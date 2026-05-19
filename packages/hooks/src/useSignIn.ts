import { useState } from 'react'
import { useSupabase } from './SupabaseContext'

type SignInState = {
  sendOtp: (email: string) => Promise<void>
  verifyOtp: (email: string, token: string) => Promise<boolean>
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
    // No emailRedirectTo → Supabase sends a code-only email (no magic link).
    // This avoids the shared-token problem where clicking the link invalidates
    // the code, and the PKCE verifier mismatch when link opens a new context.
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

  return { sendOtp, verifyOtp, loading, error }
}
