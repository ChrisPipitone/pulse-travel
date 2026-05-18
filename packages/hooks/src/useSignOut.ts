import { useState } from 'react'
import { useSupabase } from './SupabaseContext'
import { useTripStore } from '@pulse/store'

type SignOutState = {
  signOut: () => Promise<void>
  loading: boolean
}

export function useSignOut(): SignOutState {
  const client = useSupabase()
  const [loading, setLoading] = useState(false)
  const reset = useTripStore((s) => s.reset)

  async function signOut(): Promise<void> {
    setLoading(true)

    await client.auth.signOut()

    // Clear the store so a subsequent sign-in on the same session doesn't
    // briefly see the previous user's trip data.
    // useSession() will update automatically via onAuthStateChange.
    reset()

    setLoading(false)
  }

  return { signOut, loading }
}
