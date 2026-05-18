import { createClient } from '@supabase/supabase-js'

// Fallbacks let createClient succeed during static pre-rendering (build time)
// when env vars aren't in scope. Real API calls will fail at runtime without
// the actual values — set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.
const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? 'http://placeholder.invalid'
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? 'placeholder'

export const supabase = createClient(url, key)
