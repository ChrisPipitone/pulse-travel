import { useState } from 'react'
import type { Trip } from '@pulse/types'
import { useSupabase } from './SupabaseContext'
import { useTripStore } from '@pulse/store'
import { updateTrip as updateTripService } from '@pulse/services'

type UpdateFields = Pick<Trip, 'name' | 'destination'> & { start_date?: string | null; end_date?: string | null }

type UpdateTripState = {
  updateTrip: (fields: UpdateFields) => Promise<boolean>
  loading: boolean
  error: string | null
}

export function useUpdateTrip(): UpdateTripState {
  const client = useSupabase()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const trip = useTripStore((s) => s.trip)
  const setTrip = useTripStore((s) => s.setTrip)

  async function updateTrip(fields: UpdateFields): Promise<boolean> {
    if (!trip) return false
    setError(null)

    const previous = trip
    setTrip({ ...trip, ...fields } as Trip)

    setLoading(true)
    try {
      const updated = await updateTripService(client, trip.id, fields)
      setTrip(updated)
      return true
    } catch (e) {
      setTrip(previous)
      setError(e instanceof Error ? e.message : 'Failed to update trip')
      return false
    } finally {
      setLoading(false)
    }
  }

  return { updateTrip, loading, error }
}
