import { useState } from 'react'
import { useSupabase } from './SupabaseContext'

type SignInState = {
  // redirectTo: where Supabase sends the user after clicking the magic link.
  // Passed by the calling component (which knows the platform URL) so this
  // hook stays platform-agnostic — no window.location reference here.
  signInWithMagicLink: (email: string, redirectTo: string) => Promise<void>
  loading: boolean
  error: string | null
}

export function useSignIn(): SignInState {
  const client = useSupabase()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function signInWithMagicLink(email: string, redirectTo: string): Promise<void> {
    setLoading(true)
    setError(null)

    const { error } = await client.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: redirectTo },
    })

    // In local dev, Supabase intercepts the email — check Mailpit at
    // http://127.0.0.1:54324 instead of a real inbox.
    if (error) setError(error.message)
    setLoading(false)
  }

  return { signInWithMagicLink, loading, error }
}
