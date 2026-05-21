import type { SupabaseClient } from '@supabase/supabase-js'
import type { Trip, Activity, ActivityRating, Member } from '@pulse/types'

export async function getUserTrips(client: SupabaseClient): Promise<Array<Trip & { member_count: number }>> {
  const { data, error } = await client
    .from('trips')
    .select('*, trip_members(count)')
    .order('created_at', { ascending: false })
  if (error) throw new Error(error.message)
  return (data ?? []).map((t: Trip & { trip_members: { count: number }[] }) => ({
    ...t,
    member_count: t.trip_members?.[0]?.count ?? 0,
    trip_members: undefined,
  })) as Array<Trip & { member_count: number }>
}

export async function createTrip(
  client: SupabaseClient,
  fields: Pick<Trip, 'name' | 'destination'> & { start_date?: string | null; end_date?: string | null },
  userId: string
): Promise<Trip> {
  let trip: Trip | null = null
  for (let attempt = 0; attempt < 5; attempt++) {
    const { data, error } = await client
      .from('trips')
      .insert({ ...fields, created_by: userId })
      .select()
      .single()
    if (error) {
      // 23505 = unique_violation — invite_code collision, retry with new DB-generated code
      if (error.code === '23505' && error.message.includes('invite_code')) continue
      throw new Error(error.message)
    }
    trip = data as Trip
    break
  }
  if (!trip) throw new Error('Failed to generate unique invite code — please try again')
  const { error: memberError } = await client
    .from('trip_members')
    .insert({ trip_id: trip.id, user_id: userId })
  if (memberError) throw new Error(memberError.message)
  return trip
}

export async function updateTrip(
  client: SupabaseClient,
  tripId: string,
  fields: Pick<Trip, 'name' | 'destination'> & { start_date?: string | null; end_date?: string | null }
): Promise<Trip> {
  const { data, error } = await client
    .from('trips')
    .update(fields)
    .eq('id', tripId)
    .select()
    .single()
  if (error) throw new Error(error.message)
  return data as Trip
}

export async function deleteTrip(client: SupabaseClient, tripId: string): Promise<void> {
  const { error } = await client.from('trips').delete().eq('id', tripId)
  if (error) throw new Error(error.message)
}

export async function getTrip(client: SupabaseClient, id: string): Promise<Trip | null> {
  const { data, error } = await client.from('trips').select('*').eq('id', id).single()
  if (error && error.code !== 'PGRST116') throw new Error(error.message)
  return data
}

export async function getTripByInviteCode(client: SupabaseClient, code: string): Promise<Trip | null> {
  // Direct table query fails for non-members (trips SELECT RLS requires membership).
  // RPC calls the SECURITY DEFINER function which bypasses RLS for this lookup only.
  const { data, error } = await client.rpc('get_trip_by_invite_code', { p_code: code })
  if (error) throw new Error(error.message)
  return (data as Trip[] | null)?.[0] ?? null
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

export async function updateMemberDates(
  client: SupabaseClient,
  tripId: string,
  userId: string,
  arrival: string | null,
  departure: string | null
): Promise<void> {
  const { error } = await client
    .from('trip_members')
    .update({ arrival_date: arrival, departure_date: departure })
    .eq('trip_id', tripId)
    .eq('user_id', userId)
  if (error) throw new Error(error.message)
}

export async function deleteRating(client: SupabaseClient, activityId: string, userId: string): Promise<void> {
  const { error } = await client
    .from('activity_ratings')
    .delete()
    .eq('activity_id', activityId)
    .eq('user_id', userId)
  if (error) throw new Error(error.message)
}

export async function removeTripMember(client: SupabaseClient, tripId: string, userId: string): Promise<void> {
  const { error } = await client
    .from('trip_members')
    .delete()
    .eq('trip_id', tripId)
    .eq('user_id', userId)
  if (error) throw new Error(error.message)
}

export async function joinTrip(client: SupabaseClient, tripId: string, userId: string): Promise<void> {
  const { error } = await client
    .from('trip_members')
    .upsert({ trip_id: tripId, user_id: userId }, { onConflict: 'trip_id,user_id', ignoreDuplicates: true })
  if (error) {
    if (error.message.includes('maximum of 50 members')) {
      throw new Error('This trip is full — the 50-member limit has been reached.')
    }
    throw new Error(error.message)
  }
}
