import { Alert, Platform } from 'react-native'
import { Button } from '@/src/components/common/Button'
import { GoogleIcon } from './GoogleIcon'

/**
 * Botón "Continuar con Google".
 * Stub por ahora: el flujo OAuth real depende de la estrategia y los client IDs
 * que defina el backend (ver §12 del plan).
 */
export function GoogleButton() {
  const onPress = () => {
    // TODO(backend): integrar OAuth (id_token/PKCE) + client IDs web/iOS/Android.
    const title = 'Próximamente'
    const message = 'El inicio de sesión con Google estará disponible pronto.'
    if (Platform.OS === 'web') {
      // Alert.alert es no-op en web → usamos el alert del navegador.
      ;(globalThis as { alert?: (msg: string) => void }).alert?.(`${title}\n\n${message}`)
    } else {
      Alert.alert(title, message)
    }
  }

  return (
    <Button
      label="Continuar con Google"
      variant="ghost"
      onPress={onPress}
      leftIcon={<GoogleIcon size={20} />}
    />
  )
}
