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
  const router = useRouter()

  const onForgotPassword = () => {
    router.push('/forgot-password')
  }

  return (
    <View className="w-full">
      <View className="mx-auto w-full max-w-md overflow-hidden rounded-[2rem] bg-white shadow-sm shadow-secondary/10">
        <View className="bg-secondary px-6 py-6 sm:px-8 sm:py-8">
          <Text className="font-nunito text-3xl font-bold text-white">Iniciar sesión</Text>
          <Text className="mt-2 text-sm font-normal leading-relaxed text-white/90">
            Accede a Carpiseñas y continúa tu camino de aprendizaje de LSA.
          </Text>
        </View>

        <View className="bg-accent px-5 py-6 sm:px-6 sm:py-8">
          <View className="rounded-[2rem] bg-white p-5 shadow-sm shadow-secondary/10 sm:p-6">
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
                        <Text className="font-nunito text-xs font-bold text-secondary">Olvidaste tu contraseña?</Text>
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
            </View>

            {serverError ? (
              <Text className="mt-3 text-center font-nunito text-sm font-bold text-red-500">{serverError}</Text>
            ) : null}

            <View className="mt-4">
              <Checkbox label="Recordarme en este equipo" checked={rememberMe} onChange={setRememberMe} />
            </View>

            <Button label="Iniciar sesión" onPress={submit} loading={submitting} className="mt-5" />
          </View>
        </View>

      </View>
    </View>
  )
}
