'use client'

import { useState, useEffect } from 'react'
import { Button } from '@pulse/ui'
import { Input } from '@pulse/ui'

type Fields = {
  name: string
  destination: string
  start_date: string
  end_date: string
}

type Props = {
  open: boolean
  title?: string
  initial?: Partial<Fields>
  submitLabel?: string
  loading: boolean
  error: string | null
  onClose: () => void
  onSubmit: (fields: Fields) => void
}

export function CreateTripModal({ open, title = 'New trip', initial, submitLabel = 'Create trip', loading, error, onClose, onSubmit }: Props) {
  const [fields, setFields] = useState<Fields>({ name: '', destination: '', start_date: '', end_date: '' })

  useEffect(() => {
    if (open) setFields({
      name: initial?.name ?? '',
      destination: initial?.destination ?? '',
      start_date: initial?.start_date ?? '',
      end_date: initial?.end_date ?? '',
    })
  }, [open]) // eslint-disable-line react-hooks/exhaustive-deps

  if (!open) return null

  function set(key: keyof Fields) {
    return (e: React.ChangeEvent<HTMLInputElement>) =>
      setFields((f) => ({ ...f, [key]: e.target.value }))
  }

  const dateError =
    fields.start_date && fields.end_date && fields.end_date < fields.start_date
      ? 'End date must be after start date'
      : null

  const canSubmit =
    !!fields.name.trim() &&
    !!fields.destination.trim() &&
    !dateError &&
    !loading

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!canSubmit) return
    onSubmit({ ...fields, name: fields.name.trim(), destination: fields.destination.trim() })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative w-full max-w-md bg-bg-card rounded-t-[var(--radius-card)] sm:rounded-[var(--radius-card)] p-6 flex flex-col gap-5 shadow-xl">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-text-primary">{title}</h2>
          <button onClick={onClose} className="text-text-muted hover:text-text-primary transition-colors text-xl leading-none">×</button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input
            label="Trip name"
            placeholder="Italy 2025"
            value={fields.name}
            onChange={set('name')}
            required
            autoFocus
          />
          <Input
            label="Destination"
            placeholder="Rome, Italy"
            value={fields.destination}
            onChange={set('destination')}
            required
          />
          <div className="flex flex-col gap-1.5">
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Start date"
                type="date"
                value={fields.start_date}
                onChange={set('start_date')}
              />
              <Input
                label="End date"
                type="date"
                value={fields.end_date}
                min={fields.start_date || undefined}
                onChange={set('end_date')}
              />
            </div>
            {dateError && <p className="text-xs text-red-500">{dateError}</p>}
          </div>

          {error && <p className="text-xs text-red-500">{error}</p>}

          <div className="flex gap-2 pt-1">
            <Button type="button" variant="outline" className="flex-1" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" className="flex-1" disabled={!canSubmit}>
              {loading ? 'Saving…' : submitLabel}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
