'use client'

import { use, useState } from 'react'
import { useTripData, useSession, useAddActivity, useActivityActions, useRateActivity, useUpdateMemberDates, useUpdateTrip, useDeleteTrip, useRemoveMember } from '@pulse/hooks'
import { useTripStore } from '@pulse/store'
import { Button } from '@pulse/ui'
import { ActivityFormModal } from '@/components/ActivityFormModal'
import { ActivityDetailModal } from '@/components/ActivityDetailModal'
import { CompatibilityMatrix } from '@/components/CompatibilityMatrix'
import { MemberDatesModal } from '@/components/MemberDatesModal'
import { CreateTripModal } from '@/components/CreateTripModal'
import { useRouter } from 'next/navigation'
import type { Rating, Activity } from '@pulse/types'

type Tab = 'activities' | 'matrix'

const TAB_LABELS: Record<Tab, string> = {
  activities: 'Activities',
  matrix: 'Find your crew',
}

const ratingColor: Record<Rating, string> = {
  MUST: 'bg-must text-must-text',
  WANT: 'bg-want text-want-text',
  MEH:  'bg-meh text-meh-text',
}

function formatDateRange(start: string, end: string) {
  const fmt = (d: string) => new Date(d + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  return `${fmt(start)} – ${fmt(end)}`
}

function formatMemberDates(arrival?: string, departure?: string): string | null {
  const fmt = (d: string) => new Date(d + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  if (arrival && departure) return `${fmt(arrival)} – ${fmt(departure)}`
  if (arrival) return `From ${fmt(arrival)}`
  if (departure) return `Until ${fmt(departure)}`
  return null
}

type ModalState =
  | { mode: 'closed' }
  | { mode: 'add' }
  | { mode: 'view'; activity: Activity }
  | { mode: 'edit'; activity: Activity }

export default function TripPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const { loading, error } = useTripData(id)
  const { session } = useSession()
  const trip       = useTripStore((s) => s.trip)
  const members    = useTripStore((s) => s.members)
  const activities = useTripStore((s) => s.activities)
  const ratings    = useTripStore((s) => s.ratings)

  const { addActivity, loading: adding, error: addError } = useAddActivity()
  const { updateActivity, deleteActivity, loading: acting, error: actError } = useActivityActions()
  const { rateActivity, loading: rating } = useRateActivity()
  const { updateDates, loading: datesLoading, error: datesError } = useUpdateMemberDates()
  const { updateTrip, loading: updating, error: updateError } = useUpdateTrip()
  const { deleteTrip, loading: deleting } = useDeleteTrip()
  const { removeMember, removingId, error: removeError } = useRemoveMember()
  const router = useRouter()

  const [modal, setModal]                   = useState<ModalState>({ mode: 'closed' })
  const [showDatesModal, setShowDatesModal]  = useState(false)
  const [showEditTrip, setShowEditTrip]      = useState(false)
  const [copied, setCopied]                  = useState(false)
  const [tab, setTab]                        = useState<Tab>('activities')

  const userId  = session?.user.id
  const isOwner = !!userId && trip?.created_by === userId

  function canEdit(activity: Activity) {
    return isOwner || activity.added_by === userId
  }

  async function handleAdd(fields: { name: string; location: string; description: string; url: string }) {
    await addActivity({
      trip_id: id,
      name: fields.name,
      location: fields.location || null,
      description: fields.description || null,
      url: fields.url || null,
      region: null,
      duration_hours: null,
      category_id: null,
    })
    setModal({ mode: 'closed' })
  }

  async function handleEdit(fields: { name: string; location: string; description: string; url: string }) {
    if (modal.mode !== 'edit') return
    await updateActivity(modal.activity.id, {
      name: fields.name,
      location: fields.location || null,
      description: fields.description || null,
      url: fields.url || null,
    })
    setModal({ mode: 'closed' })
  }

  async function handleDelete(activity: Activity) {
    if (!confirm(`Delete "${activity.name}"?`)) return
    await deleteActivity(activity.id)
  }

  async function handleEditTrip(fields: { name: string; destination: string; start_date: string; end_date: string }) {
    await updateTrip({
      name: fields.name,
      destination: fields.destination,
      start_date: fields.start_date || null,
      end_date: fields.end_date || null,
    })
    setShowEditTrip(false)
  }

  async function handleDeleteTrip() {
    if (!confirm(`Delete "${trip?.name}"? This cannot be undone.`)) return
    await deleteTrip(trip!.id, () => router.replace('/'))
  }

  function handleCopyInvite() {
    const url = `${window.location.origin}/join?code=${trip!.invite_code}`
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-bg flex items-center justify-center">
        <p className="text-text-muted text-sm">Loading…</p>
      </main>
    )
  }

  if (error || !trip) {
    return (
      <main className="min-h-screen bg-bg flex items-center justify-center">
        <p className="text-text-muted text-sm">{error ?? 'Trip not found'}</p>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-bg">
      <div className="max-w-screen-xl mx-auto px-6 py-8">
        <div className="flex flex-col lg:flex-row gap-8 items-start">

          {/* ── Sidebar ─────────────────────────────────────────── */}
          <aside className="w-full lg:w-72 lg:shrink-0 flex flex-col gap-6 lg:sticky lg:top-[5rem]">

            {/* Trip identity */}
            <div className="bg-bg-card rounded-[var(--radius-card)] border border-border p-5 flex flex-col gap-3">
              <div className="flex items-start justify-between gap-2">
                <div className="flex flex-col gap-0.5 min-w-0">
                  <h1 className="text-lg font-semibold text-text-primary leading-tight">{trip.name}</h1>
                  <p className="text-sm text-text-muted truncate">{trip.destination}</p>
                </div>
                {isOwner && (
                  <div className="flex items-center gap-0.5 shrink-0">
                    <button
                      onClick={() => setShowEditTrip(true)}
                      className="p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-bg transition-colors"
                      title="Edit trip"
                    >
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M9.5 1.5l3 3-8 8H1.5v-3l8-8z"/>
                      </svg>
                    </button>
                    <button
                      onClick={handleDeleteTrip}
                      disabled={deleting}
                      className="p-1.5 rounded-lg text-text-muted hover:text-red-500 hover:bg-bg transition-colors disabled:opacity-40"
                      title="Delete trip"
                    >
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M1.5 3.5h11M4.5 3.5V2.5a1 1 0 011-1h3a1 1 0 011 1v1M5.5 6.5v4M8.5 6.5v4M2.5 3.5l.75 8.25a1 1 0 001 .75h5.5a1 1 0 001-.75L11.5 3.5"/>
                      </svg>
                    </button>
                  </div>
                )}
              </div>

              {trip.start_date && trip.end_date && (
                <div className="flex items-center gap-2 text-xs text-text-muted">
                  <svg width="12" height="12" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="1.5" y="2.5" width="11" height="10" rx="1.5"/>
                    <path d="M1.5 6h11M4.5 1v3M9.5 1v3"/>
                  </svg>
                  {formatDateRange(trip.start_date, trip.end_date)}
                </div>
              )}

              <div className="flex items-center gap-2 text-xs text-text-muted">
                <svg width="12" height="12" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="5" cy="4.5" r="2"/>
                  <path d="M1.5 12c0-2.21 1.567-4 3.5-4s3.5 1.79 3.5 4"/>
                  <circle cx="10" cy="4.5" r="2"/>
                  <path d="M10 8.5c1.2.3 2.5 1.5 2.5 3.5"/>
                </svg>
                {members.length} {members.length === 1 ? 'person' : 'people'}
              </div>
            </div>

            {/* Member schedule */}
            <div className="bg-bg-card rounded-[var(--radius-card)] border border-border p-5 flex flex-col gap-3">
              <h2 className="text-xs font-semibold text-text-subtle uppercase tracking-widest">Schedules</h2>
              <div className="flex flex-col gap-2">
                {members.map((m) => {
                  const isMe = m.id === userId
                  const dateStr = formatMemberDates(m.arrival_date, m.departure_date)
                  return (
                    <div key={m.id} className="flex items-center gap-2.5">
                      <span className="w-7 h-7 rounded-full bg-border flex items-center justify-center text-text-subtle font-semibold text-xs shrink-0">
                        {m.name.charAt(0).toUpperCase()}
                      </span>
                      <div className="flex flex-col leading-tight min-w-0 flex-1">
                        <span className="text-xs font-medium text-text-primary">{m.name.split(' ')[0]}</span>
                        <span className="text-[11px] text-text-muted">{dateStr ?? 'Full trip'}</span>
                      </div>
                      {isMe && (
                        <button
                          onClick={() => setShowDatesModal(true)}
                          className="p-1 text-text-muted hover:text-text-primary transition-colors shrink-0"
                          title="Edit my dates"
                        >
                          <svg width="11" height="11" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M9.5 1.5l3 3-8 8H1.5v-3l8-8z"/>
                          </svg>
                        </button>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Invite code */}
            <div className="bg-bg-card rounded-[var(--radius-card)] border border-border p-5 flex flex-col gap-3">
              <h2 className="text-xs font-semibold text-text-subtle uppercase tracking-widest">Invite</h2>
              <div className="flex items-center gap-2">
                <code className="flex-1 bg-bg text-xs font-mono text-text-primary px-2.5 py-1.5 rounded-lg border border-border truncate">
                  {trip.invite_code}
                </code>
                <button
                  onClick={handleCopyInvite}
                  className="shrink-0 text-xs font-medium text-accent hover:opacity-75 transition-opacity px-2.5 py-1.5 rounded-lg border border-accent/30 bg-accent/5"
                >
                  {copied ? 'Copied!' : 'Copy link'}
                </button>
              </div>
            </div>

          </aside>

          {/* ── Main content ─────────────────────────────────────── */}
          <div className="flex-1 min-w-0 flex flex-col gap-5">

            {/* Tab bar */}
            <div className="flex border-b border-border">
              {(['activities', 'matrix'] as Tab[]).map((t) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={`px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px ${
                    tab === t
                      ? 'text-text-primary border-accent'
                      : 'text-text-muted border-transparent hover:text-text-primary'
                  }`}
                >
                  {TAB_LABELS[t]}
                </button>
              ))}
            </div>

            {/* Activities tab */}
            {tab === 'activities' && (
              <>
                <div className="flex items-center justify-between">
                  <p className="text-sm text-text-muted">{activities.length} {activities.length === 1 ? 'activity' : 'activities'}</p>
                  <Button size="sm" onClick={() => setModal({ mode: 'add' })}>+ Add activity</Button>
                </div>

                <div className="flex flex-col gap-2">
                  {activities.length === 0 && (
                    <div className="bg-bg-card rounded-[var(--radius-card)] border border-border px-6 py-12 flex flex-col items-center gap-2 text-center">
                      <p className="text-sm font-medium text-text-primary">No activities yet</p>
                      <p className="text-xs text-text-muted">Add the first one for the group to rate.</p>
                    </div>
                  )}
                  {activities.map((activity) => {
                    const activityRatings = ratings.filter((r) => r.activity_id === activity.id)
                    const myRating = activityRatings.find((r) => r.user_id === session?.user.id)
                    const editable = canEdit(activity)

                    return (
                      <div
                        key={activity.id}
                        className="bg-bg-card rounded-[var(--radius-card)] border border-border px-4 py-3.5 flex items-center gap-4 cursor-pointer hover:border-border/60 hover:shadow-sm transition-all"
                        onClick={() => setModal({ mode: 'view', activity })}
                      >
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-text-primary truncate">{activity.name}</p>
                          {activity.location && (
                            <p className="text-xs text-text-muted truncate mt-0.5">{activity.location}</p>
                          )}
                        </div>

                        {/* Per-member rating chips — capped at 5 */}
                        <div className="flex items-center gap-1 shrink-0">
                          {members.slice(0, 5).map((member) => {
                            const r = activityRatings.find((r) => r.user_id === member.id)
                            return (
                              <div
                                key={member.id}
                                title={`${member.name.split(' ')[0]}: ${r?.rating ?? 'unrated'}`}
                                className={`w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-semibold ${
                                  r ? ratingColor[r.rating] : 'bg-border text-text-subtle'
                                }`}
                              >
                                {member.name.charAt(0).toUpperCase()}
                              </div>
                            )
                          })}
                          {members.length > 5 && (
                            <div className="w-7 h-7 rounded-full bg-border flex items-center justify-center text-[11px] font-semibold text-text-muted">
                              +{members.length - 5}
                            </div>
                          )}
                        </div>

                        {myRating && (
                          <span className={`text-xs font-semibold px-2 py-0.5 rounded-[var(--radius-badge)] shrink-0 ${ratingColor[myRating.rating]}`}>
                            {myRating.rating}
                          </span>
                        )}

                        {editable && (
                          <div className="flex items-center gap-0.5 shrink-0" onClick={(e) => e.stopPropagation()}>
                            <button
                              onClick={() => setModal({ mode: 'edit', activity })}
                              className="p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-bg transition-colors"
                              title="Edit"
                            >
                              <svg width="13" height="13" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M9.5 1.5l3 3-8 8H1.5v-3l8-8z"/>
                              </svg>
                            </button>
                            <button
                              onClick={() => handleDelete(activity)}
                              disabled={acting}
                              className="p-1.5 rounded-lg text-text-muted hover:text-red-500 hover:bg-bg transition-colors disabled:opacity-40"
                              title="Delete"
                            >
                              <svg width="13" height="13" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M1.5 3.5h11M4.5 3.5V2.5a1 1 0 011-1h3a1 1 0 011 1v1M5.5 6.5v4M8.5 6.5v4M2.5 3.5l.75 8.25a1 1 0 001 .75h5.5a1 1 0 001-.75L11.5 3.5"/>
                              </svg>
                            </button>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </>
            )}

            {/* Matrix tab */}
            {tab === 'matrix' && <CompatibilityMatrix />}

          </div>
        </div>
      </div>

      <ActivityDetailModal
        open={modal.mode === 'view'}
        activity={modal.mode === 'view' ? modal.activity : null}
        members={members}
        activityRatings={ratings}
        myRating={
          modal.mode === 'view'
            ? (ratings.find((r) => r.activity_id === modal.activity.id && r.user_id === userId)?.rating ?? null)
            : null
        }
        ratingLoading={rating}
        onRate={(r) => modal.mode === 'view' && rateActivity(modal.activity.id, r)}
        canEdit={modal.mode === 'view' ? canEdit(modal.activity) : false}
        onClose={() => setModal({ mode: 'closed' })}
        onEdit={() => modal.mode === 'view' && setModal({ mode: 'edit', activity: modal.activity })}
      />

      <CreateTripModal
        open={showEditTrip}
        title="Edit trip"
        initial={{
          name: trip.name,
          destination: trip.destination,
          start_date: trip.start_date ?? '',
          end_date: trip.end_date ?? '',
        }}
        submitLabel="Save"
        loading={updating}
        error={updateError}
        onClose={() => setShowEditTrip(false)}
        onSubmit={handleEditTrip}
        members={members}
        ownerId={trip.created_by}
        onRemoveMember={removeMember}
        removingMemberId={removingId}
        removeError={removeError}
      />

      <ActivityFormModal
        open={modal.mode === 'add'}
        title="Add Activity"
        submitLabel="Add"
        loading={adding}
        error={addError}
        onClose={() => setModal({ mode: 'closed' })}
        onSubmit={handleAdd}
      />

      {(() => {
        const me = members.find((m) => m.id === userId)
        return (
          <MemberDatesModal
            open={showDatesModal}
            tripStart={trip.start_date ?? null}
            tripEnd={trip.end_date ?? null}
            initialArrival={me?.arrival_date ?? null}
            initialDeparture={me?.departure_date ?? null}
            loading={datesLoading}
            error={datesError}
            onClose={() => setShowDatesModal(false)}
            onSubmit={async (arrival, departure) => {
              await updateDates(arrival, departure)
              setShowDatesModal(false)
            }}
          />
        )
      })()}

      <ActivityFormModal
        open={modal.mode === 'edit'}
        title="Edit Activity"
        initial={modal.mode === 'edit' ? {
          name: modal.activity.name,
          location: modal.activity.location ?? '',
          description: modal.activity.description ?? '',
          url: modal.activity.url ?? '',
        } : undefined}
        loading={acting}
        error={actError}
        onClose={() => setModal({ mode: 'closed' })}
        onSubmit={handleEdit}
      />
    </main>
  )
}
