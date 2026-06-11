import { http } from './http'
import { ddMmYyyyToIso } from '@/src/utils/date'
import type { RegisterValues } from '@/src/schemas/auth'
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
 * Mapea los valores del formulario de registro al formato del endpoint.
 * `full_name` se mantiene por compatibilidad con el backend actual.
 */
export function toRegisterRequest(values: RegisterValues): RegisterRequest {
  const firstName = values.firstName.trim()
  const lastName = values.lastName.trim()
  return {
    email: values.email,
    password: values.password,
    first_name: firstName,
    last_name: lastName,
    birth_date: ddMmYyyyToIso(values.birthDate),
    gender: values.gender,
    full_name: `${firstName} ${lastName}`,
  }
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
        user_metadata: { full_name: payload.full_name },
      },
    }
  }

  const { data } = await http.post<RegisterResponse>('/auth/register', payload)
  return data
}

// TODO(backend): me() y logout() cuando existan los endpoints (/api/auth/me, /logout).
// TODO(backend): recupero de contraseña (UI de referencia en local/desing/recover_password.png).
