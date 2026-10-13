import { describe, it, expect, vi, beforeEach } from 'vitest'
import { act } from '@testing-library/react'
import { createMockClient } from './helpers/mockClient'
import { renderHookWithClient } from './helpers/renderHookWithProvider'
import { useDemoEntry } from '../useDemoEntry'

describe('useDemoEntry', () => {
  let client: ReturnType<typeof createMockClient>

  beforeEach(() => {
    client = createMockClient()
    vi.mocked(client.rpc).mockResolvedValue({ data: 'trip-1', error: null } as never)
  })

  it('signs in anonymously when there is no session and returns the cloned trip id', async () => {
    const { result } = renderHookWithClient(() => useDemoEntry(), client)
    let tripId: string | null = null
    await act(async () => { tripId = await result.current.enterDemo() })
    expect(client.auth.signInAnonymously).toHaveBeenCalledWith({ options: { data: { onboarded: true } } })
    expect(client.rpc).toHaveBeenCalledWith('create_demo_trip')
    expect(tripId).toBe('trip-1')
    expect(result.current.error).toBeNull()
  })

  it('reuses an existing session instead of signing in again', async () => {
    vi.mocked(client.auth.getSession).mockResolvedValue({ data: { session: { user: { id: 'u1' } } } } as never)
    const { result } = renderHookWithClient(() => useDemoEntry(), client)
    let tripId: string | null = null
    await act(async () => { tripId = await result.current.enterDemo() })
    expect(client.auth.signInAnonymously).not.toHaveBeenCalled()
    expect(tripId).toBe('trip-1')
  })

  it('returns null and sets error when anonymous sign-in fails', async () => {
    vi.mocked(client.auth.signInAnonymously).mockResolvedValue({ error: { message: 'Anonymous sign-ins are disabled' } } as never)
    const { result } = renderHookWithClient(() => useDemoEntry(), client)
    let tripId: string | null = 'unset'
    await act(async () => { tripId = await result.current.enterDemo() })
    expect(tripId).toBeNull()
    expect(result.current.error).toBe('Anonymous sign-ins are disabled')
    expect(client.rpc).not.toHaveBeenCalled()
  })

  it('returns null and sets error when the clone fails', async () => {
    vi.mocked(client.rpc).mockResolvedValue({ data: null, error: { message: 'Demo template trip is missing' } } as never)
    const { result } = renderHookWithClient(() => useDemoEntry(), client)
    let tripId: string | null = 'unset'
    await act(async () => { tripId = await result.current.enterDemo() })
    expect(tripId).toBeNull()
    expect(result.current.error).toBe('Demo template trip is missing')
  })
})
