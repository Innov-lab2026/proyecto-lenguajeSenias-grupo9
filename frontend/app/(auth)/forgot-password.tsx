import { useState } from 'react'
import { Pressable, Text, View } from 'react-native'
import { useRouter } from 'expo-router'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { forgotPasswordSchema, type ForgotPasswordValues } from '@/src/schemas/auth'
import { AuthShell } from '@/src/components/features/auth/AuthShell'
import { Button } from '@/src/components/common/Button'
import { TextField } from '@/src/components/common/TextField'

export default function ForgotPasswordScreen() {
  const router = useRouter()
  const [infoMessage, setInfoMessage] = useState<string | null>(null)

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: '' },
  })

  const submit = handleSubmit(() => {
    setInfoMessage(
      'Si el email está registrado, recibirás un correo con instrucciones para recuperar tu contraseña.',
    )
  })

  return (
    <AuthShell
      title="Recuperar contraseña"
      subtitle="Ingresa tu correo y te enviamos las instrucciones."
      titleLinksToHome
    >
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
            returnKeyType="go"
            onSubmitEditing={submit}
            submitBehavior="submit"
          />
        )}
      />

      {infoMessage ? (
        <Text className="rounded-2xl bg-white px-4 py-3 text-center font-nunito text-sm font-bold text-secondary shadow-sm shadow-black/5">
          {infoMessage}
        </Text>
      ) : null}

      <Button label="Recuperar contraseña" onPress={submit} className="mt-1" />

      <View className="flex-row items-center justify-center pt-1">
        <Pressable onPress={() => router.push('/login')} accessibilityRole="link">
          <Text className="font-nunito text-sm font-bold text-secondary">Volver a iniciar sesión</Text>
        </Pressable>
      </View>
    </AuthShell>
  )
}
