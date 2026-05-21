'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession, useUserTrips, useCreateTrip } from '@pulse/hooks'
import { Button } from '@pulse/ui'
import { CreateTripModal } from '@/components/CreateTripModal'
import type { Trip } from '@pulse/types'

type TripSummary = Trip & { member_count: number }

function formatDateRange(start?: string | null, end?: string | null) {
  if (!start && !end) return null
  const fmt = (d: string) => new Date(d + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  if (start && end) return `${fmt(start)} – ${fmt(end)}`
  if (start) return `From ${fmt(start)}`
  return `Until ${fmt(end!)}`
}

function MemberDots({ count }: { count: number }) {
  const shown = Math.min(count, 5)
  return (
    <div className="flex items-center">
      {Array.from({ length: shown }).map((_, i) => (
        <span
          key={i}
          style={{ marginLeft: i === 0 ? 0 : -6, zIndex: shown - i }}
          className="relative w-6 h-6 rounded-full bg-border border-2 border-bg-card flex items-center justify-center text-[9px] font-semibold text-text-subtle"
        >
          {i === shown - 1 && count > 5 ? `+${count - 4}` : ''}
        </span>
      ))}
      <span className="ml-2 text-xs text-text-muted">{count} {count === 1 ? 'person' : 'people'}</span>
    </div>
  )
}

export default function Home() {
  const { session, loading: sessionLoading } = useSession()
  const { trips, loading: tripsLoading, refresh } = useUserTrips()
  const { createTrip, loading: creating, error: createError } = useCreateTrip()
  const router = useRouter()

  const [showCreate, setShowCreate] = useState(false)
  const [joinCode, setJoinCode] = useState('')

  useEffect(() => {
    if (!sessionLoading && !session) router.replace('/login')
  }, [session, sessionLoading, router])

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
    <main className="min-h-screen bg-bg overflow-x-clip">
      <div className="max-w-screen-xl mx-auto px-6 py-10 flex flex-col gap-10">

        {/* Trips section */}
        <section className="flex flex-col gap-5">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-text-primary">Your trips</h1>
              <p className="text-sm text-text-muted mt-0.5">Plan, rate, and explore with your group.</p>
            </div>
            <Button onClick={() => setShowCreate(true)}>+ New trip</Button>
          </div>

          {tripsLoading && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-bg-card rounded-[var(--radius-card)] border border-border h-36 animate-pulse" />
              ))}
            </div>
          )}

          {!tripsLoading && trips.length === 0 && (
            <div className="bg-bg-card rounded-[var(--radius-card)] border border-border px-8 py-16 flex flex-col items-center gap-3 text-center">
              <div className="w-12 h-12 rounded-full bg-border flex items-center justify-center text-2xl">✈️</div>
              <p className="text-sm font-medium text-text-primary">No trips yet</p>
              <p className="text-xs text-text-muted max-w-xs">Create your first trip or join one below with an invite code.</p>
              <Button onClick={() => setShowCreate(true)} className="mt-1">+ New trip</Button>
            </div>
          )}

          {!tripsLoading && trips.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {trips.map((trip: TripSummary) => {
                const dates = formatDateRange(trip.start_date, trip.end_date)
                const isOwner = trip.created_by === session.user.id
                return (
                  <button
                    key={trip.id}
                    onClick={() => router.push(`/trip/${trip.id}`)}
                    className="group w-full text-left bg-bg-card rounded-[var(--radius-card)] border border-border p-5 flex flex-col gap-4 hover:shadow-md hover:-translate-y-0.5 transition-all duration-150"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex flex-col gap-0.5 min-w-0">
                        <span className="text-base font-semibold text-text-primary leading-tight truncate">{trip.name}</span>
                        <span className="text-sm text-text-muted truncate">{trip.destination}</span>
                      </div>
                      {isOwner && (
                        <span className="shrink-0 text-[10px] font-semibold text-text-subtle bg-border rounded-full px-2.5 py-1 uppercase tracking-wide">
                          Owner
                        </span>
                      )}
                    </div>

                    <div className="flex items-center justify-between mt-auto">
                      <MemberDots count={trip.member_count} />
                      {dates && (
                        <span className="text-xs text-text-muted tabular-nums shrink-0">{dates}</span>
                      )}
                    </div>
                  </button>
                )
              })}
            </div>
          )}
        </section>

        {/* Join section */}
        <section className="max-w-md flex flex-col gap-3">
          <div>
            <h2 className="text-sm font-semibold text-text-primary">Join a trip</h2>
            <p className="text-xs text-text-muted mt-0.5">Enter an invite code to join someone's trip.</p>
          </div>
          <form onSubmit={handleJoin} className="flex gap-2">
            <input
              type="text"
              placeholder="Invite code"
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value)}
              maxLength={50}
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck={false}
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
