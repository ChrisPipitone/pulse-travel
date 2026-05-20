'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSignIn } from '@pulse/hooks'
import { Input } from '@pulse/ui'
import { Button } from '@pulse/ui'
import { Card } from '@pulse/ui'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [sent, setSent] = useState(false)
  const { sendOtp, verifyOtp, signInWithGoogle, loading, error } = useSignIn()
  const router = useRouter()

  async function handleSend(e: React.FormEvent) {
    e.preventDefault()
    await sendOtp(email)
    setSent(true)
  }

  async function handleResend() {
    setOtp('')
    await sendOtp(email)
  }

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault()
    const ok = await verifyOtp(email, otp)
    if (ok) router.replace('/')
  }

  function handleChangeEmail() {
    setSent(false)
    setOtp('')
  }

  function handleGoogleSignIn() {
    const redirectTo = `${window.location.origin}/auth/callback`
    signInWithGoogle(redirectTo)
  }

  if (sent) {
    return (
      <main className="min-h-screen bg-bg flex items-center justify-center p-8">
        <div className="w-full max-w-sm flex flex-col gap-8">
          <div className="text-center">
            <h1 className="text-4xl font-semibold text-text-primary">Pulse</h1>
          </div>

          <Card className="flex flex-col gap-4">
            <div>
              <h2 className="text-base font-medium text-text-primary">Check your email</h2>
              <p className="text-sm text-text-muted mt-0.5">
                6-digit code sent to <span className="text-text-primary">{email}</span>
              </p>
              <p className="text-xs text-text-subtle mt-1">Local dev? Mailpit → <span className="font-mono">127.0.0.1:54324</span></p>
            </div>

            <form onSubmit={handleVerify} className="flex flex-col gap-3">
              <Input
                type="text"
                placeholder="123456"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                maxLength={6}
                inputMode="numeric"
                autoFocus
              />
              <Button type="submit" variant="primary" disabled={loading || otp.length < 6}>
                {loading ? 'Verifying…' : 'Sign in'}
              </Button>
            </form>

            {error && <p className="text-xs text-red-500 text-center">{error}</p>}

            <div className="flex justify-between text-xs text-text-muted">
              <button className="underline" onClick={handleChangeEmail}>Change email</button>
              <button className="underline" disabled={loading} onClick={handleResend}>
                {loading ? 'Sending…' : 'Resend code'}
              </button>
            </div>
          </Card>
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
            <p className="text-sm text-text-muted mt-0.5">Enter your email — we'll send a code.</p>
          </div>

          <form onSubmit={handleSend} className="flex flex-col gap-3">
            <Input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoFocus
            />
            <Button type="submit" variant="primary" disabled={loading}>
              {loading ? 'Sending…' : 'Send code'}
            </Button>
          </form>

          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-border" />
            <span className="text-xs text-text-subtle">or</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          <Button variant="outline" disabled={loading} onClick={handleGoogleSignIn}>
            {loading ? 'Redirecting…' : 'Continue with Google'}
          </Button>

          {error && <p className="text-xs text-red-500 text-center">{error}</p>}
        </Card>
      </div>
    </main>
  )
}
