import { describe, it, expect, vi, beforeEach } from 'vitest'
import { act } from '@testing-library/react'
import { createMockClient } from './helpers/mockClient'
import { renderHookWithClient } from './helpers/renderHookWithProvider'
import { useSignIn } from '../useSignIn'

describe('useSignIn', () => {
  let client: ReturnType<typeof createMockClient>

  beforeEach(() => { client = createMockClient() })

  // ── OTP ──────────────────────────────────────────────────────────────────

  it('sendOtp calls signInWithOtp with email only', async () => {
    const { result } = renderHookWithClient(() => useSignIn(), client)
    await act(async () => { await result.current.sendOtp('marco@example.com') })
    expect(client.auth.signInWithOtp).toHaveBeenCalledWith({ email: 'marco@example.com' })
  })

  it('sendOtp sets error on failure', async () => {
    vi.mocked(client.auth.signInWithOtp).mockResolvedValue({ error: { message: 'rate limited' } } as never)
    const { result } = renderHookWithClient(() => useSignIn(), client)
    await act(async () => { await result.current.sendOtp('x@x.com') })
    expect(result.current.error).toBe('rate limited')
  })

  it('sendOtp clears loading after call', async () => {
    const { result } = renderHookWithClient(() => useSignIn(), client)
    await act(async () => { await result.current.sendOtp('x@x.com') })
    expect(result.current.loading).toBe(false)
  })

  it('verifyOtp returns true on success', async () => {
    vi.mocked(client.auth.verifyOtp).mockResolvedValue({ data: {}, error: null } as never)
    const { result } = renderHookWithClient(() => useSignIn(), client)
    let ok = false
    await act(async () => { ok = await result.current.verifyOtp('x@x.com', '123456') })
    expect(ok).toBe(true)
    expect(result.current.error).toBeNull()
  })

  it('verifyOtp returns false and sets error on failure', async () => {
    vi.mocked(client.auth.verifyOtp).mockResolvedValue({ error: { message: 'invalid otp' } } as never)
    const { result } = renderHookWithClient(() => useSignIn(), client)
    let ok = true
    await act(async () => { ok = await result.current.verifyOtp('x@x.com', '000000') })
    expect(ok).toBe(false)
    expect(result.current.error).toBe('invalid otp')
  })

  // ── Google OAuth ──────────────────────────────────────────────────────────

  it('signInWithGoogle calls signInWithOAuth with google provider and redirectTo', async () => {
    const { result } = renderHookWithClient(() => useSignIn(), client)
    await act(async () => { await result.current.signInWithGoogle('http://localhost:3000/auth/callback') })
    expect(client.auth.signInWithOAuth).toHaveBeenCalledWith({
      provider: 'google',
      options: { redirectTo: 'http://localhost:3000/auth/callback' },
    })
  })

  it('signInWithGoogle sets error and clears loading on failure', async () => {
    vi.mocked(client.auth.signInWithOAuth).mockResolvedValue({ error: { message: 'OAuth error' } } as never)
    const { result } = renderHookWithClient(() => useSignIn(), client)
    await act(async () => { await result.current.signInWithGoogle('http://localhost:3000/auth/callback') })
    expect(result.current.error).toBe('OAuth error')
    expect(result.current.loading).toBe(false)
  })

  it('signInWithGoogle keeps loading true on success (browser navigates away)', async () => {
    const { result } = renderHookWithClient(() => useSignIn(), client)
    await act(async () => { await result.current.signInWithGoogle('http://localhost:3000/auth/callback') })
    expect(result.current.loading).toBe(true)
  })
})
