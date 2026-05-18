import { describe, it, expect, vi, beforeEach } from 'vitest'
import { act } from '@testing-library/react'
import { createMockClient } from './helpers/mockClient'
import { renderHookWithClient } from './helpers/renderHookWithProvider'
import { useSignIn } from '../useSignIn'

describe('useSignIn', () => {
  let client: ReturnType<typeof createMockClient>

  beforeEach(() => { client = createMockClient() })

  it('calls signInWithOtp with email and redirectTo', async () => {
    const { result } = renderHookWithClient(() => useSignIn(), client)

    await act(async () => {
      await result.current.signInWithMagicLink('marco@example.com', 'https://app.example.com/auth/callback')
    })

    expect(client.auth.signInWithOtp).toHaveBeenCalledWith({
      email: 'marco@example.com',
      options: { emailRedirectTo: 'https://app.example.com/auth/callback' },
    })
  })

  it('sets error when signInWithOtp fails', async () => {
    vi.mocked(client.auth.signInWithOtp).mockResolvedValue({ error: { message: 'rate limited' } } as never)
    const { result } = renderHookWithClient(() => useSignIn(), client)

    await act(async () => {
      await result.current.signInWithMagicLink('x@x.com', 'https://app/callback')
    })

    expect(result.current.error).toBe('rate limited')
  })

  it('clears loading after call completes', async () => {
    const { result } = renderHookWithClient(() => useSignIn(), client)

    await act(async () => {
      await result.current.signInWithMagicLink('x@x.com', 'https://app/callback')
    })

    expect(result.current.loading).toBe(false)
  })
})
