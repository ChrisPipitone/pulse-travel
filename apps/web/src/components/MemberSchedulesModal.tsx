'use client'

import { useRef, useState } from 'react'
import { useFocusTrap } from '@/hooks/useFocusTrap'
import { useModalEscape } from '@/hooks/useModalEscape'
import { MemberAvatar } from '@/components/MemberAvatar'
import { KebabMenu } from '@/components/KebabMenu'
import { fmtDateRange } from '@/lib/date'
import type { Trip, Member } from '@pulse/types'

type Props = {
  open: boolean
  members: Member[]
  trip: Trip | null
  userId: string | undefined
  onEditDates: () => void
  onClose: () => void
}

export function MemberSchedulesModal({ open, members, trip, userId, onEditDates, onClose }: Props) {
  const modalRef = useRef<HTMLDivElement>(null)
  const [viewMode, setViewMode] = useState<'bars' | 'grid'>('bars')
  useFocusTrap(modalRef, open)

  useModalEscape(onClose)

  if (!open) return null

  const sorted = userId
    ? [...members].sort((a, b) => (a.id === userId ? -1 : b.id === userId ? 1 : 0))
    : members

  // Helper for timeline bars + grid
  const tripStart = trip?.start_date ? new Date(trip.start_date + 'T00:00:00').getTime() : null
  const tripEnd = trip?.end_date ? new Date(trip.end_date + 'T00:00:00').getTime() : null
  const tripDuration = tripStart && tripEnd ? tripEnd - tripStart : 0
  const MS = 86400000
  const numDays = tripDuration > 0 ? Math.round(tripDuration / MS) + 1 : 0
  const days = Array.from({ length: numDays }, (_, i) => {
    const d = new Date(tripStart! + i * MS)
    return {
      str: [d.getFullYear(), String(d.getMonth() + 1).padStart(2, '0'), String(d.getDate()).padStart(2, '0')].join('-'),
      day: d.getDate(),
      month: d.toLocaleString('default', { month: 'short' }),
      isMonthStart: d.getDate() === 1 || i === 0,
    }
  })

  function memberOnDay(m: Member, dayStr: string): boolean | null {
    if (!m.arrival_date && !m.departure_date) return null
    const mStart = m.arrival_date ?? trip?.start_date ?? dayStr
    const mEnd = m.departure_date ?? trip?.end_date ?? dayStr
    return dayStr >= mStart && dayStr <= mEnd
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="modal-overlay absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div
        ref={modalRef}
        className={`modal-panel relative bg-bg-card rounded-t-[var(--radius-card)] sm:rounded-[var(--radius-card)] border border-border w-full shadow-lg flex flex-col max-h-[80vh] transition-all duration-200 ${viewMode === 'grid' ? 'sm:max-w-2xl' : 'sm:max-w-sm'}`}
      >
        {/* Header */}
        <div className="px-5 pt-5 pb-3 flex items-center justify-between shrink-0">
          <div>
            <h2 className="text-sm font-semibold text-text-primary">Schedules</h2>
            <p className="text-xs text-text-muted mt-0.5">{members.length} {members.length === 1 ? 'person' : 'people'}</p>
          </div>
          <div className="flex items-center gap-2">
            {numDays > 0 && (
              <div className="flex items-center gap-0.5 bg-bg rounded-lg p-0.5">
                {(['bars', 'grid'] as const).map((v) => (
                  <button
                    key={v}
                    onClick={() => setViewMode(v)}
                    className={`px-2 py-0.5 rounded text-[10px] font-semibold transition-all ${
                      viewMode === v ? 'bg-accent text-white' : 'text-text-muted hover:text-text-primary'
                    }`}
                  >
                    {v === 'bars' ? 'Timeline' : 'Grid'}
                  </button>
                ))}
              </div>
            )}
            <button
              onClick={onClose}
              aria-label="Close"
              className="p-1.5 rounded text-text-muted hover:text-text-primary hover:bg-bg transition-colors"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                <path d="M3 3l10 10M13 3L3 13" />
              </svg>
            </button>
          </div>
        </div>

        {/* Scrollable list */}
        <div className="overflow-y-auto px-5 pb-6 flex flex-col gap-4">
          {viewMode === 'bars' ? sorted.map((m) => {
            const isMe = m.id === userId
            const dateStr = fmtDateRange(m.arrival_date, m.departure_date)
            const hasDates = !!(m.arrival_date || m.departure_date)

            // Timeline calculations
            let left = 0
            let width = 100
            if (hasDates && tripDuration > 0 && tripStart && tripEnd) {
              const mStart = m.arrival_date ? new Date(m.arrival_date + 'T00:00:00').getTime() : tripStart
              const mEnd = m.departure_date ? new Date(m.departure_date + 'T00:00:00').getTime() : tripEnd
              left = Math.max(0, ((mStart - tripStart) / tripDuration) * 100)
              width = Math.min(100 - left, ((mEnd - mStart) / tripDuration) * 100)
            }

            return (
              <div key={m.id} className="flex flex-col gap-2">
                <div className="flex items-center gap-2.5">
                  <MemberAvatar name={m.name} avatarUrl={m.avatar_url} size="lg" />
                  <div className="flex flex-col leading-tight min-w-0 flex-1">
                    <span className="text-xs font-semibold text-text-primary">
                      {m.name.split(' ')[0]}{isMe && <span className="text-text-muted font-normal"> (you)</span>}
                    </span>
                    <span className={`text-[10px] ${hasDates ? "text-text-muted" : "text-accent font-medium italic"}`}>
                      {dateStr ?? (isMe ? "+ Add your dates" : "Dates not set")}
                    </span>
                  </div>
                  {isMe && (
                    <KebabMenu
                      items={[
                        { label: 'Edit dates', onClick: () => { onClose(); onEditDates() } },
                      ]}
                    />
                  )}
                </div>

                {/* Visual timeline bar */}
                {tripDuration > 0 && (
                  <div className="h-1 w-full bg-bg rounded-full overflow-hidden relative">
                    <div
                      className={`absolute h-full rounded-full transition-all duration-500 ${hasDates ? "bg-accent" : "bg-border opacity-50"}`}
                      style={{ left: `${left}%`, width: `${width}%` }}
                    />
                  </div>
                )}
              </div>
            )
          }) : (
            /* Grid view */
            <>
              <div className="overflow-x-auto -mx-5 px-5">
                <div style={{ minWidth: `${days.length * 20 + 80}px` }}>
                  {/* Month + day header */}
                  <div className="flex mb-2 ml-[72px]">
                    {days.map((d, i) => (
                      <div key={i} className="w-5 shrink-0 flex flex-col items-center">
                        <span className="text-[8px] text-accent font-semibold uppercase leading-tight">
                          {d.isMonthStart ? d.month.slice(0, 3) : ''}
                        </span>
                        <span className="text-[9px] text-text-subtle leading-tight">{d.day}</span>
                      </div>
                    ))}
                  </div>
                  {/* Member rows */}
                  {sorted.map((m) => {
                    const isMe = m.id === userId
                    return (
                      <div key={m.id} className="flex items-center mb-2">
                        <div className="w-[72px] shrink-0 flex items-center gap-1.5 pr-2">
                          <MemberAvatar name={m.name} avatarUrl={m.avatar_url} size="sm" />
                          <span className="text-[10px] font-medium text-text-primary truncate">
                            {m.name.split(' ')[0]}{isMe ? '*' : ''}
                          </span>
                        </div>
                        <div className="flex gap-0.5">
                          {days.map((d, i) => {
                            const present = memberOnDay(m, d.str)
                            return (
                              <div
                                key={i}
                                className={`w-4 h-4 rounded-sm shrink-0 ${
                                  present === null
                                    ? 'bg-border/40'
                                    : present
                                      ? 'bg-accent/70'
                                      : 'bg-bg-card border border-border'
                                }`}
                              />
                            )
                          })}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
              {/* Legend — outside scroll so not covered by scrollbar */}
              <div className="flex items-center gap-3 pt-3 border-t border-border">
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded-sm bg-accent/70" />
                  <span className="text-[9px] text-text-subtle">Present</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded-sm bg-bg-card border border-border" />
                  <span className="text-[9px] text-text-subtle">Away</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded-sm bg-border/40" />
                  <span className="text-[9px] text-text-subtle">No dates</span>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
