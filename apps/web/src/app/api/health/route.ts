import { supabase } from '@/lib/supabase'

// Keep-alive + liveness probe. Supabase pauses free projects after 7 days of
// inactivity, so a scheduled ping to this route keeps the hosted DB awake.
// get_trip_preview is the one RPC granted to anon, so this reaches Postgres
// without any credentials beyond the public anon key.
export const dynamic = 'force-dynamic'

export async function GET() {
  const { error } = await supabase.rpc('get_trip_preview', { p_code: '__healthcheck__' })

  if (error) {
    return Response.json({ ok: false, db: 'unreachable', error: error.message }, { status: 503 })
  }
  return Response.json({ ok: true, db: 'reachable', at: new Date().toISOString() })
}
