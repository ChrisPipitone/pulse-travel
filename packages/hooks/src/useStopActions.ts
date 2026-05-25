import { useState } from 'react'
import { useSupabase } from './SupabaseContext'
import { useTripStore } from '@pulse/store'
import { createStop, updateStop, deleteStop } from '@pulse/services'

type StopActionsState = {
  createStop: (tripId: string, name: string, dateFrom: string | null, dateTo: string | null) => Promise<boolean>
  updateStop: (stopId: string, fields: { name?: string; date_from?: string | null; date_to?: string | null }) => Promise<boolean>
  deleteStop: (stopId: string) => Promise<boolean>
  loading: boolean
  error: string | null
}

export function useStopActions(): StopActionsState {
  const client = useSupabase()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { addStop, updateStop: updateStoreStop, removeStop } = useTripStore()

  async function create(tripId: string, name: string, dateFrom: string | null, dateTo: string | null): Promise<boolean> {
    setLoading(true)
    setError(null)
    try {
      const { data: { user } } = await client.auth.getUser()
      if (!user) return false
      const stop = await createStop(client, tripId, name, dateFrom, dateTo, user.id)
      addStop(stop)
      return true
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to create stop')
      return false
    } finally {
      setLoading(false)
    }
  }

  async function update(stopId: string, fields: { name?: string; date_from?: string | null; date_to?: string | null }): Promise<boolean> {
    setLoading(true)
    setError(null)
    try {
      const stop = await updateStop(client, stopId, fields)
      updateStoreStop(stop)
      return true
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to update stop')
      return false
    } finally {
      setLoading(false)
    }
  }

  async function remove(stopId: string): Promise<boolean> {
    setLoading(true)
    setError(null)
    try {
      await deleteStop(client, stopId)
      removeStop(stopId)
      return true
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to delete stop')
      return false
    } finally {
      setLoading(false)
    }
  }

  return { createStop: create, updateStop: update, deleteStop: remove, loading, error }

}
