'use client'

import { useState } from 'react'
import { useModalEscape } from '@/hooks/useModalEscape'
import { Button } from '@pulse/ui'
import { Input } from '@pulse/ui'
import { sendInviteEmail, isEmailTripMember } from '@pulse/services'
import { useRegenerateInvite } from '@pulse/hooks'
import { fmtExpiry } from '@/lib/date'
import { supabase } from '@/lib/supabase'

type Props = {
  tripName: string
  tripId: string
  inviteCode: string
  expiresAt: string
  isOwner: boolean
  onClose: () => void
}

type State = 'idle' | 'checking' | 'already_member' | 'sending' | 'sent' | 'error'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function InviteMemberModal({ tripName, tripId, inviteCode, expiresAt, isOwner, onClose }: Props) {
  const [email, setEmail] = useState('')
  const [touched, setTouched] = useState(false)
  const [state, setState] = useState<State>('idle')
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [copyState, setCopyState] = useState<'idle' | 'copied' | 'error'>('idle')
  const [confirmingRegen, setConfirmingRegen] = useState(false)
  const { regenerate, loading: regenerating, error: regenError } = useRegenerateInvite()

  const expired = new Date(expiresAt).getTime() <= Date.now()

  async function handleRegenerate() {
    const ok = await regenerate()
    if (ok) setConfirmingRegen(false)
  }

  const trimmed = email.trim()
  const emailValid = EMAIL_RE.test(trimmed)
  const showEmailError = touched && !emailValid && trimmed.length > 0

  const inviteUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/join?code=${inviteCode}`
    : ''
  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(`Join ${tripName} on Pulse — rate activities and find your crew: ${inviteUrl}`)}`

  useModalEscape(onClose)

  async function handleCopyLink() {
    try {
      await navigator.clipboard.writeText(inviteUrl)
      setCopyState('copied')
      setTimeout(() => setCopyState('idle'), 2000)
    } catch {
      setCopyState('error')
      setTimeout(() => setCopyState('idle'), 2000)
    }
  }

  async function handleSend(e: React.FormEvent) {
    e.preventDefault()
    setTouched(true)
    if (!emailValid) return

    setState('checking')
    setErrorMsg(null)

    const alreadyIn = await isEmailTripMember(supabase, tripId, trimmed)
    if (alreadyIn) {
      setState('already_member')
      return
    }

    setState('sending')
    try {
      const callbackUrl = `${window.location.origin}/auth/callback?returnTo=${encodeURIComponent(`/join?code=${inviteCode}`)}`
      await sendInviteEmail(supabase, trimmed, callbackUrl)
      setState('sent')
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Failed to send invite')
      setState('error')
    }
  }

  function reset() {
    setEmail('')
    setTouched(false)
    setState('idle')
    setErrorMsg(null)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="modal-overlay absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="modal-panel relative bg-bg-card rounded-t-[var(--radius-card)] sm:rounded-[var(--radius-card)] border border-border w-full sm:max-w-md shadow-xl flex flex-col items-center gap-5 px-8 py-8">

        {/* Icon */}
        <div className="w-14 h-14 rounded-full bg-accent/10 flex items-center justify-center">
          <svg className="w-7 h-7 text-accent" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <line x1="19" y1="8" x2="19" y2="14" />
            <line x1="22" y1="11" x2="16" y2="11" />
          </svg>
        </div>

        {/* ── Sent ── */}
        {state === 'sent' && (
          <>
            <div className="text-center">
              <h2 className="text-xl font-semibold text-text-primary">Invite sent!</h2>
              <p className="text-sm text-text-muted mt-1">
                Email sent to <span className="text-text-primary">{trimmed}</span>.
                They’ll get a 6-digit code to sign in and join <span className="text-text-primary font-medium">{tripName}</span>.
              </p>
            </div>
            <div className="w-full flex flex-col gap-2">
              <Button variant="outline" className="w-full" onClick={reset}>
                Invite another
              </Button>
              <button onClick={onClose} className="text-sm text-text-muted hover:text-text-primary transition-colors py-1">
                Done
              </button>
            </div>
          </>
        )}

        {/* ── Already a member ── */}
        {state === 'already_member' && (
          <>
            <div className="text-center">
              <h2 className="text-xl font-semibold text-text-primary">Already in the trip</h2>
              <p className="text-sm text-text-muted mt-1">
                <span className="text-text-primary">{trimmed}</span> is already a member of{' '}
                <span className="text-text-primary font-medium">{tripName}</span>.
              </p>
            </div>
            <div className="w-full flex flex-col gap-2">
              <Button variant="outline" className="w-full" onClick={reset}>
                Invite someone else
              </Button>
              <button onClick={onClose} className="text-sm text-text-muted hover:text-text-primary transition-colors py-1">
                Done
              </button>
            </div>
          </>
        )}

        {/* ── Default / checking / sending / error ── */}
        {(state === 'idle' || state === 'checking' || state === 'sending' || state === 'error') && (
          <>
            <div className="text-center">
              <h2 className="text-xl font-semibold text-text-primary">Invite to {tripName}</h2>
              <p className="text-sm text-text-muted mt-1">Share the link or send an email.</p>
            </div>

            {/* Primary: copy link */}
            <Button
              className="w-full"
              onClick={handleCopyLink}
              disabled={copyState !== 'idle'}
            >
              {copyState === 'copied' ? (
                <>
                  <svg className="w-4 h-4 mr-2 inline-block text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  Link copied!
                </>
              ) : copyState === 'error' ? (
                'Copy failed — try manually'
              ) : (
                <>
                  <svg className="w-4 h-4 mr-2 inline-block" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                  </svg>
                  Copy invite link
                </>
              )}
            </Button>

            {/* Expiry status + owner regenerate */}
            <div className="w-full flex items-center justify-between gap-2 -mt-2">
              <span className={`text-xs ${expired ? 'text-red-500' : 'text-text-subtle'}`}>
                {expired ? 'This link has expired' : fmtExpiry(expiresAt)}
              </span>
              {isOwner && (
                confirmingRegen ? (
                  <span className="flex items-center gap-2 text-xs">
                    <span className="text-text-muted">Disable old link?</span>
                    <button
                      onClick={handleRegenerate}
                      disabled={regenerating}
                      className="font-medium text-accent hover:underline disabled:opacity-50"
                    >
                      {regenerating ? 'Working…' : 'Confirm'}
                    </button>
                    <button
                      onClick={() => setConfirmingRegen(false)}
                      disabled={regenerating}
                      className="text-text-subtle hover:text-text-muted"
                    >
                      Cancel
                    </button>
                  </span>
                ) : (
                  <button
                    onClick={() => setConfirmingRegen(true)}
                    className="text-xs font-medium text-accent hover:underline"
                  >
                    {expired ? 'Generate new link' : 'Regenerate'}
                  </button>
                )
              )}
            </div>
            {regenError && (
              <p className="text-xs text-red-500 px-0.5 -mt-3 w-full">{regenError}</p>
            )}

            {/* WhatsApp — mobile only */}
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-2 border border-border rounded-xl py-2.5 px-4 text-sm font-medium text-text-primary hover:bg-bg transition-colors"
            >
              <svg className="w-4 h-4 shrink-0" style={{ color: "#25D366" }} viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                <path d="M12.005 0C5.379 0 0 5.38 0 12.005c0 2.134.557 4.12 1.529 5.842L.057 23.943l6.254-1.638A11.953 11.953 0 0012.005 24C18.625 24 24 18.621 24 12.005 24 5.38 18.625 0 12.005 0zm0 21.818a9.808 9.808 0 01-5.026-1.385l-.36-.214-3.726.977.993-3.634-.235-.374A9.808 9.808 0 012.18 12.005c0-5.42 4.41-9.836 9.825-9.836 5.415 0 9.82 4.416 9.82 9.836 0 5.42-4.405 9.813-9.82 9.813z"/>
              </svg>
              Share via WhatsApp
            </a>

            <div className="flex items-center gap-3 w-full">
              <div className="flex-1 h-px bg-border" />
              <span className="text-xs text-text-subtle">or email a 6-digit code</span>
              <div className="flex-1 h-px bg-border" />
            </div>

            <form onSubmit={handleSend} className="w-full flex flex-col gap-2">
              <Input
                type="email"
                placeholder="friend@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onBlur={() => setTouched(true)}
                autoFocus
                required
              />
              {showEmailError && (
                <p className="text-xs text-red-500 px-0.5">Enter a valid email address.</p>
              )}
              {state === 'error' && errorMsg && (
                <p className="text-xs text-red-500 px-0.5">{errorMsg}</p>
              )}
              <Button
                variant="outline"
                type="submit"
                disabled={state === 'checking' || state === 'sending' || (!emailValid && touched)}
                className="w-full"
              >
                {state === 'checking' ? 'Checking…' : state === 'sending' ? 'Sending…' : 'Send email invite'}
              </Button>
            </form>

            <button
              onClick={onClose}
              className="text-sm text-text-muted hover:text-text-primary transition-colors"
            >
              Cancel
            </button>
          </>
        )}
      </div>
    </div>
  )
}
