import { Platform } from 'react-native'
import * as SecureStore from 'expo-secure-store'

/**
 * Persistencia del access token, cross-platform:
 *  - mobile (iOS/Android) → expo-secure-store
 *  - web → localStorage (SecureStore no existe en web)
 *
 * Si en el futuro el backend setea el token como cookie httpOnly en web, la
 * rama `web` queda como no-op y la sesión se restaura por la cookie + GET /me.
 */
const TOKEN_KEY = 'accessToken'

export async function saveToken(token: string): Promise<void> {
  if (Platform.OS === 'web') {
    localStorage.setItem(TOKEN_KEY, token)
    return
  }
  await SecureStore.setItemAsync(TOKEN_KEY, token)
}

export async function getToken(): Promise<string | null> {
  if (Platform.OS === 'web') {
    return localStorage.getItem(TOKEN_KEY)
  }
  return SecureStore.getItemAsync(TOKEN_KEY)
}

export async function removeToken(): Promise<void> {
  if (Platform.OS === 'web') {
    localStorage.removeItem(TOKEN_KEY)
    return
  }
  await SecureStore.deleteItemAsync(TOKEN_KEY)
}
