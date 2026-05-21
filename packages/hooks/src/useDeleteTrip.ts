import { useState } from 'react'
import { useSupabase } from './SupabaseContext'
import { deleteTrip as deleteTripService } from '@pulse/services'

type DeleteTripState = {
  deleteTrip: (tripId: string, onSuccess: () => void) => Promise<void>
  loading: boolean
  error: string | null
}

export function useDeleteTrip(): DeleteTripState {
  const client = useSupabase()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function deleteTrip(tripId: string, onSuccess: () => void): Promise<void> {
    setError(null)
    setLoading(true)
    try {
      await deleteTripService(client, tripId)
      onSuccess()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to delete trip')
    } finally {
      setLoading(false)
    }
  }

  return { deleteTrip, loading, error }
}
