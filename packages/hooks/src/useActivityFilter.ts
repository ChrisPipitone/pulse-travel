import { useState, useMemo } from 'react'
import type { Activity } from '@pulse/types'
import { useTripStore } from '@pulse/store'

type ActivityFilterState = {
  filtered: Activity[]
  region: string
  setRegion: (region: string) => void
  category: string
  setCategory: (categoryId: string) => void
  search: string
  setSearch: (search: string) => void
  reset: () => void
}

export function useActivityFilter(): ActivityFilterState {
  const activities = useTripStore((s) => s.activities)

  // Empty string = no filter applied for that dimension.
  const [region, setRegion] = useState('')
  const [category, setCategory] = useState('')
  const [search, setSearch] = useState('')

  // useMemo not useEffect+useState: filtering is synchronous so we compute
  // in the same render pass as the filter change, avoiding a stale frame.
  const filtered = useMemo((): Activity[] => {
    return activities.filter((activity) => {
      if (region && activity.region !== region) return false
      if (category && activity.category_id !== category) return false
      if (search) {
        const term = search.toLowerCase()
        const matchesName = activity.name.toLowerCase().includes(term)
        const matchesDesc = activity.description?.toLowerCase().includes(term) ?? false
        if (!matchesName && !matchesDesc) return false
      }
      return true
    })
  }, [activities, region, category, search])

  function reset() {
    setRegion('')
    setCategory('')
    setSearch('')
  }

  return { filtered, region, setRegion, category, setCategory, search, setSearch, reset }
}
