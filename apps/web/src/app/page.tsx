'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession, useSignOut, useUserTrips, useCreateTrip } from '@pulse/hooks'
import { Button } from '@pulse/ui'
import { CreateTripModal } from '@/components/CreateTripModal'
import type { Trip } from '@pulse/types'

type TripSummary = Trip & { member_count: number }

function formatDateRange(start?: string | null, end?: string | null) {
  if (!start && !end) return null
  const fmt = (d: string) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  if (start && end) return `${fmt(start)} – ${fmt(end)}`
  if (start) return `From ${fmt(start)}`
  return `Until ${fmt(end!)}`
}

export default function Home() {
  const { session, loading: sessionLoading } = useSession()
  const { signOut, loading: signingOut } = useSignOut()
  const { trips, loading: tripsLoading, refresh } = useUserTrips()
  const { createTrip, loading: creating, error: createError } = useCreateTrip()
  const router = useRouter()

  const [showCreate, setShowCreate] = useState(false)
  const [joinCode, setJoinCode] = useState('')

  useEffect(() => {
    if (!sessionLoading && !session) router.replace('/login')
  }, [session, sessionLoading, router])

  async function handleSignOut() {
    await signOut()
    router.replace('/login')
  }

  async function handleCreate(fields: { name: string; destination: string; start_date: string; end_date: string }) {
    const trip = await createTrip({
      name: fields.name,
      destination: fields.destination,
      start_date: fields.start_date || null,
      end_date: fields.end_date || null,
    })
    if (trip) {
      setShowCreate(false)
      refresh()
      router.push(`/trip/${trip.id}`)
    }
  }

  function handleJoin(e: React.FormEvent) {
    e.preventDefault()
    const code = joinCode.trim()
    if (code) router.push(`/join?code=${encodeURIComponent(code)}`)
  }

  if (sessionLoading || !session) {
    return (
      <main className="min-h-screen bg-bg flex items-center justify-center">
        <p className="text-text-muted text-sm">Loading…</p>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-bg">
      <div className="max-w-lg mx-auto px-4 py-8 flex flex-col gap-8">

        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-text-primary">Pulse</h1>
          <button
            onClick={handleSignOut}
            disabled={signingOut}
            className="text-xs text-text-muted hover:text-text-primary transition-colors disabled:opacity-40"
          >
            {signingOut ? 'Signing out…' : 'Sign out'}
          </button>
        </div>

        {/* Trips */}
        <section className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-text-primary uppercase tracking-wide">Your trips</h2>
            <Button size="sm" onClick={() => setShowCreate(true)}>+ New trip</Button>
          </div>

          {tripsLoading && (
            <p className="text-sm text-text-muted py-4">Loading…</p>
          )}

          {!tripsLoading && trips.length === 0 && (
            <div className="bg-bg-card rounded-[var(--radius-card)] border border-border px-5 py-8 text-center flex flex-col gap-2">
              <p className="text-sm text-text-primary font-medium">No trips yet</p>
              <p className="text-xs text-text-muted">Create one or join with an invite code below.</p>
            </div>
          )}

          {trips.map((trip: TripSummary) => {
            const dates = formatDateRange(trip.start_date, trip.end_date)
            const isOwner = trip.created_by === session.user.id
            return (
              <button
                key={trip.id}
                onClick={() => router.push(`/trip/${trip.id}`)}
                className="w-full text-left bg-bg-card rounded-[var(--radius-card)] border border-border px-5 py-4 flex flex-col gap-1 hover:border-accent/30 transition-colors"
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="text-sm font-semibold text-text-primary">{trip.name}</span>
                  {isOwner && (
                    <span className="text-[10px] font-medium text-text-subtle bg-border rounded-full px-2 py-0.5 shrink-0">Owner</span>
                  )}
                </div>
                <p className="text-xs text-text-muted">
                  {trip.destination}
                  {dates && <> · {dates}</>}
                  {' · '}{trip.member_count} {trip.member_count === 1 ? 'person' : 'people'}
                </p>
              </button>
            )
          })}
        </section>

        {/* Join */}
        <section className="flex flex-col gap-2">
          <h2 className="text-sm font-semibold text-text-primary uppercase tracking-wide">Join a trip</h2>
          <form onSubmit={handleJoin} className="flex gap-2">
            <input
              type="text"
              placeholder="Invite code"
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value)}
              className="flex-1 bg-bg-card border border-border rounded-[var(--radius-card)] px-3 py-2 text-sm text-text-primary placeholder:text-text-subtle focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-colors"
            />
            <Button type="submit" variant="outline" disabled={!joinCode.trim()}>
              Join
            </Button>
          </form>
        </section>
      </div>

      <CreateTripModal
        open={showCreate}
        loading={creating}
        error={createError}
        onClose={() => setShowCreate(false)}
        onSubmit={handleCreate}
      />
    </main>
  )
}
