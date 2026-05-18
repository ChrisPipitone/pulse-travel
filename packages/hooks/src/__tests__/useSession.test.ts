import { describe, it, expect, vi, beforeEach } from 'vitest'
import { act } from '@testing-library/react'
import { createMockClient } from './helpers/mockClient'
import { renderHookWithClient } from './helpers/renderHookWithProvider'
import { useSession } from '../useSession'

describe('useSession', () => {
  let client: ReturnType<typeof createMockClient>

  beforeEach(() => { client = createMockClient() })

  it('starts with loading: true and no user', () => {
    // getSession never resolves — hook is in the async gap
    vi.mocked(client.auth.getSession).mockReturnValue(new Promise(() => {}))
    const { result } = renderHookWithClient(() => useSession(), client)
    expect(result.current.loading).toBe(true)
    expect(result.current.user).toBeNull()
  })

  it('sets user and clears loading once getSession resolves', async () => {
    const fakeUser = { id: 'user-1', email: 'marco@example.com' }
    const fakeSession = { user: fakeUser, access_token: 'tok' }
    vi.mocked(client.auth.getSession).mockResolvedValue({ data: { session: fakeSession } } as never)

    const { result } = renderHookWithClient(() => useSession(), client)

    await act(async () => {})
    expect(result.current.user).toEqual(fakeUser)
    expect(result.current.loading).toBe(false)
  })

  it('updates when onAuthStateChange fires', async () => {
    let authCallback: ((event: string, session: unknown) => void) | null = null
    vi.mocked(client.auth.onAuthStateChange).mockImplementation((cb) => {
      authCallback = cb
      return { data: { subscription: { unsubscribe: vi.fn() } } } as never
    })

    const { result } = renderHookWithClient(() => useSession(), client)
    await act(async () => {})

    const newUser = { id: 'user-2', email: 'sara@example.com' }
    act(() => { authCallback?.('SIGNED_IN', { user: newUser, access_token: 'tok2' }) })

    expect(result.current.user).toEqual(newUser)
  })

  it('unsubscribes on unmount', async () => {
    const unsubscribe = vi.fn()
    vi.mocked(client.auth.onAuthStateChange).mockReturnValue({
      data: { subscription: { unsubscribe } },
    } as never)

    const { unmount } = renderHookWithClient(() => useSession(), client)
    await act(async () => {})
    unmount()

    expect(unsubscribe).toHaveBeenCalledOnce()
  })
})
