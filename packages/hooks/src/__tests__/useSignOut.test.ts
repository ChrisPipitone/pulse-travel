import { describe, it, expect, vi, beforeEach } from 'vitest'
import { act } from '@testing-library/react'
import { createMockClient } from './helpers/mockClient'
import { renderHookWithClient } from './helpers/renderHookWithProvider'
import { useSignOut } from '../useSignOut'
import { useTripStore } from '@pulse/store'

describe('useSignOut', () => {
  let client: ReturnType<typeof createMockClient>

  beforeEach(() => {
    client = createMockClient()
    // Seed the store with data to verify it gets cleared
    useTripStore.setState({ trip: { id: 'trip-1' } as never, members: [{ id: 'u1' } as never] })
  })

  it('calls client.auth.signOut', async () => {
    const { result } = renderHookWithClient(() => useSignOut(), client)
    await act(async () => { await result.current.signOut() })
    expect(client.auth.signOut).toHaveBeenCalledOnce()
  })

  it('resets the Zustand store on sign out', async () => {
    const { result } = renderHookWithClient(() => useSignOut(), client)
    await act(async () => { await result.current.signOut() })

    const store = useTripStore.getState()
    expect(store.trip).toBeNull()
    expect(store.members).toEqual([])
  })
})
