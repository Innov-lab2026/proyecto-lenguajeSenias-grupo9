import type { ReactNode } from 'react'
import { ActivityIndicator, Pressable, Text } from 'react-native'
import { cn } from '@/src/utils/cn'

type Variant = 'primary' | 'white' | 'secondary'

interface ButtonProps {
  label: string
  onPress?: () => void
  variant?: Variant
  loading?: boolean
  disabled?: boolean
  leftIcon?: ReactNode
  className?: string
}

const containerByVariant: Record<Variant, string> = {
  primary: 'bg-primary hover:bg-primary-hover active:bg-primary-hover',
  white: 'bg-surface shadow-sm shadow-black/5 hover:bg-gray-100 active:bg-gray-200',
  secondary: 'bg-secondary hover:bg-secondary/90 active:bg-secondary/80',
}

const textByVariant: Record<Variant, string> = {
  primary: 'text-ink',
  white: 'text-ink',
  secondary: 'text-white',
}

// Color del spinner por variante (ActivityIndicator no acepta className).
const spinnerColorByVariant: Record<Variant, string> = {
  primary: '#1F2937', // ink
  white: '#4A90E2', // secondary
  secondary: '#FFFFFF',
}

export function Button({
  label,
  onPress,
  variant = 'primary',
  loading = false,
  disabled = false,
  leftIcon,
  className,
}: ButtonProps) {
  const isDisabled = disabled || loading

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      className={cn(
        'h-14 w-full flex-row items-center justify-center gap-2 rounded-full px-4 web:transition-colors',
        containerByVariant[variant],
        isDisabled && 'opacity-50',
        className,
      )}
    >
      {loading ? (
        <ActivityIndicator color={spinnerColorByVariant[variant]} />
      ) : (
        <>
          {leftIcon}
          <Text className={cn('font-nunito text-base font-bold', textByVariant[variant])}>{label}</Text>
        </>
      )}
    </Pressable>
  )
}
