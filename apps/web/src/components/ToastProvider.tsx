'use client'

import { createContext, useContext, useState, useCallback, useRef } from 'react'
import { UNDO_DURATION_MS } from '@/lib/constants'

type Toast = {
  id: string
  message: string
  onUndo?: () => void
}

type ToastCtx = {
  showToast: (message: string, onUndo?: () => void, duration?: number) => void
}

const ToastContext = createContext<ToastCtx>({ showToast: () => {} })

export function useToast() {
  return useContext(ToastContext)
}

function ToastItem({ t, onDismiss }: { t: Toast; onDismiss: (undo?: () => void) => void }) {
  const [dragX, setDragX] = useState(0)
  const startX = useRef<number | null>(null)
  const isDragging = useRef(false)

  function handlePointerDown(e: React.PointerEvent<HTMLDivElement>) {
    startX.current = e.clientX
    isDragging.current = false
    e.currentTarget.setPointerCapture(e.pointerId)
  }

  function handlePointerMove(e: React.PointerEvent<HTMLDivElement>) {
    if (startX.current === null) return
    const dx = e.clientX - startX.current
    if (Math.abs(dx) > 5) isDragging.current = true
    setDragX(dx)
  }

  function handlePointerUp() {
    if (Math.abs(dragX) > 80) {
      onDismiss()
    } else {
      setDragX(0)
    }
    startX.current = null
  }

  function handleClick() {
    if (isDragging.current) return
    onDismiss()
  }

  const opacity = Math.max(0, 1 - Math.abs(dragX) / 160)
  const isSnapping = dragX === 0 && startX.current === null

  return (
    <div
      className="toast-enter pointer-events-auto flex items-center gap-3 bg-bg-card border border-accent/30 text-text-primary px-4 py-3 rounded-xl shadow-[0_8px_28px_color-mix(in_srgb,var(--accent)_20%,transparent)] w-full max-w-sm cursor-pointer select-none"
      style={{
        transform: `translateX(${dragX}px)`,
        transition: isSnapping ? 'transform 200ms ease-out, opacity 200ms ease-out' : 'none',
        opacity,
      }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onClick={handleClick}
    >
      <span className="flex-1 text-sm">{t.message}</span>
      {t.onUndo && (
        <button
          onClick={(e) => { e.stopPropagation(); onDismiss(t.onUndo) }}
          className="shrink-0 text-sm font-semibold text-accent px-1"
        >
          Undo
        </button>
      )}
    </div>
  )
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const showToast = useCallback((message: string, onUndo?: () => void, duration = UNDO_DURATION_MS) => {
    const id = crypto.randomUUID()
    setToasts(prev => [...prev.slice(-2), { id, message, onUndo }])
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), duration)
  }, [])

  function dismiss(id: string, undo?: () => void) {
    undo?.()
    setToasts(prev => prev.filter(t => t.id !== id))
  }

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {toasts.length > 0 && (
        <div className="fixed bottom-6 inset-x-0 z-[100] flex flex-col items-center gap-2 px-4 pointer-events-none">
          {toasts.map(t => (
            <ToastItem key={t.id} t={t} onDismiss={(undo) => dismiss(t.id, undo)} />
          ))}
        </div>
      )}
    </ToastContext.Provider>
  )
}
