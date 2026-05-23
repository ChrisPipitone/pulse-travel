'use client'

import { useRef, useState } from 'react'
import { Button } from '@pulse/ui'

type Props = {
  onPlanTrip: () => void
  onJoinTrip: (code: string) => void
}

type View = 'choice' | 'joining'

export function WelcomeScreen({ onPlanTrip, onJoinTrip }: Props) {
  const [view, setView] = useState<View>('choice')
  const [code, setCode] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  function handleJoinSubmit(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = code.trim()
    if (trimmed) onJoinTrip(trimmed)
  }

  function showJoin() {
    setView('joining')
    setTimeout(() => inputRef.current?.focus(), 50)
  }

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-6 py-20 min-h-[70vh]">
      {view === 'choice' && (
        <div className="w-full max-w-2xl flex flex-col items-center gap-10">
          <div className="text-center">
            <h1 className="text-3xl font-semibold text-text-primary">What brings you here?</h1>
            <p className="text-text-muted mt-2 text-base">Get started in seconds.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
            {/* Plan a trip */}
            <button
              onClick={onPlanTrip}
              className="group flex flex-col items-center text-center gap-4 bg-bg-card border-2 border-border hover:border-accent/60 hover:shadow-md rounded-[var(--radius-card)] px-8 py-10 transition-all duration-150 hover:-translate-y-0.5"
            >
              <div className="w-14 h-14 rounded-full bg-accent/10 group-hover:bg-accent/20 transition-colors flex items-center justify-center">
                <svg className="w-7 h-7 text-accent" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="2" y1="12" x2="22" y2="12" />
                  <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                </svg>
              </div>
              <div>
                <p className="text-base font-semibold text-text-primary">Plan a trip</p>
                <p className="text-sm text-text-muted mt-1 max-w-[200px]">
                  Create a trip and invite your group to rate activities together.
                </p>
              </div>
              <span className="text-xs font-medium text-accent group-hover:underline mt-auto">
                Create a trip →
              </span>
            </button>

            {/* Join a trip */}
            <button
              onClick={showJoin}
              className="group flex flex-col items-center text-center gap-4 bg-bg-card border-2 border-border hover:border-accent/60 hover:shadow-md rounded-[var(--radius-card)] px-8 py-10 transition-all duration-150 hover:-translate-y-0.5"
            >
              <div className="w-14 h-14 rounded-full bg-accent/10 group-hover:bg-accent/20 transition-colors flex items-center justify-center">
                <svg className="w-7 h-7 text-accent" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
              </div>
              <div>
                <p className="text-base font-semibold text-text-primary">Join a trip</p>
                <p className="text-sm text-text-muted mt-1 max-w-[200px]">
                  Have an invite link or code from someone? Jump right in.
                </p>
              </div>
              <span className="text-xs font-medium text-accent group-hover:underline mt-auto">
                Enter code →
              </span>
            </button>
          </div>
        </div>
      )}

      {view === 'joining' && (
        <div className="w-full max-w-sm flex flex-col gap-6">
          <div className="text-center">
            <h1 className="text-2xl font-semibold text-text-primary">Join a trip</h1>
            <p className="text-sm text-text-muted mt-1">
              Paste your invite link or enter the code from the trip owner.
            </p>
          </div>

          <form onSubmit={handleJoinSubmit} className="flex flex-col gap-3">
            <input
              ref={inputRef}
              type="text"
              placeholder="Invite code or link"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              maxLength={200}
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck={false}
              className="w-full bg-bg-card border border-border rounded-[var(--radius-card)] px-3 py-2.5 text-sm text-text-primary placeholder:text-text-subtle focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50 focus-visible:border-accent transition-colors"
            />
            <Button type="submit" disabled={!code.trim()} className="w-full">
              Join trip
            </Button>
          </form>

          <button
            onClick={() => { setView('choice'); setCode('') }}
            className="text-xs text-text-subtle hover:text-text-muted transition-colors text-center"
          >
            ← Back
          </button>
        </div>
      )}
    </div>
  )
}
