import { useState } from 'react'
import { useSupabase } from './SupabaseContext'

type SignInState = {
  sendOtp: (email: string) => Promise<void>
  verifyOtp: (email: string, token: string) => Promise<boolean>
  // redirectTo: where Supabase sends the user after Google auth completes.
  // Passed by the caller so this hook stays platform-agnostic (no window ref).
  signInWithGoogle: (redirectTo: string) => Promise<void>
  loading: boolean
  error: string | null
}

export function useSignIn(): SignInState {
  const client = useSupabase()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function sendOtp(email: string): Promise<void> {
    setLoading(true)
    setError(null)
    const { error } = await client.auth.signInWithOtp({ email })
    if (error) setError(error.message)
    setLoading(false)
  }

  async function verifyOtp(email: string, token: string): Promise<boolean> {
    setLoading(true)
    setError(null)
    const { error } = await client.auth.verifyOtp({ email, token, type: 'email' })
    if (error) setError(error.message)
    setLoading(false)
    return !error
  }

  async function signInWithGoogle(redirectTo: string): Promise<void> {
    setLoading(true)
    setError(null)
    const { error } = await client.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo },
    })
    // On success the browser navigates to Google — loading stays true during
    // the redirect. Only reset on error (page stays mounted).
    if (error) {
      setError(error.message)
      setLoading(false)
    }
  }

  return { sendOtp, verifyOtp, signInWithGoogle, loading, error }
}
