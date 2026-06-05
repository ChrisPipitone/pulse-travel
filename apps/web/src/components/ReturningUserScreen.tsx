'use client'

import { useRef, useState } from 'react'
import { Button } from '@pulse/ui'

type Props = {
  name: string
  onPlanTrip: () => void
  onJoinTrip: (code: string) => void
}

export function ReturningUserScreen({ name, onPlanTrip, onJoinTrip }: Props) {
  const [showJoin, setShowJoin] = useState(false)
  const [code, setCode] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  function handleShowJoin() {
    setShowJoin(true)
    setTimeout(() => inputRef.current?.focus(), 50)
  }

  function handleJoinSubmit(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = code.trim()
    if (trimmed) onJoinTrip(trimmed)
  }

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-6 py-20 min-h-[calc(100vh-4rem)]">
      <div className="w-full max-w-sm flex flex-col items-center text-center gap-8">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold text-text-primary tracking-tight">
            Welcome back{name ? `, ${name}` : ''}.
          </h1>
          <p className="text-text-muted text-base">
            No active trips right now. Ready when you are.
          </p>
        </div>

        <div className="w-full flex flex-col gap-3">
          <Button onClick={onPlanTrip} className="w-full">
            Start a new trip
          </Button>

          {!showJoin ? (
            <Button variant="outline" onClick={handleShowJoin} className="w-full">
              Join a friend&apos;s trip
            </Button>
          ) : (
            <form onSubmit={handleJoinSubmit} className="flex gap-2 w-full">
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
      </div>
    </div>
  )
}
