import { describe, it, expect, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useTripStore } from '@pulse/store'
import { useActivityFilter } from '../useActivityFilter'
import type { Activity } from '@pulse/types'

const a = (overrides: Partial<Activity>): Activity => ({
  id: 'a1', trip_id: 't1', name: 'Default', added_by: 'u1', created_at: '',
  region: 'Rome', category_id: 'cat-culture',
  ...overrides,
})

const ACTIVITIES: Activity[] = [
  a({ id: 'a1', name: 'Colosseum Tour',  region: 'Rome',    category_id: 'cat-culture', description: 'Historic ruins' }),
  a({ id: 'a2', name: 'Wine Tasting',    region: 'Tuscany', category_id: 'cat-food' }),
  a({ id: 'a3', name: 'Vatican Museums', region: 'Rome',    category_id: 'cat-culture' }),
]

describe('useActivityFilter', () => {
  beforeEach(() => { useTripStore.setState({ activities: ACTIVITIES }) })

  it('returns all activities with no filters', () => {
    const { result } = renderHook(() => useActivityFilter())
    expect(result.current.filtered).toHaveLength(3)
  })

  it('filters by region', () => {
    const { result } = renderHook(() => useActivityFilter())
    act(() => { result.current.setRegion('Rome') })
    expect(result.current.filtered.map((a) => a.id)).toEqual(['a1', 'a3'])
  })

  it('filters by category', () => {
    const { result } = renderHook(() => useActivityFilter())
    act(() => { result.current.setCategory('cat-food') })
    expect(result.current.filtered.map((a) => a.id)).toEqual(['a2'])
  })

  it('filters by search (case-insensitive, matches name)', () => {
    const { result } = renderHook(() => useActivityFilter())
    act(() => { result.current.setSearch('colosseum') })
    expect(result.current.filtered.map((a) => a.id)).toEqual(['a1'])
  })

  it('filters by search matching description', () => {
    const { result } = renderHook(() => useActivityFilter())
    act(() => { result.current.setSearch('historic') })
    expect(result.current.filtered.map((a) => a.id)).toEqual(['a1'])
  })

  it('combines filters (AND semantics)', () => {
    const { result } = renderHook(() => useActivityFilter())
    act(() => {
      result.current.setRegion('Rome')
      result.current.setCategory('cat-food') // no Rome+food activities
    })
    expect(result.current.filtered).toHaveLength(0)
  })

  it('reset clears all filters', () => {
    const { result } = renderHook(() => useActivityFilter())
    act(() => { result.current.setRegion('Rome'); result.current.setSearch('col') })
    act(() => { result.current.reset() })
    expect(result.current.filtered).toHaveLength(3)
    expect(result.current.region).toBe('')
    expect(result.current.search).toBe('')
  })
})
