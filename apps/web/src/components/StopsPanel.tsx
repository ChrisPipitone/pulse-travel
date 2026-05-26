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

export function StopsPanel({ tripId, userId, tripOwnerId }: Props) {
  const stops = useTripStore((s) => s.stops)
  const activities = useTripStore((s) => s.activities)
  const { createStop, updateStop, deleteStop, loading } = useStopActions()
  const { showToast } = useToast()

  const isOwner = userId === tripOwnerId

  const [adding, setAdding] = useState(false)
  const [newName, setNewName] = useState('')
  const [newFrom, setNewFrom] = useState('')
  const [newTo, setNewTo] = useState('')

  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')
  const [editFrom, setEditFrom] = useState('')
  const [editTo, setEditTo] = useState('')

  const [hiddenIds, setHiddenIds] = useState<Set<string>>(new Set())
  const timerRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map())

  const countByStop = activities.reduce<Record<string, number>>((acc, a) => {
    if (a.stop_id) acc[a.stop_id] = (acc[a.stop_id] ?? 0) + 1
    return acc
  }, {})

  function resetAddForm() {
    setNewName(''); setNewFrom(''); setNewTo(''); setAdding(false)
  }

  function startEdit(stop: Stop) {
    setEditingId(stop.id)
    setEditName(stop.name)
    setEditFrom(stop.date_from ?? '')
    setEditTo(stop.date_to ?? '')
  }

  function cancelEdit() {
    setEditingId(null)
    setEditName(''); setEditFrom(''); setEditTo('')
  }

  async function handleAdd() {
    const name = newName.trim()
    if (!name) return
    const ok = await createStop(tripId, name, newFrom || null, newTo || null)
    if (ok) resetAddForm()
  }

  async function handleSaveEdit(stop: Stop) {
    const name = editName.trim()
    if (!name) return
    const ok = await updateStop(stop.id, {
      name,
      date_from: editFrom || null,
      date_to: editTo || null,
    })
    if (ok) cancelEdit()
  }

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

  const addDateError = newFrom && newTo && newFrom > newTo ? 'Start must be before end' : null
  const editDateError = editFrom && editTo && editFrom > editTo ? 'Start must be before end' : null
  const visibleStops = stops.filter((s) => !hiddenIds.has(s.id))

  return (
    <div className="bg-bg-card rounded-[var(--radius-card)] border border-border p-5 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h2 className="text-xs font-semibold text-text-subtle uppercase tracking-widest">Stops</h2>
        {isOwner && !adding && (
          <button
            onClick={() => setAdding(true)}
            className="text-xs font-medium text-accent hover:text-accent/80 transition-colors"
          >
            + Add
          </button>
        )}
      </div>

      {visibleStops.length === 0 && !adding && (
        <p className="text-xs text-text-muted italic">
          No stops yet. Add legs like &quot;Rome&quot; or &quot;Amalfi&quot; to group activities.
        </p>
      )}

      {visibleStops.length > 0 && (
        <div className="flex flex-col gap-1.5">
          {visibleStops.map((stop) => {
            const count = countByStop[stop.id] ?? 0
            const dateStr = formatStopDates(stop.date_from, stop.date_to)

            if (editingId === stop.id) {
              return (
                <div key={stop.id} className="flex flex-col gap-2 py-1.5 border-t border-border">
                  <input
                    autoFocus
                    type="text"
                    placeholder="Stop name"
                    maxLength={100}
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleSaveEdit(stop)
                      if (e.key === 'Escape') cancelEdit()
                    }}
                    className="w-full text-xs bg-bg border border-border rounded-lg px-2.5 py-1.5 text-text-primary placeholder:text-text-subtle outline-none focus:border-accent/50"
                  />
                  <div className="flex gap-2">
                    <div className="flex-1 flex flex-col gap-1">
                      <label className="text-[10px] text-text-subtle font-medium">From</label>
                      <input
                        type="date"
                        value={editFrom}
                        onChange={(e) => setEditFrom(e.target.value)}
                        className="w-full text-xs bg-bg border border-border rounded-lg px-2 py-1.5 text-text-primary outline-none focus:border-accent/50"
                      />
                    </div>
                    <div className="flex-1 flex flex-col gap-1">
                      <label className="text-[10px] text-text-subtle font-medium">To</label>
                      <input
                        type="date"
                        value={editTo}
                        min={editFrom || undefined}
                        onChange={(e) => setEditTo(e.target.value)}
                        className="w-full text-xs bg-bg border border-border rounded-lg px-2 py-1.5 text-text-primary outline-none focus:border-accent/50"
                      />
                    </div>
                  </div>
                  {editDateError && <p className="text-[10px] text-red-500 -mt-0.5">{editDateError}</p>}
                  <div className="flex gap-2">
                    <button
                      onClick={cancelEdit}
                      className="flex-1 text-xs font-medium text-text-muted border border-border rounded-lg py-1.5 hover:bg-bg transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleSaveEdit(stop)}
                      disabled={!editName.trim() || !!editDateError || loading}
                      className="flex-1 text-xs font-medium text-white bg-accent rounded-lg py-1.5 disabled:opacity-40 hover:opacity-90 transition-opacity"
                    >
                      {loading ? 'Saving…' : 'Save'}
                    </button>
                  </div>
                </div>
              )
            }

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
                      { label: 'Edit', onClick: () => startEdit(stop) },
                      { label: 'Delete', danger: true, onClick: () => handleDelete(stop) },
                    ]}
                  />
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
              if (e.key === 'Escape') resetAddForm()
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
          {addDateError && <p className="text-[10px] text-red-500 -mt-0.5">{addDateError}</p>}
          {!addDateError && <p className="text-[10px] text-text-subtle -mt-0.5">Dates optional</p>}
          <div className="flex gap-2">
            <button
              onClick={resetAddForm}
              className="flex-1 text-xs font-medium text-text-muted border border-border rounded-lg py-1.5 hover:bg-bg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleAdd}
              disabled={!newName.trim() || !!addDateError || loading}
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
