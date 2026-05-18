import { Text, View } from 'react-native'
import type { Rating } from '@pulse/types'

const styles: Record<Rating, { container: string; text: string }> = {
  MUST: { container: 'bg-must px-3 py-1 rounded-[var(--radius-badge)]', text: 'text-must-text text-xs font-semibold tracking-wide uppercase' },
  WANT: { container: 'bg-want px-3 py-1 rounded-[var(--radius-badge)]', text: 'text-want-text text-xs font-semibold tracking-wide uppercase' },
  MEH:  { container: 'bg-meh  px-3 py-1 rounded-[var(--radius-badge)]', text: 'text-meh-text  text-xs font-semibold tracking-wide uppercase' },
}

type Props = {
  rating: Rating
  className?: string
}

export function Badge({ rating, className = '' }: Props) {
  return (
    <View className={`${styles[rating].container} ${className}`}>
      <Text className={styles[rating].text}>{rating}</Text>
    </View>
  )
}
