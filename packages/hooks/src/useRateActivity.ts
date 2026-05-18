import { useState } from 'react'
import type { Rating } from '@pulse/types'
import { useSupabase } from './SupabaseContext'
import { useSession } from './useSession'
import { useTripStore } from '@pulse/store'
import { upsertRating } from '@pulse/services'

type RateActivityState = {
  rateActivity: (activityId: string, rating: Rating) => Promise<void>
  loading: boolean
  error: string | null
}

export function useRateActivity(): RateActivityState {
  const client = useSupabase()
  // Read user from session synchronously so the optimistic update below has
  // no async gap before it fires. If we called client.auth.getUser() inside
  // rateActivity, the store would update only after that await, which breaks
  // the instant-feedback guarantee of the optimistic pattern.
  const { user } = useSession()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const ratings = useTripStore((s) => s.ratings)
  const upsertRatingInStore = useTripStore((s) => s.upsertRating)
  const setRatings = useTripStore((s) => s.setRatings)

  async function rateActivity(activityId: string, rating: Rating): Promise<void> {
    setError(null)
    if (!user) return

    // Snapshot before the optimistic update — needed to roll back on failure.
    const previousRatings = ratings

    // Apply to the store immediately so the UI responds without waiting for
    // the network. If the request fails we roll back below.
    upsertRatingInStore({
      id: crypto.randomUUID(), // placeholder — real-time or next fetch will correct it
      activity_id: activityId,
      user_id: user!.id,
      rating,
    })

    setLoading(true)
    try {
      await upsertRating(client, { activity_id: activityId, user_id: user!.id, rating })
    } catch (e) {
      // Network failed — restore the state the user saw before they tapped.
      setRatings(previousRatings)
      setError(e instanceof Error ? e.message : 'Failed to save rating')
    } finally {
      setLoading(false)
    }
  }

  return { rateActivity, loading, error }
}
