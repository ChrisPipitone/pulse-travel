"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useTripStore } from "@pulse/store";
import { useSession, useRateActivity, useCrewRows } from "@pulse/hooks";
import type { Activity, Rating, Stop, SortKey } from "@pulse/types";
import { fmtDateRange } from "@/lib/date";
import { CrewCard, type CrewRowData } from "@/components/CrewCard";
import { CrewModal } from "@/components/CrewModal";
import { useIsMobile } from "@/hooks/useIsMobile";

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
  const isMobile = useIsMobile();
  const [openId, setOpenId] = useState<string | null>(null);
  const [sortKey, setSortKey] = useState<SortKey>("popular");
  const [didAutoOpen, setDidAutoOpen] = useState(false);

  function canEditActivity(a: Activity) {
    return userId === tripOwnerId || userId === a.added_by;
  }

  const rows = useCrewRows({ activities, members, ratings, userId, sortKey });

  const sortedStops = useMemo(
    () => [...stops].sort((a, b) => a.position - b.position),
    [stops]
  );

  const openRow = rows.find((r) => r.activity.id === openId) ?? null;

  function stopDateLabel(stop: Stop) {
    return fmtDateRange(stop.date_from, stop.date_to);
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
      {sortedStops.map((stop: Stop) => {
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
    <div className="flex flex-col gap-5">
      {/* Rating progress / completion banner */}
      {unratedCount > 0 ? (
        <div className="flex items-center justify-between gap-3 bg-accent/10 border border-accent/30 rounded-2xl px-5 py-4 shadow-sm callout-in">
          <div className="min-w-0">
            <p className="text-sm font-bold text-text-primary">Finish your ratings</p>
            <p className="text-xs font-medium text-text-muted mt-0.5">
              <span className="text-accent font-bold">{rows.length - unratedCount}</span> of {rows.length} activities rated
            </p>
          </div>
          <button
            onClick={openNextUnrated}
            className="shrink-0 text-xs font-bold bg-accent text-white px-4 py-2 rounded-full hover:shadow-lg hover:shadow-accent/30 transition-all active:scale-95 whitespace-nowrap"
          >
            Next unrated →
          </button>
        </div>
      ) : rows.length > 0 && (
        <div
          className="flex items-center justify-between gap-3 rounded-2xl px-5 py-4 shadow-sm pop-in"
          style={{ background: "rgba(22,163,74,.12)", border: "1px solid rgba(22,163,74,.3)" }}
        >
          <div className="min-w-0">
            <p className="text-sm font-bold text-text-primary">🎉 All rated — you&apos;re done!</p>
            <p className="text-xs font-medium text-text-muted mt-0.5">See how the group lines up and find your crew.</p>
          </div>
          {onSwitchToCrewTab && (
            <button
              onClick={onSwitchToCrewTab}
              className="shrink-0 text-xs font-bold bg-[#16A34A] text-white px-4 py-2 rounded-full hover:shadow-lg hover:shadow-[#16A34A]/30 transition-all active:scale-95 whitespace-nowrap"
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

      {crewModalProps && isMobile && <CrewModal variant="modal" {...crewModalProps} />}
    </div>
  );
}
