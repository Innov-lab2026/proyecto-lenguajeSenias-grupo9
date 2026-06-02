import { useState } from 'react'
import { View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { AuthCard } from '@/src/components/features/auth/AuthCard'
import type { AuthMode } from '@/src/components/features/auth/AuthForm'
import type { LoginValues } from '@/src/schemas/auth'
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

  const handleSubmit = (submittedMode: AuthMode, values: LoginValues) => {
    setInfo(null)
    if (submittedMode === 'login') {
      login.mutate(values)
      return
    }
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
      <View className="flex-1 justify-center px-5">
        <AuthCard
          mode={mode}
          onModeChange={handleModeChange}
          onSubmit={handleSubmit}
          submitting={submitting}
          serverError={serverError}
          infoMessage={info}
        />
      </View>
    </SafeAreaView>
  )
}
