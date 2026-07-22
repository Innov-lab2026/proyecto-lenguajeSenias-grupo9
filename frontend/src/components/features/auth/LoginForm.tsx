import { useRef, useState } from 'react'
import { Pressable, Text, View, type TextInput } from 'react-native'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Ionicons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import { loginSchema, type LoginValues } from '@/src/schemas/auth'
import { TextField } from '@/src/components/common/TextField'
import { Button } from '@/src/components/common/Button'
import { Checkbox } from '@/src/components/common/Checkbox'

interface LoginFormProps {
  onSubmit: (values: LoginValues, rememberMe: boolean) => void
  submitting?: boolean
  /** Mensaje de error del backend a mostrar sobre el CTA. */
  serverError?: string | null
}

export function LoginForm({ onSubmit, submitting = false, serverError }: LoginFormProps) {
  const router = useRouter()
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

  return (
    <View className="w-full gap-4">
      <Controller
        control={control}
        name="email"
        render={({ field: { onChange, onBlur, value } }) => (
          <TextField
            label="Correo electrónico"
            placeholder="Correo electrónico"
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

      <View className="gap-1.5">
        <Controller
          control={control}
          name="password"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextField
              ref={passwordRef}
              label="Contraseña"
              placeholder="Contraseña"
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

        <Pressable
          onPress={() => router.push('/forgot-password')}
          accessibilityRole="link"
          hitSlop={8}
          className="self-end"
        >
          <Text className="font-nunito text-xs font-bold text-secondary">Olvidaste tu contraseña?</Text>
        </Pressable>
      </View>

      {serverError ? (
        <Text className="text-center font-nunito text-sm font-bold text-red-500">{serverError}</Text>
      ) : null}

      <Checkbox label="Recordarme en este equipo" checked={rememberMe} onChange={setRememberMe} />

      <Button label="Iniciar sesión" onPress={submit} loading={submitting} className="mt-1" />

      <View className="flex-row items-center justify-center gap-1 pt-1">
        <Text className="font-nunito text-sm font-normal text-ink/80">¿No tenés cuenta?</Text>
        <Pressable onPress={() => router.push('/pre-register')} accessibilityRole="link">
          <Text className="font-nunito text-sm font-bold text-secondary">Regístrate</Text>
        </Pressable>
      </View>
    </View>
  )
}
