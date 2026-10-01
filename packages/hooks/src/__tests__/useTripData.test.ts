import { describe, it, expect, vi, beforeEach } from 'vitest'
import { act } from '@testing-library/react'
import { createMockClient, mockQueryBuilder } from './helpers/mockClient'
import { renderHookWithClient } from './helpers/renderHookWithProvider'
import { useTripData } from '../useTripData'
import { useTripStore } from '@pulse/store'
import type { Trip, Member, Activity } from '@pulse/types'

const fakeTrip: Trip = { id: 't1', name: 'Italy 2025', destination: 'Italy', start_date: '', end_date: '', created_by: 'u1', invite_code: 'abc', invite_code_expires_at: '2099-01-01T00:00:00Z' }
// getMembers fetches trip_members rows then joins profiles — fakeMembers reflects the mapped output.
const fakeTripMemberRows = [{ user_id: 'u1', arrival_date: '', departure_date: '' }]
const fakeProfileRows = [{ id: 'u1', display_name: 'Marco', avatar_url: null }]
const fakeMembers: Member[] = [{ id: 'u1', name: 'Marco', email: '', avatar_url: undefined, arrival_date: '', departure_date: '' }]
const fakeActivities: Activity[] = [{ id: 'a1', trip_id: 't1', name: 'Colosseum', added_by: 'u1', created_at: '' }]

describe('useTripData', () => {
  let client: ReturnType<typeof createMockClient>

  beforeEach(() => {
    client = createMockClient()
    useTripStore.setState({ trip: null, members: [], activities: [], ratings: [] })

    vi.mocked(client.from).mockImplementation((table: string) => {
      if (table === 'trips')        return { select: vi.fn().mockReturnThis(), eq: vi.fn().mockReturnThis(), single: vi.fn().mockResolvedValue({ data: fakeTrip, error: null }) } as never
      if (table === 'trip_members') return { select: vi.fn().mockReturnThis(), eq: vi.fn().mockResolvedValue({ data: fakeTripMemberRows, error: null }) } as never
      if (table === 'profiles')     return { select: vi.fn().mockReturnThis(), in: vi.fn().mockResolvedValue({ data: fakeProfileRows, error: null }) } as never
      if (table === 'activities')   return { select: vi.fn().mockReturnThis(), eq: vi.fn().mockReturnThis(), order: vi.fn().mockResolvedValue({ data: fakeActivities, error: null }) } as never
      if (table === 'activity_ratings') return { select: vi.fn().mockReturnThis(), in: vi.fn().mockResolvedValue({ data: [], error: null }) } as never
      if (table === 'stops')        return mockQueryBuilder([]) as never
      return {} as never
    })
  })

  it('loads trip, members, activities, ratings into store', async () => {
    const { result } = renderHookWithClient(() => useTripData('t1'), client)
    await act(async () => {})

    const store = useTripStore.getState()
    expect(store.trip).toEqual(fakeTrip)
    expect(store.members).toEqual(fakeMembers)
    expect(store.activities).toEqual(fakeActivities)
    expect(result.current.loading).toBe(false)
  })

  it('sets error state when fetch throws', async () => {
    vi.mocked(client.from).mockImplementation(() => { throw new Error('DB down') })
    const { result } = renderHookWithClient(() => useTripData('t1'), client)
    await act(async () => {})

    expect(result.current.error).toBeTruthy()
    expect(result.current.loading).toBe(false)
  })

  it('creates a real-time channel named for the trip', async () => {
    renderHookWithClient(() => useTripData('t1'), client)
    await act(async () => {})
    expect(client.channel).toHaveBeenCalledWith('trip-t1')
  })

  it('removes the channel on unmount', async () => {
    const { unmount } = renderHookWithClient(() => useTripData('t1'), client)
    await act(async () => {})
    unmount()
    expect(client.removeChannel).toHaveBeenCalledOnce()
  })

  it('does not fetch when tripId is empty', async () => {
    renderHookWithClient(() => useTripData(''), client)
    await act(async () => {})
    expect(client.from).not.toHaveBeenCalled()
  })
})
