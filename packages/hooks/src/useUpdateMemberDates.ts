import { useState } from 'react'
import { useSupabase } from './SupabaseContext'
import { useSession } from './useSession'
import { useTripStore } from '@pulse/store'
import { updateMemberDates } from '@pulse/services'

type UpdateDatesState = {
  updateDates: (arrival: string | null, departure: string | null) => Promise<void>
  loading: boolean
  error: string | null
}

export function useUpdateMemberDates(): UpdateDatesState {
  const client = useSupabase()
  const { user } = useSession()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const trip = useTripStore((s) => s.trip)
  const members = useTripStore((s) => s.members)
  const updateMember = useTripStore((s) => s.updateMember)
  const setMembers = useTripStore((s) => s.setMembers)

  async function updateDates(arrival: string | null, departure: string | null): Promise<void> {
    if (!user || !trip) return
    setError(null)

    const previous = members
    const me = members.find((m) => m.id === user.id)
    if (!me) return

    updateMember({ ...me, arrival_date: arrival ?? undefined, departure_date: departure ?? undefined })

    setLoading(true)
    try {
      await updateMemberDates(client, trip.id, user.id, arrival, departure)
    } catch (e) {
      setMembers(previous)
      setError(e instanceof Error ? e.message : 'Failed to update dates')
    } finally {
      setLoading(false)
    }
  }

  return { updateDates, loading, error }
}
