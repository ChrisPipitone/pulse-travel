"use client";

import { useState } from "react";
import { fmtDate } from "@/lib/date";
import { DayCard } from "./DayCard";
import type { PresenceModel } from "@pulse/hooks";
import type { PlanData } from "./usePlanData";

export function WeekList({
  presence,
  data,
  viewerId,
}: {
  presence: PresenceModel;
  data: PlanData;
  viewerId: string | undefined;
}) {
  const [wi, setWi] = useState(Math.max(0, presence.bestWeek));
  const weeks = presence.weeks;
  const index = Math.min(wi, weeks.length - 1);
  const week = weeks[index] ?? [];

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <button
          onClick={() => setWi(Math.max(0, index - 1))}
          disabled={index <= 0}
          className="rounded px-2 py-1 text-sm text-text-muted disabled:opacity-30 hover:text-text-primary"
          aria-label="Previous week"
        >
          ←
        </button>
        <div className="flex flex-col items-center">
          <span className="text-sm font-medium text-text-primary">
            {week.length > 0 ? `Week of ${fmtDate(week[0])}` : "No dates yet"}
          </span>
          {index === presence.bestWeek && week.length > 0 && (
            <span className="text-[11px] text-accent">★ best overlap</span>
          )}
        </div>
        <button
          onClick={() => setWi(Math.min(weeks.length - 1, index + 1))}
          disabled={index >= weeks.length - 1}
          className="rounded px-2 py-1 text-sm text-text-muted disabled:opacity-30 hover:text-text-primary"
          aria-label="Next week"
        >
          →
        </button>
      </div>

      <div className="flex flex-col gap-2.5">
        {week.map((day) => (
          <DayCard key={day} day={day} presence={presence} data={data} viewerId={viewerId} />
        ))}
      </div>
    </div>
  );
}
