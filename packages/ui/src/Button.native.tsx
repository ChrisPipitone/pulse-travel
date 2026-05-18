import { Pressable, Text } from 'react-native'
import type { ReactNode } from 'react'

type Variant = 'primary' | 'outline' | 'ghost'
type Size = 'sm' | 'md' | 'lg'

const variantStyles: Record<Variant, { container: string; text: string }> = {
  primary: { container: 'bg-accent',         text: 'text-white' },
  outline: { container: 'border border-border', text: 'text-text-primary' },
  ghost:   { container: 'bg-meh',            text: 'text-accent' },
}

const sizeStyles: Record<Size, { container: string; text: string }> = {
  sm: { container: 'px-3 py-1.5', text: 'text-sm' },
  md: { container: 'px-5 py-2.5', text: 'text-sm' },
  lg: { container: 'px-6 py-3',   text: 'text-base' },
}

type Props = {
  variant?: Variant
  size?: Size
  className?: string
  disabled?: boolean
  onPress?: () => void
  children: ReactNode
}

export function Button({ variant = 'primary', size = 'md', className = '', disabled, onPress, children }: Props) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      className={`flex-row items-center justify-center rounded-[var(--radius-btn)] ${variantStyles[variant].container} ${sizeStyles[size].container} ${disabled ? 'opacity-40' : ''} ${className}`}
    >
      <Text className={`font-medium ${variantStyles[variant].text} ${sizeStyles[size].text}`}>
        {children}
      </Text>
    </Pressable>
  )
}
