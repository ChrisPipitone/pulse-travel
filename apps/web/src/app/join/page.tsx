'use client'

import { Suspense, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useSession, useJoinTrip, useOnboarding } from '@pulse/hooks'
import { Button } from '@pulse/ui'
import { Input } from '@pulse/ui'
import { getTripByInviteCode, getTripPreview, getMembers } from '@pulse/services'
import type { TripPreviewPublic } from '@pulse/services'
import { supabase } from '@/lib/supabase'
import { fmtDateRange } from '@/lib/date'
import { destinationEmoji } from '@/lib/destination'
import { useToast } from '@/components/ToastProvider'
import { VibeCheckCard } from '@/components/VibeCheckCard'
import type { TripPreview } from '@pulse/types'

function JoinPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const code = searchParams.get('code') ?? ''

  const { session, loading: sessionLoading } = useSession()
  const { joinTrip, loading: joining, error: joinError } = useJoinTrip()
  const { needsOnboarding, submit: submitName, loading: nameLoading, error: nameError } = useOnboarding()
  const { showToast } = useToast()

  // Unauthenticated preview — fetched with anon client, no session needed
  const [unauthedPreview, setUnauthedPreview] = useState<TripPreviewPublic | null>(null)
  const [unauthedPreviewDone, setUnauthedPreviewDone] = useState(false)

  // Authenticated trip state
  const [trip, setTrip] = useState<TripPreview | null>(null)
  const [alreadyMember, setAlreadyMember] = useState(false)
  const [lookupError, setLookupError] = useState<string | null>(null)
  const [lookupDone, setLookupDone] = useState(false)
  const [joinedTripId, setJoinedTripId] = useState<string | null>(null)
  const [nameValue, setNameValue] = useState('')

  // Fetch anon preview on mount — runs regardless of auth state
  useEffect(() => {
    if (!code) { setUnauthedPreviewDone(true); return }
    getTripPreview(supabase, code)
      .then((p) => setUnauthedPreview(p))
      .catch(() => {})
      .finally(() => setUnauthedPreviewDone(true))
  }, [code])

  // Authenticated lookup — only runs once session is established
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
    if (!joined) return
    showToast(`You're in! ${destinationEmoji(trip?.destination)} ${trip?.name}`)
    if (needsOnboarding(session)) {
      const meta = session?.user.user_metadata ?? {}
      setNameValue((meta.name as string | undefined) ?? session?.user.email?.split('@')[0] ?? '')
      setJoinedTripId(joined.id)
    } else {
      router.replace(`/trip/${joined.id}?newMember=1`)
    }
  }

  async function handleNameSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!nameValue.trim() || !session) return
    try { await submitName(session.user.id, nameValue) } catch { /* error shown */ }
    router.replace(`/trip/${joinedTripId}?newMember=1`)
  }

  // Session loading
  if (sessionLoading) {
    return <Screen><p className="text-text-muted text-sm">Loading…</p></Screen>
  }

  // Unauthenticated — show Vibe Check preview (no redirect to /login)
  if (!session) {
    if (!unauthedPreviewDone) {
      return <Screen><p className="text-text-muted text-sm">Looking up invite…</p></Screen>
    }
    if (!code || !unauthedPreview) {
      return (
        <Screen>
          <p className="text-sm text-text-muted text-center">
            {code ? 'Invite not found. Ask the trip organizer for a new link.' : 'No invite code provided.'}
          </p>
          <Button variant="outline" onClick={() => router.push('/login')}>Sign in</Button>
        </Screen>
      )
    }
    return (
      <Screen>
        <VibeCheckCard preview={unauthedPreview} code={code} />
      </Screen>
    )
  }

  // Authenticated — existing join flow
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

  const dates = fmtDateRange(trip.start_date, trip.end_date)

  if (joinedTripId && needsOnboarding(session)) {
    return (
      <Screen>
        <div className="w-full max-w-sm flex flex-col gap-6">
          <div className="text-center">
            <h1 className="text-2xl font-semibold text-text-primary">What should we call you?</h1>
            <p className="text-sm text-text-muted mt-1">
              This is how you&apos;ll appear to the group in{' '}
              <span className="text-text-primary font-medium">{trip?.name}</span>.
            </p>
          </div>
          <form onSubmit={handleNameSubmit} className="flex flex-col gap-3">
            <Input
              type="text"
              placeholder="Your name"
              value={nameValue}
              onChange={(e) => setNameValue(e.target.value)}
              maxLength={50}
              autoFocus
              required
            />
            {nameError && <p className="text-xs text-red-500">{nameError}</p>}
            <Button type="submit" disabled={nameLoading || !nameValue.trim()} className="w-full">
              {nameLoading ? 'Saving…' : "Let's go"}
            </Button>
          </form>
          <button
            onClick={() => router.replace(`/trip/${joinedTripId}?newMember=1`)}
            className="text-sm text-text-muted hover:text-text-primary transition-colors text-center"
          >
            Skip for now
          </button>
        </div>
      </Screen>
    )
  }

  if (alreadyMember) {
    return (
      <Screen>
        <div className="w-full max-w-sm flex flex-col gap-6">
          <div className="text-center">
            <h1 className="text-2xl font-semibold text-text-primary">You&apos;re already in</h1>
            <p className="text-sm text-text-muted mt-1">You&apos;re already a member of this trip.</p>
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
          <h1 className="text-2xl font-semibold text-text-primary">You&apos;re invited</h1>
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
    <main className="min-h-[calc(100vh-4rem)] bg-bg flex flex-col items-center justify-center gap-4 p-8">
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
