import { describe, it, expect, vi, beforeEach } from 'vitest'
import { act } from '@testing-library/react'
import { createMockClient } from './helpers/mockClient'
import { renderHookWithClient } from './helpers/renderHookWithProvider'
import { useRemoveMember } from '../useRemoveMember'
import { useTripStore } from '@pulse/store'
import type { Member, Trip } from '@pulse/types'

const trip: Trip = { id: 'trip1', name: 'Italy', destination: 'Rome', start_date: '2025-06-03', end_date: '2025-06-24', created_by: 'u1', invite_code: 'abc', invite_code_expires_at: '2099-01-01T00:00:00Z' }
const members: Member[] = [
  { id: 'u1', name: 'Chris' },
  { id: 'u2', name: 'Sara' },
]

describe('useRemoveMember', () => {
  let client: ReturnType<typeof createMockClient>

  beforeEach(() => {
    client = createMockClient()
    useTripStore.setState({ trip, members: [...members] })
  })

  it('optimistically removes member from store', async () => {
    let resolve!: () => void
    const pending = new Promise<{ data: null; error: null }>((r) => { resolve = () => r({ data: null, error: null }) })
    vi.mocked(client.from).mockReturnValue({ delete: vi.fn().mockReturnValue({ eq: vi.fn().mockReturnValue({ eq: vi.fn().mockReturnValue(pending) }) }) } as never)

    const { result } = renderHookWithClient(() => useRemoveMember(), client)

    act(() => { result.current.removeMember('u2') })

    expect(useTripStore.getState().members.find((m) => m.id === 'u2')).toBeUndefined()
    expect(result.current.removingId).toBe('u2')

    await act(async () => { resolve() })
    expect(result.current.removingId).toBeNull()
  })

  it('rolls back on failure', async () => {
    vi.mocked(client.from).mockReturnValue({
      delete: vi.fn().mockReturnValue({ eq: vi.fn().mockReturnValue({ eq: vi.fn().mockRejectedValue(new Error('fail')) }) }),
    } as never)

    const { result } = renderHookWithClient(() => useRemoveMember(), client)
    await act(async () => { await result.current.removeMember('u2') })

    expect(useTripStore.getState().members).toHaveLength(2)
    expect(result.current.error).toBeTruthy()
  })

  it('sets removingId to null after success', async () => {
    vi.mocked(client.from).mockReturnValue({
      delete: vi.fn().mockReturnValue({ eq: vi.fn().mockReturnValue({ eq: vi.fn().mockResolvedValue({ data: null, error: null }) }) }),
    } as never)

    const { result } = renderHookWithClient(() => useRemoveMember(), client)
    await act(async () => { await result.current.removeMember('u2') })

    expect(result.current.removingId).toBeNull()
  })
})
