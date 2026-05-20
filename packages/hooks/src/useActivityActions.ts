import { useState } from 'react'
import type { Activity } from '@pulse/types'
import { useSupabase } from './SupabaseContext'
import { useTripStore } from '@pulse/store'
import { updateActivity as updateActivityService, deleteActivity as deleteActivityService } from '@pulse/services'

type ActivityFields = Partial<Pick<Activity, 'name' | 'description' | 'url' | 'location' | 'region' | 'duration_hours' | 'category_id'>>

type ActivityActionsState = {
  updateActivity: (id: string, fields: ActivityFields) => Promise<void>
  deleteActivity: (id: string) => Promise<void>
  loading: boolean
  error: string | null
}

export function useActivityActions(): ActivityActionsState {
  const client = useSupabase()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const updateInStore = useTripStore((s) => s.updateActivity)
  const removeFromStore = useTripStore((s) => s.removeActivity)

  async function updateActivity(id: string, fields: ActivityFields): Promise<void> {
    setLoading(true)
    setError(null)
    try {
      const updated = await updateActivityService(client, id, fields)
      if (updated) updateInStore(updated)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to update activity')
    } finally {
      setLoading(false)
    }
  }

  async function deleteActivity(id: string): Promise<void> {
    setLoading(true)
    setError(null)
    const snapshot = useTripStore.getState().activities
    removeFromStore(id)
    try {
      await deleteActivityService(client, id)
    } catch (e) {
      useTripStore.setState({ activities: snapshot })
      setError(e instanceof Error ? e.message : 'Failed to delete activity')
    } finally {
      setLoading(false)
    }
  }

  return { updateActivity, deleteActivity, loading, error }
}
