import { describe, it, expect, vi, beforeEach } from 'vitest'
import { act } from '@testing-library/react'
import { createMockClient } from './helpers/mockClient'
import { renderHookWithClient } from './helpers/renderHookWithProvider'
import { useRegenerateInvite } from '../useRegenerateInvite'
import { useTripStore } from '@pulse/store'
import type { Trip } from '@pulse/types'

const trip: Trip = {
  id: 'trip1', name: 'Italy', destination: 'Rome',
  start_date: '2025-06-03', end_date: '2025-06-24',
  created_by: 'u1', invite_code: 'OLDCODE', invite_code_expires_at: '2026-01-01T00:00:00Z',
}

describe('useRegenerateInvite', () => {
  let client: ReturnType<typeof createMockClient>

  beforeEach(() => {
    client = createMockClient()
    useTripStore.setState({ trip })
  })

  it('updates store with the new code and expiry on success', async () => {
    vi.mocked(client.rpc).mockResolvedValue({
      data: [{ invite_code: 'NEWCODE12345', invite_code_expires_at: '2099-01-01T00:00:00Z' }],
      error: null,
    } as never)

    const { result } = renderHookWithClient(() => useRegenerateInvite(), client)

    let ok = false
    await act(async () => { ok = await result.current.regenerate() })

    expect(ok).toBe(true)
    expect(client.rpc).toHaveBeenCalledWith('regenerate_invite_code', { p_trip_id: 'trip1' })
    expect(useTripStore.getState().trip?.invite_code).toBe('NEWCODE12345')
    expect(useTripStore.getState().trip?.invite_code_expires_at).toBe('2099-01-01T00:00:00Z')
  })

  it('sets error and leaves store unchanged on failure', async () => {
    vi.mocked(client.rpc).mockResolvedValue({ data: null, error: { message: 'not owner' } } as never)

    const { result } = renderHookWithClient(() => useRegenerateInvite(), client)

    let ok = true
    await act(async () => { ok = await result.current.regenerate() })

    expect(ok).toBe(false)
    expect(result.current.error).toBe('not owner')
    expect(useTripStore.getState().trip?.invite_code).toBe('OLDCODE')
  })
})
