import { useState } from 'react'
import { useSupabase } from './SupabaseContext'
import { updateDisplayName } from '@pulse/services'
import type { Session } from '@supabase/supabase-js'

type OnboardingState = {
  needsOnboarding: (session: Session | null) => boolean
  submit: (userId: string, name: string) => Promise<void>
  loading: boolean
  error: string | null
}

export function useOnboarding(): OnboardingState {
  const client = useSupabase()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Google users have full_name in user_metadata set by OAuth — trigger already
  // used it for display_name, so skip the prompt.
  function needsOnboarding(session: Session | null): boolean {
    if (!session) return false
    const meta = session.user.user_metadata ?? {}
    return !meta.onboarded && !meta.full_name
  }

  async function submit(userId: string, name: string): Promise<void> {
    setLoading(true)
    setError(null)
    try {
      await updateDisplayName(client, userId, name.trim())
      await client.auth.updateUser({ data: { onboarded: true, display_name: name.trim() } })
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to save name')
      throw e
    } finally {
      setLoading(false)
    }
  }

  return { needsOnboarding, submit, loading, error }
}
