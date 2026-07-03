/** Fila de `public.profiles` tal como la devuelve el backend. */
export interface Profile {
  id: string
  full_name: string
  birth_date: string | null
  gender: string | null
  country: string | null
  avatar_url: string | null
}

/**
 * Un signup por Google crea el profile con `full_name` pero sin país/género/
 * fecha (Supabase no los provee). Se considera incompleto si falta alguno.
 */
export function isProfileComplete(profile: Profile): boolean {
  return Boolean(profile.country) && Boolean(profile.gender) && Boolean(profile.birth_date)
}
