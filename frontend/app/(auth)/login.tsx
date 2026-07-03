import { useState } from 'react'
import { Text } from 'react-native'
import { AuthShell } from '@/src/components/features/auth/AuthShell'
import { LoginForm } from '@/src/components/features/auth/LoginForm'
import type { LoginValues } from '@/src/schemas/auth'
import { useLogin } from '@/src/hooks/features/auth/useLogin'
import { consumeFlashMessage } from '@/src/lib/flashMessage'
import { getApiErrorMessage } from '@/src/services/http'

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
    <AuthShell eyebrow="Inicia sesión en" title="CarpiSeñas">
      {info ? (
        <Text className="rounded-2xl bg-white px-4 py-3 text-center font-nunito text-sm font-bold text-secondary shadow-sm shadow-black/5">
          {info}
        </Text>
      ) : null}
      <LoginForm onSubmit={handleSubmit} submitting={login.isPending} serverError={serverError} />
    </AuthShell>
  )
}
