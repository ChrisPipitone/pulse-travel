'use client'

import { useEffect, useState } from 'react'
import { Button } from '@pulse/ui'
import { Input } from '@pulse/ui'
import { sendInviteEmail } from '@pulse/services'
import { supabase } from '@/lib/supabase'

type Props = {
  tripName: string
  inviteCode: string
  onClose: () => void
}

export function InviteMemberModal({ tripName, inviteCode, onClose }: Props) {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const trimmedEmail = email.trim()
  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  async function handleSend(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const inviteUrl = `${window.location.origin}/auth/callback?returnTo=${encodeURIComponent(`/join?code=${inviteCode}`)}`
      await sendInviteEmail(supabase, trimmedEmail, inviteUrl)
      setSent(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send invite')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.45)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="bg-bg-card rounded-[var(--radius-card)] border border-border w-full max-w-md shadow-xl flex flex-col items-center gap-5 px-8 py-8">

        {/* Icon */}
        <div className="w-14 h-14 rounded-full bg-accent/10 flex items-center justify-center">
          <svg className="w-7 h-7 text-accent" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <line x1="19" y1="8" x2="19" y2="14" />
            <line x1="22" y1="11" x2="16" y2="11" />
          </svg>
        </div>

        {!sent ? (
          <>
            <div className="text-center">
              <h2 className="text-xl font-semibold text-text-primary">Invite someone</h2>
              <p className="text-sm text-text-muted mt-1">
                They'll get an email with a link to join <span className="text-text-primary font-medium">{tripName}</span>.
              </p>
            </div>

            <form onSubmit={handleSend} className="w-full flex flex-col gap-3">
              <Input
                type="email"
                autoFocus
                placeholder="friend@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              {error && <p className="text-xs text-red-500">{error}</p>}
              <Button type="submit" disabled={loading || !emailValid} className="w-full">
                {loading ? 'Sending…' : 'Send invite'}
              </Button>
            </form>

            <button
              onClick={onClose}
              className="text-sm text-text-muted hover:text-text-primary transition-colors"
            >
              Cancel
            </button>
          </>
        ) : (
          <>
            <div className="text-center">
              <h2 className="text-xl font-semibold text-text-primary">Invite sent!</h2>
              <p className="text-sm text-text-muted mt-1">
                Email sent to <span className="text-text-primary">{trimmedEmail}</span>.
                They'll get a link to join {tripName}.
              </p>
            </div>

            <div className="w-full flex flex-col gap-2">
              <Button
                variant="outline"
                className="w-full"
                onClick={() => { setEmail(''); setSent(false); setError(null) }}
              >
                Invite another
              </Button>
              <button
                onClick={onClose}
                className="text-sm text-text-muted hover:text-text-primary transition-colors py-1"
              >
                Done
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
