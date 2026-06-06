"use client";

import { RATING_PILL } from "@pulse/types";
import { MemberAvatar } from "@/components/MemberAvatar";
import type { DaySlotView } from "./usePlanData";

const RATING_LABEL = { MUST: "Must", MAYBE: "Maybe", SKIP: "Skip" } as const;

export function ActivityChip({ slot, variant }: { slot: DaySlotView; variant: "compact" | "full" }) {
  const band = slot.color ?? "var(--border)";

  if (variant === "compact") {
    return (
      <div
        className={`flex items-center gap-1 rounded px-1 py-0.5 text-[10px] leading-tight bg-bg-card border-l-2 ${slot.clash ? "ring-1 ring-red-400" : ""}`}
        style={{ borderLeftColor: band }}
        title={slot.name}
      >
        <span className="truncate text-text-primary">{slot.name}</span>
        {slot.isSplit && <span className="shrink-0 text-text-subtle" title="split crew">⋮⋮</span>}
      </div>
    );
  }

  return (
    <div
      className={`flex flex-col gap-1.5 rounded-md border border-border bg-bg-card p-2.5 border-l-4 ${slot.clash ? "ring-1 ring-red-400" : ""}`}
      style={{ borderLeftColor: band }}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-1.5 min-w-0">
          <span className="font-medium text-sm text-text-primary truncate">{slot.name}</span>
          {slot.isSplit && (
            <span className="shrink-0 rounded bg-bg px-1 py-0.5 text-[9px] font-medium text-text-subtle">split</span>
          )}
        </div>
        {slot.myRating && (
          <span className={`shrink-0 rounded-full px-1.5 py-0.5 text-[10px] font-medium ${RATING_PILL[slot.myRating]}`}>
            {RATING_LABEL[slot.myRating]}
          </span>
        )}
      </div>

      {slot.region && <span className="text-[11px] text-text-subtle">{slot.region}</span>}

      {slot.crew.length > 0 && (
        <div className="flex items-center">
          {slot.crew.slice(0, 6).map((m, i) => (
            <MemberAvatar key={m.id} name={m.name} avatarUrl={m.avatar_url} size="sm" overlap={i > 0} />
          ))}
          {slot.maybeCount > 0 && (
            <span className="ml-2 text-[10px] text-text-subtle">+{slot.maybeCount} may join</span>
          )}
        </div>
      )}
    </div>
  );
}
