import { forwardRef, useEffect, useState, type ReactNode } from 'react'
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
  /** Sólo alimenta accessibilityLabel: el nombre del campo se muestra como placeholder (sin label visible). */
  label: string
  error?: string
  /** Elemento dentro del input, alineado a la derecha (ej. ojo de mostrar contraseña, calendario). */
  rightElement?: ReactNode
}

// El borde/redondeo vive en el contenedor; el outline nativo del navegador se
// dibujaría sobre el TextInput interno y no coincide. Se quita y el foco se
// señala con el borde del contenedor.
const webNoOutline =
  Platform.OS === 'web' ? ({ outlineStyle: 'none' } as unknown as TextStyle) : undefined

const AUTOFILL_STYLE_ID = 'rn-textfield-autofill-fix'

/**
 * El navegador tiñe el fondo de los inputs autocompletados (esquinas
 * cuadradas, ignora el rounded-full del contenedor) y no se puede anular con
 * clases normales. Se inyecta CSS crudo una sola vez en <head>, sólo en web,
 * dentro de un efecto (nunca en carga de módulo, para no romper el export
 * estático) — evitamos tocar global.css porque NativeWind no soporta CSS
 * arbitrario ahí (ver nota de @font-face).
 */
function useAutofillFix() {
  useEffect(() => {
    if (Platform.OS !== 'web') return
    if (document.getElementById(AUTOFILL_STYLE_ID)) return

    const style = document.createElement('style')
    style.id = AUTOFILL_STYLE_ID
    style.textContent = `
      input:-webkit-autofill,
      input:-webkit-autofill:hover,
      input:-webkit-autofill:focus,
      input:-webkit-autofill:active {
        -webkit-box-shadow: 0 0 0px 1000px #FFFFFF inset !important;
        -webkit-text-fill-color: #1F2937 !important;
        caret-color: #1F2937;
        transition: background-color 9999s ease-in-out 0s;
      }
    `
    document.head.appendChild(style)
  }, [])
}

/**
 * Input estilo pill, sin label visible: el nombre del campo va como placeholder.
 * Pensado para integrarse con react-hook-form vía <Controller>.
 */
export const TextField = forwardRef<TextInput, TextFieldProps>(
  ({ label, error, rightElement, className, style, onFocus, onBlur, ...props }, ref) => {
    const [focused, setFocused] = useState(false)
    useAutofillFix()

    return (
      <View className="w-full gap-1.5">
        <View
          className={cn(
            'h-14 w-full flex-row items-center overflow-hidden rounded-full border bg-surface px-5 shadow-sm shadow-black/5',
            error ? 'border-red-400' : focused ? 'border-secondary' : 'border-transparent',
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
          <Text className="px-2 font-nunito text-xs font-bold text-red-500">{error}</Text>
        ) : null}
      </View>
    )
  },
)

TextField.displayName = 'TextField'
