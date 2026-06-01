import { useState } from 'react'
import { Pressable, Text, View } from 'react-native'
import type { LoginValues } from '@/src/schemas/auth'
import { cn } from '@/src/utils/cn'
import { AuthForm, type AuthMode } from './AuthForm'
import { GoogleButton } from './GoogleButton'

interface AuthCardProps {
  initialMode?: AuthMode
  onSubmit: (mode: AuthMode, values: LoginValues) => void
  submitting?: boolean
  serverError?: string | null
  onModeChange?: (mode: AuthMode) => void
}

function Tab({
  label,
  active,
  onPress,
}: {
  label: string
  active: boolean
  onPress: () => void
}) {
  return (
    <Pressable onPress={onPress} className="items-center gap-1" accessibilityRole="tab">
      <Text className={cn('text-base font-bold', active ? 'text-secondary' : 'text-muted')}>
        {label}
      </Text>
      <View className={cn('h-0.5 w-full rounded-full', active ? 'bg-secondary' : 'bg-transparent')} />
    </Pressable>
  )
}

/**
 * Tarjeta de autenticación con tabs (Crear Cuenta / Iniciar Sesión).
 * Mobile-first: ocupa el ancho disponible y se limita a `max-w-md` centrada en web.
 */
export function AuthCard({
  initialMode = 'login',
  onSubmit,
  submitting,
  serverError,
  onModeChange,
}: AuthCardProps) {
  const [mode, setMode] = useState<AuthMode>(initialMode)

  const changeMode = (next: AuthMode) => {
    if (next === mode) return
    setMode(next)
    onModeChange?.(next)
  }

  return (
    <View className="w-full max-w-md self-center rounded-2xl bg-surface p-6 shadow-sm">
      {/* Tabs */}
      <View className="mb-6 flex-row gap-8">
        <Tab label="Crear Cuenta" active={mode === 'register'} onPress={() => changeMode('register')} />
        <Tab label="Iniciar Sesión" active={mode === 'login'} onPress={() => changeMode('login')} />
      </View>

      {/* Google */}
      <GoogleButton />

      {/* Divisor */}
      <View className="my-5 flex-row items-center gap-3">
        <View className="h-px flex-1 bg-muted/20" />
        <Text className="text-xs font-semibold uppercase tracking-wide text-muted">
          O utiliza tu email
        </Text>
        <View className="h-px flex-1 bg-muted/20" />
      </View>

      {/* Formulario */}
      <AuthForm
        key={mode}
        mode={mode}
        onSubmit={(values) => onSubmit(mode, values)}
        submitting={submitting}
        serverError={serverError}
      />

      {/* Footer términos */}
      <Text className="mt-5 text-center text-xs text-muted">
        Al registrarte, confirmas tu aceptación de los Términos de Servicio de LSAprende!.
      </Text>
    </View>
  )
}
