'use client'

import { useState, useEffect, useRef } from 'react'
import { Button, Input } from '@pulse/ui'
import { useFocusTrap } from '@/hooks/useFocusTrap'
import { useModalEscape } from '@/hooks/useModalEscape'

type Fields = { name: string; date_from: string; date_to: string }

type Props = {
  open: boolean
  title: string
  initial?: { name?: string; date_from?: string | null; date_to?: string | null }
  loading?: boolean
  error?: string | null
  submitLabel?: string
  onClose: () => void
  onSubmit: (fields: { name: string; date_from: string | null; date_to: string | null }) => Promise<void>
}

export function StopFormModal({ open, title, initial, loading, error, submitLabel = 'Save', onClose, onSubmit }: Props) {
  const [fields, setFields] = useState<Fields>({ name: '', date_from: '', date_to: '' })
  const modalRef = useRef<HTMLDivElement>(null)
  useFocusTrap(modalRef, open)
  useModalEscape(onClose, open)

  useEffect(() => {
    if (open) {
      setFields({
        name: initial?.name ?? '',
        date_from: initial?.date_from ?? '',
        date_to: initial?.date_to ?? '',
      })
    }
  }, [open]) // eslint-disable-line react-hooks/exhaustive-deps

  if (!open) return null

  const dateError = fields.date_from && fields.date_to && fields.date_from > fields.date_to
    ? 'Start must be before end'
    : null
  const canSubmit = !!fields.name.trim() && !dateError && !loading

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!canSubmit) return
    await onSubmit({
      name: fields.name.trim(),
      date_from: fields.date_from || null,
      date_to: fields.date_to || null,
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="modal-overlay absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div ref={modalRef} className="modal-panel relative w-full max-w-md bg-bg-card rounded-t-[var(--radius-card)] sm:rounded-[var(--radius-card)] p-6 flex flex-col gap-5 shadow-xl max-h-[90dvh] overflow-y-auto">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-text-primary">{title}</h2>
          <button onClick={onClose} aria-label="Close" className="shrink-0 p-1.5 rounded text-text-muted hover:text-text-primary hover:bg-bg transition-colors">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
              <path d="M3 3l10 10M13 3L3 13" />
            </svg>
          </button>
        </div>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input label="Stop name" placeholder="Rome" required autoFocus maxLength={100} value={fields.name} onChange={(e) => setFields((p) => ({ ...p, name: e.target.value }))} />
          <div className="flex flex-col gap-1.5">
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="From"
                type="date"
                value={fields.date_from}
                onChange={(e) => setFields((p) => ({ ...p, date_from: e.target.value }))}
              />
              <Input
                label="To"
                type="date"
                value={fields.date_to}
                min={fields.date_from || undefined}
                onChange={(e) => setFields((p) => ({ ...p, date_to: e.target.value }))}
              />
            </div>
            {dateError
              ? <p className="text-xs text-red-500">{dateError}</p>
              : <p className="text-xs text-text-muted">Dates optional</p>
            }
          </div>
          {error && <p className="text-xs text-red-500">{error}</p>}
          <div className="flex gap-2 pt-1">
            <Button type="button" variant="outline" className="flex-1" onClick={onClose} disabled={loading}>
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
