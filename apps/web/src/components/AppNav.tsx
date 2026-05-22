'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useSignOut, useSession } from '@pulse/hooks'

export function AppNav() {
  const pathname = usePathname()
  const { session } = useSession()
  const { signOut, loading } = useSignOut()
  const router = useRouter()

  if (!pathname || pathname === '/login' || pathname.startsWith('/auth/')) return null

  const isOnTripPage = pathname.startsWith('/trip/')

  async function handleSignOut() {
    await signOut()
    router.replace('/login')
  }

  return (
    <header className="sticky top-0 z-40 bg-bg-card border-b border-border shadow-sm">
      <div className="max-w-screen-xl mx-auto px-6 h-16 flex items-center justify-between gap-4">

        {/* Left: logo or back */}
        {isOnTripPage ? (
          <Link
            href="/"
            className="flex items-center gap-2 text-sm font-medium text-text-muted hover:text-text-primary transition-colors group"
          >
            <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-border group-hover:bg-border/80 transition-colors">
              <svg width="12" height="12" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M8.5 2.5L3.5 7l5 4.5"/>
              </svg>
            </span>
            Trips
          </Link>
        ) : (
          <Link href="/" className="flex items-center gap-2.5">
            <span className="w-7 h-7 rounded-lg bg-accent flex items-center justify-center shrink-0">
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                <path d="M8 2L10.5 7H14L10.5 10L12 14L8 11L4 14L5.5 10L2 7H5.5L8 2Z" fill="white" fillOpacity="0.9"/>
              </svg>
            </span>
            <span className="text-base font-semibold text-text-primary tracking-tight">Pulse</span>
          </Link>
        )}

        {/* Right: sign out */}
        {session && (
          <button
            onClick={handleSignOut}
            disabled={loading}
            className="text-xs font-medium text-text-muted hover:text-text-primary border border-border hover:border-border/60 rounded-lg px-3 py-1.5 transition-colors disabled:opacity-40"
          >
            {loading ? 'Signing out…' : 'Sign out'}
          </button>
        )}
      </div>
    </header>
  )
}
