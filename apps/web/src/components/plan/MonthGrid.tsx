"use client";

import { ActivityChip } from "./ActivityChip";
import type { ISODate, PresenceModel } from "@pulse/hooks";
import type { PlanData } from "./usePlanData";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function dow(iso: ISODate): number {
  return new Date(iso + "T00:00:00").getDay();
}
function shift(iso: ISODate, n: number): ISODate {
  const d = new Date(iso + "T00:00:00");
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
}
function dayNum(iso: ISODate): number {
  return Number(iso.slice(8, 10));
}
function monthAbbr(iso: ISODate): string {
  return new Date(iso + "T00:00:00").toLocaleDateString("en-US", { month: "short" });
}

export function MonthGrid({
  presence,
  data,
  viewerId,
}: {
  presence: PresenceModel;
  data: PlanData;
  viewerId: string | undefined;
}) {
  const days = presence.days;
  if (days.length === 0) return null;

  const first = days[0];
  const last = days[days.length - 1];
  const gridStart = shift(first, -dow(first));
  const gridEnd = shift(last, 6 - dow(last));
  const inEnvelope = new Set(days);

  const cells: ISODate[] = [];
  for (let d = gridStart; d <= gridEnd; d = shift(d, 1)) cells.push(d);

  const header =
    monthAbbr(first) === monthAbbr(last)
      ? `${monthAbbr(first)} ${first.slice(0, 4)}`
      : `${monthAbbr(first)} – ${monthAbbr(last)} ${last.slice(0, 4)}`;

  return (
    <div className="flex flex-col gap-2">
      <div className="text-sm font-medium text-text-primary">{header}</div>

      <div className="grid grid-cols-7 gap-px rounded-lg overflow-hidden border border-border bg-border">
        {WEEKDAYS.map((w) => (
          <div key={w} className="bg-bg px-2 py-1 text-[10px] uppercase tracking-wide text-text-subtle text-center">
            {w}
          </div>
        ))}

        {cells.map((day) => {
          if (!inEnvelope.has(day)) {
            return <div key={day} className="bg-bg/40 min-h-[88px]" />;
          }
          const presentIds = presence.presentIds(day);
          const youHere = !!viewerId && presentIds.includes(viewerId);
          const peak = presence.isPeak(day);
          const locked = presence.locked(day);
          const leg = data.legForDay(day);
          const slots = data.slotsByDay.get(day) ?? [];

          return (
            <div
              key={day}
              className={`min-h-[88px] bg-bg-card p-1.5 flex flex-col gap-1 ${
                youHere ? "ring-1 ring-inset ring-accent/30" : ""
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-text-primary">
                  {dayNum(day) === 1 ? `${monthAbbr(day)} 1` : dayNum(day)}
                </span>
                <span className="flex items-center gap-1 text-[10px] text-text-subtle">
                  {locked && <span title="locked">🔒</span>}
                  {peak && <span className="text-accent" title="everyone here">★</span>}
                  {presentIds.length}/{presence.total}
                </span>
              </div>
              {leg && <span className="truncate text-[9px] text-text-subtle">{leg.name}</span>}
              {slots.slice(0, 3).map((slot) => (
                <ActivityChip key={slot.slotId} slot={slot} variant="compact" />
              ))}
              {slots.length > 3 && <span className="text-[9px] text-text-subtle">+{slots.length - 3} more</span>}
            </div>
          );
        })}
      </div>
    </div>
  );
}
