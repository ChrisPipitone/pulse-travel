import { describe, it, expect, vi, beforeEach } from 'vitest'
import { act } from '@testing-library/react'
import { createMockClient } from './helpers/mockClient'
import { renderHookWithClient } from './helpers/renderHookWithProvider'
import { useUpdateTrip } from '../useUpdateTrip'
import { useTripStore } from '@pulse/store'
import type { Trip } from '@pulse/types'

const trip: Trip = {
  id: 'trip1', name: 'Italy', destination: 'Rome',
  start_date: '2025-06-03', end_date: '2025-06-24',
  created_by: 'u1', invite_code: 'abc',
}

describe('useUpdateTrip', () => {
  let client: ReturnType<typeof createMockClient>

  beforeEach(() => {
    client = createMockClient()
    useTripStore.setState({ trip })
  })

  it('optimistically updates store', async () => {
    let resolve!: (v: { data: Trip; error: null }) => void
    const pending = new Promise<{ data: Trip; error: null }>((r) => { resolve = r })
    vi.mocked(client.from).mockReturnValue({
      update: vi.fn().mockReturnValue({ eq: vi.fn().mockReturnValue({ select: vi.fn().mockReturnValue({ single: vi.fn().mockReturnValue(pending) }) }) }),
    } as never)

    const { result } = renderHookWithClient(() => useUpdateTrip(), client)

    act(() => { result.current.updateTrip({ name: 'Italy 2025', destination: 'Rome' }) })

    expect(useTripStore.getState().trip?.name).toBe('Italy 2025')

    await act(async () => { resolve({ data: { ...trip, name: 'Italy 2025' }, error: null }) })
  })

  it('rolls back on failure', async () => {
    vi.mocked(client.from).mockReturnValue({
      update: vi.fn().mockReturnValue({ eq: vi.fn().mockReturnValue({ select: vi.fn().mockReturnValue({ single: vi.fn().mockRejectedValue(new Error('fail')) }) }) }),
    } as never)

    const { result } = renderHookWithClient(() => useUpdateTrip(), client)
    await act(async () => { await result.current.updateTrip({ name: 'Italy 2025', destination: 'Rome' }) })

    expect(useTripStore.getState().trip?.name).toBe('Italy')
    expect(result.current.error).toBeTruthy()
  })
})
