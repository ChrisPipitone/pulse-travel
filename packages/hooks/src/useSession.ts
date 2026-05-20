import { useState, useEffect } from 'react'
import type { User, Session } from '@supabase/supabase-js'
import { useSupabase } from './SupabaseContext'

type SessionState = {
  user: User | null
  session: Session | null
  loading: boolean
}

export function useSession(): SessionState {
  const client = useSupabase()

  // loading: true prevents a flash of "logged out" state before the async
  // session check resolves on mount.
  const [state, setState] = useState<SessionState>({ user: null, session: null, loading: true })

  useEffect(() => {
    // getSession() handles the current session on mount. onAuthStateChange
    // fires on CHANGES only — it does not fire for an already-active session,
    // so both are needed.
    client.auth.getSession().then(({ data: { session } }) => {
      setState({ user: session?.user ?? null, session, loading: false })
    })

    const { data: { subscription } } = client.auth.onAuthStateChange((event, session) => {
      // TOKEN_REFRESH_FAILED means the stored refresh token is invalid (e.g.
      // revoked, or left over from a different auth method). Treat as signed out.
      if (event === 'TOKEN_REFRESHED' || event === 'SIGNED_IN' || event === 'SIGNED_OUT' || event === 'USER_UPDATED') {
        setState({ user: session?.user ?? null, session, loading: false })
      } else if ((event as string) === 'TOKEN_REFRESH_FAILED') {
        setState({ user: null, session: null, loading: false })
      }
    })

    // Without this cleanup the callback fires on unmount and tries to setState
    // on an unmounted component — memory leak + React warning.
    return () => subscription.unsubscribe()
  }, [client])

  return state
}
