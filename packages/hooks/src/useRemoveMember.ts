import { useState } from 'react'
import { useSupabase } from './SupabaseContext'
import { useTripStore } from '@pulse/store'
import { removeTripMember } from '@pulse/services'

type RemoveMemberState = {
  removeMember: (userId: string) => Promise<void>
  removingId: string | null
  error: string | null
}

export function useRemoveMember(): RemoveMemberState {
  const client = useSupabase()
  const [removingId, setRemovingId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const trip = useTripStore((s) => s.trip)
  const members = useTripStore((s) => s.members)
  const setMembers = useTripStore((s) => s.setMembers)

  async function removeMember(userId: string): Promise<void> {
    if (!trip) return
    setError(null)

    const previous = members
    setMembers(members.filter((m) => m.id !== userId))
    setRemovingId(userId)

    try {
      await removeTripMember(client, trip.id, userId)
    } catch (e) {
      setMembers(previous)
      setError(e instanceof Error ? e.message : 'Failed to remove member')
    } finally {
      setRemovingId(null)
    }
  }

  return { removeMember, removingId, error }
}
