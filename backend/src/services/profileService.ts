import { supabaseAdmin } from '../config/supabaseClient'

interface ProfileUserMeta {
  full_name?: string | null
  name?: string | null
  given_name?: string | null
  family_name?: string | null
  avatar_url?: string | null
  picture?: string | null
}

interface AuthenticatedUserContext {
  id: string
  email?: string | null
  provider?: string | null
  userMeta?: ProfileUserMeta
}

interface UpdateProfileInput {
  full_name?: string
  birth_date?: Date | string
  gender?: string
  country?: string
  avatar_url?: string | null
}

function resolveFullName(meta?: ProfileUserMeta): string {
  const fromFullName = meta?.full_name?.trim()
  if (fromFullName) return fromFullName

  const fromName = meta?.name?.trim()
  if (fromName) return fromName

  const given = meta?.given_name?.trim()
  const family = meta?.family_name?.trim()
  const fromParts = [given, family].filter(Boolean).join(' ').trim()
  if (fromParts) return fromParts

  return 'Usuario'
}

function resolveAvatarUrl(meta?: ProfileUserMeta): string | null {
  return meta?.avatar_url || meta?.picture || null
}

function isDuplicateKeyError(error: { code?: string } | null): boolean {
  return error?.code === '23505'
}

async function ensureAppUserRecord(user: AuthenticatedUserContext): Promise<void> {
  const { data: existing, error: selectError } = await supabaseAdmin
    .from('users')
    .select('id')
    .eq('id', user.id)
    .maybeSingle()

  if (selectError) {
    throw new Error(`No se pudo verificar el usuario: ${selectError.message}`)
  }

  if (existing) return

  const { error: insertError } = await supabaseAdmin.from('users').insert({
    id: user.id,
    email: user.email ?? '',
    provider: user.provider ?? 'email',
  })

  if (insertError && !isDuplicateKeyError(insertError)) {
    throw new Error(`No se pudo crear el usuario: ${insertError.message}`)
  }
}

async function fetchProfileById(userId: string) {
  const { data, error } = await supabaseAdmin
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle()

  if (error) {
    throw new Error(`No se pudo obtener el perfil: ${error.message}`)
  }

  return data
}

async function createProfileIfMissing(
  userId: string,
  userMeta?: ProfileUserMeta,
) {
  const payload = {
    id: userId,
    full_name: resolveFullName(userMeta),
    birth_date: null,
    gender: null,
    country: null,
    avatar_url: resolveAvatarUrl(userMeta),
  }

  const { data: created, error: createError } = await supabaseAdmin
    .from('profiles')
    .insert(payload)
    .select('*')
    .maybeSingle()

  if (!createError && created) {
    return created
  }

  // Otro request o el trigger de Supabase pudo crear la fila en paralelo.
  if (isDuplicateKeyError(createError)) {
    const existing = await fetchProfileById(userId)
    if (existing) return existing
  }

  if (createError) {
    throw new Error(`No se pudo crear el perfil: ${createError.message}`)
  }

  throw new Error('No se pudo crear el perfil')
}

export const getProfileByIdService = async (user: AuthenticatedUserContext) => {
  const existing = await fetchProfileById(user.id)
  if (existing) return existing

  await ensureAppUserRecord(user)
  return createProfileIfMissing(user.id, user.userMeta)
}

export const updateProfileService = async (
  userId: string,
  dataToUpdate: UpdateProfileInput,
  userMeta?: ProfileUserMeta,
) => {
  const fields = Object.fromEntries(
    Object.entries(dataToUpdate).filter(([, value]) => value !== undefined),
  )

  if (fields.full_name === undefined) {
    const existing = await fetchProfileById(userId)
    fields.full_name = existing?.full_name ?? resolveFullName(userMeta)
  }

  const { data, error } = await supabaseAdmin
    .from('profiles')
    .upsert(
      {
        id: userId,
        ...fields,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'id' },
    )
    .select()
    .single()

  if (error) {
    throw new Error(`Error al actualizar el perfil: ${error.message}`)
  }

  return data
}

const AVATAR_BUCKET = 'avatars'

export async function uploadAvatarService(userId: string, dataUrl: string) {
  const match = /^data:(image\/(?:jpeg|png|webp));base64,([a-zA-Z0-9+/=]+)$/.exec(dataUrl)
  if (!match) throw new Error('Formato de imagen no válido')

  const contentType = match[1]
  const buffer = Buffer.from(match[2], 'base64')
  if (buffer.length > 4 * 1024 * 1024) throw new Error('La imagen supera el límite de 4 MB')

  const extension = contentType === 'image/png' ? 'png' : contentType === 'image/webp' ? 'webp' : 'jpg'
  const objectPath = `${userId}/avatar.${extension}`
  const { error } = await supabaseAdmin.storage
    .from(AVATAR_BUCKET)
    .upload(objectPath, buffer, { contentType, upsert: true, cacheControl: '3600' })
  if (error) throw new Error(`No se pudo subir la foto: ${error.message}`)

  const { data: publicUrl } = supabaseAdmin.storage.from(AVATAR_BUCKET).getPublicUrl(objectPath)
  return updateProfileService(userId, { avatar_url: publicUrl.publicUrl })
}

export async function deleteAvatarService(userId: string) {
  const profile = await fetchProfileById(userId)
  if (profile?.avatar_url) {
    const objectPath = `${userId}/avatar.jpg`
    await supabaseAdmin.storage.from(AVATAR_BUCKET).remove([objectPath, `${userId}/avatar.png`, `${userId}/avatar.webp`])
  }
  return updateProfileService(userId, { avatar_url: null })
}
