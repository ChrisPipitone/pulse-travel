import { Text, View } from 'react-native'
import type { Rating } from '@pulse/types'
import { RATING_LABELS } from '@pulse/types'

const styles: Record<Rating, { container: string; text: string }> = {
  MUST:  { container: 'bg-must  px-3 py-1 rounded-[var(--radius-badge)]', text: 'text-must-text  text-xs font-semibold tracking-wide' },
  WANT:  { container: 'bg-want  px-3 py-1 rounded-[var(--radius-badge)]', text: 'text-want-text  text-xs font-semibold tracking-wide' },
  MAYBE: { container: 'bg-maybe px-3 py-1 rounded-[var(--radius-badge)]', text: 'text-maybe-text text-xs font-semibold tracking-wide' },
  SKIP:  { container: 'bg-skip  px-3 py-1 rounded-[var(--radius-badge)]', text: 'text-skip-text  text-xs font-semibold tracking-wide' },
}

type Props = {
  rating: Rating
  className?: string
}

export function Badge({ rating, className = '' }: Props) {
  return (
    <View className={`${styles[rating].container} ${className}`}>
      <Text className={styles[rating].text}>{RATING_LABELS[rating]}</Text>
    </View>
  )
}
