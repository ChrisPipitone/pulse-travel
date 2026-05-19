import { describe, it, expect, vi, beforeEach } from 'vitest'
import { act } from '@testing-library/react'
import { createMockClient } from './helpers/mockClient'
import { renderHookWithClient } from './helpers/renderHookWithProvider'
import { useSignIn } from '../useSignIn'

describe('useSignIn', () => {
  let client: ReturnType<typeof createMockClient>

  beforeEach(() => { client = createMockClient() })

  it('calls signInWithOtp with email only (no redirectTo)', async () => {
    const { result } = renderHookWithClient(() => useSignIn(), client)

    await act(async () => {
      await result.current.sendOtp('marco@example.com')
    })

    expect(client.auth.signInWithOtp).toHaveBeenCalledWith({ email: 'marco@example.com' })
  })

  it('sets error when signInWithOtp fails', async () => {
    vi.mocked(client.auth.signInWithOtp).mockResolvedValue({ error: { message: 'rate limited' } } as never)
    const { result } = renderHookWithClient(() => useSignIn(), client)

    await act(async () => {
      await result.current.sendOtp('x@x.com')
    })

    expect(result.current.error).toBe('rate limited')
  })

  it('clears loading after sendOtp completes', async () => {
    const { result } = renderHookWithClient(() => useSignIn(), client)

    await act(async () => {
      await result.current.sendOtp('x@x.com')
    })

    expect(result.current.loading).toBe(false)
  })

  it('returns true and clears error on successful verifyOtp', async () => {
    vi.mocked(client.auth.verifyOtp).mockResolvedValue({ data: {}, error: null } as never)
    const { result } = renderHookWithClient(() => useSignIn(), client)

    let ok: boolean = false
    await act(async () => {
      ok = await result.current.verifyOtp('x@x.com', '123456')
    })

    expect(ok).toBe(true)
    expect(result.current.error).toBeNull()
  })

  it('returns false and sets error on failed verifyOtp', async () => {
    vi.mocked(client.auth.verifyOtp).mockResolvedValue({ error: { message: 'invalid otp' } } as never)
    const { result } = renderHookWithClient(() => useSignIn(), client)

    let ok: boolean = true
    await act(async () => {
      ok = await result.current.verifyOtp('x@x.com', '000000')
    })

    expect(ok).toBe(false)
    expect(result.current.error).toBe('invalid otp')
  })
})
