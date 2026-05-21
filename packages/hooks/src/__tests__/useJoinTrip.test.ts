import { describe, it, expect, vi, beforeEach } from 'vitest'
import { act } from '@testing-library/react'
import { createMockClient } from './helpers/mockClient'
import { renderHookWithClient } from './helpers/renderHookWithProvider'
import { useJoinTrip } from '../useJoinTrip'
import type { Trip } from '@pulse/types'

const fakeTrip: Trip = {
  id: 'trip-1', name: 'Italy 2025', destination: 'Italy',
  start_date: '2025-06-03', end_date: '2025-06-24',
  created_by: 'owner-id', invite_code: 'italy25',
}

describe('useJoinTrip', () => {
  let client: ReturnType<typeof createMockClient>

  beforeEach(() => {
    client = createMockClient()
    vi.mocked(client.auth.getUser).mockResolvedValue({ data: { user: { id: 'u1' } } } as never)
  })

  it('returns the trip on success', async () => {
    // getTripByInviteCode now uses client.rpc; joinTrip uses client.from
    vi.mocked(client.rpc).mockResolvedValue({ data: [fakeTrip], error: null } as never)
    vi.mocked(client.from).mockReturnValue({
      upsert: vi.fn().mockResolvedValue({ data: null, error: null }),
    } as never)

    const { result } = renderHookWithClient(() => useJoinTrip(), client)
    let returned: Trip | null = null
    await act(async () => { returned = await result.current.joinTrip('italy25') })

    expect(returned).toEqual(fakeTrip)
    expect(result.current.error).toBeNull()
  })

  it('sets error and returns null for invalid invite code', async () => {
    vi.mocked(client.rpc).mockResolvedValue({ data: [], error: null } as never)

    const { result } = renderHookWithClient(() => useJoinTrip(), client)
    let returned: Trip | null = fakeTrip as Trip
    await act(async () => { returned = await result.current.joinTrip('bad-code') })

    expect(returned).toBeNull()
    expect(result.current.error).toMatch(/not found/i)
  })

  it('upserts with ignoreDuplicates so re-joining is safe', async () => {
    const upsertMock = vi.fn().mockResolvedValue({ data: null, error: null })
    vi.mocked(client.rpc).mockResolvedValue({ data: [fakeTrip], error: null } as never)
    vi.mocked(client.from).mockReturnValue({ upsert: upsertMock } as never)

    const { result } = renderHookWithClient(() => useJoinTrip(), client)
    await act(async () => { await result.current.joinTrip('italy25') })

    expect(upsertMock).toHaveBeenCalledWith(
      { trip_id: fakeTrip.id, user_id: 'u1' },
      expect.objectContaining({ ignoreDuplicates: true }),
    )
  })
})
