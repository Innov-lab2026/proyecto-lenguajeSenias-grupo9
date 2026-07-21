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

export async function uploadAvatar(dataUrl: string): Promise<Profile> {
  if (USE_MOCK_AUTH) return { ...MOCK_PROFILE, avatar_url: dataUrl }
  const { data } = await http.put<ProfileResponse>('/profile/avatar', { dataUrl })
  return data.data
}

export async function deleteAvatar(): Promise<Profile> {
  if (USE_MOCK_AUTH) return { ...MOCK_PROFILE, avatar_url: null }
  const { data } = await http.delete<ProfileResponse>('/profile/avatar')
  return data.data
}

export interface UpdateCredentialsPayload {
  currentPassword: string
  email?: string
  password?: string
}

export async function updateCredentials(payload: UpdateCredentialsPayload): Promise<void> {
  if (USE_MOCK_AUTH) return
  await http.patch('/auth/credentials', payload)
}
