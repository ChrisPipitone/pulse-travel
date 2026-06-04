import { useState } from 'react'
import type { TripPreview } from '@pulse/types'
import { useSupabase } from './SupabaseContext'
import { getTripByInviteCode, joinTrip as joinTripService } from '@pulse/services'

type JoinTripState = {
  joinTrip: (inviteCode: string) => Promise<TripPreview | null>
  loading: boolean
  error: string | null
}

export function useJoinTrip(): JoinTripState {
  const client = useSupabase()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function joinTrip(inviteCode: string): Promise<TripPreview | null> {
    setLoading(true)
    setError(null)

    try {
      const trip = await getTripByInviteCode(client, inviteCode)
      if (!trip) {
        setError('Invalid invite link — trip not found.')
        return null
      }

      const { data: { user } } = await client.auth.getUser()
      if (!user) {
        setError('You must be signed in to join a trip.')
        return null
      }

      // Server-side join: the SECURITY DEFINER function verifies the invite
      // code and inserts membership. Idempotent for existing members.
      const joinedTripId = await joinTripService(client, inviteCode)
      if (!joinedTripId) {
        setError('Invalid invite link — trip not found.')
        return null
      }

      return trip
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to join trip')
      return null
    } finally {
      setLoading(false)
    }
  }

  return { joinTrip, loading, error }
}
