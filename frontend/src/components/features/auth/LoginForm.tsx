import { useRef, useState } from 'react'
import { Pressable, Text, View, type TextInput } from 'react-native'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Ionicons } from '@expo/vector-icons'
import { loginSchema, type LoginValues } from '@/src/schemas/auth'
import { TextField } from '@/src/components/common/TextField'
import { Button } from '@/src/components/common/Button'
import { Checkbox } from '@/src/components/common/Checkbox'
import { showComingSoon } from './comingSoon'

interface LoginFormProps {
  onSubmit: (values: LoginValues, rememberMe: boolean) => void
  submitting?: boolean
  /** Mensaje de error del backend a mostrar sobre el CTA. */
  serverError?: string | null
}

export function LoginForm({ onSubmit, submitting = false, serverError }: LoginFormProps) {
  const passwordRef = useRef<TextInput>(null)
  const [rememberMe, setRememberMe] = useState(true)
  const [showPassword, setShowPassword] = useState(false)

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  })

  const submit = handleSubmit((values) => onSubmit(values, rememberMe))

  const onForgotPassword = () => {
    // TODO: flujo de recupero de contraseña (UI de referencia en local/desing/recover_password.png).
    showComingSoon('La recuperación de contraseña estará disponible pronto.')
  }

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
            labelRight={
              <Pressable onPress={onForgotPassword} accessibilityRole="link" hitSlop={8}>
                <Text className="font-nunito text-xs font-bold text-secondary">
                  Olvidaste tu contraseña?
                </Text>
              </Pressable>
            }
            rightElement={
              <Pressable
                onPress={() => setShowPassword((s) => !s)}
                accessibilityRole="button"
                accessibilityLabel={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                hitSlop={8}
              >
                <Ionicons
                  name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                  size={20}
                  color="#6F706F"
                />
              </Pressable>
            }
            placeholder="Mínimo 8 caracteres"
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            error={errors.password?.message}
            secureTextEntry={!showPassword}
            autoCapitalize="none"
            autoComplete="current-password"
            returnKeyType="go"
            onSubmitEditing={submit}
          />
        )}
      />

      {serverError ? (
        <Text className="text-center font-nunito text-sm font-bold text-red-500">
          {serverError}
        </Text>
      ) : null}

      <Checkbox label="Recordarme en este equipo" checked={rememberMe} onChange={setRememberMe} />

      <Button label="Iniciar Sesión" onPress={submit} loading={submitting} className="mt-2" />
    </View>
  )
}
