import { useMemo } from "react";
import { useTripStore } from "@pulse/store";
import {
  useCrewRows,
  usePresence,
  useConvergence,
  type PresenceModel,
  type ConvergenceModel,
  type PlanMember,
  type PlanActivity,
  type PlanSlot,
  type ISODate,
} from "@pulse/hooks";
import type { Member, Rating, Stop } from "@pulse/types";
import { buildRegionColors } from "./regionColor";

export interface DaySlotView {
  slotId: string;
  activityId: string;
  name: string;
  region: string | null;
  color: string | null;
  crew: Member[];
  myRating: Rating | null;
  maybeCount: number;
  isSplit: boolean;
  clash: boolean;
}

export interface PlanData {
  presence: PresenceModel;
  convergence: ConvergenceModel;
  membersById: Map<string, Member>;
  slotsByDay: Map<ISODate, DaySlotView[]>;
  legForDay: (day: ISODate) => Stop | null;
  hasActivities: boolean;
}

// App-layer adapter: turns store rows into the engine's portable shapes, runs the
// pure hooks, and derives the per-day view models the calendar renders.
export function usePlanData(viewerId: string | undefined): PlanData {
  const members = useTripStore((s) => s.members);
  const activities = useTripStore((s) => s.activities);
  const ratings = useTripStore((s) => s.ratings);
  const stops = useTripStore((s) => s.stops);
  const slots = useTripStore((s) => s.slots);

  const crewRows = useCrewRows({ activities, members, ratings, userId: viewerId, sortKey: "cant-miss" });

  const planMembers: PlanMember[] = useMemo(
    () => members.map((m) => ({ id: m.id, arrival: m.arrival_date ?? null, departure: m.departure_date ?? null })),
    [members]
  );

  const planActivities: PlanActivity[] = useMemo(
    () =>
      crewRows.map((r) => ({
        id: r.activity.id,
        region: r.activity.region ?? null,
        mustIds: r.mustMembers.map((m) => m.id),
        maybeIds: r.maybeMembers.map((m) => m.id),
      })),
    [crewRows]
  );

  const planSlots: PlanSlot[] = useMemo(
    () => slots.map((s) => ({ id: s.id, activityId: s.activity_id, date: s.date, memberIds: s.member_ids })),
    [slots]
  );

  const presence = usePresence(planMembers);
  const convergence = useConvergence(planActivities, planMembers, planSlots);

  const membersById = useMemo(() => new Map(members.map((m) => [m.id, m])), [members]);

  const regionColors = useMemo(
    () => buildRegionColors(crewRows.map((r) => r.activity.region ?? null)),
    [crewRows]
  );

  const slotsByDay = useMemo(() => {
    const rowByActivity = new Map(crewRows.map((r) => [r.activity.id, r]));
    const slotCountByActivity = new Map<string, number>();
    for (const s of slots) slotCountByActivity.set(s.activity_id, (slotCountByActivity.get(s.activity_id) ?? 0) + 1);

    const map = new Map<ISODate, DaySlotView[]>();
    for (const s of slots) {
      const row = rowByActivity.get(s.activity_id);
      if (!row) continue;
      const region = row.activity.region ?? null;
      const view: DaySlotView = {
        slotId: s.id,
        activityId: s.activity_id,
        name: row.activity.name,
        region,
        color: region ? regionColors.get(region) ?? null : null,
        crew: s.member_ids.map((id) => membersById.get(id)).filter((m): m is Member => !!m),
        myRating: row.myRating,
        maybeCount: row.maybeCount,
        isSplit: (slotCountByActivity.get(s.activity_id) ?? 0) > 1,
        clash: convergence.clashDays.has(s.date),
      };
      const list = map.get(s.date) ?? [];
      list.push(view);
      map.set(s.date, list);
    }
    return map;
  }, [slots, crewRows, membersById, regionColors, convergence]);

  const legForDay = useMemo(() => {
    const dated = stops.filter((s) => s.date_from && s.date_to);
    return (day: ISODate): Stop | null =>
      dated.find((s) => (s.date_from as string) <= day && day <= (s.date_to as string)) ?? null;
  }, [stops]);

  return {
    presence,
    convergence,
    membersById,
    slotsByDay,
    legForDay,
    hasActivities: activities.length > 0,
  };
}
