'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useSignOut } from '@pulse/hooks'

type Props = {
  back?: { label: string; href: string }
}

export function AppHeader({ back }: Props) {
  const { signOut, loading } = useSignOut()
  const router = useRouter()

  async function handleSignOut() {
    await signOut()
    router.replace('/login')
  }

  return (
    <div className="flex items-center justify-between">
      {back ? (
        <Link
          href={back.href}
          className="flex items-center gap-1.5 text-sm text-text-muted hover:text-text-primary transition-colors"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M8.5 2.5L3.5 7l5 4.5"/>
          </svg>
          {back.label}
        </Link>
      ) : (
        <span className="text-xl font-semibold text-text-primary">Pulse</span>
      )}
      <button
        onClick={handleSignOut}
        disabled={loading}
        className="text-xs text-text-muted hover:text-text-primary transition-colors disabled:opacity-40"
      >
        {loading ? 'Signing out…' : 'Sign out'}
      </button>
    </div>
  )
}
