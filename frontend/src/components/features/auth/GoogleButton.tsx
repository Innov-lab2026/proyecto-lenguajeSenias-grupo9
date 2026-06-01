import { Alert } from 'react-native'
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
    Alert.alert('Próximamente', 'El inicio de sesión con Google estará disponible pronto.')
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
