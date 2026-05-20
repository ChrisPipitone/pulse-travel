import type { SupabaseClient } from '@supabase/supabase-js'
import type { Trip, Activity, ActivityRating, Member } from '@pulse/types'

export async function getTrip(client: SupabaseClient, id: string): Promise<Trip | null> {
  const { data, error } = await client.from('trips').select('*').eq('id', id).single()
  if (error && error.code !== 'PGRST116') throw new Error(error.message)
  return data
}

export async function getTripByInviteCode(client: SupabaseClient, code: string): Promise<Trip | null> {
  const { data, error } = await client.from('trips').select('*').eq('invite_code', code).single()
  if (error && error.code !== 'PGRST116') throw new Error(error.message)
  return data
}

export async function getMembers(client: SupabaseClient, tripId: string): Promise<Member[]> {
  const { data: rows, error } = await client
    .from('trip_members')
    .select('user_id, arrival_date, departure_date')
    .eq('trip_id', tripId)
  if (error) throw new Error(error.message)
  if (!rows?.length) return []

  const { data: profiles, error: profilesError } = await client
    .from('profiles')
    .select('id, display_name, avatar_url')
    .in('id', rows.map((r) => r.user_id))
  if (profilesError) throw new Error(profilesError.message)

  return rows.map((r) => {
    const profile = profiles?.find((p) => p.id === r.user_id)
    return {
      id: r.user_id,
      name: profile?.display_name ?? 'Unknown',
      email: '',
      avatar_url: profile?.avatar_url ?? undefined,
      arrival_date: r.arrival_date ?? undefined,
      departure_date: r.departure_date ?? undefined,
    }
  })
}

export async function getActivities(client: SupabaseClient, tripId: string): Promise<Activity[]> {
  const { data, error } = await client.from('activities').select('*').eq('trip_id', tripId).order('created_at')
  if (error) throw new Error(error.message)
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

export async function updateActivity(
  client: SupabaseClient,
  id: string,
  fields: Partial<Pick<Activity, 'name' | 'description' | 'url' | 'location' | 'region' | 'duration_hours' | 'category_id'>>
): Promise<Activity | null> {
  const { data, error } = await client.from('activities').update(fields).eq('id', id).select().single()
  if (error) throw new Error(error.message)
  return data
}

export async function deleteActivity(client: SupabaseClient, id: string): Promise<void> {
  const { error } = await client.from('activities').delete().eq('id', id)
  if (error) throw new Error(error.message)
}

export async function upsertRating(client: SupabaseClient, rating: Omit<ActivityRating, 'id'>): Promise<void> {
  await client.from('activity_ratings').upsert(rating, { onConflict: 'activity_id,user_id' })
}

export async function joinTrip(client: SupabaseClient, tripId: string, userId: string): Promise<void> {
  // ignoreDuplicates: member clicking the invite link twice is not an error
  await client.from('trip_members').upsert({ trip_id: tripId, user_id: userId }, { onConflict: 'trip_id,user_id', ignoreDuplicates: true })
}
