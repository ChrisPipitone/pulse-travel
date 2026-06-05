export type Rating = 'MUST' | 'MAYBE' | 'SKIP'

export const RATING_LABELS: Record<Rating, string> = {
  MUST:  "Can't miss",
  MAYBE: 'Maybe',
  SKIP:  'Skip',
}

export const RATING_PILL: Record<Rating, string> = {
  MUST:  'bg-must/12 text-must',
  MAYBE: 'bg-maybe/20 text-maybe-text',
  SKIP:  'bg-skip text-skip-text',
}

export const RATING_BUTTON: Record<Rating, { active: string; idle: string }> = {
  MUST:  { active: 'bg-must text-must-text border-transparent',                  idle: 'border-must/40 text-must/60' },
  MAYBE: { active: 'bg-maybe text-maybe-text border-transparent',                idle: 'border-maybe/40 text-maybe-text/60' },
  SKIP:  { active: 'bg-text-subtle/30 text-text-primary border-text-subtle/40',  idle: 'border-border text-text-subtle' },
}

export type Theme = 'pulse' | 'comic' | 'modern' | 'editorial' | 'sage' | 'slate' | 'terra'

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

// Returned by get_trip_by_invite_code RPC — restricted to safe columns only (JAB-14).
export type TripPreview = Pick<Trip, 'id' | 'name' | 'destination' | 'start_date' | 'end_date'>

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

export type SortKey = 'popular' | 'my-recs' | 'cant-miss' | 'newest' | 'by-stop'

export interface CrewRowData {
  activity: Activity
  mustMembers: Member[]
  maybeMembers: Member[]
  skipMembers: Member[]
  unratedMembers: Member[]
  myRating: Rating | null
  mustCount: number
  maybeCount: number
}
