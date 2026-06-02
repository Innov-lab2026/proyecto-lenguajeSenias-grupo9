import { Pressable, Text, View } from 'react-native'
import type { LoginValues } from '@/src/schemas/auth'
import { cn } from '@/src/utils/cn'
import { AuthForm, type AuthMode } from './AuthForm'
import { GoogleButton } from './GoogleButton'

interface AuthCardProps {
  mode: AuthMode
  onModeChange: (mode: AuthMode) => void
  onSubmit: (mode: AuthMode, values: LoginValues) => void
  submitting?: boolean
  /** Error del backend a mostrar sobre el CTA. */
  serverError?: string | null
  /** Mensaje informativo (ej. "revisá tu correo para confirmar tu cuenta"). */
  infoMessage?: string | null
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
 * Componente controlado: el `mode` lo maneja el consumidor.
 * Mobile-first: ocupa el ancho disponible y se limita a `max-w-md` centrada en web.
 */
export function AuthCard({
  mode,
  onModeChange,
  onSubmit,
  submitting,
  serverError,
  infoMessage,
}: AuthCardProps) {
  return (
    <View className="w-full max-w-md self-center rounded-2xl bg-surface p-6 shadow-sm">
      {/* Tabs */}
      <View className="mb-6 flex-row gap-8">
        <Tab label="Crear Cuenta" active={mode === 'register'} onPress={() => onModeChange('register')} />
        <Tab label="Iniciar Sesión" active={mode === 'login'} onPress={() => onModeChange('login')} />
      </View>

      {infoMessage ? (
        <View className="mb-4 rounded-xl bg-accent p-3">
          <Text className="text-center text-sm text-secondary">{infoMessage}</Text>
        </View>
      ) : null}

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

      {/* Formulario (se reinicia al cambiar de modo) */}
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
