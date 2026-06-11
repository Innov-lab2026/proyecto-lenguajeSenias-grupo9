import { Alert, Platform } from 'react-native'

/** Aviso "Próximamente" cross-platform (Alert.alert es no-op en web). */
export function showComingSoon(message: string) {
  const title = 'Próximamente'
  if (Platform.OS === 'web') {
    ;(globalThis as { alert?: (msg: string) => void }).alert?.(`${title}\n\n${message}`)
  } else {
    Alert.alert(title, message)
  }
}
