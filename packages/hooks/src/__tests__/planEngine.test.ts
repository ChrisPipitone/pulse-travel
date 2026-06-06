import { describe, it, expect } from 'vitest'
import {
  type PlanMember,
  type PlanEvent,
  type PlanActivity,
  type PlanSlot,
  enumerateDays,
  presenceEnvelope,
  present,
  blocked,
  lockedDay,
  presentCount,
  mustHere,
  works,
  chunkWeeks,
  bestWeekIndex,
  regionClashes,
  doubleBooks,
} from '../planEngine'

const member = (id: string, arrival: string | null, departure: string | null): PlanMember => ({
  id,
  arrival,
  departure,
})

// Italy-ish fixture: Sara early, Marco late, Elena no dates.
const sara = member('S', '2025-06-10', '2025-06-18')
const marco = member('M', '2025-06-14', '2025-06-21')
const elena = member('E', null, null)
const members = [sara, marco, elena]

describe('enumerateDays', () => {
  it('is inclusive and chronological', () => {
    expect(enumerateDays('2025-06-10', '2025-06-12')).toEqual(['2025-06-10', '2025-06-11', '2025-06-12'])
  })
  it('returns [] when end precedes start', () => {
    expect(enumerateDays('2025-06-12', '2025-06-10')).toEqual([])
  })
})

describe('presenceEnvelope', () => {
  it('spans min arrival to max departure, ignoring undated members', () => {
    expect(presenceEnvelope(members)).toEqual({ start: '2025-06-10', end: '2025-06-21' })
  })
  it('is null when no one has both dates', () => {
    expect(presenceEnvelope([elena])).toBeNull()
  })
})

describe('present', () => {
  it('is true inside the window, false outside', () => {
    expect(present(sara, '2025-06-10')).toBe(true)
    expect(present(sara, '2025-06-18')).toBe(true)
    expect(present(sara, '2025-06-19')).toBe(false)
  })
  it('is false for undated members', () => {
    expect(present(elena, '2025-06-15')).toBe(false)
  })
})

describe('presentCount', () => {
  it('counts overlap on a converging day', () => {
    expect(presentCount(members, '2025-06-15')).toBe(2) // Sara + Marco; Elena undated
    expect(presentCount(members, '2025-06-11')).toBe(1) // Sara only
  })
})

describe('blocked / lockedDay', () => {
  const wedding: PlanEvent = { start: '2025-06-16', end: '2025-06-16', memberIds: ['S', 'M', 'E'] }
  const soloThing: PlanEvent = { start: '2025-06-15', end: '2025-06-15', memberIds: ['S'] }
  const events = [wedding, soloThing]

  it('blocks listed members on active days', () => {
    expect(blocked('S', '2025-06-15', events)).toBe(true)
    expect(blocked('M', '2025-06-15', events)).toBe(false)
  })
  it('locks a day only when the event covers all members', () => {
    expect(lockedDay('2025-06-16', events, ['S', 'M', 'E'])).toBe(true)
    expect(lockedDay('2025-06-15', events, ['S', 'M', 'E'])).toBe(false)
  })
})

describe('mustHere / works', () => {
  const colosseum: PlanActivity = { id: 'A', region: 'Rome', mustIds: ['S', 'M'], maybeIds: [] }

  it('works on a day when all MUST crew are present and unblocked', () => {
    expect(works(colosseum, '2025-06-15', members, [], ['S', 'M', 'E'])).toBe(true)
    expect(works(colosseum, '2025-06-11', members, [], ['S', 'M', 'E'])).toBe(false) // Marco not yet
  })
  it('does not work when a MUST member is blocked', () => {
    const ev: PlanEvent[] = [{ start: '2025-06-15', end: '2025-06-15', memberIds: ['M'] }]
    expect(mustHere(colosseum, '2025-06-15', members, ev)).toEqual(['S'])
    expect(works(colosseum, '2025-06-15', members, ev, ['S', 'M', 'E'])).toBe(false)
  })
  it('never works with no MUST crew', () => {
    const empty: PlanActivity = { id: 'B', region: null, mustIds: [], maybeIds: ['S'] }
    expect(works(empty, '2025-06-15', members, [], ['S', 'M', 'E'])).toBe(false)
  })
})

describe('chunkWeeks / bestWeekIndex', () => {
  it('chunks into 7s and finds the highest-overlap week', () => {
    const days = enumerateDays('2025-06-10', '2025-06-21')
    const weeks = chunkWeeks(days)
    expect(weeks[0]).toHaveLength(7)
    // Week 0 (Jun 10–16) carries more presence-days (10) than week 1 (Jun 17–21, 7).
    expect(bestWeekIndex(weeks, members)).toBe(0)
  })
})

describe('regionClashes / doubleBooks', () => {
  const acts = new Map<string, PlanActivity>([
    ['A', { id: 'A', region: 'Rome', mustIds: ['S'], maybeIds: [] }],
    ['B', { id: 'B', region: 'Amalfi', mustIds: ['S'], maybeIds: [] }],
  ])
  const slots: PlanSlot[] = [
    { id: 's1', activityId: 'A', date: '2025-06-15', memberIds: ['S', 'M'] },
    { id: 's2', activityId: 'B', date: '2025-06-15', memberIds: ['S'] },
  ]

  it('flags two regions on one day', () => {
    const clashes = regionClashes(slots, acts)
    expect(clashes).toHaveLength(1)
    expect(clashes[0].regions.sort()).toEqual(['Amalfi', 'Rome'])
  })
  it('flags a person booked twice on one day', () => {
    const dbl = doubleBooks(slots)
    expect(dbl).toHaveLength(1)
    expect(dbl[0].memberIds).toEqual(['S']) // S in both, M in only one
  })
})
