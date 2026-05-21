import { describe, it, expect, vi, beforeEach } from 'vitest'
import { act } from '@testing-library/react'
import { createMockClient } from './helpers/mockClient'
import { renderHookWithClient } from './helpers/renderHookWithProvider'
import { useRateActivity } from '../useRateActivity'
import { useTripStore } from '@pulse/store'
import type { ActivityRating } from '@pulse/types'

// useRateActivity reads user from useSession synchronously so the optimistic
// update has no async gap. Mock it at module level for all tests in this file.
vi.mock('../useSession', () => ({
  useSession: () => ({ user: { id: 'u1' }, session: null, loading: false }),
}))

const existingRating: ActivityRating = { id: 'r1', activity_id: 'a1', user_id: 'u1', rating: 'MEH' }

describe('useRateActivity', () => {
  let client: ReturnType<typeof createMockClient>

  beforeEach(() => {
    client = createMockClient()
    useTripStore.setState({ ratings: [existingRating] })
  })

  it('applies optimistic update to store immediately', async () => {
    // Hold the network call open so we can inspect the store mid-flight
    let resolve!: () => void
    const pending = new Promise<{ data: null; error: null }>((r) => { resolve = () => r({ data: null, error: null }) })
    vi.mocked(client.from).mockReturnValue({ upsert: vi.fn().mockReturnValue(pending) } as never)

    const { result } = renderHookWithClient(() => useRateActivity(), client)

    act(() => { result.current.rateActivity('a1', 'MUST') })

    // Store updated before the promise resolves
    const stored = useTripStore.getState().ratings.find((r) => r.activity_id === 'a1' && r.user_id === 'u1')
    expect(stored?.rating).toBe('MUST')

    await act(async () => { resolve() })
  })

  it('rolls back store on network failure', async () => {
    vi.mocked(client.from).mockReturnValue({
      upsert: vi.fn().mockRejectedValue(new Error('network error')),
    } as never)

    const { result } = renderHookWithClient(() => useRateActivity(), client)

    await act(async () => { await result.current.rateActivity('a1', 'MUST') })

    // Store rolled back to original MEH rating
    const stored = useTripStore.getState().ratings.find((r) => r.activity_id === 'a1')
    expect(stored?.rating).toBe('MEH')
    expect(result.current.error).toBeTruthy()
  })

  it('calls upsertRating with correct args', async () => {
    const { result } = renderHookWithClient(() => useRateActivity(), client)
    await act(async () => { await result.current.rateActivity('a1', 'WANT') })

    expect(client.from).toHaveBeenCalledWith('activity_ratings')
  })

  it('optimistically removes rating when tapping the active rating', async () => {
    let resolve!: () => void
    const pending = new Promise<{ data: null; error: null }>((r) => { resolve = () => r({ data: null, error: null }) })
    vi.mocked(client.from).mockReturnValue({ delete: vi.fn().mockReturnValue({ eq: vi.fn().mockReturnValue({ eq: vi.fn().mockReturnValue(pending) }) }) } as never)

    const { result } = renderHookWithClient(() => useRateActivity(), client)

    // 'MEH' is the existing rating — tapping it again should toggle off
    act(() => { result.current.rateActivity('a1', 'MEH') })

    expect(useTripStore.getState().ratings.find((r) => r.activity_id === 'a1')).toBeUndefined()

    await act(async () => { resolve() })
  })

  it('calls deleteRating when toggling off', async () => {
    const deleteMock = vi.fn().mockReturnValue({ eq: vi.fn().mockReturnValue({ eq: vi.fn().mockResolvedValue({ data: null, error: null }) }) })
    vi.mocked(client.from).mockReturnValue({ delete: deleteMock } as never)

    const { result } = renderHookWithClient(() => useRateActivity(), client)
    await act(async () => { await result.current.rateActivity('a1', 'MEH') })

    expect(deleteMock).toHaveBeenCalled()
  })

  it('rolls back on deleteRating failure', async () => {
    vi.mocked(client.from).mockReturnValue({
      delete: vi.fn().mockReturnValue({ eq: vi.fn().mockReturnValue({ eq: vi.fn().mockRejectedValue(new Error('network error')) }) }),
    } as never)

    const { result } = renderHookWithClient(() => useRateActivity(), client)
    await act(async () => { await result.current.rateActivity('a1', 'MEH') })

    const stored = useTripStore.getState().ratings.find((r) => r.activity_id === 'a1')
    expect(stored?.rating).toBe('MEH')
    expect(result.current.error).toBeTruthy()
  })
})
