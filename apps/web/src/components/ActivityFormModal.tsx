'use client'

import { useState, useEffect } from 'react'
import { Button, Input } from '@pulse/ui'

type Fields = {
  name: string
  location: string
  description: string
  url: string
}

type Props = {
  open: boolean
  title: string
  initial?: Partial<Fields>
  loading?: boolean
  error?: string | null
  submitLabel?: string
  onClose: () => void
  onSubmit: (fields: Fields) => Promise<void>
}

export function ActivityFormModal({ open, title, initial, loading, error, submitLabel = 'Save', onClose, onSubmit }: Props) {
  const [fields, setFields] = useState<Fields>({ name: '', location: '', description: '', url: '' })

  useEffect(() => {
    if (open) {
      setFields({
        name: initial?.name ?? '',
        location: initial?.location ?? '',
        description: initial?.description ?? '',
        url: initial?.url ?? '',
      })
    }
  }, [open]) // eslint-disable-line react-hooks/exhaustive-deps

  if (!open) return null

  function set(field: keyof Fields) {
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
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-bg-card rounded-t-2xl sm:rounded-2xl border border-border w-full sm:max-w-md p-6 flex flex-col gap-5 shadow-lg">
        <h2 className="text-base font-semibold text-text-primary">{title}</h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input label="Activity *" id="act-name" placeholder="Colosseum Tour" required maxLength={100} value={fields.name} onChange={set('name')} />
          <Input label="Location" id="act-location" placeholder="Rome" maxLength={100} value={fields.location} onChange={set('location')} />
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
