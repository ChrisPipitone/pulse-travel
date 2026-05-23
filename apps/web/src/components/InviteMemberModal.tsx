'use client'

import { useEffect, useState } from 'react'
import { Button } from '@pulse/ui'
import { Input } from '@pulse/ui'
import { sendInviteEmail, isEmailTripMember } from '@pulse/services'
import { supabase } from '@/lib/supabase'

type Props = {
  tripName: string
  tripId: string
  inviteCode: string
  onClose: () => void
}

type State = 'idle' | 'checking' | 'already_member' | 'sending' | 'sent' | 'error'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function InviteMemberModal({ tripName, tripId, inviteCode, onClose }: Props) {
  const [email, setEmail] = useState('')
  const [touched, setTouched] = useState(false)
  const [state, setState] = useState<State>('idle')
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [canShare, setCanShare] = useState(false)

  const trimmed = email.trim()
  const emailValid = EMAIL_RE.test(trimmed)
  const showEmailError = touched && !emailValid && trimmed.length > 0

  const inviteUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/join?code=${inviteCode}`
    : ''

  useEffect(() => {
    setCanShare(typeof navigator !== 'undefined' && !!navigator.share)
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

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

  function handleShare() {
    navigator.share({
      title: `Join ${tripName} on Pulse`,
      text: `You're invited to plan the trip "${tripName}" on Pulse.`,
      url: inviteUrl,
    }).catch(() => {})
  }

  function reset() {
    setEmail('')
    setTouched(false)
    setState('idle')
    setErrorMsg(null)
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

        {/* ── Sent ── */}
        {state === 'sent' && (
          <>
            <div className="text-center">
              <h2 className="text-xl font-semibold text-text-primary">Invite sent!</h2>
              <p className="text-sm text-text-muted mt-1">
                Email sent to <span className="text-text-primary">{trimmed}</span>.
                They'll get a link to join <span className="text-text-primary font-medium">{tripName}</span>.
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
              <h2 className="text-xl font-semibold text-text-primary">Invite someone</h2>
              <p className="text-sm text-text-muted mt-1">
                They'll get an email with a link to join{' '}
                <span className="text-text-primary font-medium">{tripName}</span>.
              </p>
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
                type="submit"
                disabled={state === 'checking' || state === 'sending' || (!emailValid && touched)}
                className="w-full mt-1"
              >
                {state === 'checking' ? 'Checking…' : state === 'sending' ? 'Sending…' : 'Send invite'}
              </Button>
            </form>

            {canShare && (
              <>
                <div className="flex items-center gap-3 w-full">
                  <div className="flex-1 h-px bg-border" />
                  <span className="text-xs text-text-subtle">or</span>
                  <div className="flex-1 h-px bg-border" />
                </div>
                <Button variant="outline" className="w-full" onClick={handleShare}>
                  <svg className="w-4 h-4 mr-2 inline-block" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="18" cy="5" r="3" />
                    <circle cx="6" cy="12" r="3" />
                    <circle cx="18" cy="19" r="3" />
                    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
                    <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
                  </svg>
                  Share invite link
                </Button>
              </>
            )}

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
