import { supabaseAdmin } from '../config/supabaseClient'

interface ProfileUserMeta {
  full_name?: string | null
  name?: string | null
  avatar_url?: string | null
  picture?: string | null
}

interface UpdateProfileInput {
  full_name?: string
  birth_date?: Date
  gender?: string
  country?: string
  avatar_url?: string
}

function resolveFullName(meta?: ProfileUserMeta): string {
  return meta?.full_name?.trim() || meta?.name?.trim() || 'Usuario'
}

function resolveAvatarUrl(meta?: ProfileUserMeta): string | null {
  return meta?.avatar_url || meta?.picture || null
}

export const getProfileByIdService = async (
  userId: string,
  userMeta?: ProfileUserMeta,
) => {
  const { data, error } = await supabaseAdmin
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle()

  if (error) {
    throw new Error(`No se pudo obtener el perfil: ${error.message}`)
  }

  if (data) {
    return data
  }

  // Usuarios OAuth (p. ej. Google) pueden no tener fila en profiles.
  const { data: created, error: createError } = await supabaseAdmin
    .from('profiles')
    .insert({
      id: userId,
      full_name: resolveFullName(userMeta),
      birth_date: null,
      gender: null,
      country: null,
      avatar_url: resolveAvatarUrl(userMeta),
    })
    .select('*')
    .single()

  if (createError) {
    throw new Error(`No se pudo crear el perfil: ${createError.message}`)
  }

  return created
}

export const updateProfileService = async (
  userId: string,
  dataToUpdate: UpdateProfileInput,
) => {
  const fields = Object.fromEntries(
    Object.entries(dataToUpdate).filter(([, value]) => value !== undefined),
  )

  // full_name es NOT NULL: si no viene en el PATCH, conservar el existente o usar default.
  if (fields.full_name === undefined) {
    const { data: existing } = await supabaseAdmin
      .from('profiles')
      .select('full_name')
      .eq('id', userId)
      .maybeSingle()

    fields.full_name = existing?.full_name ?? 'Usuario'
  }

  const { data, error } = await supabaseAdmin
    .from('profiles')
    .upsert({
      id: userId,
      ...fields,
      updated_at: new Date(),
    })
    .select()
    .single()

  if (error) {
    throw new Error(`Error al actualizar el perfil: ${error.message}`)
  }

  return data
}
