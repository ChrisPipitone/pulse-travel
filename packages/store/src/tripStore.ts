import { create } from 'zustand'
import type { Trip, Activity, ActivityRating, Member, Stop, ItinerarySlot } from '@pulse/types'

interface TripStore {
  trip: Trip | null
  members: Member[]
  activities: Activity[]
  ratings: ActivityRating[]
  stops: Stop[]
  slots: ItinerarySlot[]
  setTrip: (trip: Trip | null) => void
  setMembers: (members: Member[]) => void
  setActivities: (activities: Activity[]) => void
  setRatings: (ratings: ActivityRating[]) => void
  setStops: (stops: Stop[]) => void
  setSlots: (slots: ItinerarySlot[]) => void
  addActivity: (activity: Activity) => void
  updateActivity: (activity: Activity) => void
  removeActivity: (id: string) => void
  upsertRating: (rating: ActivityRating) => void
  removeRating: (activityId: string, userId: string) => void
  updateMember: (member: Member) => void
  addStop: (stop: Stop) => void
  updateStop: (stop: Stop) => void
  removeStop: (id: string) => void
  addSlot: (slot: ItinerarySlot) => void
  updateSlot: (slot: ItinerarySlot) => void
  removeSlot: (id: string) => void
  reset: () => void
}

const initialState = {
  trip: null,
  members: [],
  activities: [],
  ratings: [],
  stops: [],
  slots: [],
}

export const useTripStore = create<TripStore>((set) => ({
  ...initialState,
  setTrip: (trip) => set({ trip }),
  setMembers: (members) => set({ members }),
  setActivities: (activities) => set({ activities }),
  setRatings: (ratings) => set({ ratings }),
  setStops: (stops) => set({ stops }),
  setSlots: (slots) => set({ slots }),
  addActivity: (activity) =>
    set((state) => ({ activities: [...state.activities, activity] })),
  updateActivity: (activity) =>
    set((state) => ({ activities: state.activities.map((a) => a.id === activity.id ? activity : a) })),
  removeActivity: (id) =>
    set((state) => ({ activities: state.activities.filter((a) => a.id !== id) })),
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
  removeRating: (activityId, userId) =>
    set((state) => ({
      ratings: state.ratings.filter(
        (r) => !(r.activity_id === activityId && r.user_id === userId)
      ),
    })),
  updateMember: (member) =>
    set((state) => ({
      members: state.members.map((m) => m.id === member.id ? member : m),
    })),
  addStop: (stop) =>
    set((state) => ({ stops: [...state.stops, stop] })),
  updateStop: (stop) =>
    set((state) => ({ stops: state.stops.map((s) => s.id === stop.id ? stop : s) })),
  removeStop: (id) =>
    set((state) => ({
      stops: state.stops.filter((s) => s.id !== id),
      activities: state.activities.map((a) => a.stop_id === id ? { ...a, stop_id: null } : a),
    })),
  addSlot: (slot) =>
    set((state) => ({ slots: [...state.slots, slot] })),
  updateSlot: (slot) =>
    set((state) => ({ slots: state.slots.map((s) => s.id === slot.id ? slot : s) })),
  removeSlot: (id) =>
    set((state) => ({ slots: state.slots.filter((s) => s.id !== id) })),
  reset: () => set(initialState),
}))
