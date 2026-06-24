import { forwardRef, useState, type ReactNode } from 'react'
import {
  Platform,
  Text,
  TextInput,
  View,
  type TextInputProps,
  type TextStyle,
} from 'react-native'
import { cn } from '@/src/utils/cn'

interface TextFieldProps extends TextInputProps {
  label: string
  error?: string
  /** Elemento a la derecha del label (ej. link "Olvidaste tu contraseña?"). */
  labelRight?: ReactNode
  /** Elemento dentro del input, alineado a la derecha (ej. ojo de mostrar contraseña). */
  rightElement?: ReactNode
}

// El borde/redondeo vive en el contenedor; el outline nativo del navegador se
// dibujaría sobre el TextInput interno y no coincide. Se quita y el foco se
// señala con el borde del contenedor.
const webNoOutline =
  Platform.OS === 'web' ? ({ outlineStyle: 'none' } as unknown as TextStyle) : undefined

/**
 * Input con label en mayúsculas (estilo del diseño) y mensaje de error debajo.
 * Pensado para integrarse con react-hook-form vía <Controller>.
 */
export const TextField = forwardRef<TextInput, TextFieldProps>(
  ({ label, error, labelRight, rightElement, className, style, onFocus, onBlur, ...props }, ref) => {
    const [focused, setFocused] = useState(false)

    return (
      <View className="w-full gap-1.5">
        <View className="flex-row items-end justify-between">
          <Text className="font-nunito text-xs font-bold uppercase tracking-wide text-muted">
            {label}
          </Text>
          {labelRight}
        </View>
        <View
          className={cn(
            'h-14 w-full flex-row items-center rounded-xl border bg-surface px-4',
            error ? 'border-red-400' : focused ? 'border-secondary' : 'border-muted/30',
          )}
        >
          <TextInput
            ref={ref}
            accessibilityLabel={label}
            placeholderTextColor="#6F706F"
            className={cn('h-full flex-1 font-nunito text-base font-bold text-ink', className)}
            style={[webNoOutline, style]}
            onFocus={(e) => {
              setFocused(true)
              onFocus?.(e)
            }}
            onBlur={(e) => {
              setFocused(false)
              onBlur?.(e)
            }}
            {...props}
          />
          {rightElement}
        </View>
        {error ? (
          <Text className="font-nunito text-xs font-bold text-red-500">{error}</Text>
        ) : null}
      </View>
    )
  },
)

TextField.displayName = 'TextField'
