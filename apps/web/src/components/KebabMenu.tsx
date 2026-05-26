'use client'

import { useState, useRef, useEffect } from 'react'

type Item = { label: string; onClick: () => void; danger?: boolean }

export function KebabMenu({ items }: { items: Item[] }) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    function onDown(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [open])

  return (
    <div ref={ref} className="relative">
      <button
        onClick={(e) => { e.stopPropagation(); setOpen((o) => !o) }}
        className="p-1 rounded text-text-muted hover:text-text-primary hover:bg-bg transition-colors"
        aria-label="More options"
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
          <circle cx="2.5" cy="7" r="1.2" />
          <circle cx="7" cy="7" r="1.2" />
          <circle cx="11.5" cy="7" r="1.2" />
        </svg>
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-1 z-50 bg-bg-card border border-border rounded-xl shadow-lg overflow-hidden min-w-[120px]">
          {items.map((item) => (
            <button
              key={item.label}
              onClick={(e) => { e.stopPropagation(); setOpen(false); item.onClick() }}
              className={`w-full text-left px-3.5 py-2 text-sm transition-colors hover:bg-bg ${item.danger ? 'text-red-500' : 'text-text-primary'}`}
            >
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
