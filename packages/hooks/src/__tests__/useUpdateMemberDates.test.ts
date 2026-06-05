import { describe, it, expect, vi, beforeEach } from 'vitest'
import { act } from '@testing-library/react'
import { createMockClient } from './helpers/mockClient'
import { renderHookWithClient } from './helpers/renderHookWithProvider'
import { useUpdateMemberDates } from '../useUpdateMemberDates'
import { useTripStore } from '@pulse/store'
import type { Member, Trip } from '@pulse/types'

vi.mock('../useSession', () => ({
  useSession: () => ({ user: { id: 'u1' }, session: null, loading: false }),
}))

const trip: Trip = { id: 'trip1', name: 'Italy', destination: 'Rome', start_date: '2025-06-03', end_date: '2025-06-24', created_by: 'u1', invite_code: 'abc', invite_code_expires_at: '2099-01-01T00:00:00Z' }
const member: Member = { id: 'u1', name: 'Chris' }

describe('useUpdateMemberDates', () => {
  let client: ReturnType<typeof createMockClient>

  beforeEach(() => {
    client = createMockClient()
    useTripStore.setState({ trip, members: [member] })
  })

  it('optimistically updates member dates in store', async () => {
    let resolve!: () => void
    const pending = new Promise<{ data: null; error: null }>((r) => { resolve = () => r({ data: null, error: null }) })
    vi.mocked(client.from).mockReturnValue({ update: vi.fn().mockReturnValue({ eq: vi.fn().mockReturnValue({ eq: vi.fn().mockReturnValue(pending) }) }) } as never)

    const { result } = renderHookWithClient(() => useUpdateMemberDates(), client)

    act(() => { result.current.updateDates('2025-06-05', '2025-06-20') })

    const stored = useTripStore.getState().members.find((m) => m.id === 'u1')
    expect(stored?.arrival_date).toBe('2025-06-05')
    expect(stored?.departure_date).toBe('2025-06-20')

    await act(async () => { resolve() })
  })

  it('calls updateMemberDates service with correct args', async () => {
    const eqInner = vi.fn().mockResolvedValue({ data: null, error: null })
    const eqOuter = vi.fn().mockReturnValue({ eq: eqInner })
    const updateMock = vi.fn().mockReturnValue({ eq: eqOuter })
    vi.mocked(client.from).mockReturnValue({ update: updateMock } as never)

    const { result } = renderHookWithClient(() => useUpdateMemberDates(), client)
    await act(async () => { await result.current.updateDates('2025-06-05', '2025-06-20') })

    expect(updateMock).toHaveBeenCalledWith({ arrival_date: '2025-06-05', departure_date: '2025-06-20' })
  })

  it('rolls back on failure', async () => {
    vi.mocked(client.from).mockReturnValue({
      update: vi.fn().mockReturnValue({ eq: vi.fn().mockReturnValue({ eq: vi.fn().mockRejectedValue(new Error('network')) }) }),
    } as never)

    const { result } = renderHookWithClient(() => useUpdateMemberDates(), client)
    await act(async () => { await result.current.updateDates('2025-06-05', '2025-06-20') })

    const stored = useTripStore.getState().members.find((m) => m.id === 'u1')
    expect(stored?.arrival_date).toBeUndefined()
    expect(result.current.error).toBeTruthy()
  })

  it('clears dates when null passed', async () => {
    useTripStore.setState({ members: [{ ...member, arrival_date: '2025-06-05', departure_date: '2025-06-20' }] })
    const eqInner = vi.fn().mockResolvedValue({ data: null, error: null })
    vi.mocked(client.from).mockReturnValue({ update: vi.fn().mockReturnValue({ eq: vi.fn().mockReturnValue({ eq: eqInner }) }) } as never)

    const { result } = renderHookWithClient(() => useUpdateMemberDates(), client)
    await act(async () => { await result.current.updateDates(null, null) })

    const stored = useTripStore.getState().members.find((m) => m.id === 'u1')
    expect(stored?.arrival_date).toBeUndefined()
    expect(stored?.departure_date).toBeUndefined()
  })
})
