'use client'

import { createContext, useContext, useState, useCallback } from 'react'

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

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const showToast = useCallback((message: string, onUndo?: () => void, duration = 4000) => {
    const id = crypto.randomUUID()
    setToasts(prev => [...prev, { id, message, onUndo }])
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
            <div
              key={t.id}
              className="pointer-events-auto flex items-center gap-3 bg-accent/10 border border-accent/30 text-text-primary px-4 py-3 rounded-xl shadow-[0_8px_28px_rgba(0,0,0,0.14)] w-full max-w-sm"
            >
              <span className="flex-1 text-sm">{t.message}</span>
              {t.onUndo && (
                <button
                  onClick={() => dismiss(t.id, t.onUndo)}
                  className="shrink-0 text-sm font-semibold text-accent px-1"
                >
                  Undo
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </ToastContext.Provider>
  )
}
