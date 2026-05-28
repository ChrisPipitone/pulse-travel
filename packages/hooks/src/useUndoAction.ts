import { useRef, useEffect } from 'react'

export function useUndoAction() {
  const timers = useRef(new Map<string, ReturnType<typeof setTimeout>>())

  useEffect(() => {
    const map = timers.current
    return () => map.forEach(clearTimeout)
  }, [])

  // Schedules onCommit to run after `duration` ms. Returns a cancel function
  // that clears the timer — pass it to the toast undo callback.
  function schedule(key: string, onCommit: () => void, duration = 4000): () => void {
    const existing = timers.current.get(key)
    if (existing) clearTimeout(existing)

    const t = setTimeout(() => {
      timers.current.delete(key)
      onCommit()
    }, duration)
    timers.current.set(key, t)

    return () => {
      clearTimeout(timers.current.get(key))
      timers.current.delete(key)
    }
  }

  return { schedule }
}
