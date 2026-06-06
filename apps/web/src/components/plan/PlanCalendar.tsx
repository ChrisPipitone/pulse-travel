"use client";

import { useSession } from "@pulse/hooks";
import { usePlanData } from "./usePlanData";
import { WeekList } from "./WeekList";
import { MonthGrid } from "./MonthGrid";

function EmptyState({ title, hint }: { title: string; hint: string }) {
  return (
    <div className="rounded-lg border border-dashed border-border bg-bg-card px-6 py-12 text-center">
      <p className="text-sm font-medium text-text-primary">{title}</p>
      <p className="mt-1 text-sm text-text-muted">{hint}</p>
    </div>
  );
}

export function PlanCalendar() {
  const { session } = useSession();
  const viewerId = session?.user.id;
  const data = usePlanData(viewerId);
  const { presence, convergence } = data;

  if (!data.hasActivities) {
    return (
      <EmptyState
        title="Nothing to plan yet"
        hint="Add and rate activities first — the calendar places them once a crew forms."
      />
    );
  }

  if (!presence.envelope) {
    return (
      <EmptyState
        title="Add your dates to unlock the calendar"
        hint="The calendar needs members' arrival and departure dates to know who's around when."
      />
    );
  }

  const conflictCount = convergence.regionClashes.length + convergence.doubleBooks.length;

  return (
    <div className="flex flex-col gap-4">
      {conflictCount > 0 && (
        <div className="rounded-md border border-red-200 bg-red-50/60 px-3 py-2 text-[13px] text-red-700">
          {conflictCount} scheduling {conflictCount === 1 ? "conflict" : "conflicts"} on the calendar —
          same-day region clashes or double-booked people. Conflict tools land next.
        </div>
      )}

      <div className="lg:hidden">
        <WeekList presence={presence} data={data} viewerId={viewerId} />
      </div>
      <div className="hidden lg:block">
        <MonthGrid presence={presence} data={data} viewerId={viewerId} />
      </div>
    </div>
  );
}
