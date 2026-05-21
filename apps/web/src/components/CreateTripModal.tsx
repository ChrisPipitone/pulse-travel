'use client'

import { useState, useEffect } from 'react'
import { Button } from '@pulse/ui'
import { Input } from '@pulse/ui'
import type { Member } from '@pulse/types'

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
  // member management — only provided in edit mode
  members?: Member[]
  ownerId?: string
  onRemoveMember?: (userId: string) => void
  removingMemberId?: string | null
  removeError?: string | null
}

export function CreateTripModal({
  open, title = 'New trip', initial, submitLabel = 'Create trip',
  loading, error, onClose, onSubmit,
  members, ownerId, onRemoveMember, removingMemberId, removeError,
}: Props) {
  const [fields, setFields] = useState<Fields>({ name: '', destination: '', start_date: '', end_date: '' })

  useEffect(() => {
    if (open) setFields({
      name: initial?.name ?? '',
      destination: initial?.destination ?? '',
      start_date: initial?.start_date ?? '',
      end_date: initial?.end_date ?? '',
    })
  }, [open]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

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
      <div className="relative w-full max-w-md bg-bg-card rounded-t-[var(--radius-card)] sm:rounded-[var(--radius-card)] p-6 flex flex-col gap-5 shadow-xl max-h-[90dvh] overflow-y-auto">
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
            maxLength={100}
          />
          <Input
            label="Destination"
            placeholder="Rome, Italy"
            value={fields.destination}
            onChange={set('destination')}
            required
            maxLength={100}
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

        {/* Member management — edit mode only */}
        {members && onRemoveMember && (
          <div className="flex flex-col gap-3 border-t border-border pt-5">
            <h3 className="text-sm font-semibold text-text-primary">Members</h3>
            <div className="flex flex-col gap-1">
              {members.map((m) => {
                const isOwner = m.id === ownerId
                const isRemoving = removingMemberId === m.id
                return (
                  <div key={m.id} className="flex items-center gap-3 py-1">
                    <span className="w-7 h-7 rounded-full bg-border flex items-center justify-center text-text-subtle font-medium text-xs shrink-0">
                      {m.name.charAt(0).toUpperCase()}
                    </span>
                    <span className="text-sm text-text-primary flex-1 truncate">{m.name}</span>
                    {isOwner ? (
                      <span className="text-xs text-text-subtle px-1">Owner</span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => onRemoveMember(m.id)}
                        disabled={isRemoving}
                        className="text-xs text-text-muted hover:text-red-500 transition-colors disabled:opacity-40 px-1 py-0.5"
                      >
                        {isRemoving ? 'Removing…' : 'Remove'}
                      </button>
                    )}
                  </div>
                )
              })}
            </div>
            {removeError && <p className="text-xs text-red-500">{removeError}</p>}
          </div>
        )}
      </div>
    </div>
  )
}
