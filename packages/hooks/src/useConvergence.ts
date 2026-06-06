import { useMemo } from 'react'
import {
  type ISODate,
  type PlanMember,
  type PlanEvent,
  type PlanActivity,
  type PlanSlot,
  type RegionClash,
  type DoubleBook,
  works,
  regionClashes,
  doubleBooks,
} from './planEngine'

export interface ConvergenceModel {
  works: (activityId: string, day: ISODate) => boolean
  regionClashes: RegionClash[]
  doubleBooks: DoubleBook[]
  clashDays: Set<ISODate>
}

// Convergence + same-day conflict lens over the current placements. Pure + memoized;
// shares the engine module with the future authoritative API route.
// (nudgesFor / splitPlan are deferred to the editing/tools phase.)
export function useConvergence(
  activities: PlanActivity[],
  members: PlanMember[],
  slots: PlanSlot[],
  events: PlanEvent[] = []
): ConvergenceModel {
  return useMemo(() => {
    const byId = new Map(activities.map((a) => [a.id, a]))
    const allIds = members.map((m) => m.id)

    const regions = regionClashes(slots, byId)
    const doubles = doubleBooks(slots)
    const clashDays = new Set<ISODate>()
    regions.forEach((c) => clashDays.add(c.day))
    doubles.forEach((c) => clashDays.add(c.day))

    return {
      works: (activityId, day) => {
        const a = byId.get(activityId)
        return a ? works(a, day, members, events, allIds) : false
      },
      regionClashes: regions,
      doubleBooks: doubles,
      clashDays,
    }
  }, [activities, members, slots, events])
}
