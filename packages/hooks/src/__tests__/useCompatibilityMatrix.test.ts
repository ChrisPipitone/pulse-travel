import { describe, it, expect, beforeEach } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useTripStore } from '@pulse/store'
import { useCompatibilityMatrix } from '../useCompatibilityMatrix'
import type { Activity, ActivityRating } from '@pulse/types'

const activity = (id: string): Activity => ({
  id, trip_id: 't1', name: `Activity ${id}`, added_by: 'u1', created_at: '',
})

const rating = (activityId: string, userId: string, r: 'MUST' | 'MAYBE' | 'SKIP'): ActivityRating => ({
  id: `${activityId}-${userId}`, activity_id: activityId, user_id: userId, rating: r,
})

describe('useCompatibilityMatrix', () => {
  beforeEach(() => {
    useTripStore.setState({ activities: [], ratings: [] })
  })

  it('returns empty matrix when no activities', () => {
    const { result } = renderHook(() => useCompatibilityMatrix())
    expect(result.current.matrix).toEqual([])
  })

  it('scores MUST=3, MAYBE=1, SKIP=0', () => {
    useTripStore.setState({
      activities: [activity('a1')],
      ratings: [
        rating('a1', 'u1', 'MUST'),
        rating('a1', 'u2', 'MAYBE'),
        rating('a1', 'u3', 'SKIP'),
      ],
    })

    const { result } = renderHook(() => useCompatibilityMatrix())
    const [item] = result.current.matrix

    expect(item.must_count).toBe(1)
    expect(item.maybe_count).toBe(1)
    expect(item.skip_count).toBe(1)
    expect(item.score).toBe(4) // 1×3 + 1×1 + 0
  })

  it('sorts by score descending', () => {
    useTripStore.setState({
      activities: [activity('a1'), activity('a2'), activity('a3')],
      ratings: [
        rating('a1', 'u1', 'SKIP'),                                // score 0
        rating('a2', 'u1', 'MUST'), rating('a2', 'u2', 'MUST'),   // score 6
        rating('a3', 'u1', 'MAYBE'),                              // score 1
      ],
    })

    const { result } = renderHook(() => useCompatibilityMatrix())
    const ids = result.current.matrix.map((m) => m.activity_id)
    expect(ids).toEqual(['a2', 'a3', 'a1'])
  })

  it('builds ratings lookup keyed by user_id', () => {
    useTripStore.setState({
      activities: [activity('a1')],
      ratings: [rating('a1', 'u1', 'MUST'), rating('a1', 'u2', 'MAYBE')],
    })

    const { result } = renderHook(() => useCompatibilityMatrix())
    expect(result.current.matrix[0].ratings).toEqual({ u1: 'MUST', u2: 'MAYBE' })
  })

  it('handles activity with no ratings', () => {
    useTripStore.setState({ activities: [activity('a1')], ratings: [] })

    const { result } = renderHook(() => useCompatibilityMatrix())
    expect(result.current.matrix[0]).toMatchObject({ score: 0, must_count: 0, maybe_count: 0, skip_count: 0, ratings: {} })
  })
})
