import type { ReactNode } from 'react'
import { ActivityIndicator, Pressable, Text } from 'react-native'
import { cn } from '@/src/utils/cn'

type Variant = 'primary' | 'ghost'

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
  primary: 'bg-primary',
  ghost: 'bg-surface border border-muted/30',
}

const textByVariant: Record<Variant, string> = {
  primary: 'text-ink',
  ghost: 'text-ink',
}

// Color del spinner por variante (ActivityIndicator no acepta className).
const spinnerColorByVariant: Record<Variant, string> = {
  primary: '#3E3D3B', // ink
  ghost: '#0581C3', // secondary
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
        'h-14 w-full flex-row items-center justify-center rounded-xl px-4',
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
          <Text className={cn('text-base font-bold', textByVariant[variant])}>{label}</Text>
        </>
      )}
    </Pressable>
  )
}
