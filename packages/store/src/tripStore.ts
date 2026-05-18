import { create } from 'zustand'
import type { Trip, Activity, ActivityRating, Member } from '@pulse/types'

interface TripStore {
  trip: Trip | null
  members: Member[]
  activities: Activity[]
  ratings: ActivityRating[]
  setTrip: (trip: Trip | null) => void
  setMembers: (members: Member[]) => void
  setActivities: (activities: Activity[]) => void
  setRatings: (ratings: ActivityRating[]) => void
  addActivity: (activity: Activity) => void
  upsertRating: (rating: ActivityRating) => void
  reset: () => void
}

const initialState = {
  trip: null,
  members: [],
  activities: [],
  ratings: [],
}

export const useTripStore = create<TripStore>((set) => ({
  ...initialState,
  setTrip: (trip) => set({ trip }),
  setMembers: (members) => set({ members }),
  setActivities: (activities) => set({ activities }),
  setRatings: (ratings) => set({ ratings }),
  addActivity: (activity) =>
    set((state) => ({ activities: [...state.activities, activity] })),
  upsertRating: (rating) =>
    set((state) => ({
      ratings: state.ratings.some(
        (r) => r.activity_id === rating.activity_id && r.user_id === rating.user_id
      )
        ? state.ratings.map((r) =>
            r.activity_id === rating.activity_id && r.user_id === rating.user_id
              ? rating
              : r
          )
        : [...state.ratings, rating],
    })),
  reset: () => set(initialState),
}))
