'use client'

import { useState } from 'react'
import { useTripStore } from '@pulse/store'
import { useStopActions } from '@pulse/hooks'
import type { Stop } from '@pulse/types'

type Props = {
  tripId: string
  userId: string | undefined
  tripOwnerId: string
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

function canManage(stop: Stop, userId: string | undefined, tripOwnerId: string) {
  return stop.created_by === userId || tripOwnerId === userId
}

export function StopsPanel({ tripId, userId, tripOwnerId }: Props) {
  const stops = useTripStore((s) => s.stops)
  const activities = useTripStore((s) => s.activities)
  const { createStop, deleteStop, loading } = useStopActions()

  const [adding, setAdding] = useState(false)
  const [newName, setNewName] = useState('')
  const [newFrom, setNewFrom] = useState('')
  const [newTo, setNewTo] = useState('')
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const countByStop = activities.reduce<Record<string, number>>((acc, a) => {
    if (a.stop_id) acc[a.stop_id] = (acc[a.stop_id] ?? 0) + 1
    return acc
  }, {})

  function resetForm() {
    setNewName(''); setNewFrom(''); setNewTo(''); setAdding(false)
  }

  async function handleAdd() {
    const name = newName.trim()
    if (!name) return
    const ok = await createStop(tripId, name, newFrom || null, newTo || null)
    if (ok) resetForm()
  }

  async function handleDelete(stop: Stop) {
    if (deletingId === stop.id) {
      await deleteStop(stop.id)
      setDeletingId(null)
    } else {
      setDeletingId(stop.id)
      setTimeout(() => setDeletingId((cur) => cur === stop.id ? null : cur), 3000)
    }
  }

  const dateError = newFrom && newTo && newFrom > newTo
    ? 'Start must be before end'
    : null

  return (
    <div className="bg-bg-card rounded-[var(--radius-card)] border border-border p-5 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h2 className="text-xs font-semibold text-text-subtle uppercase tracking-widest">Stops</h2>
        {!adding && (
          <button
            onClick={() => setAdding(true)}
            className="text-xs font-medium text-accent hover:text-accent/80 transition-colors"
          >
            + Add
          </button>
        )}
      </div>

      {stops.length === 0 && !adding && (
        <p className="text-xs text-text-muted italic">
          No stops yet. Add legs like "Rome" or "Amalfi" to group activities.
        </p>
      )}

      {stops.length > 0 && (
        <div className="flex flex-col gap-1.5">
          {stops.map((stop) => {
            const count = countByStop[stop.id] ?? 0
            const isPending = deletingId === stop.id
            const dateStr = formatStopDates(stop.date_from, stop.date_to)
            return (
              <div key={stop.id} className="flex items-center gap-2 group">
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
                {canManage(stop, userId, tripOwnerId) && (
                  <button
                    onClick={() => handleDelete(stop)}
                    disabled={loading}
                    className={`shrink-0 p-1 rounded transition-colors opacity-0 group-hover:opacity-100 disabled:opacity-40 ${
                      isPending ? 'text-red-500 bg-red-500/10 opacity-100' : 'text-text-muted hover:text-red-500 hover:bg-bg'
                    }`}
                    title={isPending ? 'Tap again to confirm' : 'Delete stop'}
                    aria-label={isPending ? 'Confirm delete stop' : 'Delete stop'}
                  >
                    <svg width="11" height="11" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1.5 3.5h11M4.5 3.5V2.5a1 1 0 011-1h3a1 1 0 011 1v1M5.5 6.5v4M8.5 6.5v4M2.5 3.5l.75 8.25a1 1 0 001 .75h5.5a1 1 0 001-.75L11.5 3.5" />
                    </svg>
                  </button>
                )}
              </div>
            )
          })}
        </div>
      )}

      {adding && (
        <div className="flex flex-col gap-2 pt-1 border-t border-border">
          <input
            autoFocus
            type="text"
            placeholder="Stop name (e.g. Rome)"
            maxLength={100}
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleAdd()
              if (e.key === 'Escape') resetForm()
            }}
            className="w-full text-xs bg-bg border border-border rounded-lg px-2.5 py-1.5 text-text-primary placeholder:text-text-subtle outline-none focus:border-accent/50"
          />
          <div className="flex gap-2">
            <div className="flex-1 flex flex-col gap-1">
              <label className="text-[10px] text-text-subtle font-medium">From</label>
              <input
                type="date"
                value={newFrom}
                onChange={(e) => setNewFrom(e.target.value)}
                className="w-full text-xs bg-bg border border-border rounded-lg px-2 py-1.5 text-text-primary outline-none focus:border-accent/50"
              />
            </div>
            <div className="flex-1 flex flex-col gap-1">
              <label className="text-[10px] text-text-subtle font-medium">To</label>
              <input
                type="date"
                value={newTo}
                min={newFrom || undefined}
                onChange={(e) => setNewTo(e.target.value)}
                className="w-full text-xs bg-bg border border-border rounded-lg px-2 py-1.5 text-text-primary outline-none focus:border-accent/50"
              />
            </div>
          </div>
          {dateError && <p className="text-[10px] text-red-500 -mt-0.5">{dateError}</p>}
          {!dateError && <p className="text-[10px] text-text-subtle -mt-0.5">Dates optional</p>}
          <div className="flex gap-2">
            <button
              onClick={resetForm}
              className="flex-1 text-xs font-medium text-text-muted border border-border rounded-lg py-1.5 hover:bg-bg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleAdd}
              disabled={!newName.trim() || !!dateError || loading}
              className="flex-1 text-xs font-medium text-white bg-accent rounded-lg py-1.5 disabled:opacity-40 hover:opacity-90 transition-opacity"
            >
              {loading ? 'Adding…' : 'Add stop'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
