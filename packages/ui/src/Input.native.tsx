import { TextInput, Text, View } from 'react-native'
import type { TextInputProps } from 'react-native'

type Props = TextInputProps & {
  label?: string
}

export function Input({ label, className = '', id, ...props }: Props & { id?: string }) {
  return (
    <View className="flex flex-col gap-1.5">
      {label && (
        <Text className="text-sm font-medium text-text-primary">{label}</Text>
      )}
      <TextInput
        className={`w-full bg-bg-card border border-border rounded-[var(--radius-card)] px-3 py-2 text-sm text-text-primary placeholder:text-text-subtle ${className}`}
        placeholderTextColor="var(--text-subtle)"
        {...props}
      />
    </View>
  )
}
