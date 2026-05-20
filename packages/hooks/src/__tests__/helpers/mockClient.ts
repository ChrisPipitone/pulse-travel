import { vi } from 'vitest'
import type { SupabaseClient } from '@supabase/supabase-js'

// Builds a chainable query builder mock.
// Each method returns `this` so callers can chain .select().eq().single()
// without errors. Override individual methods per test when you need
// specific return values.
export function mockQueryBuilder(resolvedData: unknown = null) {
  const builder: Record<string, unknown> = {}
  const chainMethods = ['select', 'eq', 'in', 'order', 'insert', 'update', 'delete']
  chainMethods.forEach((m) => { builder[m] = vi.fn().mockReturnValue(builder) })
  builder['single'] = vi.fn().mockResolvedValue({ data: resolvedData, error: null })
  builder['upsert'] = vi.fn().mockResolvedValue({ data: resolvedData, error: null })
  // Non-single queries return an array
  builder['then'] = vi.fn().mockImplementation((fn: (v: {data: unknown, error: null}) => unknown) =>
    Promise.resolve({ data: resolvedData ?? [], error: null }).then(fn)
  )
  return builder
}

// Minimal mock channel — supports .on().on().subscribe() chaining.
function mockChannel() {
  const ch: Record<string, unknown> = {}
  ch['on'] = vi.fn().mockReturnValue(ch)
  ch['subscribe'] = vi.fn().mockReturnValue(ch)
  return ch
}

// Factory — returns a typed partial that satisfies the hooks' usage surface.
// Use vi.mocked() on individual methods in tests to set return values.
export function createMockClient(): SupabaseClient {
  const sub = { unsubscribe: vi.fn() }

  return {
    auth: {
      getSession:          vi.fn().mockResolvedValue({ data: { session: null } }),
      getUser:             vi.fn().mockResolvedValue({ data: { user: null } }),
      onAuthStateChange:   vi.fn().mockReturnValue({ data: { subscription: sub } }),
      signInWithOtp:       vi.fn().mockResolvedValue({ error: null }),
      signInWithOAuth:     vi.fn().mockResolvedValue({ error: null }),
      verifyOtp:           vi.fn().mockResolvedValue({ data: {}, error: null }),
      signOut:             vi.fn().mockResolvedValue({ error: null }),
    },
    from:          vi.fn().mockReturnValue(mockQueryBuilder()),
    channel:       vi.fn().mockReturnValue(mockChannel()),
    removeChannel: vi.fn().mockResolvedValue(undefined),
  } as unknown as SupabaseClient
}
