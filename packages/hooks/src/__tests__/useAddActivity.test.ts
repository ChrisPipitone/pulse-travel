import { describe, it, expect, vi, beforeEach } from 'vitest'
import { act } from '@testing-library/react'
import { createMockClient } from './helpers/mockClient'
import { renderHookWithClient } from './helpers/renderHookWithProvider'
import { useAddActivity } from '../useAddActivity'
import { useTripStore } from '@pulse/store'
import type { Activity } from '@pulse/types'

const newActivityInput = {
  trip_id: 't1', name: 'Colosseum Tour', region: 'Rome',
  category_id: 'cat-culture', description: null, url: null,
  location: null, duration_hours: null,
}

const createdActivity: Activity = { ...newActivityInput, id: 'server-id', added_by: 'u1', created_at: '2025-06-03' }

describe('useAddActivity', () => {
  let client: ReturnType<typeof createMockClient>

  beforeEach(() => {
    client = createMockClient()
    vi.mocked(client.auth.getUser).mockResolvedValue({ data: { user: { id: 'u1' } } } as never)
    useTripStore.setState({ activities: [] })
  })

  it('pushes the created activity into the store', async () => {
    vi.mocked(client.from).mockReturnValue({
      insert: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({ data: createdActivity, error: null }),
        }),
      }),
    } as never)

    const { result } = renderHookWithClient(() => useAddActivity(), client)
    await act(async () => { await result.current.addActivity(newActivityInput) })

    expect(useTripStore.getState().activities).toContainEqual(createdActivity)
  })

  it('sets error when insert fails', async () => {
    vi.mocked(client.from).mockReturnValue({
      insert: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({ data: null, error: { message: 'insert failed' } }),
        }),
      }),
    } as never)

    const { result } = renderHookWithClient(() => useAddActivity(), client)
    await act(async () => { await result.current.addActivity(newActivityInput) })

    // Store unchanged on failure
    expect(useTripStore.getState().activities).toHaveLength(0)
  })

  it('includes added_by from session user', async () => {
    const insertMock = vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({ single: vi.fn().mockResolvedValue({ data: createdActivity, error: null }) }),
    })
    vi.mocked(client.from).mockReturnValue({ insert: insertMock } as never)

    const { result } = renderHookWithClient(() => useAddActivity(), client)
    await act(async () => { await result.current.addActivity(newActivityInput) })

    expect(insertMock).toHaveBeenCalledWith(expect.objectContaining({ added_by: 'u1' }))
  })
})
