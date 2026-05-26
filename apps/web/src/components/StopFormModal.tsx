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
  useModalEscape(onClose)

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
      <div ref={modalRef} className="modal-panel relative bg-bg-card rounded-t-[var(--radius-card)] sm:rounded-[var(--radius-card)] border border-border w-full sm:max-w-sm p-6 flex flex-col gap-5 shadow-lg">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-text-primary">{title}</h2>
          <button onClick={onClose} aria-label="Close" className="shrink-0 p-1.5 rounded text-text-muted hover:text-text-primary hover:bg-bg transition-colors">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
              <path d="M3 3l10 10M13 3L3 13" />
            </svg>
          </button>
        </div>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input label="Stop name *" id="stop-name" placeholder="Rome" required autoFocus maxLength={100} value={fields.name} onChange={(e) => setFields((p) => ({ ...p, name: e.target.value }))} />
          <div className="flex gap-3">
            <div className="flex-1 flex flex-col gap-1.5">
              <label className="text-xs font-medium text-text-muted" htmlFor="stop-from">From</label>
              <input
                id="stop-from"
                type="date"
                value={fields.date_from}
                onChange={(e) => setFields((p) => ({ ...p, date_from: e.target.value }))}
                className="w-full text-sm bg-bg border border-border rounded-lg px-3 py-2 text-text-primary outline-none focus:border-accent/50"
              />
            </div>
            <div className="flex-1 flex flex-col gap-1.5">
              <label className="text-xs font-medium text-text-muted" htmlFor="stop-to">To</label>
              <input
                id="stop-to"
                type="date"
                value={fields.date_to}
                min={fields.date_from || undefined}
                onChange={(e) => setFields((p) => ({ ...p, date_to: e.target.value }))}
                className="w-full text-sm bg-bg border border-border rounded-lg px-3 py-2 text-text-primary outline-none focus:border-accent/50"
              />
            </div>
          </div>
          {dateError && <p className="text-xs text-red-500 -mt-2">{dateError}</p>}
          {!dateError && <p className="text-xs text-text-subtle -mt-2">Dates optional</p>}
          {error && <p className="text-xs text-red-500">{error}</p>}
          <div className="flex gap-2 pt-1">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1" disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={!canSubmit} className="flex-1">
              {loading ? 'Saving…' : submitLabel}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
