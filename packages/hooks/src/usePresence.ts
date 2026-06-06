import { useMemo } from 'react'
import {
  type ISODate,
  type PlanMember,
  type PlanEvent,
  presenceEnvelope,
  enumerateDays,
  chunkWeeks,
  bestWeekIndex,
  presentMemberIds,
  lockedDay,
  eventsActiveOnDay,
} from './planEngine'

export interface PresenceModel {
  envelope: { start: ISODate; end: ISODate } | null
  days: ISODate[]
  weeks: ISODate[][]
  bestWeek: number
  total: number
  presentIds: (day: ISODate) => string[]
  count: (day: ISODate) => number
  isPeak: (day: ISODate) => boolean
  locked: (day: ISODate) => boolean
  eventsOn: (day: ISODate) => PlanEvent[]
}

// Per-day presence derivations for the calendar. Pure + memoized; recomputes only
// when members/events change (drag-your-dates re-flow needs no round-trip).
export function usePresence(members: PlanMember[], events: PlanEvent[] = []): PresenceModel {
  return useMemo(() => {
    const envelope = presenceEnvelope(members)
    const days = envelope ? enumerateDays(envelope.start, envelope.end) : []
    const weeks = chunkWeeks(days)
    const total = members.length
    const allIds = members.map((m) => m.id)

    const presentByDay = new Map<ISODate, string[]>()
    for (const d of days) presentByDay.set(d, presentMemberIds(members, d))

    const presentIds = (day: ISODate) => presentByDay.get(day) ?? presentMemberIds(members, day)
    const count = (day: ISODate) => presentIds(day).length

    return {
      envelope,
      days,
      weeks,
      bestWeek: bestWeekIndex(weeks, members),
      total,
      presentIds,
      count,
      isPeak: (day) => total > 0 && count(day) === total,
      locked: (day) => lockedDay(day, events, allIds),
      eventsOn: (day) => eventsActiveOnDay(events, day),
    }
  }, [members, events])
}
