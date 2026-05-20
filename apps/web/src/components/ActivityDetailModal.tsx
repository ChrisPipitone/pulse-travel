'use client'

import type { Activity, ActivityRating, Member, Rating } from '@pulse/types'

// TODO(mobile): revisit rating UX for touch — consider long-press popover or
// swipe gesture instead of tapping into detail modal. Web option 2 (modal chips)
// may not be the best mobile pattern.

const ratingColor: Record<Rating, string> = {
  MUST: 'bg-must text-must-text',
  WANT: 'bg-want text-want-text',
  MEH:  'bg-meh text-meh-text',
}

const ratingLabel: Record<Rating, string> = {
  MUST: 'Must',
  WANT: 'Want',
  MEH:  'Meh',
}

const ratings: Rating[] = ['MUST', 'WANT', 'MEH']

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

export function ActivityDetailModal({
  open, activity, members, activityRatings, myRating, ratingLoading,
  onRate, onClose, onEdit, canEdit,
}: Props) {
  if (!open || !activity) return null

  const addedBy = members.find((m) => m.id === activity.added_by)
  const memberRatings = activityRatings.filter((r) => r.activity_id === activity.id)

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-bg-card rounded-t-2xl sm:rounded-2xl border border-border w-full sm:max-w-md shadow-lg overflow-hidden">

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
            className="shrink-0 p-1.5 rounded text-text-muted hover:text-text-primary hover:bg-bg transition-colors"
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
                return (
                  <button
                    key={r}
                    disabled={ratingLoading}
                    onClick={() => onRate(r)}
                    className={`flex-1 py-2 rounded-[var(--radius-card)] text-sm font-semibold transition-all disabled:opacity-50 ${
                      active
                        ? ratingColor[r]
                        : 'bg-bg border border-border text-text-muted hover:border-accent/40 hover:text-text-primary'
                    }`}
                  >
                    {ratingLabel[r]}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Group ratings */}
          {memberRatings.length > 0 && (
            <div className="flex flex-col gap-2">
              <p className="text-xs font-medium text-text-muted uppercase tracking-wide">Group</p>
              <div className="flex flex-col gap-1.5">
                {members.map((member) => {
                  const r = memberRatings.find((ar) => ar.user_id === member.id)
                  if (!r) return null
                  return (
                    <div key={member.id} className="flex items-center justify-between">
                      <span className="text-sm text-text-primary">{member.name.split(' ')[0]}</span>
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-[var(--radius-badge)] ${ratingColor[r.rating]}`}>
                        {ratingLabel[r.rating]}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
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
