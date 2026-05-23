'use client'

import { useEffect, useRef } from 'react'
import { useFocusTrap } from '@/hooks/useFocusTrap'
import { memberPalette } from '@/lib/memberColors'
import type { Member } from '@pulse/types'

function formatMemberDates(arrival?: string, departure?: string): string | null {
  const fmt = (d: string) =>
    new Date(d + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  if (arrival && departure) return `${fmt(arrival)} – ${fmt(departure)}`
  if (arrival) return `From ${fmt(arrival)}`
  if (departure) return `Until ${fmt(departure)}`
  return null
}

type Props = {
  open: boolean
  members: Member[]
  colorMap: Map<string, number>
  userId: string | undefined
  onEditDates: () => void
  onClose: () => void
}

export function MemberSchedulesModal({ open, members, colorMap, userId, onEditDates, onClose }: Props) {
  const modalRef = useRef<HTMLDivElement>(null)
  useFocusTrap(modalRef, open)

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null

  const sorted = userId
    ? [...members].sort((a, b) => (a.id === userId ? -1 : b.id === userId ? 1 : 0))
    : members

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div
        ref={modalRef}
        className="relative bg-bg-card rounded-t-[var(--radius-card)] sm:rounded-[var(--radius-card)] border border-border w-full sm:max-w-sm shadow-lg flex flex-col max-h-[80vh]"
      >
        {/* Header */}
        <div className="px-5 pt-5 pb-3 flex items-center justify-between shrink-0">
          <div>
            <h2 className="text-sm font-semibold text-text-primary">Schedules</h2>
            <p className="text-xs text-text-muted mt-0.5">{members.length} {members.length === 1 ? 'person' : 'people'}</p>
          </div>
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

        {/* Scrollable list */}
        <div className="overflow-y-auto px-5 pb-5 flex flex-col gap-2">
          {sorted.map((m) => {
            const isMe = m.id === userId
            const dateStr = formatMemberDates(m.arrival_date, m.departure_date)
            const palette = memberPalette(colorMap.get(m.id) ?? 0)
            return (
              <div key={m.id} className="flex items-center gap-2.5">
                {m.avatar_url ? (
                  <img src={m.avatar_url} alt={m.name} className="w-7 h-7 rounded-full object-cover shrink-0" />
                ) : (
                  <span
                    className="w-7 h-7 rounded-full flex items-center justify-center font-semibold text-xs shrink-0"
                    style={{ backgroundColor: palette.bg, color: palette.fg }}
                  >
                    {m.name.charAt(0).toUpperCase()}
                  </span>
                )}
                <div className="flex flex-col leading-tight min-w-0 flex-1">
                  <span className="text-xs font-medium text-text-primary">
                    {m.name.split(' ')[0]}{isMe && <span className="text-text-muted font-normal"> (you)</span>}
                  </span>
                  <span className="text-[11px] text-text-muted">{dateStr ?? 'Full trip'}</span>
                </div>
                {isMe && (
                  <button
                    onClick={() => { onClose(); onEditDates() }}
                    className="shrink-0 text-xs text-accent hover:opacity-75 transition-opacity font-medium"
                  >
                    Edit
                  </button>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
