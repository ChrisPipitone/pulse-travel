'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSignIn } from '@pulse/hooks'
import { supabase } from '@/lib/supabase'
import { Input } from '@pulse/ui'
import { Button } from '@pulse/ui'
import { Card } from '@pulse/ui'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [otp, setOtp] = useState('')
  const [sent, setSent] = useState(false)
  const [pwLoading, setPwLoading] = useState(false)
  const [pwError, setPwError] = useState<string | null>(null)
  const { sendOtp, verifyOtp, signInWithGoogle, loading, error } = useSignIn()
  const router = useRouter()

  const trimmedEmail = email.trim()
  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)

  async function handlePasswordSignIn(e: React.FormEvent) {
    e.preventDefault()
    setPwLoading(true)
    setPwError(null)
    const { error } = await supabase.auth.signInWithPassword({ email: trimmedEmail, password })
    if (error) { setPwError(error.message); setPwLoading(false); return }
    router.replace('/')
  }

  async function handleSend(e: React.FormEvent) {
    e.preventDefault()
    await sendOtp(trimmedEmail)
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
    signInWithGoogle(`${window.location.origin}/auth/callback`)
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
              <Button type="submit" disabled={loading || otp.length < 6}>
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

        <Card className="flex flex-col gap-5">
          <div>
            <h2 className="text-base font-medium text-text-primary">Sign in</h2>
          </div>

          {/* Email + password */}
          <form onSubmit={handlePasswordSignIn} className="flex flex-col gap-3">
            <Input
              type="email"
              label="Email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoFocus
            />
            <Input
              type="password"
              label="Password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <Button type="submit" disabled={pwLoading || loading || !emailValid || !password}>
              {pwLoading ? 'Signing in…' : 'Sign in'}
            </Button>
            {pwError && <p className="text-xs text-red-500">{pwError}</p>}
          </form>

          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-border" />
            <span className="text-xs text-text-subtle">or</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          {/* OTP */}
          <form onSubmit={handleSend} className="flex flex-col gap-2">
            <Button type="submit" variant="outline" disabled={loading || !emailValid}>
              {loading ? 'Sending…' : 'Send email code'}
            </Button>
          </form>

          <Button variant="outline" disabled={pwLoading || loading} onClick={handleGoogleSignIn}>
            Continue with Google
          </Button>

          {error && <p className="text-xs text-red-500 text-center">{error}</p>}
        </Card>
      </div>
    </main>
  )
}
