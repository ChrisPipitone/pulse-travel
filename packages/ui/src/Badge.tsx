import type { Rating } from '@pulse/types'
import { RATING_LABELS } from '@pulse/types'

const styles: Record<Rating, string> = {
  MUST:  'bg-must  text-must-text',
  MAYBE: 'bg-maybe text-maybe-text',
  SKIP:  'bg-skip  text-skip-text',
}

type Props = {
  rating: Rating
  className?: string
}

export function Badge({ rating, className = '' }: Props) {
  return (
    <span
      className={`inline-flex items-center px-3 py-1 text-xs font-semibold tracking-wide rounded-[var(--radius-badge)] ${styles[rating]} ${className}`}
    >
      {RATING_LABELS[rating]}
    </span>
  )
}
