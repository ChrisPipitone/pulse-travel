'use client'

import { Suspense, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useSignIn } from '@pulse/hooks'
import { supabase } from '@/lib/supabase'
import { Input } from '@pulse/ui'
import { Button } from '@pulse/ui'

function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [otp, setOtp] = useState('')
  const [sent, setSent] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [pwLoading, setPwLoading] = useState(false)
  const [pwError, setPwError] = useState<string | null>(null)
  const { sendOtp, verifyOtp, signInWithGoogle, loading, error } = useSignIn()
  const router = useRouter()
  const searchParams = useSearchParams()
  const returnTo = searchParams.get('returnTo') || '/'

  const trimmedEmail = email.trim()
  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)

  async function handlePasswordSignIn(e: React.FormEvent) {
    e.preventDefault()
    setPwLoading(true)
    setPwError(null)
    const { error } = await supabase.auth.signInWithPassword({ email: trimmedEmail, password })
    if (error) { setPwError(error.message); setPwLoading(false); return }
    router.replace(returnTo)
  }

  async function handleSend(e: React.FormEvent) {
    e.preventDefault()
    await sendOtp(trimmedEmail)
    setSent(true)
  }

  async function handleResend() {
    setOtp('')
    await sendOtp(trimmedEmail)
  }

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault()
    const ok = await verifyOtp(trimmedEmail, otp)
    if (ok) router.replace(returnTo)
  }

  function handleChangeEmail() {
    setSent(false)
    setOtp('')
  }

  function handleGoogleSignIn() {
    const callbackUrl = returnTo === '/'
      ? `${window.location.origin}/auth/callback`
      : `${window.location.origin}/auth/callback?returnTo=${encodeURIComponent(returnTo)}`
    signInWithGoogle(callbackUrl)
  }

  if (sent) {
    return (
      <Layout>
        <div className="flex flex-col gap-6">
          <div>
            <h2 className="text-2xl font-semibold text-text-primary">Check your email</h2>
            <p className="text-sm text-text-muted mt-1">
              6-digit code sent to <span className="text-text-primary">{trimmedEmail}</span>
            </p>
            <p className="text-xs text-text-subtle mt-1">
              Local dev? Mailpit → <span className="font-mono">127.0.0.1:54324</span>
            </p>
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

          {error && <p className="text-xs text-red-500">{error}</p>}

          <div className="flex justify-between text-xs text-text-muted">
            <button className="underline hover:text-text-primary transition-colors" onClick={handleChangeEmail}>
              Change email
            </button>
            <button className="underline hover:text-text-primary transition-colors" disabled={loading} onClick={handleResend}>
              {loading ? 'Sending…' : 'Resend code'}
            </button>
          </div>
        </div>
      </Layout>
    )
  }

  if (showPassword) {
    return (
      <Layout>
        <div className="flex flex-col gap-6">
          <div>
            <h2 className="text-2xl font-semibold text-text-primary">Sign in</h2>
            <p className="text-sm text-text-muted mt-1">Sign in with your password.</p>
          </div>

          <form onSubmit={handlePasswordSignIn} className="flex flex-col gap-3">
            <Input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoFocus
            />
            <Input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <Button type="submit" disabled={pwLoading || !emailValid || !password}>
              {pwLoading ? 'Signing in…' : 'Sign in'}
            </Button>
            {pwError && <p className="text-xs text-red-500">{pwError}</p>}
          </form>

          <button
            className="text-xs text-text-subtle underline hover:text-text-muted transition-colors text-left"
            onClick={() => { setShowPassword(false); setPwError(null) }}
          >
            ← Back
          </button>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="flex flex-col gap-6">
        <div>
          <h2 className="text-2xl font-semibold text-text-primary">Welcome to Pulse</h2>
          <p className="text-sm text-text-muted mt-1">New or returning — just enter your email.</p>
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
          <Button type="submit" disabled={loading || !emailValid}>
            {loading ? 'Sending…' : 'Send me a code'}
          </Button>
        </form>

        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-border" />
          <span className="text-xs text-text-subtle">or</span>
          <div className="flex-1 h-px bg-border" />
        </div>

        <Button variant="outline" disabled={loading} onClick={handleGoogleSignIn}>
          Continue with Google
        </Button>

        {error && <p className="text-xs text-red-500">{error}</p>}

        <p className="text-xs text-text-subtle text-center">
          Have a password?{' '}
          <button
            className="underline text-text-muted hover:text-text-primary transition-colors"
            onClick={() => setShowPassword(true)}
          >
            Sign in with password
          </button>
        </p>
      </div>
    </Layout>
  )
}

function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex">
      {/* Left panel — brand (desktop only) */}
      <div className="hidden lg:flex lg:w-1/2 bg-accent flex-col items-center justify-center p-12 gap-3">
        <h1 className="text-5xl font-semibold text-white tracking-tight">Pulse</h1>
        <p className="text-white/70 text-lg text-center max-w-xs">Plan trips everyone will love.</p>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex flex-col items-center justify-center p-8 bg-bg">
        {/* Mobile wordmark */}
        <div className="lg:hidden mb-10 text-center">
          <h1 className="text-3xl font-semibold text-text-primary">Pulse</h1>
          <p className="text-sm text-text-muted mt-1">Plan trips everyone will love.</p>
        </div>
        <div className="w-full max-w-sm">
          {children}
        </div>
      </div>
    </div>
  )
}

export default function LoginPageWrapper() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-bg">
        <p className="text-text-muted text-sm">Loading…</p>
      </div>
    }>
      <LoginPage />
    </Suspense>
  )
}
