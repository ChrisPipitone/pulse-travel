"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useTripStore } from "@pulse/store";
import { useSession } from "@pulse/hooks";
import { useRateActivity } from "@pulse/hooks";
import type { Activity, Rating, Stop } from "@pulse/types";
import { fmtDateRange } from "@/lib/date";
import { CrewCard, type CrewRowData } from "@/components/CrewCard";
import { CrewModal } from "@/components/CrewModal";

type SortKey = "popular" | "my-recs" | "cant-miss" | "newest" | "by-stop";

const SORT_LABELS: Record<SortKey, string> = {
  popular: "Popular",
  "cant-miss": "Can't Miss",
  "my-recs": "My Recs",
  newest: "Newest",
  "by-stop": "By Stop",
};

export function FindYourCrew({
  onAdd,
  onEdit,
  onDelete,
  tripOwnerId,
  hiddenIds,
  autoOpenFirstUnrated = false,
  onSwitchToCrewTab,
}: {
  onAdd?: () => void;
  onEdit?: (a: Activity) => void;
  onDelete?: (a: Activity) => void;
  tripOwnerId?: string;
  hiddenIds?: Set<string>;
  autoOpenFirstUnrated?: boolean;
  onSwitchToCrewTab?: () => void;
} = {}) {
  const allActivities = useTripStore((s) => s.activities);
  const members = useTripStore((s) => s.members);
  const ratings = useTripStore((s) => s.ratings);
  const stops = useTripStore((s) => s.stops);
  const { session } = useSession();
  const { rateActivity, loading: ratingLoading } = useRateActivity();
  const router = useRouter();
  const pathname = usePathname();

  const activities = hiddenIds?.size
    ? allActivities.filter((a) => !hiddenIds.has(a.id))
    : allActivities;

  const userId = session?.user.id;
  const [openId, setOpenId] = useState<string | null>(null);
  const [sortKey, setSortKey] = useState<SortKey>("popular");
  const [didAutoOpen, setDidAutoOpen] = useState(false);

  function canEditActivity(a: Activity) {
    return userId === tripOwnerId || userId === a.added_by;
  }

  const rows = useMemo((): CrewRowData[] => {

    return activities
      .map((activity) => {
        const actRatings = ratings.filter((r) => r.activity_id === activity.id);
        const ratingMap = new Map(actRatings.map((r) => [r.user_id, r.rating]));
        const mustMembers = members.filter((m) => ratingMap.get(m.id) === "MUST");
        const maybeMembers = members.filter((m) => ratingMap.get(m.id) === "MAYBE");
        const skipMembers = members.filter((m) => ratingMap.get(m.id) === "SKIP");
        const ratedIds = new Set(actRatings.map((r) => r.user_id));
        const unratedMembers = members.filter((m) => !ratedIds.has(m.id));
        const myRating = userId ? (ratingMap.get(userId) ?? null) : null;
        return {
          activity,
          mustMembers,
          maybeMembers,
          skipMembers,
          unratedMembers,
          myRating,
          mustCount: mustMembers.length,
          maybeCount: maybeMembers.length,
        };
      })
      .sort((a, b) => {
        if (sortKey === "by-stop") {
          return b.mustCount * 3 + b.maybeCount - (a.mustCount * 3 + a.maybeCount);
        }
        if (sortKey === "my-recs") {
          const aMe = a.activity.added_by === userId ? 0 : 1;
          const bMe = b.activity.added_by === userId ? 0 : 1;
          if (aMe !== bMe) return aMe - bMe;
        }
        if (sortKey === "cant-miss") {
          const TIER: Record<string, number> = { MUST: 0, MAYBE: 1, SKIP: 2 };
          const av = a.myRating ? (TIER[a.myRating] ?? 3) : 3;
          const bv = b.myRating ? (TIER[b.myRating] ?? 3) : 3;
          if (av !== bv) return av - bv;
        }
        if (sortKey === "newest") {
          return new Date(b.activity.created_at).getTime() - new Date(a.activity.created_at).getTime();
        }
        return b.mustCount * 3 + b.maybeCount - (a.mustCount * 3 + a.maybeCount);
      });
  }, [activities, members, ratings, userId, sortKey]);

  const sortedStops = useMemo(
    () => [...stops].sort((a, b) => a.position - b.position),
    [stops]
  );

  const openRow = rows.find((r) => r.activity.id === openId) ?? null;

  function stopDateLabel(stop: Stop) {
    return fmtDateRange(stop.date_from, stop.date_to);
  }

  if (activities.length === 0) {
    return (
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <p className="text-sm text-text-muted">0 activities</p>
          {onAdd && (
            <button
              onClick={onAdd}
              className="text-xs font-semibold px-3 py-1.5 rounded-[var(--radius-btn)] bg-accent text-white hover:opacity-90 transition-opacity"
            >
              + Add activity
            </button>
          )}
        </div>
        <div className="bg-bg-card rounded-[var(--radius-card)] border border-border px-6 py-12 flex flex-col items-center gap-2 text-center">
          <p className="text-sm font-medium text-text-primary">No activities yet</p>
          <p className="text-xs text-text-muted">Add the first one for the group to rate.</p>
        </div>
      </div>
    );
  }

  function toggleOpen(activityId: string) {
    setOpenId((prev) => (prev === activityId ? null : activityId));
  }

  useEffect(() => {
    if (!autoOpenFirstUnrated || didAutoOpen || rows.length === 0) return;
    const first = rows.find((r) => r.myRating === null);
    if (first) {
      setOpenId(first.activity.id);
      setTimeout(() => {
        document.getElementById(`crew-card-${first.activity.id}`)?.scrollIntoView({ block: "nearest", behavior: "smooth" });
      }, 100);
    }
    setDidAutoOpen(true);
    router.replace(pathname, { scroll: false });
  }, [autoOpenFirstUnrated, didAutoOpen, rows, router, pathname]);

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key !== "ArrowDown" && e.key !== "ArrowUp") return;
      const tag = (document.activeElement as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
      e.preventDefault();
      const idx = openId ? rows.findIndex((r) => r.activity.id === openId) : -1;
      let nextId: string | null = null;
      if (e.key === "ArrowDown") {
        nextId = rows[idx + 1]?.activity.id ?? rows[0]?.activity.id ?? null;
      } else {
        nextId = idx > 0 ? rows[idx - 1].activity.id : null;
      }
      setOpenId(nextId);
      if (nextId) {
        document.getElementById(`crew-card-${nextId}`)?.scrollIntoView({ block: "nearest", behavior: "smooth" });
      }
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [openId, rows]);

  function renderCards(cardRows: typeof rows) {
    return (
      <div className="flex flex-col gap-2.5">
        {cardRows.map((row) => (
          <div key={row.activity.id} id={`crew-card-${row.activity.id}`}>
            <CrewCard
              row={row}
              userId={userId}
              canEdit={canEditActivity(row.activity)}
              selected={row.activity.id === openId}
              onOpen={() => toggleOpen(row.activity.id)}
              onEdit={onEdit ? () => onEdit(row.activity) : undefined}
              onDelete={onDelete ? () => onDelete(row.activity) : undefined}
            />
          </div>
        ))}
      </div>
    );
  }

  const cards = sortKey === "by-stop" ? (
    <div className="flex flex-col gap-5">
      {sortedStops.map((stop) => {
        const stopRows = rows.filter((r) => r.activity.stop_id === stop.id);
        if (stopRows.length === 0) return null;
        const dateLabel = stopDateLabel(stop);
        return (
          <div key={stop.id} className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-accent/60 shrink-0" />
              <span className="text-xs font-semibold text-text-subtle uppercase tracking-widest">{stop.name}</span>
              {dateLabel && <span className="text-[10px] font-medium text-accent">{dateLabel}</span>}
            </div>
            {renderCards(stopRows)}
          </div>
        );
      })}
      {(() => {
        const stopIds = new Set(stops.map((s) => s.id));
        const unassigned = rows.filter((r) => !r.activity.stop_id || !stopIds.has(r.activity.stop_id));
        if (unassigned.length === 0) return null;
        return (
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-border shrink-0" />
              <span className="text-xs font-semibold text-text-subtle uppercase tracking-widest">Unassigned</span>
            </div>
            {renderCards(unassigned)}
          </div>
        );
      })()}
    </div>
  ) : renderCards(rows);

  const crewModalProps = openRow ? {
    row: openRow,
    userId,
    onClose: () => setOpenId(null),
    onRate: (r: Rating) => { rateActivity(openRow.activity.id, r); },
    ratingLoading,
    stops,
    canEdit: canEditActivity(openRow.activity),
    onEdit: onEdit ? () => onEdit(openRow.activity) : undefined,
  } : null;

  const unratedCount = rows.filter((r) => r.myRating === null).length;

  function openNextUnrated() {
    const next = rows.find((r) => r.myRating === null);
    if (!next) return;
    setOpenId(next.activity.id);
    document.getElementById(`crew-card-${next.activity.id}`)?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }

  return (
    <>
      {/* Rating progress / completion banner */}
      {unratedCount > 0 ? (
        <div className="flex items-center justify-between gap-3 bg-accent/8 border border-accent/20 rounded-[var(--radius-card)] px-4 py-3">
          <div className="min-w-0">
            <p className="text-sm font-medium text-text-primary">Rate activities to find your crew</p>
            <p className="text-xs text-text-muted mt-0.5">{unratedCount} of {rows.length} left</p>
          </div>
          <button
            onClick={openNextUnrated}
            className="shrink-0 text-xs font-bold text-accent hover:opacity-80 transition-opacity whitespace-nowrap"
          >
            Next unrated →
          </button>
        </div>
      ) : rows.length > 0 && (
        <div
          className="flex items-center justify-between gap-3 rounded-[var(--radius-card)] px-4 py-3"
          style={{ background: "rgba(22,163,74,.08)", border: "1px solid rgba(22,163,74,.2)" }}
        >
          <div className="min-w-0">
            <p className="text-sm font-medium text-text-primary">All rated — you&apos;re done</p>
            <p className="text-xs text-text-muted mt-0.5">See how the group lines up</p>
          </div>
          {onSwitchToCrewTab && (
            <button
              onClick={onSwitchToCrewTab}
              className="shrink-0 text-xs font-bold hover:opacity-80 transition-opacity whitespace-nowrap"
              style={{ color: "#16A34A" }}
            >
              See your crew →
            </button>
          )}
        </div>
      )}

      {/* Split-pane: card list + desktop detail panel */}
      <div className="flex gap-5 lg:items-start">
        <div className="flex-1 min-w-0 flex flex-col gap-2.5">
          {/* Sort bar — inside left pane */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1">
              <span className="hidden lg:inline text-[11px] text-text-subtle mr-0.5">Sort:</span>
              <div className="flex items-center gap-0.5 bg-bg-card border border-border rounded-lg p-0.5">
                {(Object.keys(SORT_LABELS) as SortKey[]).map((k) => (
                  <button
                    key={k}
                    onClick={() => setSortKey(k)}
                    className={`px-1.5 py-0.5 lg:px-2.5 lg:py-1 rounded-md text-[10px] lg:text-[11px] font-semibold transition-all ${
                      sortKey === k
                        ? "bg-accent text-white shadow-sm"
                        : "text-text-muted hover:text-text-primary"
                    }`}
                  >
                    {SORT_LABELS[k]}
                  </button>
                ))}
              </div>
            </div>
            {onAdd && (
              <button
                onClick={onAdd}
                className="text-[10px] lg:text-xs font-semibold px-2.5 py-1 lg:px-3 lg:py-1.5 rounded-[var(--radius-btn)] bg-accent text-white hover:opacity-90 transition-opacity shrink-0"
              >
                + Add activity
              </button>
            )}
          </div>
          {cards}
        </div>

        {/* Desktop panel — hidden on mobile */}
        <aside className="hidden lg:block w-[360px] shrink-0 sticky top-20">
          {crewModalProps ? (
            <CrewModal key={openId ?? "none"} variant="panel" {...crewModalProps} />
          ) : (
            <div className="bg-bg-card rounded-[var(--radius-card)] border border-border px-6 py-10 flex flex-col items-center justify-center text-center gap-1.5">
              <p className="text-sm font-medium text-text-muted">Select an activity</p>
              <p className="text-xs text-text-subtle">See who&apos;s going and rate it</p>
            </div>
          )}
        </aside>
      </div>

      {/* Mobile modal — CSS-hidden on desktop */}
      {crewModalProps && <CrewModal variant="modal" {...crewModalProps} />}
    </>
  );
}
