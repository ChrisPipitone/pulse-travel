import type { SupabaseClient } from '@supabase/supabase-js'
import type { Trip, Activity, ActivityRating, Member } from '@pulse/types'

export async function getTrip(client: SupabaseClient, id: string): Promise<Trip | null> {
  const { data } = await client.from('trips').select('*').eq('id', id).single()
  return data
}

export async function getTripByInviteCode(client: SupabaseClient, code: string): Promise<Trip | null> {
  const { data } = await client.from('trips').select('*').eq('invite_code', code).single()
  return data
}

export async function getMembers(client: SupabaseClient, tripId: string): Promise<Member[]> {
  const { data } = await client.from('trip_members').select('*').eq('trip_id', tripId)
  return data ?? []
}

export async function getActivities(client: SupabaseClient, tripId: string): Promise<Activity[]> {
  const { data } = await client.from('activities').select('*').eq('trip_id', tripId).order('created_at')
  return data ?? []
}

export async function addActivity(client: SupabaseClient, activity: Omit<Activity, 'id' | 'created_at'>): Promise<Activity | null> {
  const { data } = await client.from('activities').insert(activity).select().single()
  return data
}

export async function getRatings(client: SupabaseClient, activityIds: string[]): Promise<ActivityRating[]> {
  if (activityIds.length === 0) return []
  const { data } = await client.from('activity_ratings').select('*').in('activity_id', activityIds)
  return data ?? []
}

export async function upsertRating(client: SupabaseClient, rating: Omit<ActivityRating, 'id'>): Promise<void> {
  await client.from('activity_ratings').upsert(rating, { onConflict: 'activity_id,user_id' })
}

export async function joinTrip(client: SupabaseClient, tripId: string, userId: string): Promise<void> {
  // ignoreDuplicates: member clicking the invite link twice is not an error
  await client.from('trip_members').upsert({ trip_id: tripId, user_id: userId }, { onConflict: 'trip_id,user_id', ignoreDuplicates: true })
}
