'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

// Landing page for magic link redirects. Supabase v2 detects ?code= in the URL
// via detectSessionInUrl (default: true) and exchanges it for a session when
// createClient runs. We listen for SIGNED_IN and redirect once the exchange
// resolves. getSession() handles the case where exchange finished before the
// effect ran.
export default function AuthCallback() {
  const router = useRouter()

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        router.replace('/')
        return
      }
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_IN') router.replace('/')
    })

    return () => subscription.unsubscribe()
  }, [router])

  return (
    <main className="min-h-screen bg-bg flex items-center justify-center">
      <p className="text-text-muted text-sm">Signing you in…</p>
    </main>
  )
}
