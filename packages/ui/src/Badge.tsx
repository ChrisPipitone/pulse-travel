import type { Rating } from '@pulse/types'

const styles: Record<Rating, string> = {
  MUST: 'bg-must text-must-text',
  WANT: 'bg-want text-want-text',
  MEH:  'bg-meh  text-meh-text',
}

type Props = {
  rating: Rating
  className?: string
}

export function Badge({ rating, className = '' }: Props) {
  return (
    <span
      className={`inline-flex items-center px-3 py-1 text-xs font-semibold tracking-wide uppercase rounded-[var(--radius-badge)] ${styles[rating]} ${className}`}
    >
      {rating}
    </span>
  )
}
