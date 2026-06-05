'use client'

import { useRef, useState } from 'react'
import { Button } from '@pulse/ui'

const FEATURES = [
  {
    icon: (
      <svg className="w-6 h-6 text-accent" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 12l2 2 4-4" />
        <circle cx="12" cy="12" r="10" />
      </svg>
    ),
    heading: 'Rate MUST / MAYBE / SKIP',
    body: 'Everyone votes on every activity. No group chat required.',
  },
  {
    icon: (
      <svg className="w-6 h-6 text-accent" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
    heading: 'Find Your Crew',
    body: 'See exactly who shares your interests — before anyone buys a ticket.',
  },
  {
    icon: (
      <svg className="w-6 h-6 text-accent" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
      </svg>
    ),
    heading: 'Build the itinerary',
    body: 'Drag real-agreement activities onto a shared timeline. No more maybes in the spreadsheet.',
  },
]

type Props = {
  onCreateTrip: () => void
  onJoinWithCode: (code: string) => void
}

export function LandingPage({ onCreateTrip, onJoinWithCode }: Props) {
  const [code, setCode] = useState('')
  const [showJoin, setShowJoin] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  function handleShowJoin() {
    setShowJoin(true)
    setTimeout(() => inputRef.current?.focus(), 50)
  }

  function handleJoinSubmit(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = code.trim()
    if (trimmed) onJoinWithCode(trimmed)
  }

  return (
    <main className="min-h-[calc(100vh-4rem)] bg-bg flex flex-col">
      {/* Hero */}
      <section className="flex-1 flex flex-col items-center justify-center text-center px-6 py-20 gap-6 max-w-2xl mx-auto w-full">
        <div className="flex flex-col gap-3">
          <h1 className="text-4xl sm:text-5xl font-bold text-text-primary tracking-tight leading-[1.1]">
            Move your trip out of<br className="hidden sm:block" /> the group chat.
          </h1>
          <p className="text-base sm:text-lg text-text-muted max-w-lg mx-auto">
            Your group rates activities. You see who agrees. No spreadsheet required.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full max-w-sm sm:max-w-none sm:justify-center">
          <Button onClick={onCreateTrip} className="px-8 shadow-md">
            Create a trip
          </Button>
          {!showJoin ? (
            <Button variant="outline" onClick={handleShowJoin}>
              I have an invite
            </Button>
          ) : (
            <form onSubmit={handleJoinSubmit} className="flex gap-2">
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
                className="flex-1 min-w-0 bg-bg-card border border-border rounded-[var(--radius-card)] px-3 py-2 text-sm text-text-primary placeholder:text-text-subtle focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50 focus-visible:border-accent transition-colors"
              />
              <Button type="submit" disabled={!code.trim()}>Join</Button>
            </form>
          )}
        </div>
      </section>

      {/* Features */}
      <section className="border-t border-border bg-bg-card/50">
        <div className="max-w-screen-lg mx-auto px-6 py-16 grid grid-cols-1 sm:grid-cols-3 gap-8">
          {FEATURES.map((f, i) => (
            <div key={i} className="flex flex-col gap-3">
              <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center">
                {f.icon}
              </div>
              <div>
                <p className="text-sm font-semibold text-text-primary">{f.heading}</p>
                <p className="text-sm text-text-muted mt-0.5">{f.body}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

    </main>
  )
}
