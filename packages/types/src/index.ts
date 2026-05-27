export type Rating = 'MUST' | 'MAYBE' | 'SKIP'

export const RATING_LABELS: Record<Rating, string> = {
  MUST:  "Can't miss",
  MAYBE: 'Maybe',
  SKIP:  'Skip',
}

export type Theme = 'modern' | 'editorial'

export interface Member {
  id: string
  name: string
  email?: string
  avatar_url?: string
  arrival_date?: string
  departure_date?: string
}

export interface Trip {
  id: string
  name: string
  destination: string
  start_date: string
  end_date: string
  created_by: string | null
  invite_code: string
}

export interface ActivityCategory {
  id: string
  name: string
  slug: string
  icon?: string
}

export interface Stop {
  id: string
  trip_id: string
  name: string
  date_from?: string | null
  date_to?: string | null
  position: number
  created_by: string | null
  created_at: string
}

export interface Activity {
  id: string
  trip_id: string
  name: string
  description?: string | null
  url?: string | null
  location?: string | null
  region?: string | null
  duration_hours?: number | null
  category_id?: string | null
  stop_id?: string | null
  added_by: string | null
  created_at: string
}

export interface ActivityRating {
  id: string
  activity_id: string
  user_id: string
  rating: Rating
}

export interface TripEvent {
  id: string
  trip_id: string
  name: string
  start_date: string
  end_date: string
  member_ids: string[]
}

export interface CompatibilityScore {
  activity_id: string
  score: number
  must_count: number
  maybe_count: number
  skip_count: number
  ratings: Record<string, Rating>
}
