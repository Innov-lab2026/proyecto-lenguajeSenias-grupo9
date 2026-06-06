import { useRef } from 'react'
import { Text, View, type TextInput } from 'react-native'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { loginSchema, type LoginValues } from '@/src/schemas/auth'
import { TextField } from '@/src/components/common/TextField'
import { Button } from '@/src/components/common/Button'

export type AuthMode = 'login' | 'register'

interface AuthFormProps {
  mode: AuthMode
  onSubmit: (values: LoginValues) => void
  submitting?: boolean
  /** Mensaje de error del backend a mostrar sobre el CTA. */
  serverError?: string | null
}

const ctaLabel: Record<AuthMode, string> = {
  login: 'Iniciar Sesión',
  register: 'Crear Cuenta Gratis',
}

/**
 * Formulario presentacional de auth (login/registro comparten campos).
 * Valida con react-hook-form + Zod y delega el submit en `onSubmit`.
 * El cableado con los hooks de mutación/navegación se hace en el consumidor.
 */
export function AuthForm({ mode, onSubmit, submitting = false, serverError }: AuthFormProps) {
  const passwordRef = useRef<TextInput>(null)

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  })

  return (
    <View className="w-full gap-4">
      <Controller
        control={control}
        name="email"
        render={({ field: { onChange, onBlur, value } }) => (
          <TextField
            label="Correo electrónico"
            placeholder="ejemplo@correo.com"
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            error={errors.email?.message}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            textContentType="emailAddress"
            returnKeyType="next"
            onSubmitEditing={() => passwordRef.current?.focus()}
            submitBehavior="submit"
          />
        )}
      />

      <Controller
        control={control}
        name="password"
        render={({ field: { onChange, onBlur, value } }) => (
          <TextField
            ref={passwordRef}
            label="Contraseña"
            placeholder="Mínimo 8 caracteres"
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            error={errors.password?.message}
            secureTextEntry
            autoCapitalize="none"
            autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
            returnKeyType="go"
            onSubmitEditing={handleSubmit(onSubmit)}
          />
        )}
      />

      {serverError ? (
        <Text className="text-center text-sm text-red-500">{serverError}</Text>
      ) : null}

      <Button
        label={ctaLabel[mode]}
        onPress={handleSubmit(onSubmit)}
        loading={submitting}
        className="mt-2"
      />
    </View>
  )
}
