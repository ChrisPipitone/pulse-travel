import { describe, it, expect, vi, beforeEach } from 'vitest'
import { act } from '@testing-library/react'
import { createMockClient } from './helpers/mockClient'
import { renderHookWithClient } from './helpers/renderHookWithProvider'
import { useActivityActions } from '../useActivityActions'
import { useTripStore } from '@pulse/store'
import type { Activity } from '@pulse/types'

const existing: Activity = {
  id: 'a1', trip_id: 't1', name: 'Colosseum Tour', added_by: 'u1',
  created_at: '2025-06-03', location: 'Rome', description: null,
  url: null, region: null, duration_hours: null, category_id: null,
}

const updated: Activity = { ...existing, name: 'Colosseum Skip-Line Tour' }

describe('useActivityActions — updateActivity', () => {
  let client: ReturnType<typeof createMockClient>

  beforeEach(() => {
    client = createMockClient()
    useTripStore.setState({ activities: [existing] })
  })

  it('updates store on success', async () => {
    vi.mocked(client.from).mockReturnValue({
      update: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: updated, error: null }),
          }),
        }),
      }),
    } as never)

    const { result } = renderHookWithClient(() => useActivityActions(), client)
    await act(async () => { await result.current.updateActivity('a1', { name: updated.name }) })

    expect(useTripStore.getState().activities[0].name).toBe('Colosseum Skip-Line Tour')
    expect(result.current.error).toBeNull()
  })

  it('sets error and leaves store unchanged on failure', async () => {
    vi.mocked(client.from).mockReturnValue({
      update: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: null, error: { message: 'update failed' } }),
          }),
        }),
      }),
    } as never)

    const { result } = renderHookWithClient(() => useActivityActions(), client)
    await act(async () => { await result.current.updateActivity('a1', { name: 'new name' }) })

    expect(useTripStore.getState().activities[0].name).toBe('Colosseum Tour')
    expect(result.current.error).toBe('update failed')
  })
})

describe('useActivityActions — deleteActivity', () => {
  let client: ReturnType<typeof createMockClient>

  beforeEach(() => {
    client = createMockClient()
    useTripStore.setState({ activities: [existing] })
  })

  it('removes from store optimistically on success', async () => {
    vi.mocked(client.from).mockReturnValue({
      delete: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ error: null }),
      }),
    } as never)

    const { result } = renderHookWithClient(() => useActivityActions(), client)
    await act(async () => { await result.current.deleteActivity('a1') })

    expect(useTripStore.getState().activities).toHaveLength(0)
    expect(result.current.error).toBeNull()
  })

  it('rolls back store on failure', async () => {
    vi.mocked(client.from).mockReturnValue({
      delete: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ error: { message: 'delete failed' } }),
      }),
    } as never)

    const { result } = renderHookWithClient(() => useActivityActions(), client)
    await act(async () => { await result.current.deleteActivity('a1') })

    expect(useTripStore.getState().activities).toHaveLength(1)
    expect(result.current.error).toBe('delete failed')
  })
})
