'use client'

import { ThemeProvider } from '@/components/ui/ThemeProvider'
import { SupabaseProvider } from '@pulse/hooks'
import { supabase } from '@/lib/supabase'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SupabaseProvider client={supabase}>
      <ThemeProvider>{children}</ThemeProvider>
    </SupabaseProvider>
  )
}
