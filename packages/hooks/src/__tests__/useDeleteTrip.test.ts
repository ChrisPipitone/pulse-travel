import { describe, it, expect, vi, beforeEach } from 'vitest'
import { act } from '@testing-library/react'
import { createMockClient } from './helpers/mockClient'
import { renderHookWithClient } from './helpers/renderHookWithProvider'
import { useDeleteTrip } from '../useDeleteTrip'

describe('useDeleteTrip', () => {
  let client: ReturnType<typeof createMockClient>

  beforeEach(() => {
    client = createMockClient()
  })

  it('calls onSuccess after delete', async () => {
    vi.mocked(client.from).mockReturnValue({
      delete: vi.fn().mockReturnValue({ eq: vi.fn().mockResolvedValue({ data: null, error: null }) }),
    } as never)

    const onSuccess = vi.fn()
    const { result } = renderHookWithClient(() => useDeleteTrip(), client)
    await act(async () => { await result.current.deleteTrip('trip1', onSuccess) })

    expect(onSuccess).toHaveBeenCalledOnce()
  })

  it('does not call onSuccess on failure', async () => {
    vi.mocked(client.from).mockReturnValue({
      delete: vi.fn().mockReturnValue({ eq: vi.fn().mockRejectedValue(new Error('fail')) }),
    } as never)

    const onSuccess = vi.fn()
    const { result } = renderHookWithClient(() => useDeleteTrip(), client)
    await act(async () => { await result.current.deleteTrip('trip1', onSuccess) })

    expect(onSuccess).not.toHaveBeenCalled()
    expect(result.current.error).toBeTruthy()
  })
})
