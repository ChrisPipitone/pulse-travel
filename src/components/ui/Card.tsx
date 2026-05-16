type Props = {
  children: React.ReactNode
  className?: string
}

export function Card({ children, className = '' }: Props) {
  return (
    <div
      className={`bg-bg-card border border-border rounded-[var(--radius-card)] p-4 ${className}`}
    >
      {children}
    </div>
  )
}
