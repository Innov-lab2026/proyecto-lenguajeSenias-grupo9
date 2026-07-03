import { http } from './http'
import { USE_MOCK_AUTH } from '@/src/constants/env'
import type { Profile } from '@/src/types/profile'

/** Perfil de prueba (completo) para el modo mock. */
const MOCK_PROFILE: Profile = {
  id: 'mock-user-id',
  full_name: 'Demo User',
  birth_date: '1990-01-01',
  gender: 'Otro',
  country: 'Argentina',
  avatar_url: null,
}

interface ProfileResponse {
  message: string
  data: Profile
}

export interface UpdateProfilePayload {
  full_name?: string
  birth_date?: string
  gender?: string
  country?: string
  avatar_url?: string
}

export async function getProfile(): Promise<Profile> {
  if (USE_MOCK_AUTH) {
    return MOCK_PROFILE
  }

  const { data } = await http.get<ProfileResponse>('/profile')
  return data.data
}

export async function updateProfile(payload: UpdateProfilePayload): Promise<Profile> {
  if (USE_MOCK_AUTH) {
    return { ...MOCK_PROFILE, ...payload }
  }

  const { data } = await http.patch<ProfileResponse>('/profile', payload)
  return data.data
}
