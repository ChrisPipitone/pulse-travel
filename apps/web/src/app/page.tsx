'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from '@pulse/hooks'

export default function Home() {
  const { session, loading } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !session) router.replace('/login')
  }, [session, loading, router])

  if (loading || !session) {
    return (
      <main className="min-h-screen bg-bg flex items-center justify-center">
        <p className="text-text-muted text-sm">Loading…</p>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-bg flex flex-col items-center justify-center gap-4 p-8">
      <h1 className="text-4xl font-semibold text-text-primary">Pulse</h1>
      <p className="text-text-muted text-sm">Signed in as {session.user.email}</p>
    </main>
  )
}
