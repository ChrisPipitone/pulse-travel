'use client'

import { useState, useRef } from 'react'
import { useTripStore } from '@pulse/store'
import { useStopActions } from '@pulse/hooks'
import { useToast } from '@/components/ToastProvider'
import { KebabMenu } from '@/components/KebabMenu'
import type { Stop } from '@pulse/types'

type Props = {
  tripId: string
  userId: string | undefined
  tripOwnerId: string
  onOpenAdd: () => void
  onOpenEdit: (stop: Stop) => void
}

function fmt(date: string) {
  return new Date(date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function formatStopDates(from?: string | null, to?: string | null): string | null {
  if (from && to) return `${fmt(from)} – ${fmt(to)}`
  if (from) return `From ${fmt(from)}`
  if (to) return `Until ${fmt(to)}`
  return null
}

export function StopsPanel({ userId, tripOwnerId, onOpenAdd, onOpenEdit }: Props) {
  const stops = useTripStore((s) => s.stops)
  const activities = useTripStore((s) => s.activities)
  const { deleteStop } = useStopActions()
  const { showToast } = useToast()

  const isOwner = userId === tripOwnerId

  const [hiddenIds, setHiddenIds] = useState<Set<string>>(new Set())
  const timerRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map())

  const countByStop = activities.reduce<Record<string, number>>((acc, a) => {
    if (a.stop_id) acc[a.stop_id] = (acc[a.stop_id] ?? 0) + 1
    return acc
  }, {})

  function handleDelete(stop: Stop) {
    setHiddenIds((prev) => new Set(prev).add(stop.id))
    const timer = setTimeout(async () => {
      timerRef.current.delete(stop.id)
      setHiddenIds((prev) => { const s = new Set(prev); s.delete(stop.id); return s })
      await deleteStop(stop.id)
    }, 4000)
    timerRef.current.set(stop.id, timer)
    showToast(
      `"${stop.name}" deleted`,
      () => {
        clearTimeout(timerRef.current.get(stop.id))
        timerRef.current.delete(stop.id)
        setHiddenIds((prev) => { const s = new Set(prev); s.delete(stop.id); return s })
      },
      4000,
    )
  }

  const visibleStops = stops.filter((s) => !hiddenIds.has(s.id))

  return (
    <div className="bg-bg-card rounded-[var(--radius-card)] border border-border p-5 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h2 className="text-xs font-semibold text-text-subtle uppercase tracking-widest">Stops</h2>
        {isOwner && (
          <button
            onClick={onOpenAdd}
            className="text-xs font-medium text-accent hover:text-accent/80 transition-colors"
          >
            + Add
          </button>
        )}
      </div>

      {visibleStops.length === 0 && (
        <p className="text-xs text-text-muted italic">
          No stops yet. Add legs like &quot;Rome&quot; or &quot;Amalfi&quot; to group activities.
        </p>
      )}

      {visibleStops.length > 0 && (
        <div className="flex flex-col gap-1.5">
          {visibleStops.map((stop) => {
            const count = countByStop[stop.id] ?? 0
            const dateStr = formatStopDates(stop.date_from, stop.date_to)
            return (
              <div key={stop.id} className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-accent/50 shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <span className="text-xs font-medium text-text-primary truncate block">{stop.name}</span>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {dateStr && (
                      <span className="text-[10px] text-accent font-medium">{dateStr}</span>
                    )}
                    {dateStr && count > 0 && (
                      <span className="text-[10px] text-text-subtle">·</span>
                    )}
                    {count > 0 && (
                      <span className="text-[10px] text-text-muted">
                        {count} {count === 1 ? 'activity' : 'activities'}
                      </span>
                    )}
                  </div>
                </div>
                {isOwner && (
                  <KebabMenu
                    items={[
                      { label: 'Edit', onClick: () => onOpenEdit(stop) },
                      { label: 'Delete', danger: true, onClick: () => handleDelete(stop) },
                    ]}
                  />
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
