import { describe, it, expect, vi, beforeEach } from 'vitest'
import { act } from '@testing-library/react'
import { createMockClient } from './helpers/mockClient'
import { renderHookWithClient } from './helpers/renderHookWithProvider'
import { useCreateTrip } from '../useCreateTrip'
import type { Trip } from '@pulse/types'

const fakeTrip: Trip = {
  id: 'trip-1', name: 'Italy 2025', destination: 'Italy',
  start_date: '2025-06-03', end_date: '2025-06-24',
  created_by: 'u1', invite_code: 'abc12345',
}

describe('useCreateTrip', () => {
  let client: ReturnType<typeof createMockClient>

  beforeEach(() => {
    client = createMockClient()
    vi.mocked(client.auth.getUser).mockResolvedValue({ data: { user: { id: 'u1' } } } as never)
  })

  it('inserts trip then adds creator as member, returns trip', async () => {
    const insertMock = vi.fn()
      .mockReturnValueOnce({ select: vi.fn().mockReturnThis(), single: vi.fn().mockResolvedValue({ data: fakeTrip, error: null }) })
      .mockReturnValueOnce({ mockResolvedValue: vi.fn(), error: null })

    vi.mocked(client.from)
      .mockReturnValueOnce({ insert: insertMock } as never)
      .mockReturnValueOnce({ insert: vi.fn().mockResolvedValue({ data: null, error: null }) } as never)

    const { result } = renderHookWithClient(() => useCreateTrip(), client)
    let trip: Trip | null = null
    await act(async () => {
      trip = await result.current.createTrip({ name: 'Italy 2025', destination: 'Italy', start_date: '2025-06-03', end_date: '2025-06-24' })
    })

    expect(trip).toEqual(fakeTrip)
    expect(result.current.error).toBeNull()
  })

  it('sets error when not authenticated', async () => {
    vi.mocked(client.auth.getUser).mockResolvedValue({ data: { user: null } } as never)

    const { result } = renderHookWithClient(() => useCreateTrip(), client)
    await act(async () => {
      await result.current.createTrip({ name: 'Test', destination: 'Nowhere' })
    })

    expect(result.current.error).toMatch(/not authenticated/i)
  })

  it('sets error on DB failure', async () => {
    vi.mocked(client.from).mockReturnValue({
      insert: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: null, error: { message: 'insert failed' } }),
    } as never)

    const { result } = renderHookWithClient(() => useCreateTrip(), client)
    await act(async () => {
      await result.current.createTrip({ name: 'Test', destination: 'Nowhere' })
    })

    expect(result.current.error).toBe('insert failed')
  })
})
