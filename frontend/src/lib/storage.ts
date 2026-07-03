import { Platform } from 'react-native'
import * as SecureStore from 'expo-secure-store'
import type { User } from '@/src/types/user'

/**
 * Persistencia de la sesión, cross-platform:
 *  - mobile (iOS/Android) → expo-secure-store
 *  - web → localStorage (SecureStore no existe en web)
 *
 * Guardamos token + user porque no hay endpoint GET /me todavía: al reabrir la
 * app necesitamos el user para hidratar la sesión sin pedirlo al backend.
 * Si en el futuro hay cookie httpOnly (web) o /me, esto se simplifica.
 */
const TOKEN_KEY = 'accessToken'
const USER_KEY = 'sessionUser'

/**
 * Helpers de bajo nivel (exportados para reusarlos como storage adapter de
 * Supabase en `lib/supabase.ts`, ya que ahí sólo se persiste el code_verifier
 * de PKCE, un valor chico que no choca con el límite de SecureStore).
 */
export async function setItem(key: string, value: string): Promise<void> {
  if (Platform.OS === 'web') {
    localStorage.setItem(key, value)
    return
  }
  await SecureStore.setItemAsync(key, value)
}

export async function getItem(key: string): Promise<string | null> {
  if (Platform.OS === 'web') {
    return localStorage.getItem(key)
  }
  return SecureStore.getItemAsync(key)
}

export async function deleteItem(key: string): Promise<void> {
  if (Platform.OS === 'web') {
    localStorage.removeItem(key)
    return
  }
  await SecureStore.deleteItemAsync(key)
}

export const saveToken = (token: string) => setItem(TOKEN_KEY, token)
export const getToken = () => getItem(TOKEN_KEY)
export const removeToken = () => deleteItem(TOKEN_KEY)

export const saveUser = (user: User) => setItem(USER_KEY, JSON.stringify(user))

export async function getUser(): Promise<User | null> {
  const raw = await getItem(USER_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw) as User
  } catch {
    return null
  }
}

export const removeUser = () => deleteItem(USER_KEY)
