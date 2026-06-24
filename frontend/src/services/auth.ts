import { http } from './http'
import { ddMmYyyyToIso } from '@/src/utils/date'
import { GENDER_API_VALUE } from '@/src/types/auth'
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

/** Mapea los valores del formulario de registro al body del endpoint. */
export function toRegisterRequest(values: RegisterValues): RegisterRequest {
  return {
    email: values.email,
    password: values.password,
    first_name: values.firstName.trim(),
    last_name: values.lastName.trim(),
    birth_date: ddMmYyyyToIso(values.birthDate),
    gender: GENDER_API_VALUE[values.gender],
  }
}

export async function login(payload: LoginRequest): Promise<LoginResponse> {
  if (USE_MOCK) {
    await delay(600)
    return {
      message: 'Login exitoso (mock)',
      user: {
        id: 'mock-user-id',
        email: payload.email,
        first_name: 'Demo',
        last_name: 'User',
      },
      session: {
        access_token: 'mock-access-token',
        expires_in: 3600,
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
        first_name: payload.first_name,
        last_name: payload.last_name,
      },
    }
  }

  const { data } = await http.post<RegisterResponse>('/auth/register', payload)
  return data
}

// TODO(backend): me() y logout() cuando existan los endpoints (/api/auth/me, /logout).
// TODO(backend): recupero de contraseña (UI de referencia en local/desing/recover_password.png).
