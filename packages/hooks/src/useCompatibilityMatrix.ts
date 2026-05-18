import { useMemo } from 'react'
import type { CompatibilityScore } from '@pulse/types'
import { useTripStore } from '@pulse/store'

type MatrixState = {
  matrix: CompatibilityScore[]
}

export function useCompatibilityMatrix(): MatrixState {
  const activities = useTripStore((s) => s.activities)
  const ratings = useTripStore((s) => s.ratings)

  // useMemo so the computation only reruns when activities or ratings change,
  // not on every render of every consumer.
  const matrix = useMemo((): CompatibilityScore[] => {
    return activities
      .map((activity) => {
        const activityRatings = ratings.filter((r) => r.activity_id === activity.id)

        const must_count = activityRatings.filter((r) => r.rating === 'MUST').length
        const want_count = activityRatings.filter((r) => r.rating === 'WANT').length
        const meh_count  = activityRatings.filter((r) => r.rating === 'MEH').length

        // MUST weighted 3× WANT so "3 people MUST" beats "10 people WANT".
        // MEH contributes nothing — it's a deliberate non-vote.
        const score = must_count * 3 + want_count * 1

        // Keyed by user_id so the matrix UI can look up any member's rating in O(1).
        const ratingsMap = Object.fromEntries(
          activityRatings.map((r) => [r.user_id, r.rating])
        )

        return { activity_id: activity.id, score, must_count, want_count, meh_count, ratings: ratingsMap }
      })
      .sort((a, b) => b.score - a.score)
  }, [activities, ratings])

  return { matrix }
}
