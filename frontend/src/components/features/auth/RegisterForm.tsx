import { useRef } from 'react'
import { Pressable, Text, View, type TextInput } from 'react-native'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { registerSchema, type RegisterValues } from '@/src/schemas/auth'
import { GENDER_VALUES, type Gender } from '@/src/types/auth'
import { formatDdMmYyyy } from '@/src/utils/date'
import { TextField } from '@/src/components/common/TextField'
import { Button } from '@/src/components/common/Button'
import { cn } from '@/src/utils/cn'

interface RegisterFormProps {
  onSubmit: (values: RegisterValues) => void
  submitting?: boolean
  /** Mensaje de error del backend a mostrar sobre el CTA. */
  serverError?: string | null
}

const GENDER_LABELS: Record<Gender, string> = {
  masculino: 'Masculino',
  femenino: 'Femenino',
  otro: 'Otro',
  prefiero_no_decir: 'Prefiero no decir',
}

function GenderField({
  value,
  onChange,
  error,
}: {
  value?: Gender
  onChange: (gender: Gender) => void
  error?: string
}) {
  return (
    <View className="w-full gap-1.5">
      <Text className="font-nunito text-xs font-bold uppercase tracking-wide text-muted">
        Género
      </Text>
      <View className="flex-row flex-wrap gap-2">
        {GENDER_VALUES.map((option) => {
          const selected = value === option
          return (
            <Pressable
              key={option}
              onPress={() => onChange(option)}
              accessibilityRole="radio"
              accessibilityState={{ selected }}
              className={cn(
                'rounded-full border px-4 py-2',
                selected ? 'border-secondary bg-accent' : 'border-muted/30 bg-surface',
              )}
            >
              <Text
                className={cn(
                  'font-nunito text-sm font-bold',
                  selected ? 'text-secondary' : 'text-muted',
                )}
              >
                {GENDER_LABELS[option]}
              </Text>
            </Pressable>
          )
        })}
      </View>
      {error ? <Text className="font-nunito text-xs font-bold text-red-500">{error}</Text> : null}
    </View>
  )
}

export function RegisterForm({ onSubmit, submitting = false, serverError }: RegisterFormProps) {
  const lastNameRef = useRef<TextInput>(null)
  const birthDateRef = useRef<TextInput>(null)
  const emailRef = useRef<TextInput>(null)
  const passwordRef = useRef<TextInput>(null)

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { firstName: '', lastName: '', birthDate: '', email: '', password: '' },
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
            placeholder="Tu nombre"
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
            placeholder="Tu apellido"
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
        name="birthDate"
        render={({ field: { onChange, onBlur, value } }) => (
          <TextField
            ref={birthDateRef}
            label="Fecha de nacimiento"
            placeholder="DD/MM/AAAA"
            value={value}
            onChangeText={(text) => onChange(formatDdMmYyyy(text))}
            onBlur={onBlur}
            error={errors.birthDate?.message}
            keyboardType="number-pad"
            maxLength={10}
            returnKeyType="next"
            onSubmitEditing={() => emailRef.current?.focus()}
            submitBehavior="submit"
          />
        )}
      />

      <Controller
        control={control}
        name="gender"
        render={({ field: { onChange, value } }) => (
          <GenderField value={value} onChange={onChange} error={errors.gender?.message} />
        )}
      />

      <Controller
        control={control}
        name="email"
        render={({ field: { onChange, onBlur, value } }) => (
          <TextField
            ref={emailRef}
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
            autoComplete="new-password"
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

      <Button label="Crear Cuenta" onPress={submit} loading={submitting} className="mt-2" />
    </View>
  )
}
