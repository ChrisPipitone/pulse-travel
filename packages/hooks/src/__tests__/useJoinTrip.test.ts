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

  // Both lookups go through client.rpc: get_trip_by_invite_code returns the
  // preview, join_trip_by_invite_code verifies the code server-side and returns
  // the joined trip id (null if the code is invalid).
  function mockRpc(preview: Trip[], joinedId: string | null) {
    vi.mocked(client.rpc).mockImplementation((fn: string) =>
      Promise.resolve(
        fn === 'join_trip_by_invite_code'
          ? { data: joinedId, error: null }
          : { data: preview, error: null },
      ) as never,
    )
  }

  it('returns the trip on success', async () => {
    mockRpc([fakeTrip], fakeTrip.id)

    const { result } = renderHookWithClient(() => useJoinTrip(), client)
    let returned: Trip | null = null
    await act(async () => { returned = await result.current.joinTrip('italy25') })

    expect(returned).toEqual(fakeTrip)
    expect(result.current.error).toBeNull()
  })

  it('sets error and returns null for invalid invite code', async () => {
    mockRpc([], null)

    const { result } = renderHookWithClient(() => useJoinTrip(), client)
    let returned: Trip | null = fakeTrip as Trip
    await act(async () => { returned = await result.current.joinTrip('bad-code') })

    expect(returned).toBeNull()
    expect(result.current.error).toMatch(/not found/i)
  })

  it('joins via the invite-code RPC so re-joining is a safe no-op', async () => {
    mockRpc([fakeTrip], fakeTrip.id)

    const { result } = renderHookWithClient(() => useJoinTrip(), client)
    await act(async () => { await result.current.joinTrip('italy25') })

    expect(client.rpc).toHaveBeenCalledWith('join_trip_by_invite_code', { p_code: 'italy25' })
  })
})
