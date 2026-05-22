import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createMockClient } from './helpers/mockClient'
import { renderHookWithClient } from './helpers/renderHookWithProvider'
import { useUserTrips } from '../useUserTrips'
import type { Trip } from '@pulse/types'

const fakeTrips: Array<Trip & { trip_members: { user_id: string }[] }> = [
  {
    id: 'trip-1', name: 'Italy 2025', destination: 'Italy',
    start_date: '2025-06-03', end_date: '2025-06-24',
    created_by: 'u1', invite_code: 'italy25',
    trip_members: [{ user_id: 'u1' }, { user_id: 'u2' }, { user_id: 'u3' }, { user_id: 'u4' }],
  },
  {
    id: 'trip-2', name: 'Tokyo', destination: 'Japan',
    start_date: '2025-09-01', end_date: '2025-09-10',
    created_by: 'u2', invite_code: 'tokyo25',
    trip_members: [{ user_id: 'u5' }, { user_id: 'u6' }],
  },
]

const fakeProfiles = [
  { id: 'u1', display_name: 'Alice', avatar_url: null },
  { id: 'u2', display_name: 'Bob', avatar_url: null },
]

describe('useUserTrips', () => {
  let client: ReturnType<typeof createMockClient>

  beforeEach(() => {
    client = createMockClient()
  })

  it('returns trips with member_count derived from trip_members array', async () => {
    vi.mocked(client.from).mockImplementation((table: string) => {
      if (table === 'trips') {
        return {
          select: vi.fn().mockReturnThis(),
          order: vi.fn().mockResolvedValue({ data: fakeTrips, error: null }),
        } as never
      }
      return {
        select: vi.fn().mockReturnThis(),
        in: vi.fn().mockResolvedValue({ data: fakeProfiles, error: null }),
      } as never
    })

    const { result } = renderHookWithClient(() => useUserTrips(), client)
    await vi.waitFor(() => expect(result.current.loading).toBe(false))

    expect(result.current.trips).toHaveLength(2)
    expect(result.current.trips[0].member_count).toBe(4)
    expect(result.current.trips[1].member_count).toBe(2)
    expect(result.current.trips[0].member_avatars).toHaveLength(4)
    expect(result.current.error).toBeNull()
  })

  it('sets error on fetch failure', async () => {
    vi.mocked(client.from).mockImplementation(() => ({
      select: vi.fn().mockReturnThis(),
      order: vi.fn().mockResolvedValue({ data: null, error: { message: 'DB error' } }),
    } as never))

    const { result } = renderHookWithClient(() => useUserTrips(), client)
    await vi.waitFor(() => expect(result.current.loading).toBe(false))

    expect(result.current.error).toBe('DB error')
    expect(result.current.trips).toHaveLength(0)
  })
})
