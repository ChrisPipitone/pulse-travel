"use client";

import { useState, useMemo } from "react";
import { useTripStore } from "@pulse/store";
import { useCompatibilityMatrix } from "@pulse/hooks";
import type { Activity } from "@pulse/types";
import { buildColorMap } from "@/lib/memberColors";
import { FindYourCrew } from "./FindYourCrew";
import { MembersRowsTable } from "./CompatibilityMatrix";

type MainView = "groupies" | "cards";

// ─────────────────────────────────────────────────────────────────────────────
// Trip pulse strip
// ─────────────────────────────────────────────────────────────────────────────

function TripPulseStrip({ activityCount, memberCount, ratedCount, topActivity, topCrewCount }: {
  activityCount: number
  memberCount: number
  ratedCount: number
  topActivity: string | null
  topCrewCount: number
}) {
  const pct = activityCount === 0 ? 0 : Math.round((ratedCount / activityCount) * 100)
  return (
    <div className="bg-bg-card border border-border rounded-[var(--radius-card)] px-4 py-3 flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="text-xs text-text-muted">{activityCount} activities · {memberCount} members</span>
        <span className="text-xs font-bold text-text-primary">{pct}%<span className="font-normal text-text-subtle ml-0.5">rated</span></span>
      </div>
      <div className="h-1.5 bg-border rounded-full overflow-hidden">
        <div className="h-full bg-accent rounded-full" style={{ width: `${pct}%` }} />
      </div>
      {topActivity && topCrewCount > 0 && (
        <p className="text-[11px] text-text-muted">
          Most popular: <span className="font-semibold text-text-primary">{topActivity}</span>
          <span className="ml-1 text-text-subtle">· {topCrewCount} going</span>
        </p>
      )}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// View toggle
// ─────────────────────────────────────────────────────────────────────────────

function ViewToggle({
  view,
  setView,
}: {
  view: MainView;
  setView: (v: MainView) => void;
}) {
  return (
    <div className="flex items-center gap-0.5 bg-bg-card border border-border rounded-lg p-0.5 self-start">
      <button
        onClick={() => setView("groupies")}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
          view === "groupies"
            ? "bg-accent text-white shadow-sm"
            : "text-text-muted hover:text-text-primary"
        }`}
      >
        <svg
          width="12"
          height="12"
          viewBox="0 0 16 16"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        >
          <circle cx="5.5" cy="5" r="2.5" />
          <path d="M1 14c0-2.76 2.02-5 4.5-5s4.5 2.24 4.5 5" />
          <circle cx="12" cy="5" r="2" />
          <path d="M12 10c1.93 0 3 1.34 3 3" />
        </svg>
        Groupies
      </button>
      <button
        onClick={() => setView("cards")}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
          view === "cards"
            ? "bg-accent text-white shadow-sm"
            : "text-text-muted hover:text-text-primary"
        }`}
      >
        <svg
          width="12"
          height="12"
          viewBox="0 0 16 16"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        >
          <rect x="2" y="3" width="12" height="4" rx="1" />
          <rect x="2" y="9" width="12" height="4" rx="1" />
        </svg>
        By Activity
      </button>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main export
// ─────────────────────────────────────────────────────────────────────────────

export function FindYourCrewOverview() {
  const activities = useTripStore((s) => s.activities);
  const members = useTripStore((s) => s.members);
  const { matrix } = useCompatibilityMatrix();

  const colorMap = useMemo(() => buildColorMap(members), [members]);

  const [mainView, setMainView] = useState<MainView>("groupies");
  const [query, setQuery] = useState("");

  const orderedActivities = useMemo(
    () =>
      matrix
        .map((s) => activities.find((a) => a.id === s.activity_id))
        .filter((a): a is Activity => !!a),
    [matrix, activities],
  );

  const maxScore = matrix[0]?.score ?? 0;

  const ratedCount = matrix.filter(s => s.score > 0).length
  const topActivity = orderedActivities[0] ?? null
  const topCrewCount = topActivity
    ? (matrix.find(s => s.activity_id === topActivity.id)
        ? Object.values(matrix.find(s => s.activity_id === topActivity.id)!.ratings)
            .filter(r => r === 'MUST' || r === 'WANT').length
        : 0)
    : 0

  const q = query.toLowerCase().trim();
  const filteredMembers = q
    ? members.filter(
        (m) =>
          m.name.toLowerCase().includes(q) ||
          (m.email?.toLowerCase().includes(q) ?? false),
      )
    : members;

  if (activities.length === 0)
    return (
      <div className="bg-bg-card rounded-[var(--radius-card)] border border-border px-6 py-14 flex flex-col items-center gap-2 text-center">
        <p className="text-sm font-medium text-text-primary">
          No activities yet
        </p>
        <p className="text-xs text-text-muted max-w-xs">
          Add activities to the trip — then come back to see who's going where.
        </p>
      </div>
    );

  return (
    <div className="flex flex-col gap-3">
      <ViewToggle view={mainView} setView={setMainView} />

      {mainView === "groupies" ? (
        <>
          <div className="relative">
            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
              <svg
                width="14"
                height="14"
                viewBox="0 0 16 16"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                className="text-text-subtle"
              >
                <circle cx="6.5" cy="6.5" r="4" />
                <path d="M11 11l3 3" />
              </svg>
            </div>
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name or email…"
              className="w-full bg-bg-card border border-border rounded-[var(--radius-card)] pl-9 pr-4 py-2.5 text-sm text-text-primary placeholder:text-text-subtle focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent/50 transition-all"
            />
          </div>
          <div className="bg-bg-card border border-border rounded-[var(--radius-card)] overflow-hidden">
            {filteredMembers.length === 0 ? (
              <p className="text-sm text-text-subtle text-center py-8">
                No members match.
              </p>
            ) : (
              <MembersRowsTable
                members={filteredMembers}
                activities={orderedActivities}
                scores={matrix}
                maxScore={maxScore}
                colorMap={colorMap}
              />
            )}
          </div>
        </>
      ) : (
        <FindYourCrew />
      )}
    </div>
  );
}
