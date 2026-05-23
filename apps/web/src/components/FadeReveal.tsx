'use client'

type Props = {
  label: string
  onClick: () => void
}

export function FadeReveal({ label, onClick }: Props) {
  return (
    <div className="-mt-12 relative z-10">
      <div
        className="h-12 w-full pointer-events-none"
        style={{ background: 'linear-gradient(to top, var(--bg-card) 30%, transparent)' }}
      />
      <button
        onClick={onClick}
        className="w-full bg-bg-card pt-0.5 pb-1 text-xs font-medium text-accent hover:opacity-75 transition-opacity text-center"
      >
        {label}
      </button>
    </div>
  )
}
