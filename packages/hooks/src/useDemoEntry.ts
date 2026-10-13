import { useState } from 'react'
import { useSupabase } from './SupabaseContext'
import { createDemoTrip } from '@pulse/services'

type DemoEntryState = {
  // Opens an anonymous session if there is none and resolves to that visitor's
  // own demo trip id, or null on failure.
  enterDemo: () => Promise<string | null>
  error: string | null
}

export function useDemoEntry(): DemoEntryState {
  const client = useSupabase()
  const [error, setError] = useState<string | null>(null)

  async function enterDemo(): Promise<string | null> {
    setError(null)
    try {
      const { data: { session } } = await client.auth.getSession()
      if (!session) {
        // onboarded: the visitor is named by the clone, so skip the name prompt.
        const { error } = await client.auth.signInAnonymously({ options: { data: { onboarded: true } } })
        if (error) throw new Error(error.message)
      }
      return await createDemoTrip(client)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to open the demo')
      return null
    }
  }

  return { enterDemo, error }
}
