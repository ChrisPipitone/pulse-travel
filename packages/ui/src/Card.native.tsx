import { View } from 'react-native'
import type { ReactNode } from 'react'

type Props = {
  children: ReactNode
  className?: string
}

export function Card({ children, className = '' }: Props) {
  return (
    <View className={`bg-bg-card border border-border rounded-[var(--radius-card)] p-4 ${className}`}>
      {children}
    </View>
  )
}
