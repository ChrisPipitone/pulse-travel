'use client'

import { useEffect, useRef, useState } from 'react'
import { useFocusTrap } from '@/hooks/useFocusTrap'
import { useModalEscape } from '@/hooks/useModalEscape'
import { FadeReveal } from './FadeReveal'
import { MemberAvatar } from '@/components/MemberAvatar'
import type { Activity, ActivityRating, Member, Rating } from '@pulse/types'
import { RATING_PILL, RATING_BUTTON, RATING_LABELS } from '@pulse/types'

// TODO(mobile): revisit rating UX for touch — consider long-press popover or
// swipe gesture instead of tapping into detail modal. Web option 2 (modal chips)
// may not be the best mobile pattern.

const ratingRing: Record<Rating, string> = {
  MUST:  'ring-must',
  MAYBE: 'ring-maybe',
  SKIP:  'ring-skip',
}

const ratings: Rating[] = ['MUST', 'MAYBE', 'SKIP']

type Props = {
  open: boolean
  activity: Activity | null
  members: Member[]
  activityRatings: ActivityRating[]
  myRating: Rating | null
  ratingLoading: boolean
  onRate: (rating: Rating) => void
  onClose: () => void
  onEdit: () => void
  canEdit: boolean
}

const GROUP_RATINGS_CAP = 5

export function ActivityDetailModal({
  open, activity, members, activityRatings, myRating, ratingLoading,
  onRate, onClose, onEdit, canEdit,
}: Props) {
  const [justRated, setJustRated] = useState(false)
  const [ratingsExpanded, setRatingsExpanded] = useState(false)
  const modalRef = useRef<HTMLDivElement>(null)
  useFocusTrap(modalRef, open)

  useModalEscape(onClose)

  useEffect(() => {
    if (!justRated || ratingLoading) return
    const timer = setTimeout(() => {
      setJustRated(false)
      onClose()
    }, 600)
    return () => clearTimeout(timer)
  }, [justRated, ratingLoading, onClose])

  useEffect(() => {
    if (!open) { setJustRated(false); setRatingsExpanded(false) }
  }, [open])

  if (!open || !activity) return null

  const addedBy = members.find((m) => m.id === activity.added_by)
  const memberRatings = activityRatings.filter((r) => r.activity_id === activity.id)

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="modal-overlay absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div ref={modalRef} className="modal-panel relative bg-bg-card rounded-t-[var(--radius-card)] sm:rounded-[var(--radius-card)] border border-border w-full sm:max-w-md shadow-lg overflow-hidden max-h-[90dvh] overflow-y-auto">

        {/* Header */}
        <div className="px-6 pt-6 pb-4 flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-semibold text-text-primary leading-snug">{activity.name}</h2>
            {activity.location && (
              <p className="text-sm text-text-muted mt-0.5">{activity.location}</p>
            )}
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="shrink-0 p-2.5 rounded text-text-muted hover:text-text-primary hover:bg-bg transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
              <path d="M3 3l10 10M13 3L3 13"/>
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="px-6 pb-5 flex flex-col gap-4">

          {activity.description && (
            <p className="text-sm text-text-primary leading-relaxed">{activity.description}</p>
          )}

          {/* Meta */}
          {(activity.duration_hours || activity.url || addedBy) && (
            <div className="flex flex-wrap gap-3 text-xs text-text-muted">
              {activity.duration_hours && <span>{activity.duration_hours}h</span>}
              {activity.url && (
                <a
                  href={activity.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-accent underline underline-offset-2 hover:opacity-80 transition-opacity"
                  onClick={(e) => e.stopPropagation()}
                >
                  Link ↗
                </a>
              )}
              {addedBy && <span>Added by {addedBy.name.split(' ')[0]}</span>}
            </div>
          )}

          {/* Your rating */}
          <div className="flex flex-col gap-2">
            <p className="text-xs font-medium text-text-muted uppercase tracking-wide">Your rating</p>
            <div className="flex gap-2">
              {ratings.map((r) => {
                const active = myRating === r
                const showCheck = active && justRated && !ratingLoading
                return (
                  <button
                    key={r}
                    disabled={ratingLoading}
                    onClick={() => { setJustRated(true); onRate(r) }}
                    className={`flex-1 min-h-[44px] py-2 rounded-[var(--radius-card)] text-sm font-semibold transition-all disabled:opacity-50 ${
                      active
                        ? `${RATING_BUTTON[r].active} ring-2 ring-offset-2 ${ratingRing[r]}`
                        : 'bg-bg border border-border text-text-muted hover:border-accent/40 hover:text-text-primary'
                    }`}
                  >
                    <span key={showCheck ? 'check' : r} className={showCheck ? 'pop-in' : ''}>
                      {showCheck ? '✓' : RATING_LABELS[r]}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>

          <p className="text-[11px] text-text-subtle text-center -mt-2">
            MUST = you&apos;re in the crew · MAYBE = flexible · SKIP = you&apos;re out
          </p>

          {/* Group ratings */}
          {memberRatings.length > 0 && (() => {
            const ratedMembers = members.filter((m) => memberRatings.some((ar) => ar.user_id === m.id))
            const visible = ratingsExpanded ? ratedMembers : ratedMembers.slice(0, GROUP_RATINGS_CAP)
            const overflow = ratedMembers.length - GROUP_RATINGS_CAP
            return (
              <div className="flex flex-col gap-2">
                <p className="text-xs font-medium text-text-muted uppercase tracking-wide">Group</p>
                <div className="flex flex-col gap-1.5">
                  {visible.map((member) => {
                    const r = memberRatings.find((ar) => ar.user_id === member.id)!
                    return (
                      <div key={member.id} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <MemberAvatar name={member.name} avatarUrl={member.avatar_url} size="md" />
                          <span className="text-sm text-text-primary">{member.name.split(' ')[0]}</span>
                        </div>
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-[var(--radius-badge)] ${RATING_PILL[r.rating]}`}>
                          {RATING_LABELS[r.rating]}
                        </span>
                      </div>
                    )
                  })}
                </div>
                {overflow > 0 && !ratingsExpanded && (
                  <FadeReveal
                    label={`+${overflow} more`}
                    onClick={() => setRatingsExpanded(true)}
                  />
                )}
                {ratingsExpanded && (
                  <button
                    onClick={() => setRatingsExpanded(false)}
                    className="text-xs font-medium text-accent hover:opacity-75 transition-opacity text-center w-full"
                  >
                    Show less
                  </button>
                )}
              </div>
            )
          })()}
        </div>

        {/* Footer — edit */}
        {canEdit && (
          <div className="px-6 pb-6">
            <button
              onClick={onEdit}
              className="w-full text-sm font-medium text-accent border border-accent/30 rounded-[var(--radius-card)] py-2 hover:bg-accent/5 transition-colors"
            >
              Edit Activity
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
