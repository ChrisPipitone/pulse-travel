'use client'

import { ThemeProvider } from '@/components/ui/ThemeProvider'
import { SupabaseProvider } from '@pulse/hooks'
import { supabase } from '@/lib/supabase'
import { AppNav } from '@/components/AppNav'
import { ToastProvider } from '@/components/ToastProvider'
import { SetDisplayNameModal } from '@/components/SetDisplayNameModal'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SupabaseProvider client={supabase}>
      <ThemeProvider>
        <ToastProvider>
          <AppNav />
          <SetDisplayNameModal />
          {children}
        </ToastProvider>
      </ThemeProvider>
    </SupabaseProvider>
  )
}
