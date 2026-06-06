"use client";

import { fmtDate } from "@/lib/date";
import { MemberAvatar } from "@/components/MemberAvatar";
import { ActivityChip } from "./ActivityChip";
import type { ISODate, PresenceModel } from "@pulse/hooks";
import type { PlanData } from "./usePlanData";

function weekday(day: ISODate): string {
  return new Date(day + "T00:00:00").toLocaleDateString("en-US", { weekday: "short" });
}

export function DayCard({
  day,
  presence,
  data,
  viewerId,
}: {
  day: ISODate;
  presence: PresenceModel;
  data: PlanData;
  viewerId: string | undefined;
}) {
  const presentIds = presence.presentIds(day);
  const youHere = !!viewerId && presentIds.includes(viewerId);
  const peak = presence.isPeak(day);
  const locked = presence.locked(day);
  const leg = data.legForDay(day);
  const slots = data.slotsByDay.get(day) ?? [];
  const presentMembers = presentIds.map((id) => data.membersById.get(id)).filter((m) => !!m);

  return (
    <div
      className={`rounded-lg border p-3 flex flex-col gap-2.5 ${
        locked ? "border-amber-300 bg-amber-50/40" : youHere ? "border-accent/40 bg-bg-card" : "border-border bg-bg-card"
      }`}
    >
      <div className="flex items-baseline justify-between">
        <div className="flex items-baseline gap-1.5">
          <span className="text-[11px] uppercase tracking-wide text-text-subtle">{weekday(day)}</span>
          <span className="text-sm font-semibold text-text-primary">{fmtDate(day)}</span>
        </div>
        <div className="flex items-center gap-1.5">
          {leg && <span className="rounded bg-bg px-1.5 py-0.5 text-[10px] text-text-subtle">{leg.name}</span>}
          {peak && <span className="text-[11px] text-accent" title="everyone here">★ all here</span>}
        </div>
      </div>

      <div className="flex items-center gap-2">
        {presentMembers.length > 0 ? (
          <div className="flex items-center">
            {presentMembers.slice(0, 8).map((m, i) => (
              <MemberAvatar key={m!.id} name={m!.name} avatarUrl={m!.avatar_url} size="sm" overlap={i > 0} />
            ))}
          </div>
        ) : (
          <span className="text-[11px] text-text-subtle">no one here yet</span>
        )}
        <span className="text-[11px] text-text-subtle">
          {presentIds.length}/{presence.total} here
        </span>
      </div>

      {locked && (
        <span className="text-[11px] text-amber-700">Locked — the plan firms up around this day.</span>
      )}

      {slots.map((slot) => (
        <ActivityChip key={slot.slotId} slot={slot} variant="full" />
      ))}
    </div>
  );
}
