import { createContext, useContext } from 'react'
import type { SupabaseClient } from '@supabase/supabase-js'

// Null default — useSupabase() guards against this below.
// Never put a real client here: it would require env vars at module load time
// and break SSR and test environments.
const SupabaseContext = createContext<SupabaseClient | null>(null)

type ProviderProps = {
  client: SupabaseClient
  children: React.ReactNode
}

export function SupabaseProvider({ client, children }: ProviderProps) {
  return (
    <SupabaseContext.Provider value={client}>
      {children}
    </SupabaseContext.Provider>
  )
}

// Internal — only used inside this package. Not exported from index.ts.
// Throws instead of returning null so callers don't need null checks everywhere.
export function useSupabase(): SupabaseClient {
  const client = useContext(SupabaseContext)
  if (!client) throw new Error('useSupabase must be used inside <SupabaseProvider>')
  return client
}
