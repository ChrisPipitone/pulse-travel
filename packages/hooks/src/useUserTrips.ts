import { useState, useEffect } from 'react'
import type { Trip } from '@pulse/types'
import { useSupabase } from './SupabaseContext'
import { getUserTrips } from '@pulse/services'

type TripSummary = Trip & { member_count: number }

type UserTripsState = {
  trips: TripSummary[]
  loading: boolean
  error: string | null
  refresh: () => void
}

export function useUserTrips(): UserTripsState {
  const client = useSupabase()
  const [trips, setTrips] = useState<TripSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [tick, setTick] = useState(0)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)
    getUserTrips(client)
      .then((data) => { if (!cancelled) { setTrips(data); setLoading(false) } })
      .catch((e) => { if (!cancelled) { setError(e instanceof Error ? e.message : 'Failed to load trips'); setLoading(false) } })
    return () => { cancelled = true }
  }, [client, tick])

  return { trips, loading, error, refresh: () => setTick((t) => t + 1) }
}
