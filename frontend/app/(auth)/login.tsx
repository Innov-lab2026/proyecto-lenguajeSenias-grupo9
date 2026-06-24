import { useState } from 'react'
import { KeyboardAvoidingView, ScrollView } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { AuthCard, type AuthMode } from '@/src/components/features/auth/AuthCard'
import type { LoginValues, RegisterValues } from '@/src/schemas/auth'
import { useLogin } from '@/src/hooks/features/auth/useLogin'
import { useRegister } from '@/src/hooks/features/auth/useRegister'
import { getApiErrorMessage } from '@/src/services/http'

export default function AuthScreen() {
  const [mode, setMode] = useState<AuthMode>('login')
  const [info, setInfo] = useState<string | null>(null)

  const login = useLogin()
  const register = useRegister()

  const submitting = mode === 'login' ? login.isPending : register.isPending
  const activeError = mode === 'login' ? login.error : register.error
  const serverError = activeError ? getApiErrorMessage(activeError) : null

  const handleModeChange = (next: AuthMode) => {
    setMode(next)
    setInfo(null)
    login.reset()
    register.reset()
  }

  const handleLogin = (values: LoginValues, rememberMe: boolean) => {
    setInfo(null)
    login.mutate({ payload: values, rememberMe })
  }

  const handleRegister = (values: RegisterValues) => {
    setInfo(null)
    register.mutate(values, {
      onSuccess: (data) => {
        // Sin auto-login: volvemos a login y mostramos el aviso de confirmación.
        setMode('login')
        setInfo(data.message)
      },
    })
  }

  return (
    <SafeAreaView className="flex-1 bg-background">
      {/* "padding" también en Android: con edge-to-edge (SDK 54) la ventana ya no
          se redimensiona sola y el teclado tapaba los inputs inferiores. */}
      <KeyboardAvoidingView className="flex-1" behavior="padding">
        <ScrollView
          contentContainerClassName="flex-grow justify-center px-5 py-8"
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <AuthCard
            mode={mode}
            onModeChange={handleModeChange}
            onLogin={handleLogin}
            onRegister={handleRegister}
            submitting={submitting}
            serverError={serverError}
            infoMessage={info}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}
