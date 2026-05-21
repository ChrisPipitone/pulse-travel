import { useState } from 'react'
import type { Rating } from '@pulse/types'
import { useSupabase } from './SupabaseContext'
import { useSession } from './useSession'
import { useTripStore } from '@pulse/store'
import { upsertRating, deleteRating } from '@pulse/services'

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
  const removeRatingFromStore = useTripStore((s) => s.removeRating)
  const setRatings = useTripStore((s) => s.setRatings)

  async function rateActivity(activityId: string, rating: Rating): Promise<void> {
    setError(null)
    if (!user) return

    const existing = ratings.find((r) => r.activity_id === activityId && r.user_id === user!.id)
    const isToggleOff = existing?.rating === rating

    // Snapshot before the optimistic update — needed to roll back on failure.
    const previousRatings = ratings

    if (isToggleOff) {
      removeRatingFromStore(activityId, user!.id)
    } else {
      upsertRatingInStore({
        id: crypto.randomUUID(), // placeholder — real-time or next fetch will correct it
        activity_id: activityId,
        user_id: user!.id,
        rating,
      })
    }

    setLoading(true)
    try {
      if (isToggleOff) {
        await deleteRating(client, activityId, user!.id)
      } else {
        await upsertRating(client, { activity_id: activityId, user_id: user!.id, rating })
      }
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
