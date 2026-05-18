'use client'

import { useState } from 'react'
import { useSignIn } from '@pulse/hooks'
import { Input } from '@pulse/ui'
import { Button } from '@pulse/ui'
import { Card } from '@pulse/ui'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const { signInWithMagicLink, loading, error } = useSignIn()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const redirectTo = `${window.location.origin}/auth/callback`
    await signInWithMagicLink(email, redirectTo)
    setSent(true)
  }

  if (sent && !error) {
    return (
      <main className="min-h-screen bg-bg flex items-center justify-center p-8">
        <div className="text-center flex flex-col gap-3">
          <h1 className="text-2xl font-semibold text-text-primary">Check your inbox</h1>
          <p className="text-text-muted text-sm">Magic link sent to <span className="text-text-primary">{email}</span></p>
          <p className="text-text-subtle text-xs mt-2">Local dev? Check Mailpit at <span className="font-mono">127.0.0.1:54324</span></p>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-bg flex items-center justify-center p-8">
      <div className="w-full max-w-sm flex flex-col gap-8">
        <div className="text-center">
          <h1 className="text-4xl font-semibold text-text-primary">Pulse</h1>
          <p className="mt-2 text-text-muted text-sm">Group vacation planner</p>
        </div>

        <Card className="flex flex-col gap-4">
          <div>
            <h2 className="text-base font-medium text-text-primary">Sign in</h2>
            <p className="text-sm text-text-muted mt-0.5">We'll send a magic link — no password needed.</p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <Input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoFocus
            />
            <Button type="submit" variant="primary" disabled={loading}>
              {loading ? 'Sending…' : 'Send magic link'}
            </Button>
          </form>

          {error && (
            <p className="text-xs text-red-500 text-center">{error}</p>
          )}
        </Card>
      </div>
    </main>
  )
}
