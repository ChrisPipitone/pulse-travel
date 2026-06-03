'use client'

import { useState, useEffect, useRef } from 'react'
import { Button, Input } from '@pulse/ui'
import { useFocusTrap } from '@/hooks/useFocusTrap'
import { useModalEscape } from '@/hooks/useModalEscape'
import type { Stop } from '@pulse/types'

type Fields = {
  name: string
  location: string
  description: string
  url: string
  stop_id: string | null
}

type Props = {
  open: boolean
  title: string
  initial?: Partial<Fields>
  stops?: Stop[]
  loading?: boolean
  error?: string | null
  submitLabel?: string
  onClose: () => void
  onSubmit: (fields: Fields) => Promise<void>
}

export function ActivityFormModal({ open, title, initial, stops = [], loading, error, submitLabel = 'Save', onClose, onSubmit }: Props) {
  const [fields, setFields] = useState<Fields>({ name: '', location: '', description: '', url: '', stop_id: null })
  const modalRef = useRef<HTMLDivElement>(null)
  useFocusTrap(modalRef, !!open)

  useEffect(() => {
    if (open) {
      setFields({
        name: initial?.name ?? '',
        location: initial?.location ?? '',
        description: initial?.description ?? '',
        url: initial?.url ?? '',
        stop_id: initial?.stop_id ?? null,
      })
    }
  }, [open]) // eslint-disable-line react-hooks/exhaustive-deps

  useModalEscape(onClose, open)

  if (!open) return null

  function set(field: keyof Pick<Fields, 'name' | 'location' | 'description' | 'url'>) {
    return (e: React.ChangeEvent<HTMLInputElement>) =>
      setFields((prev) => ({ ...prev, [field]: e.target.value }))
  }

  const urlError =
    fields.url.trim() && !/^https?:\/\/.+/.test(fields.url.trim())
      ? 'Must start with https:// or http://'
      : null

  const canSubmit = !!fields.name.trim() && !urlError && !loading

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!canSubmit) return
    await onSubmit({
      name: fields.name.trim(),
      location: fields.location.trim(),
      description: fields.description.trim(),
      url: fields.url.trim(),
      stop_id: fields.stop_id,
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="modal-overlay absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div ref={modalRef} className="modal-panel relative bg-bg-card rounded-t-[var(--radius-card)] sm:rounded-[var(--radius-card)] border border-border w-full sm:max-w-md p-6 flex flex-col gap-5 shadow-lg max-h-[90dvh] overflow-y-auto">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-text-primary">{title}</h2>
          <button onClick={onClose} aria-label="Close" className="shrink-0 p-2.5 rounded text-text-muted hover:text-text-primary hover:bg-bg transition-colors">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
              <path d="M3 3l10 10M13 3L3 13"/>
            </svg>
          </button>
        </div>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input label="Activity *" id="act-name" placeholder="Colosseum Tour" required autoFocus maxLength={100} value={fields.name} onChange={set('name')} />
          <Input label="Location" id="act-location" placeholder="Rome" maxLength={100} value={fields.location} onChange={set('location')} />
          {stops.length > 0 && (
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-text-muted" htmlFor="act-stop">
                Stop
              </label>
              <select
                id="act-stop"
                value={fields.stop_id ?? ''}
                onChange={(e) => setFields((prev) => ({ ...prev, stop_id: e.target.value || null }))}
                className="w-full text-sm bg-bg border border-border rounded-lg px-3 py-2 text-text-primary outline-none focus:border-accent/50 appearance-none"
              >
                <option value="">No stop</option>
                {stops.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>
          )}
          <Input label="Description" id="act-description" placeholder="Optional details" maxLength={500} value={fields.description} onChange={set('description')} />
          <div className="flex flex-col gap-1.5">
            <Input label="URL" id="act-url" type="url" placeholder="https://…" maxLength={2000} value={fields.url} onChange={set('url')} />
            {urlError && <p className="text-xs text-red-500">{urlError}</p>}
          </div>
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
