import { useState } from 'react'
import { Text, View } from 'react-native'
import { AuthShell } from '@/src/components/features/auth/AuthShell'
import { LoginForm } from '@/src/components/features/auth/LoginForm'
import type { LoginValues } from '@/src/schemas/auth'
import { useLogin } from '@/src/hooks/features/auth/useLogin'
import { consumeFlashMessage } from '@/src/lib/flashMessage'
import { getApiErrorMessage } from '@/src/services/http'
import { GoogleButton } from '@/src/components/features/auth/GoogleButton'
import { USE_MOCK_AUTH } from '@/src/constants/env'

export default function LoginScreen() {
  // Consume el flash (ej. "cuenta creada") una sola vez al montar. No usa la URL,
  // así que no reaparece al recargar ni al volver a esta ruta.
  const [info] = useState(() => consumeFlashMessage())

  const login = useLogin()

  const handleSubmit = (values: LoginValues, rememberMe: boolean) => {
    login.mutate({ payload: values, rememberMe })
  }

  const serverError = login.error ? getApiErrorMessage(login.error) : null

  return (
    <AuthShell eyebrow="Inicia sesión en" title="CarpiSeñas" titleLinksToHome>
      {info ? (
        <Text className="rounded-2xl bg-white px-4 py-3 text-center font-nunito text-sm font-bold text-secondary shadow-sm shadow-black/5">
          {info}
        </Text>
      ) : null}
      <LoginForm onSubmit={handleSubmit} submitting={login.isPending} serverError={serverError} />
      {USE_MOCK_AUTH ? null : (
        <>
          <View className="flex-row items-center gap-3">
            <View className="h-px flex-1 bg-ink/10" />
            <View className="h-1.5 w-1.5 rounded-full bg-ink/20" />
            <View className="h-px flex-1 bg-ink/10" />
          </View>
          <GoogleButton />
        </>
      )}
    </AuthShell>
  )
}
