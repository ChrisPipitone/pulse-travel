import type { SupabaseClient } from '@supabase/supabase-js'
import type { Trip, Activity, ActivityRating, Member, Stop } from '@pulse/types'

export type TripMemberAvatar = { id: string; name: string; avatar_url?: string | null }
export type TripSummary = Trip & { member_count: number; member_avatars: TripMemberAvatar[]; activity_count: number; my_rated_count: number }

export async function getUserTrips(client: SupabaseClient, userId?: string): Promise<TripSummary[]> {
  const { data: trips, error } = await client
    .from('trips')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) throw new Error(error.message)
  if (!trips?.length) return []

  const tripIds = trips.map((t: any) => t.id as string)

  const { data: members, error: membersError } = await client
    .from('trip_members')
    .select('trip_id, user_id')
    .in('trip_id', tripIds)
  if (membersError) throw new Error(membersError.message)

  const membersByTrip = new Map<string, string[]>()
  for (const m of members ?? []) {
    if (!membersByTrip.has(m.trip_id)) membersByTrip.set(m.trip_id, [])
    membersByTrip.get(m.trip_id)!.push(m.user_id)
  }

  const previewIds = [...new Set([...membersByTrip.values()].flatMap((ids) => ids.slice(0, 5)))]

  const profileMap = new Map<string, { name: string; avatar_url?: string | null }>()
  if (previewIds.length > 0) {
    const { data: profiles, error: profilesError } = await client
      .from('profiles')
      .select('id, display_name, avatar_url')
      .in('id', previewIds)
    if (profilesError) throw new Error(profilesError.message)
    for (const p of profiles ?? []) {
      profileMap.set(p.id, { name: p.display_name ?? 'Unknown', avatar_url: p.avatar_url })
    }
  }

  // Activity counts per trip
  const activityCountByTrip = new Map<string, number>()
  const myRatedByTrip = new Map<string, number>()

  const { data: activities } = await client
    .from('activities')
    .select('id, trip_id')
    .in('trip_id', tripIds)

  if (activities?.length) {
    for (const a of activities) {
      activityCountByTrip.set(a.trip_id, (activityCountByTrip.get(a.trip_id) ?? 0) + 1)
    }

    if (userId) {
      const activityIds = activities.map((a: any) => a.id)
      const { data: myRatings } = await client
        .from('activity_ratings')
        .select('activity_id')
        .eq('user_id', userId)
        .in('activity_id', activityIds)

      for (const r of myRatings ?? []) {
        const tripId = activities.find((a: any) => a.id === r.activity_id)?.trip_id
        if (tripId) myRatedByTrip.set(tripId, (myRatedByTrip.get(tripId) ?? 0) + 1)
      }
    }
  }

  return trips.map((t: any) => {
    const memberIds = membersByTrip.get(t.id) ?? []
    return {
      ...t,
      member_count: memberIds.length,
      member_avatars: memberIds.slice(0, 5).map((id) => ({
        id,
        name: profileMap.get(id)?.name ?? 'Unknown',
        avatar_url: profileMap.get(id)?.avatar_url,
      })),
      activity_count: activityCountByTrip.get(t.id) ?? 0,
      my_rated_count: myRatedByTrip.get(t.id) ?? 0,
    }
  })
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
  fields: Partial<Pick<Activity, 'name' | 'description' | 'url' | 'location' | 'region' | 'duration_hours' | 'category_id' | 'stop_id'>>
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
    if (error.message.startsWith('Trip is full')) {
      throw new Error(error.message)
    }
    throw new Error(error.message)
  }
}

export async function sendInviteEmail(
  client: SupabaseClient,
  email: string,
  inviteUrl: string,
): Promise<void> {
  const { error } = await client.auth.signInWithOtp({
    email,
    options: { emailRedirectTo: inviteUrl, shouldCreateUser: true },
  })
  if (error) throw new Error(error.message)
}

export async function listStops(client: SupabaseClient, tripId: string): Promise<Stop[]> {
  const { data, error } = await client
    .from('stops')
    .select('*')
    .eq('trip_id', tripId)
    .order('position')
    .order('created_at')
  if (error) throw new Error(error.message)
  return data ?? []
}

export async function createStop(
  client: SupabaseClient,
  tripId: string,
  name: string,
  dateFrom: string | null,
  dateTo: string | null,
  userId: string,
): Promise<Stop> {
  const { data: existing } = await client
    .from('stops')
    .select('position')
    .eq('trip_id', tripId)
    .order('position', { ascending: false })
    .limit(1)
  const nextPos = existing?.[0] ? existing[0].position + 1 : 0

  const { data, error } = await client
    .from('stops')
    .insert({ trip_id: tripId, name: name.trim(), date_from: dateFrom || null, date_to: dateTo || null, position: nextPos, created_by: userId })
    .select()
    .single()
  if (error) throw new Error(error.message)
  return data as Stop
}

export async function updateStop(
  client: SupabaseClient,
  stopId: string,
  fields: { name?: string; date_from?: string | null; date_to?: string | null },
): Promise<Stop> {
  const patch: Record<string, unknown> = {}
  if (fields.name !== undefined) patch.name = fields.name.trim()
  if ('date_from' in fields) patch.date_from = fields.date_from || null
  if ('date_to' in fields) patch.date_to = fields.date_to || null

  const { data, error } = await client.from('stops').update(patch).eq('id', stopId).select().single()
  if (error) throw new Error(error.message)
  return data as Stop
}

export async function deleteStop(client: SupabaseClient, stopId: string): Promise<void> {
  const { error } = await client.from('stops').delete().eq('id', stopId)
  if (error) throw new Error(error.message)
}

export async function updateDisplayName(
  client: SupabaseClient,
  userId: string,
  displayName: string,
): Promise<void> {
  const { error } = await client
    .from('profiles')
    .update({ display_name: displayName })
    .eq('id', userId)
  if (error) throw new Error(error.message)
}

export async function isEmailTripMember(
  client: SupabaseClient,
  tripId: string,
  email: string,
): Promise<boolean> {
  const { data, error } = await client.rpc('is_trip_member_by_email', {
    p_trip_id: tripId,
    p_email: email,
  })
  if (error) return false
  return data === true
}
