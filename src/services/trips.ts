import { supabase } from '@/lib/supabase'
import type { Trip, Activity, ActivityRating, Member } from '@/types'

export async function getTrip(id: string): Promise<Trip | null> {
  const { data } = await supabase.from('trips').select('*').eq('id', id).single()
  return data
}

export async function getTripByInviteCode(code: string): Promise<Trip | null> {
  const { data } = await supabase.from('trips').select('*').eq('invite_code', code).single()
  return data
}

export async function getMembers(tripId: string): Promise<Member[]> {
  const { data } = await supabase.from('members').select('*').eq('trip_id', tripId)
  return data ?? []
}

export async function getActivities(tripId: string): Promise<Activity[]> {
  const { data } = await supabase.from('activities').select('*').eq('trip_id', tripId).order('created_at')
  return data ?? []
}

export async function addActivity(activity: Omit<Activity, 'id' | 'created_at'>): Promise<Activity | null> {
  const { data } = await supabase.from('activities').insert(activity).select().single()
  return data
}

export async function getRatings(activityIds: string[]): Promise<ActivityRating[]> {
  if (activityIds.length === 0) return []
  const { data } = await supabase.from('activity_ratings').select('*').in('activity_id', activityIds)
  return data ?? []
}

export async function upsertRating(rating: Omit<ActivityRating, 'id'>): Promise<void> {
  await supabase.from('activity_ratings').upsert(rating, { onConflict: 'activity_id,member_id' })
}
