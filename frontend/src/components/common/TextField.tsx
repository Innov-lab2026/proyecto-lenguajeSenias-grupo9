import { forwardRef } from 'react'
import { Text, TextInput, View, type TextInputProps } from 'react-native'
import { cn } from '@/src/utils/cn'

interface TextFieldProps extends TextInputProps {
  label: string
  error?: string
}

/**
 * Input con label en mayúsculas (estilo del diseño) y mensaje de error debajo.
 * Pensado para integrarse con react-hook-form vía <Controller>.
 */
export const TextField = forwardRef<TextInput, TextFieldProps>(
  ({ label, error, className, ...props }, ref) => {
    return (
      <View className="w-full gap-1.5">
        <Text className="text-xs font-semibold uppercase tracking-wide text-muted">
          {label}
        </Text>
        <TextInput
          ref={ref}
          placeholderTextColor="#6F706F"
          className={cn(
            'h-14 rounded-xl border bg-surface px-4 text-base text-ink',
            error ? 'border-red-400' : 'border-muted/30',
            className,
          )}
          {...props}
        />
        {error ? <Text className="text-xs text-red-500">{error}</Text> : null}
      </View>
    )
  },
)

TextField.displayName = 'TextField'
