'use client'

import { useState } from 'react'
import { useSession, useOnboarding } from '@pulse/hooks'
import { Button } from '@pulse/ui'
import { Input } from '@pulse/ui'

export function SetDisplayNameModal() {
  const { session } = useSession()
  const { needsOnboarding, submit, loading, error } = useOnboarding()
  const [name, setName] = useState(() => {
    const meta = session?.user.user_metadata ?? {}
    const emailPrefix = session?.user.email?.split('@')[0] ?? ''
    return (meta.name as string | undefined) ?? emailPrefix
  })
  const [done, setDone] = useState(false)

  if (done || !session || !needsOnboarding(session)) return null

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim() || !session) return
    try {
      await submit(session.user.id, name)
      setDone(true)
    } catch {
      // error shown via hook
    }
  }

  function handleSkip() {
    // Mark onboarded without changing the name. Fire-and-forget.
    submit(session!.user.id, name).catch(() => {})
    setDone(true)
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.45)' }}
    >
      <div className="bg-bg-card rounded-[var(--radius-card)] border border-border w-full max-w-sm shadow-xl flex flex-col items-center gap-5 px-8 py-8">
        <div className="w-14 h-14 rounded-full bg-accent/10 flex items-center justify-center">
          <svg className="w-7 h-7 text-accent" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
        </div>

        <div className="text-center">
          <h2 className="text-xl font-semibold text-text-primary">What should we call you?</h2>
          <p className="text-sm text-text-muted mt-1">
            This is how you'll appear to your trip group.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="w-full flex flex-col gap-3">
          <Input
            type="text"
            placeholder="Your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={50}
            autoFocus
            required
          />
          {error && <p className="text-xs text-red-500">{error}</p>}
          <Button type="submit" disabled={loading || !name.trim()} className="w-full">
            {loading ? 'Saving…' : 'Save name'}
          </Button>
        </form>

        <button
          onClick={handleSkip}
          className="text-xs text-text-subtle hover:text-text-muted transition-colors"
        >
          Skip for now
        </button>
      </div>
    </div>
  )
}
