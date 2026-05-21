import { useState } from 'react'
import type { Trip } from '@pulse/types'
import { useSupabase } from './SupabaseContext'
import { createTrip as createTripService } from '@pulse/services'

type CreateTripInput = Pick<Trip, 'name' | 'destination'> & {
  start_date?: string | null
  end_date?: string | null
}

type CreateTripState = {
  createTrip: (fields: CreateTripInput) => Promise<Trip | null>
  loading: boolean
  error: string | null
}

export function useCreateTrip(): CreateTripState {
  const client = useSupabase()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function createTrip(fields: CreateTripInput): Promise<Trip | null> {
    setLoading(true)
    setError(null)
    try {
      const { data: { user } } = await client.auth.getUser()
      if (!user) throw new Error('Not authenticated')
      return await createTripService(client, fields, user.id)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to create trip')
      return null
    } finally {
      setLoading(false)
    }
  }

  return { createTrip, loading, error }
}
