import 'react-native-url-polyfill/auto'
import { createClient } from '@supabase/supabase-js'
import { getItem, setItem, deleteItem } from './storage'

/**
 * Cliente de Supabase, usado únicamente para el flujo OAuth de Google
 * (ver hooks/features/auth/useGoogleAuth.ts).
 *
 * No persiste su propia sesión (`persistSession: false`): el access_token que
 * devuelve se guarda con el mismo mecanismo que el login por email
 * (sessionStore + lib/storage), evitando duplicar el manejo de sesión.
 * El `storage` configurado acá lo usa supabase-js únicamente para el
 * code_verifier de PKCE durante el intercambio del código (un valor chico,
 * no la sesión completa, por eso no choca con el límite de SecureStore).
 */
export const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL!,
  process.env.EXPO_PUBLIC_SUPABASE_KEY!,
  {
    auth: {
      flowType: 'pkce',
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
      storage: { getItem, setItem, removeItem: deleteItem },
    },
  },
)
