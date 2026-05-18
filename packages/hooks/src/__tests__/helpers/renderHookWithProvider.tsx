import React from 'react'
import { renderHook } from '@testing-library/react'
import type { SupabaseClient } from '@supabase/supabase-js'
import { SupabaseProvider } from '../../SupabaseContext'

// Wraps renderHook with the SupabaseProvider so hooks that call useSupabase()
// don't throw. Pass the mock client returned by createMockClient().
export function renderHookWithClient<T>(
  hook: () => T,
  client: SupabaseClient,
) {
  return renderHook(hook, {
    wrapper: ({ children }) => (
      <SupabaseProvider client={client}>{children}</SupabaseProvider>
    ),
  })
}
