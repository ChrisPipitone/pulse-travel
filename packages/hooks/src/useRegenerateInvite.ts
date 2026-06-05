import { useState } from 'react'
import type { Trip } from '@pulse/types'
import { useSupabase } from './SupabaseContext'
import { useTripStore } from '@pulse/store'
import { regenerateInviteCode } from '@pulse/services'

type RegenerateInviteState = {
  regenerate: () => Promise<boolean>
  loading: boolean
  error: string | null
}

export function useRegenerateInvite(): RegenerateInviteState {
  const client = useSupabase()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const trip = useTripStore((s) => s.trip)
  const setTrip = useTripStore((s) => s.setTrip)

  async function regenerate(): Promise<boolean> {
    if (!trip) return false
    setError(null)
    setLoading(true)
    try {
      const { code, expiresAt } = await regenerateInviteCode(client, trip.id)
      setTrip({ ...trip, invite_code: code, invite_code_expires_at: expiresAt } as Trip)
      return true
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to regenerate invite link')
      return false
    } finally {
      setLoading(false)
    }
  }

  return { regenerate, loading, error }
}
