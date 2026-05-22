'use client'

import { useState, useEffect, useRef } from 'react'
import { Button, Input } from '@pulse/ui'
import { useFocusTrap } from '@/hooks/useFocusTrap'

type Props = {
  open: boolean
  tripStart: string | null
  tripEnd: string | null
  initialArrival: string | null
  initialDeparture: string | null
  loading: boolean
  error: string | null
  onClose: () => void
  onSubmit: (arrival: string | null, departure: string | null) => void
}

export function MemberDatesModal({
  open, tripStart, tripEnd, initialArrival, initialDeparture,
  loading, error, onClose, onSubmit,
}: Props) {
  const [arrival, setArrival] = useState(initialArrival ?? '')
  const [departure, setDeparture] = useState(initialDeparture ?? '')
  const modalRef = useRef<HTMLDivElement>(null)
  useFocusTrap(modalRef, open)

  useEffect(() => {
    if (open) {
      setArrival(initialArrival ?? '')
      setDeparture(initialDeparture ?? '')
    }
  }, [open, initialArrival, initialDeparture])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null

  const dateError =
    arrival && departure && departure < arrival
      ? 'Departure must be on or after arrival'
      : null

  const canSubmit = !dateError && !loading

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!canSubmit) return
    onSubmit(arrival || null, departure || null)
  }

  function handleClear() {
    onSubmit(null, null)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div ref={modalRef} className="relative w-full max-w-md bg-bg-card rounded-t-[var(--radius-card)] sm:rounded-[var(--radius-card)] p-6 flex flex-col gap-5 shadow-xl">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-text-primary">My trip dates</h2>
          <button onClick={onClose} aria-label="Close" className="text-text-muted hover:text-text-primary transition-colors text-xl leading-none">×</button>
        </div>

        {tripStart && tripEnd && (
          <p className="text-xs text-text-muted -mt-2">
            Trip runs {fmt(tripStart)} – {fmt(tripEnd)}. Leave blank if you're attending the full trip.
          </p>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Arrival"
                type="date"
                value={arrival}
                min={tripStart ?? undefined}
                max={tripEnd ?? undefined}
                onChange={(e) => setArrival(e.target.value)}
                autoFocus
              />
              <Input
                label="Departure"
                type="date"
                value={departure}
                min={arrival || tripStart || undefined}
                max={tripEnd ?? undefined}
                onChange={(e) => setDeparture(e.target.value)}
              />
            </div>
            {dateError && <p className="text-xs text-red-500">{dateError}</p>}
          </div>

          {error && <p className="text-xs text-red-500">{error}</p>}

          <div className="flex gap-2 pt-1">
            <Button type="button" variant="outline" onClick={handleClear} disabled={loading} className="text-text-muted">
              Clear
            </Button>
            <Button type="button" variant="outline" className="flex-1" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" className="flex-1" disabled={!canSubmit}>
              {loading ? 'Saving…' : 'Save'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

function fmt(d: string) {
  return new Date(d + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}
