import { Pressable, Text, View } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { cn } from '@/src/utils/cn'

interface CheckboxProps {
  label: string
  checked: boolean
  onChange: (checked: boolean) => void
  className?: string
}

export function Checkbox({ label, checked, onChange, className }: CheckboxProps) {
  return (
    <Pressable
      onPress={() => onChange(!checked)}
      accessibilityRole="checkbox"
      accessibilityState={{ checked }}
      className={cn('flex-row items-center gap-2', className)}
    >
      <View
        className={cn(
          'h-6 w-6 items-center justify-center rounded-md border',
          checked ? 'border-ink bg-ink' : 'border-muted/40 bg-surface',
        )}
      >
        {checked ? <Ionicons name="checkmark" size={16} color="#FFFFFF" /> : null}
      </View>
      <Text className="font-nunito text-sm font-bold text-ink">{label}</Text>
    </Pressable>
  )
}
