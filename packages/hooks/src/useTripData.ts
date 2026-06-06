import { useState, useEffect } from 'react'
import { useSupabase } from './SupabaseContext'
import { useTripStore } from '@pulse/store'
import { getTrip, getMembers, getActivities, getRatings, listStops, listSlots } from '@pulse/services'

type TripDataState = {
  loading: boolean
  error: string | null
}

export function useTripData(tripId: string): TripDataState {
  const client = useSupabase()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { setTrip, setMembers, setActivities, setRatings, setStops, setSlots } = useTripStore()

  useEffect(() => {
    if (!tripId) return

    async function fetchAll() {
      setLoading(true)
      setError(null)
      try {
        // Trip, members, activities, and stops have no inter-dependency — fetch in parallel.
        // Ratings depend on activity IDs, so they follow in a second round.
        const [trip, members, activities, stops, slots] = await Promise.all([
          getTrip(client, tripId),
          getMembers(client, tripId),
          getActivities(client, tripId),
          listStops(client, tripId),
          listSlots(client, tripId),
        ])

        const ratings = await getRatings(client, activities.map((a) => a.id))

        setTrip(trip)
        setMembers(members)
        setActivities(activities)
        setRatings(ratings)
        setStops(stops)
        setSlots(slots)
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to load trip')
      } finally {
        setLoading(false)
      }
    }

    fetchAll()

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
          getActivities(client, tripId).then((acts) => {
            getRatings(client, acts.map((a) => a.id)).then(setRatings)
          })
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'stops', filter: `trip_id=eq.${tripId}` },
        () => { listStops(client, tripId).then(setStops) }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'itinerary_slots', filter: `trip_id=eq.${tripId}` },
        () => { listSlots(client, tripId).then(setSlots) }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'itinerary_slot_members' },
        () => { listSlots(client, tripId).then(setSlots) }
      )
      .subscribe()

    return () => { client.removeChannel(channel) }
  }, [tripId, client])

  return { loading, error }
}
