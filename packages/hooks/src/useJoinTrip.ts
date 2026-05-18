import { useState } from 'react'
import type { Trip } from '@pulse/types'
import { useSupabase } from './SupabaseContext'
import { getTripByInviteCode, joinTrip as joinTripService } from '@pulse/services'

type JoinTripState = {
  joinTrip: (inviteCode: string) => Promise<Trip | null>
  loading: boolean
  error: string | null
}

export function useJoinTrip(): JoinTripState {
  const client = useSupabase()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function joinTrip(inviteCode: string): Promise<Trip | null> {
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

      // upsert with ignoreDuplicates handles the case where a member clicks
      // the invite link a second time — treated as success, not an error.
      await joinTripService(client, trip.id, user.id)

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
