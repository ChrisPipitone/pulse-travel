'use client'

import { Suspense, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useSession, useJoinTrip } from '@pulse/hooks'
import { Button } from '@pulse/ui'
import { getTripByInviteCode, getMembers } from '@pulse/services'
import { supabase } from '@/lib/supabase'
import type { Trip } from '@pulse/types'

function formatDateRange(start?: string | null, end?: string | null) {
  if (!start && !end) return null
  const fmt = (d: string) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  if (start && end) return `${fmt(start)} – ${fmt(end)}`
  if (start) return `From ${fmt(start)}`
  return `Until ${fmt(end!)}`
}

function JoinPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const code = searchParams.get('code') ?? ''

  const { session, loading: sessionLoading } = useSession()
  const { joinTrip, loading: joining, error: joinError } = useJoinTrip()

  const [trip, setTrip] = useState<Trip | null>(null)
  const [alreadyMember, setAlreadyMember] = useState(false)
  const [lookupError, setLookupError] = useState<string | null>(null)
  const [lookupDone, setLookupDone] = useState(false)

  useEffect(() => {
    if (!sessionLoading && !session) {
      router.replace(`/login?returnTo=${encodeURIComponent(`/join?code=${code}`)}`)
      return
    }
  }, [session, sessionLoading, router, code])

  useEffect(() => {
    if (!code || sessionLoading || !session) return
    getTripByInviteCode(supabase, code)
      .then(async (t) => {
        if (!t) { setLookupError('Invite link not found. Check the code and try again.'); return }
        setTrip(t)
        const members = await getMembers(supabase, t.id)
        if (members.some((m) => m.id === session!.user.id)) setAlreadyMember(true)
      })
      .catch((e) => setLookupError(e instanceof Error ? e.message : 'Failed to look up invite code'))
      .finally(() => setLookupDone(true))
  }, [code, session, sessionLoading])

  async function handleJoin() {
    const joined = await joinTrip(code)
    if (joined) router.replace(`/trip/${joined.id}`)
  }

  if (sessionLoading || !session) {
    return <Screen><p className="text-text-muted text-sm">Loading…</p></Screen>
  }

  if (!code) {
    return (
      <Screen>
        <p className="text-sm text-text-muted">No invite code provided.</p>
        <Button variant="outline" onClick={() => router.replace('/')}>Back to trips</Button>
      </Screen>
    )
  }

  if (!lookupDone) {
    return <Screen><p className="text-text-muted text-sm">Looking up invite…</p></Screen>
  }

  if (lookupError || !trip) {
    return (
      <Screen>
        <p className="text-sm text-red-500">{lookupError ?? 'Trip not found.'}</p>
        <Button variant="outline" onClick={() => router.replace('/')}>Back to trips</Button>
      </Screen>
    )
  }

  const dates = formatDateRange(trip.start_date, trip.end_date)

  if (alreadyMember) {
    return (
      <Screen>
        <div className="w-full max-w-sm flex flex-col gap-6">
          <div className="text-center">
            <h1 className="text-2xl font-semibold text-text-primary">You're already in</h1>
            <p className="text-sm text-text-muted mt-1">You're already a member of this trip.</p>
          </div>

          <div className="bg-bg-card rounded-[var(--radius-card)] border border-border px-6 py-5 flex flex-col gap-1">
            <p className="text-base font-semibold text-text-primary">{trip.name}</p>
            <p className="text-sm text-text-muted">
              {trip.destination}
              {dates && <> · {dates}</>}
            </p>
          </div>

          <Button onClick={() => router.replace(`/trip/${trip.id}`)} className="w-full">
            Go to trip
          </Button>
        </div>
      </Screen>
    )
  }

  return (
    <Screen>
      <div className="w-full max-w-sm flex flex-col gap-6">
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-text-primary">You're invited</h1>
          <p className="text-sm text-text-muted mt-1">Join to rate activities and see who you&apos;re going with.</p>
        </div>

        <div className="bg-bg-card rounded-[var(--radius-card)] border border-border px-6 py-5 flex flex-col gap-1">
          <p className="text-base font-semibold text-text-primary">{trip.name}</p>
          <p className="text-sm text-text-muted">
            {trip.destination}
            {dates && <> · {dates}</>}
          </p>
        </div>

        {joinError && (
          <p className="text-xs text-red-500 text-center">
            {joinError.includes('Trip is full')
              ? 'This trip is full — the owner would need to upgrade to add more members.'
              : joinError}
          </p>
        )}

        <div className="flex flex-col gap-2">
          <Button onClick={handleJoin} disabled={joining} className="w-full">
            {joining ? 'Joining…' : `Join ${trip.name}`}
          </Button>
          <Button variant="ghost" onClick={() => router.replace('/')} className="w-full">
            Cancel
          </Button>
        </div>
      </div>
    </Screen>
  )
}

function Screen({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-screen bg-bg flex flex-col items-center justify-center gap-4 p-8">
      {children}
    </main>
  )
}

export default function JoinPageWrapper() {
  return (
    <Suspense fallback={
      <main className="min-h-screen bg-bg flex items-center justify-center">
        <p className="text-text-muted text-sm">Loading…</p>
      </main>
    }>
      <JoinPage />
    </Suspense>
  )
}
