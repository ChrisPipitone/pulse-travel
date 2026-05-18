import { useState } from 'react'
import type { Activity } from '@pulse/types'
import { useSupabase } from './SupabaseContext'
import { useTripStore } from '@pulse/store'
import { addActivity as addActivityService } from '@pulse/services'

// added_by comes from the session, not the form — excluded from input shape.
type NewActivityInput = Omit<Activity, 'id' | 'created_at' | 'added_by'>

type AddActivityState = {
  addActivity: (data: NewActivityInput) => Promise<void>
  loading: boolean
  error: string | null
}

export function useAddActivity(): AddActivityState {
  const client = useSupabase()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const addToStore = useTripStore((s) => s.addActivity)

  async function addActivity(data: NewActivityInput): Promise<void> {
    setLoading(true)
    setError(null)

    try {
      const { data: { user } } = await client.auth.getUser()
      if (!user) return

      const created = await addActivityService(client, { ...data, added_by: user.id })

      // No optimistic update here — we need the server-generated id and
      // created_at before we can display the activity correctly.
      // The real-time subscription in useTripData will also fire; the store's
      // addActivity action handles the duplicate gracefully.
      if (created) addToStore(created)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to add activity')
    } finally {
      setLoading(false)
    }
  }

  return { addActivity, loading, error }
}
