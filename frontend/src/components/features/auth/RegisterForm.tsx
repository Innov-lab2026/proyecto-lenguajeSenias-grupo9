import { useRef, useState } from 'react'
import { Pressable, Text, View } from 'react-native'
import type { TextInput as NativeTextInput } from 'react-native'
import { useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { registerSchema, type RegisterValues } from '@/src/schemas/auth'
import { GENDER_OPTIONS } from '@/src/constants/gender'
import { COUNTRY_OPTIONS } from '@/src/constants/countries'
import { TextField } from '@/src/components/common/TextField'
import { Select } from '@/src/components/common/Select'
import { Button } from '@/src/components/common/Button'
import { BirthDateField } from './BirthDateField'

interface RegisterFormProps {
  onSubmit: (values: RegisterValues) => void
  submitting?: boolean
  /** Mensaje de error del backend a mostrar sobre el CTA. */
  serverError?: string | null
}

export function RegisterForm({ onSubmit, submitting = false, serverError }: RegisterFormProps) {
  const router = useRouter()
  const lastNameRef = useRef<NativeTextInput>(null)
  const birthDateRef = useRef<NativeTextInput>(null)
  const emailRef = useRef<NativeTextInput>(null)
  const passwordRef = useRef<NativeTextInput>(null)
  const confirmPasswordRef = useRef<NativeTextInput>(null)

  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      birthDate: '',
      gender: undefined,
      country: undefined,
      email: '',
      password: '',
      confirmPassword: '',
    },
  })

  const submit = handleSubmit(onSubmit)

  return (
    <View className="w-full gap-4">
      <Controller
        control={control}
        name="firstName"
        render={({ field: { onChange, onBlur, value } }) => (
          <TextField
            label="Nombre"
            placeholder="Nombre"
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            error={errors.firstName?.message}
            autoComplete="given-name"
            textContentType="givenName"
            returnKeyType="next"
            onSubmitEditing={() => lastNameRef.current?.focus()}
            submitBehavior="submit"
          />
        )}
      />

      <Controller
        control={control}
        name="lastName"
        render={({ field: { onChange, onBlur, value } }) => (
          <TextField
            ref={lastNameRef}
            label="Apellido"
            placeholder="Apellido"
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            error={errors.lastName?.message}
            autoComplete="family-name"
            textContentType="familyName"
            returnKeyType="next"
            onSubmitEditing={() => birthDateRef.current?.focus()}
            submitBehavior="submit"
          />
        )}
      />

      <Controller
        control={control}
        name="gender"
        render={({ field: { onChange, value } }) => (
          <Select
            label="Género"
            placeholder="Género"
            options={GENDER_OPTIONS}
            value={value}
            onChange={onChange}
            error={errors.gender?.message}
          />
        )}
      />

      <Controller
        control={control}
        name="birthDate"
        render={({ field: { onChange, onBlur, value } }) => (
          <BirthDateField
            ref={birthDateRef}
            value={value}
            onChange={onChange}
            onBlur={onBlur}
            error={errors.birthDate?.message}
            onSubmitEditing={() => emailRef.current?.focus()}
          />
        )}
      />

      <Controller
        control={control}
        name="country"
        render={({ field: { onChange, value } }) => (
          <Select
            label="País"
            placeholder="País"
            options={COUNTRY_OPTIONS}
            value={value}
            onChange={onChange}
            error={errors.country?.message}
            searchable
            searchPlaceholder="Buscar país..."
          />
        )}
      />

      <Controller
        control={control}
        name="email"
        render={({ field: { onChange, onBlur, value } }) => (
          <TextField
            ref={emailRef}
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
            autoComplete="new-password"
            returnKeyType="next"
            onSubmitEditing={() => confirmPasswordRef.current?.focus()}
          />
        )}
      />

      <Controller
        control={control}
        name="confirmPassword"
        render={({ field: { onChange, onBlur, value } }) => (
          <TextField
            ref={confirmPasswordRef}
            label="Confirmar contraseña"
            placeholder="Confirmar contraseña"
            rightElement={
              <Pressable
                onPress={() => setShowConfirmPassword((s) => !s)}
                accessibilityRole="button"
                accessibilityLabel={showConfirmPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                hitSlop={8}
              >
                <Ionicons
                  name={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'}
                  size={20}
                  color="#6F706F"
                />
              </Pressable>
            }
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            error={errors.confirmPassword?.message}
            secureTextEntry={!showConfirmPassword}
            autoCapitalize="none"
            autoComplete="new-password"
            returnKeyType="go"
            onSubmitEditing={submit}
          />
        )}
      />

      {serverError ? (
        <Text className="text-center font-nunito text-sm font-bold text-red-500">{serverError}</Text>
      ) : null}

      <Button label="Crear cuenta" onPress={submit} loading={submitting} className="mt-2" />

      <View className="flex-row items-center justify-center gap-1 pt-1">
        <Text className="font-nunito text-sm font-normal text-ink/80">¿Ya tienes cuenta?</Text>
        <Pressable onPress={() => router.push('/login')} accessibilityRole="link">
          <Text className="font-nunito text-sm font-bold text-secondary">Inicia sesión</Text>
        </Pressable>
      </View>
    </View>
  )
}
