import { http } from './http'
import type {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
} from '@/src/types/auth'

/**
 * Capa mock conmutable para desarrollar sin backend.
 * Se activa con EXPO_PUBLIC_USE_MOCK_AUTH=true en el .env.
 */
const USE_MOCK = process.env.EXPO_PUBLIC_USE_MOCK_AUTH === 'true'

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

/**
 * Workaround temporal: el backend actual exige `full_name`. La UI sólo envía
 * email + password (decisión de diseño), así que derivamos un nombre del email.
 * TODO(backend): hacer `full_name` opcional y quitar esto.
 */
function withFullNameFallback(payload: RegisterRequest): RegisterRequest {
  if (payload.full_name) return payload
  const derived = payload.email.split('@')[0]
  return { ...payload, full_name: derived }
}

export async function login(payload: LoginRequest): Promise<LoginResponse> {
  if (USE_MOCK) {
    await delay(600)
    return {
      message: 'Login exitoso (mock)',
      token: 'mock-access-token',
      user: {
        id: 'mock-user-id',
        email: payload.email,
        user_metadata: { full_name: payload.email.split('@')[0] },
      },
    }
  }

  const { data } = await http.post<LoginResponse>('/auth/login', payload)
  return data
}

export async function register(payload: RegisterRequest): Promise<RegisterResponse> {
  if (USE_MOCK) {
    await delay(600)
    return {
      message: 'Usuario registrado (mock). Revisá tu correo para confirmar.',
      user: {
        id: 'mock-user-id',
        email: payload.email,
        user_metadata: { full_name: payload.email.split('@')[0] },
      },
    }
  }

  const { data } = await http.post<RegisterResponse>(
    '/auth/register',
    withFullNameFallback(payload),
  )
  return data
}

// TODO(backend): me() y logout() cuando existan los endpoints (/api/auth/me, /logout).
