import { Request, Response } from 'express'
import { deleteAvatarService, getProfileByIdService, updateProfileService, uploadAvatarService } from '../services/profileService'

function getUserContext(req: Request) {
  const user = (req as any).user
  const meta = user?.user_metadata ?? {}

  return {
    id: user.id as string,
    email: user.email as string | undefined,
    provider: user.app_metadata?.provider as string | undefined,
    userMeta: {
      full_name: meta.full_name,
      name: meta.name,
      given_name: meta.given_name,
      family_name: meta.family_name,
      avatar_url: meta.avatar_url,
      picture: meta.picture,
    },
  }
}

export const getProfile = async (req: Request, res: Response) => {
  try {
    const profile = await getProfileByIdService(getUserContext(req))

    return res.status(200).json({
      message: 'Perfil obtenido con éxito.',
      data: profile,
    })
  } catch (error: any) {
    console.error('[GET /api/profile]', error)
    return res.status(500).json({ message: error.message })
  }
}

export const updateProfile = async (req: Request, res: Response) => {
  try {
    const userContext = getUserContext(req)
    const { full_name, birth_date, gender, country, avatar_url } = req.body

    if (full_name !== undefined && full_name.trim() === '') {
      return res.status(400).json({ error: 'El nombre completo no puede estar vacío.' })
    }

    const updatedProfile = await updateProfileService(
      userContext.id,
      {
        full_name,
        birth_date,
        gender,
        country,
        avatar_url,
      },
      userContext.userMeta,
    )

    return res.status(200).json({
      message: 'Perfil actualizado correctamente.',
      data: updatedProfile,
    })
  } catch (error: any) {
    console.error('[PATCH /api/profile]', error)
    return res.status(500).json({ error: error.message })
  }
}

export const uploadAvatar = async (req: Request, res: Response) => {
  try {
    const { dataUrl } = req.body
    if (typeof dataUrl !== 'string') return res.status(400).json({ error: 'La imagen es requerida.' })
    const profile = await uploadAvatarService((req as any).user.id, dataUrl)
    return res.status(200).json({ message: 'Foto actualizada.', data: profile })
  } catch (error: any) {
    return res.status(400).json({ error: error.message })
  }
}

export const deleteAvatar = async (req: Request, res: Response) => {
  try {
    const profile = await deleteAvatarService((req as any).user.id)
    return res.status(200).json({ message: 'Foto eliminada.', data: profile })
  } catch (error: any) {
    return res.status(400).json({ error: error.message })
  }
}
