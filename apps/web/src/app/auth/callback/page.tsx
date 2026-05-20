'use client'

import { Suspense, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'

function Callback() {
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const code = searchParams.get('code')

    if (code) {
      // PKCE flow: explicit code exchange (hosted Supabase + production).
      // Sign out first to clear any stale session from a previous auth method.
      supabase.auth.signOut().then(() => {
        supabase.auth.exchangeCodeForSession(code).then(({ error }) => {
          router.replace(error ? '/login' : '/')
        })
      })
      return
    }

    // Implicit / hash flow: local Supabase OAuth returns tokens in the URL
    // hash (#access_token=...) rather than a ?code= param. detectSessionInUrl
    // processes the hash asynchronously — listen for SIGNED_IN instead of
    // redirecting immediately. Fall back to /login after 10s if nothing fires.
    const timeout = setTimeout(() => router.replace('/login'), 10_000)

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) { clearTimeout(timeout); router.replace('/') }
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_IN') { clearTimeout(timeout); router.replace('/') }
    })

    return () => { subscription.unsubscribe(); clearTimeout(timeout) }
  }, [router, searchParams])

  return (
    <main className="min-h-screen bg-bg flex items-center justify-center">
      <p className="text-text-muted text-sm">Signing you in…</p>
    </main>
  )
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen bg-bg flex items-center justify-center">
        <p className="text-text-muted text-sm">Signing you in…</p>
      </main>
    }>
      <Callback />
    </Suspense>
  )
}
