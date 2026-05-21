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
    <header className="sticky top-0 z-40 bg-bg/90 backdrop-blur-md border-b border-border">
      <div className="max-w-screen-xl mx-auto px-6 h-14 flex items-center justify-between">
        {isOnTripPage ? (
          <Link
            href="/"
            className="flex items-center gap-1.5 text-sm font-medium text-text-muted hover:text-text-primary transition-colors"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
              <path d="M8.5 2.5L3.5 7l5 4.5"/>
            </svg>
            Trips
          </Link>
        ) : (
          <span className="text-lg font-semibold text-text-primary tracking-tight">Pulse</span>
        )}

        {session && (
          <button
            onClick={handleSignOut}
            disabled={loading}
            className="text-xs text-text-muted hover:text-text-primary transition-colors disabled:opacity-40"
          >
            {loading ? 'Signing out…' : 'Sign out'}
          </button>
        )}
      </div>
    </header>
  )
}
