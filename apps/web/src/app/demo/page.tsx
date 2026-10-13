'use client'

import { useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useSession, useDemoEntry } from '@pulse/hooks'
import { Button } from '@pulse/ui'

export default function DemoPage() {
  const router = useRouter()
  const { session, loading: sessionLoading } = useSession()
  const { enterDemo, error } = useDemoEntry()
  // Signing in changes the session, which would re-run the effect mid-entry.
  const started = useRef(false)

  useEffect(() => {
    if (sessionLoading || started.current) return
    started.current = true

    // A real account keeps its session — the demo is for anonymous visitors.
    if (session && !session.user.is_anonymous) { router.replace('/'); return }

    enterDemo().then((tripId) => {
      if (tripId) router.replace(`/trip/${tripId}`)
    })
  }, [sessionLoading, session, enterDemo, router])

  return (
    <main className="min-h-screen bg-bg flex flex-col items-center justify-center gap-4 p-8">
      {error ? (
        <>
          <p className="text-sm text-text-muted text-center">The demo is unavailable right now.</p>
          <Button variant="outline" onClick={() => router.replace('/login')}>Sign in</Button>
        </>
      ) : (
        <p className="text-text-muted text-sm">Opening the demo trip…</p>
      )}
    </main>
  )
}
