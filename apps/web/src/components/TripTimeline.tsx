"use client";

import { useState, useMemo, Fragment } from "react";
import { useTripStore } from "@pulse/store";
import { MemberAvatar } from "@/components/MemberAvatar";
import { fmtDateRange } from "@/lib/date";
import type { Rating, Stop, Activity, Member, ActivityRating } from "@pulse/types";
import { RATING_PILL } from "@pulse/types";

// ─── Helpers ──────────────────────────────────────────────────────────────

type StopTier = "must" | "maybe" | "skip";

function getMemberStopTier(
  memberId: string,
  activityIds: string[],
  ratings: ActivityRating[],
): StopTier | null {
  const memberRatings = ratings
    .filter(r => r.user_id === memberId && activityIds.includes(r.activity_id))
    .map(r => r.rating);
  if (memberRatings.includes("MUST")) return "must";
  if (memberRatings.includes("MAYBE")) return "maybe";
  if (memberRatings.length > 0) return "skip";
  return null;
}

const RATING_ORDER: Rating[] = ["MUST", "MAYBE", "SKIP"];

// ─── Ratings grid (per-activity drill-down) ───────────────────────────────

function ActivityRatingsGrid({
  activityId,
  members,
  ratings,
}: {
  activityId: string;
  members: Member[];
  ratings: ActivityRating[];
}) {
  const ratingByMember = new Map(
    ratings.filter(r => r.activity_id === activityId).map(r => [r.user_id, r.rating])
  );

  const sections = RATING_ORDER
    .map(rating => ({
      rating,
      raters: members.filter(m => ratingByMember.get(m.id) === rating),
    }))
    .filter(s => s.raters.length > 0);

  if (sections.length === 0) {
    return (
      <div className="px-4 py-3 bg-bg border-t border-border text-[11px] text-text-subtle text-center">
        No ratings yet.
      </div>
    );
  }

  return (
    <div className="bg-bg border-t border-border px-4 py-2.5 grid grid-cols-2 gap-x-4 gap-y-0">
      {sections.map(({ rating, raters }) => (
        <Fragment key={rating}>
          <div className="col-span-2 pt-2 pb-0.5 first:pt-1 text-[9px] font-bold uppercase tracking-[0.07em] text-text-subtle">
            {rating}
          </div>
          {raters.map(m => (
            <div key={m.id} className="flex items-center gap-1.5 py-[3px]">
              <MemberAvatar name={m.name} avatarUrl={m.avatar_url} size="xs" />
              <span className="text-[11px] font-medium text-text-primary flex-1 truncate">
                {m.name.split(" ")[0]}
              </span>
              <span className={`text-[8px] font-bold rounded-[5px] px-1.5 py-[2px] shrink-0 ${RATING_PILL[rating]}`}>
                {rating}
              </span>
            </div>
          ))}
        </Fragment>
      ))}
      <div className="h-1.5 col-span-2" />
    </div>
  );
}

// ─── Activity row ──────────────────────────────────────────────────────────

function ActivityRow({
  activity,
  members,
  ratings,
  isOpen,
  onToggle,
}: {
  activity: Activity;
  members: Member[];
  ratings: ActivityRating[];
  isOpen: boolean;
  onToggle: () => void;
}) {
  const excitedCount = ratings.filter(
    r => r.activity_id === activity.id && (r.rating === "MUST" || r.rating === "MAYBE")
  ).length;

  return (
    <div className="border-t border-border">
      <button
        className="w-full flex items-center gap-2.5 px-4 py-2.5 text-left hover:bg-bg transition-colors"
        onClick={e => { e.stopPropagation(); onToggle(); }}
        aria-expanded={isOpen}
      >
        <div className="flex-1 min-w-0">
          <p className="text-[12px] font-semibold text-text-primary leading-tight">
            {activity.name}
          </p>
          {activity.location && (
            <p className="text-[10px] text-text-subtle mt-0.5 truncate">
              {activity.location}
            </p>
          )}
        </div>
        {excitedCount > 0 && (
          <span className="text-[10px] font-semibold text-text-subtle bg-bg border border-border rounded-full px-2.5 py-0.5 shrink-0 whitespace-nowrap">
            {excitedCount} excited
          </span>
        )}
        <svg
          width="12"
          height="12"
          viewBox="0 0 16 16"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          className={`shrink-0 transition-transform duration-200 ${isOpen ? "rotate-180 text-text-subtle" : "text-border"}`}
        >
          <path d="M4 6l4 4 4-4" />
        </svg>
      </button>

      <div className={`grid transition-all duration-200 ease-out ${isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}>
        <div className="overflow-hidden">
          <ActivityRatingsGrid
            activityId={activity.id}
            members={members}
            ratings={ratings}
          />
        </div>
      </div>
    </div>
  );
}

// ─── Stop card ─────────────────────────────────────────────────────────────

function StopCard({
  stop,
  stopActivities,
  members,
  ratings,
  openActivityIds,
  onToggleActivity,
  isSelected,
  onSelect,
}: {
  stop: Stop;
  stopActivities: Activity[];
  members: Member[];
  ratings: ActivityRating[];
  openActivityIds: Set<string>;
  onToggleActivity: (id: string) => void;
  isSelected: boolean;
  onSelect: () => void;
}) {
  const hasDate = !!(stop.date_from || stop.date_to);
  const dateStr = fmtDateRange(stop.date_from, stop.date_to);
  const activityIds = stopActivities.map(a => a.id);

  const mustMembers: Member[] = [];
  const maybeMembers: Member[] = [];
  const skipMembers: Member[] = [];

  for (const m of members) {
    const tier = getMemberStopTier(m.id, activityIds, ratings);
    if (tier === "must") mustMembers.push(m);
    else if (tier === "maybe") maybeMembers.push(m);
    else if (tier === "skip") skipMembers.push(m);
  }

  const hasTiers = mustMembers.length > 0 || maybeMembers.length > 0 || skipMembers.length > 0;

  return (
    <div className="flex items-start gap-3">
      {/* Node */}
      <div
        className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 z-10 mt-3"
        style={{ backgroundColor: hasDate ? "var(--spine-node)" : "var(--spine-empty)" }}
      >
        <svg
          width="10"
          height="10"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          className={hasDate ? "text-white" : "text-[var(--spine-node)]"}
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
          <circle cx="12" cy="9" r="2.5" />
        </svg>
      </div>

      {/* Card */}
      <div className={`flex-1 min-w-0 bg-bg-card rounded-[var(--radius-card)] border overflow-hidden mb-3 shadow-sm transition-all ${isSelected ? "border-accent/50 shadow-md" : "border-border"}`}>
        {/* Header — click to select/deselect in detail panel */}
        <div
          className="flex items-center gap-2.5 px-4 py-3 cursor-pointer hover:bg-bg/60 transition-colors"
          onClick={onSelect}
        >
          <div className="flex-1 min-w-0">
            <h3 className="text-[14px] font-bold text-text-primary leading-tight">
              {stop.name}
            </h3>
            <p className={`text-[11px] font-semibold mt-0.5 ${hasDate ? "text-text-muted" : "text-text-subtle"}`}>
              {dateStr ?? "No dates set"}
            </p>
          </div>
          {stopActivities.length > 0 && (
            <span className="text-[10px] font-semibold text-text-subtle bg-bg border border-border rounded-full px-2.5 py-0.5 shrink-0 whitespace-nowrap">
              {stopActivities.length} {stopActivities.length === 1 ? "activity" : "activities"}
            </span>
          )}
        </div>

        {/* Tier block — always visible when there are ratings */}
        {hasTiers && (
          <div className="border-t border-border/60 px-4 pt-2.5 pb-3 flex flex-col gap-2">
            {mustMembers.length > 0 && (
              <div className="flex items-start gap-2.5">
                <span className="text-[9px] font-bold uppercase tracking-[0.06em] text-must w-8 shrink-0 pt-1">
                  MUST
                </span>
                <div className="flex flex-wrap gap-2.5">
                  {mustMembers.map(m => (
                    <MemberAvatar key={m.id} name={m.name} avatarUrl={m.avatar_url} withLabel />
                  ))}
                </div>
              </div>
            )}
            {maybeMembers.length > 0 && (
              <div className="flex items-start gap-2.5">
                <span className="text-[9px] font-bold uppercase tracking-[0.06em] text-maybe-text w-8 shrink-0 pt-1">
                  MAYBE
                </span>
                <div className="flex flex-wrap gap-2.5">
                  {maybeMembers.map(m => (
                    <MemberAvatar key={m.id} name={m.name} avatarUrl={m.avatar_url} withLabel />
                  ))}
                </div>
              </div>
            )}
            {skipMembers.length > 0 && (
              <div className="flex items-start gap-2.5">
                <span className="text-[9px] font-bold uppercase tracking-[0.06em] text-text-subtle w-8 shrink-0 pt-1">
                  SKIP
                </span>
                <div className="flex flex-wrap gap-2.5">
                  {skipMembers.map(m => (
                    <MemberAvatar key={m.id} name={m.name} avatarUrl={m.avatar_url} withLabel muted />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Activity list — always visible */}
        {stopActivities.length === 0 ? (
          <div className="border-t border-border px-4 py-4 text-[12px] text-text-subtle text-center">
            No activities assigned to this stop.
          </div>
        ) : (
          <div className="border-t border-border">
            {stopActivities.map(activity => (
              <ActivityRow
                key={activity.id}
                activity={activity}
                members={members}
                ratings={ratings}
                isOpen={openActivityIds.has(activity.id)}
                onToggle={() => onToggleActivity(activity.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Stop detail panel (right pane, desktop) ──────────────────────────────

function ActivityDetailSection({
  activity,
  members,
  ratings,
}: {
  activity: Activity;
  members: Member[];
  ratings: ActivityRating[];
}) {
  const ratingByMember = new Map(
    ratings.filter(r => r.activity_id === activity.id).map(r => [r.user_id, r.rating])
  );
  const sections = RATING_ORDER
    .map(rating => ({ rating, raters: members.filter(m => ratingByMember.get(m.id) === rating) }))
    .filter(s => s.raters.length > 0);
  const excitedCount = ratings.filter(
    r => r.activity_id === activity.id && (r.rating === "MUST" || r.rating === "MAYBE")
  ).length;

  return (
    <div className="border-t border-border">
      <div className="flex items-center gap-2 px-4 py-2.5">
        <div className="flex-1 min-w-0">
          <p className="text-[12px] font-semibold text-text-primary leading-tight">{activity.name}</p>
          {activity.location && (
            <p className="text-[10px] text-text-subtle mt-0.5 truncate">{activity.location}</p>
          )}
        </div>
        {excitedCount > 0 && (
          <span className="text-[10px] font-semibold text-text-subtle bg-bg border border-border rounded-full px-2.5 py-0.5 shrink-0">
            {excitedCount} excited
          </span>
        )}
      </div>
      {sections.length > 0 ? (
        <div className="bg-bg border-t border-border/50 px-4 py-2.5 grid grid-cols-2 gap-x-4">
          {sections.map(({ rating, raters }) => (
            <Fragment key={rating}>
              <div className="col-span-2 pt-1.5 pb-0.5 first:pt-0 text-[9px] font-bold uppercase tracking-[0.07em] text-text-subtle">
                {rating}
              </div>
              {raters.map(m => (
                <div key={m.id} className="flex items-center gap-1.5 py-[2px]">
                  <MemberAvatar name={m.name} avatarUrl={m.avatar_url} size="xs" />
                  <span className="text-[11px] font-medium text-text-primary truncate">{m.name.split(" ")[0]}</span>
                </div>
              ))}
            </Fragment>
          ))}
          <div className="h-1.5 col-span-2" />
        </div>
      ) : (
        <p className="bg-bg border-t border-border/50 px-4 py-2 text-[11px] text-text-subtle">No ratings yet.</p>
      )}
    </div>
  );
}

function StopDetailPanel({
  stop,
  activities,
  members,
  ratings,
  onClose,
}: {
  stop: Stop;
  activities: Activity[];
  members: Member[];
  ratings: ActivityRating[];
  onClose: () => void;
}) {
  const hasDate = !!(stop.date_from || stop.date_to);
  const dateStr = fmtDateRange(stop.date_from, stop.date_to);
  const activityIds = activities.map(a => a.id);

  const mustMembers: Member[] = [];
  const maybeMembers: Member[] = [];

  for (const m of members) {
    const tier = getMemberStopTier(m.id, activityIds, ratings);
    if (tier === "must") mustMembers.push(m);
    else if (tier === "maybe") maybeMembers.push(m);
  }

  return (
    <div className="bg-bg-card rounded-[var(--radius-card)] border border-border flex flex-col overflow-y-auto max-h-[calc(100vh-8rem)] section-in">
      {/* Sticky header */}
      <div className="flex items-start justify-between gap-3 px-5 pt-4 pb-3 border-b border-border sticky top-0 bg-bg-card z-10 shrink-0">
        <div className="min-w-0">
          <h3 className="text-sm font-bold text-text-primary leading-tight">{stop.name}</h3>
          <p className={`text-xs mt-0.5 ${hasDate ? "text-text-muted" : "text-text-subtle"}`}>
            {dateStr ?? "No dates set"}
          </p>
        </div>
        <button
          onClick={onClose}
          aria-label="Close panel"
          className="shrink-0 p-1.5 rounded-lg text-text-subtle hover:text-text-primary hover:bg-bg transition-colors mt-0.5"
        >
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M3 3l10 10M13 3L3 13" />
          </svg>
        </button>
      </div>

      {/* Future view tabs (Map + Days slot in here) */}
      <div className="px-5 pt-3 pb-1 shrink-0">
        <div className="inline-flex items-center bg-bg border border-border rounded-lg p-0.5">
          <span className="px-2.5 py-1 rounded-md bg-accent text-white text-[11px] font-semibold">Detail</span>
          <span className="px-2.5 py-1 text-[11px] font-semibold text-text-subtle/40 cursor-not-allowed select-none">Map</span>
          <span className="px-2.5 py-1 text-[11px] font-semibold text-text-subtle/40 cursor-not-allowed select-none">Days</span>
        </div>
      </div>

      {/* Stop crew */}
      {(mustMembers.length > 0 || maybeMembers.length > 0) && (
        <div className="px-5 py-3 border-b border-border/60 flex flex-col gap-2 shrink-0">
          {mustMembers.length > 0 && (
            <div className="flex items-start gap-2">
              <span className="text-[9px] font-bold uppercase tracking-[0.06em] text-must w-9 shrink-0 pt-1">MUST</span>
              <div className="flex flex-wrap gap-2">
                {mustMembers.map(m => (
                  <MemberAvatar key={m.id} name={m.name} avatarUrl={m.avatar_url} size="sm" withLabel />
                ))}
              </div>
            </div>
          )}
          {maybeMembers.length > 0 && (
            <div className="flex items-start gap-2">
              <span className="text-[9px] font-bold uppercase tracking-[0.06em] text-maybe-text w-9 shrink-0 pt-1">MAYBE</span>
              <div className="flex flex-wrap gap-2">
                {maybeMembers.map(m => (
                  <MemberAvatar key={m.id} name={m.name} avatarUrl={m.avatar_url} size="sm" withLabel />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Activity detail — all ratings visible, no expand needed */}
      {activities.length === 0 ? (
        <p className="px-5 py-8 text-sm text-text-subtle text-center">No activities assigned to this stop.</p>
      ) : (
        <div className="flex-1">
          {activities.map(activity => (
            <ActivityDetailSection
              key={activity.id}
              activity={activity}
              members={members}
              ratings={ratings}
            />
          ))}
          <div className="h-4" />
        </div>
      )}
    </div>
  );
}

// ─── Main export ───────────────────────────────────────────────────────────

export function TripTimeline() {
  const stops = useTripStore(s => s.stops);
  const activities = useTripStore(s => s.activities);
  const members = useTripStore(s => s.members);
  const ratings = useTripStore(s => s.ratings);

  const [openActivityIds, setOpenActivityIds] = useState<Set<string>>(new Set());
  const [selectedStopId, setSelectedStopId] = useState<string | null>(null);

  function toggleActivity(id: string) {
    setOpenActivityIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }

  function selectStop(id: string) {
    setSelectedStopId(prev => (prev === id ? null : id));
  }

  const sortedStops = useMemo(
    () => [...stops].sort((a, b) => a.position - b.position),
    [stops]
  );

  const activitiesByStop = useMemo(() => {
    const map = new Map<string, Activity[]>();
    for (const s of sortedStops) {
      map.set(s.id, activities.filter(a => a.stop_id === s.id));
    }
    return map;
  }, [sortedStops, activities]);

  const unassigned = useMemo(
    () => activities.filter(a => !a.stop_id),
    [activities]
  );

  const selectedStop = selectedStopId
    ? sortedStops.find(s => s.id === selectedStopId) ?? null
    : null;
  const selectedStopActivities = selectedStop
    ? (activitiesByStop.get(selectedStop.id) ?? [])
    : [];

  if (stops.length === 0) {
    return (
      <div className="bg-bg-card rounded-[var(--radius-card)] border border-border px-6 py-12 flex flex-col items-center gap-2 text-center">
        <p className="text-sm font-medium text-text-primary">No stops yet</p>
        <p className="text-xs text-text-muted max-w-xs">
          Add stops in the sidebar to see who's going where, stop by stop.
        </p>
      </div>
    );
  }

  return (
    <div className="flex gap-5 lg:items-start">
      {/* Left: full timeline spine — preserves birds-eye scan view */}
      <div className="flex-1 min-w-0 flex flex-col">
        <div className="relative">
          <div
            className="absolute left-3 top-6 bottom-6 w-px z-0 pointer-events-none"
            style={{ backgroundColor: "var(--spine-line)" }}
            aria-hidden="true"
          />
          {sortedStops.map(stop => (
            <StopCard
              key={stop.id}
              stop={stop}
              stopActivities={activitiesByStop.get(stop.id) ?? []}
              members={members}
              ratings={ratings}
              openActivityIds={openActivityIds}
              onToggleActivity={toggleActivity}
              isSelected={selectedStopId === stop.id}
              onSelect={() => selectStop(stop.id)}
            />
          ))}
        </div>

        {/* Unassigned */}
        {unassigned.length > 0 && (
          <div className="mt-2">
            <div className="flex items-center gap-2 mb-2.5">
              <span className="text-[10px] font-bold uppercase tracking-[0.07em] text-text-subtle">Unassigned</span>
              <span className="text-[10px] font-semibold text-text-subtle bg-border rounded-full px-2 py-0.5">
                {unassigned.length}
              </span>
            </div>
            <div className="border-2 border-dashed border-text-subtle/30 rounded-[var(--radius-card)] p-2 flex flex-col gap-1.5">
              {unassigned.map(activity => (
                <div key={activity.id} className="bg-bg-card rounded-xl border border-border shadow-sm overflow-hidden [&>div]:border-t-0">
                  <ActivityRow
                    activity={activity}
                    members={members}
                    ratings={ratings}
                    isOpen={openActivityIds.has(activity.id)}
                    onToggle={() => toggleActivity(activity.id)}
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Right: detail panel (desktop only) */}
      <aside className="hidden lg:block w-[360px] shrink-0 sticky top-20">
        {selectedStop ? (
          <StopDetailPanel
            key={selectedStopId}
            stop={selectedStop}
            activities={selectedStopActivities}
            members={members}
            ratings={ratings}
            onClose={() => setSelectedStopId(null)}
          />
        ) : (
          <div className="bg-bg-card rounded-[var(--radius-card)] border border-border px-6 py-10 flex flex-col items-center justify-center text-center gap-1.5">
            <p className="text-sm font-medium text-text-muted">Select a stop</p>
            <p className="text-xs text-text-subtle">Crew detail, ratings, and future map</p>
          </div>
        )}
      </aside>
    </div>
  );
}
