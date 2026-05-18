import { useState, useEffect } from 'react'
import { useSupabase } from './SupabaseContext'
import { useTripStore } from '@pulse/store'
import { getTrip, getMembers, getActivities, getRatings } from '@pulse/services'

type TripDataState = {
  loading: boolean
  error: string | null
}

export function useTripData(tripId: string): TripDataState {
  const client = useSupabase()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { setTrip, setMembers, setActivities, setRatings } = useTripStore()

  useEffect(() => {
    if (!tripId) return

    async function fetchAll() {
      setLoading(true)
      setError(null)
      try {
        // Trip, members, and activities have no inter-dependency — fetch in parallel.
        // Ratings depend on activity IDs, so they follow in a second round.
        const [trip, members, activities] = await Promise.all([
          getTrip(client, tripId),
          getMembers(client, tripId),
          getActivities(client, tripId),
        ])

        const ratings = await getRatings(client, activities.map((a) => a.id))

        setTrip(trip)
        setMembers(members)
        setActivities(activities)
        setRatings(ratings)
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to load trip')
      } finally {
        setLoading(false)
      }
    }

    fetchAll()

    // Real-time: re-fetch affected data when another group member makes changes.
    // Re-fetching is simpler than surgically updating the store and always
    // produces a consistent state. RLS on the fetch ensures we only see
    // rows we're allowed to see.
    //
    // activity_ratings has no trip_id column so it can't be filtered by trip
    // directly — subscribing to all rating changes for this session and
    // letting the re-fetch scope it correctly.
    const channel = client
      .channel(`trip-${tripId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'activities', filter: `trip_id=eq.${tripId}` },
        () => { getActivities(client, tripId).then(setActivities) }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'activity_ratings' },
        () => {
          getActivities(client, tripId).then((activities) => {
            getRatings(client, activities.map((a) => a.id)).then(setRatings)
          })
        }
      )
      .subscribe()

    // Channels accumulate if not removed — duplicate events on re-mount.
    return () => { client.removeChannel(channel) }
  }, [tripId, client])

  return { loading, error }
}
