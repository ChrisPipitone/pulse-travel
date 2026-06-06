// Convergence-calendar pure engine — see docs/decisions/CONVERGENCE_CALENDAR.md.
// Framework-free so the client preview (usePresence/useConvergence) and the future
// authoritative API route (/api/trip/[id]/plan) run the SAME code.
//
// Days are ISO 'yyyy-mm-dd' strings; lexicographic compare == chronological compare,
// so range checks need no Date parsing. A member with no arrival/departure is treated
// as not present (graceful degradation, not a hard fail).

export type ISODate = string

export interface PlanMember {
  id: string
  arrival: ISODate | null
  departure: ISODate | null
}

// A blocking window (e.g. a wedding). Spans start..end inclusive.
export interface PlanEvent {
  start: ISODate
  end: ISODate
  memberIds: string[]
}

export interface PlanActivity {
  id: string
  region: string | null
  mustIds: string[]
  maybeIds: string[]
}

export interface PlanSlot {
  id: string
  activityId: string
  date: ISODate
  memberIds: string[]
}

const inRange = (d: ISODate, start: ISODate, end: ISODate) => start <= d && d <= end

function addDays(iso: ISODate, n: number): ISODate {
  const dt = new Date(iso + 'T00:00:00')
  dt.setDate(dt.getDate() + n)
  return dt.toISOString().slice(0, 10)
}

export function enumerateDays(start: ISODate, end: ISODate): ISODate[] {
  if (end < start) return []
  const out: ISODate[] = []
  for (let d = start; d <= end; d = addDays(d, 1)) out.push(d)
  return out
}

// Envelope = min(arrival) … max(departure) across members who have both dates.
export function presenceEnvelope(members: PlanMember[]): { start: ISODate; end: ISODate } | null {
  const dated = members.filter((m) => m.arrival && m.departure)
  if (dated.length === 0) return null
  let start = dated[0].arrival as ISODate
  let end = dated[0].departure as ISODate
  for (const m of dated) {
    if ((m.arrival as ISODate) < start) start = m.arrival as ISODate
    if ((m.departure as ISODate) > end) end = m.departure as ISODate
  }
  return { start, end }
}

export function present(member: PlanMember, day: ISODate): boolean {
  if (!member.arrival || !member.departure) return false
  return inRange(day, member.arrival, member.departure)
}

export function eventsActiveOnDay(events: PlanEvent[], day: ISODate): PlanEvent[] {
  return events.filter((e) => inRange(day, e.start, e.end))
}

export function blocked(memberId: string, day: ISODate, events: PlanEvent[]): boolean {
  return eventsActiveOnDay(events, day).some((e) => e.memberIds.includes(memberId))
}

// Whole-group lock: an active event whose members cover every trip member.
export function lockedDay(day: ISODate, events: PlanEvent[], allMemberIds: string[]): boolean {
  if (allMemberIds.length === 0) return false
  return eventsActiveOnDay(events, day).some((e) =>
    allMemberIds.every((id) => e.memberIds.includes(id))
  )
}

export function presentMemberIds(members: PlanMember[], day: ISODate): string[] {
  return members.filter((m) => present(m, day)).map((m) => m.id)
}

export function presentCount(members: PlanMember[], day: ISODate): number {
  return members.reduce((n, m) => (present(m, day) ? n + 1 : n), 0)
}

// All present + unblocked MUST crew of an activity on a day.
export function mustHere(
  activity: PlanActivity,
  day: ISODate,
  members: PlanMember[],
  events: PlanEvent[]
): string[] {
  const byId = new Map(members.map((m) => [m.id, m]))
  return activity.mustIds.filter((id) => {
    const m = byId.get(id)
    return !!m && present(m, day) && !blocked(id, day, events)
  })
}

// A day "works" for an activity when all its MUST crew are present and unblocked
// and the day isn't whole-group locked.
export function works(
  activity: PlanActivity,
  day: ISODate,
  members: PlanMember[],
  events: PlanEvent[],
  allMemberIds: string[]
): boolean {
  if (activity.mustIds.length === 0) return false
  if (lockedDay(day, events, allMemberIds)) return false
  return mustHere(activity, day, members, events).length === activity.mustIds.length
}

// Group a flat day list into consecutive 7-day weeks (proto-style chunks).
export function chunkWeeks(days: ISODate[]): ISODate[][] {
  const weeks: ISODate[][] = []
  for (let i = 0; i < days.length; i += 7) weeks.push(days.slice(i, i + 7))
  return weeks
}

// Index of the week with the highest total presence (the "best overlap" week).
export function bestWeekIndex(weeks: ISODate[][], members: PlanMember[]): number {
  if (weeks.length === 0) return -1
  let best = 0
  let bestScore = -1
  weeks.forEach((week, i) => {
    const score = week.reduce((s, d) => s + presentCount(members, d), 0)
    if (score > bestScore) {
      bestScore = score
      best = i
    }
  })
  return best
}

// Two activities placed in different regions on the same day (can't be two places).
export interface RegionClash {
  day: ISODate
  regions: string[]
  slotIds: string[]
}

export function regionClashes(
  slots: PlanSlot[],
  activitiesById: Map<string, PlanActivity>
): RegionClash[] {
  const byDay = new Map<ISODate, PlanSlot[]>()
  for (const s of slots) {
    const list = byDay.get(s.date) ?? []
    list.push(s)
    byDay.set(s.date, list)
  }
  const out: RegionClash[] = []
  for (const [day, daySlots] of byDay) {
    const regions = [
      ...new Set(
        daySlots
          .map((s) => activitiesById.get(s.activityId)?.region ?? null)
          .filter((r): r is string => !!r)
      ),
    ]
    if (regions.length > 1) {
      out.push({ day, regions, slotIds: daySlots.map((s) => s.id) })
    }
  }
  return out
}

// One person assigned to 2+ activities on the same day.
export interface DoubleBook {
  day: ISODate
  memberIds: string[]
  slotIds: string[]
}

export function doubleBooks(slots: PlanSlot[]): DoubleBook[] {
  const byDay = new Map<ISODate, PlanSlot[]>()
  for (const s of slots) {
    const list = byDay.get(s.date) ?? []
    list.push(s)
    byDay.set(s.date, list)
  }
  const out: DoubleBook[] = []
  for (const [day, daySlots] of byDay) {
    const count = new Map<string, number>()
    for (const s of daySlots) {
      for (const id of s.memberIds) count.set(id, (count.get(id) ?? 0) + 1)
    }
    const dbl = [...count.entries()].filter(([, n]) => n > 1).map(([id]) => id)
    if (dbl.length) out.push({ day, memberIds: dbl, slotIds: daySlots.map((s) => s.id) })
  }
  return out
}
