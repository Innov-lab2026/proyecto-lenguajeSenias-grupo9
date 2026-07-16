import { Request, Response } from 'express'
import { getProfileByIdService, updateProfileService } from '../services/profileService';

export const getProfile = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user
    const meta = user?.user_metadata ?? {}

    const profile = await getProfileByIdService(user.id, {
      full_name: meta.full_name,
      name: meta.name,
      avatar_url: meta.avatar_url,
      picture: meta.picture,
    })

    return res.status(200).json({
      message: 'Perfil obtenido con éxito.',
      data: {
        ...profile,
      },
    })
  } catch (error: any) {
    return res.status(500).json({ message: error.message })
  }
}


export const updateProfile = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user; 

    const { full_name, birth_date, gender, country, avatar_url } = req.body;

    if (full_name !== undefined && full_name.trim() === '') {
      return res.status(400).json({ error: 'El nombre completo no puede estar vacío.' });
    }

  
    const updatedProfile = await updateProfileService(user.id, {
      full_name,
      birth_date,
      gender,
      country,
      avatar_url
    });

    return res.status(200).json({
      message: 'Perfil actualizado correctamente.',
      data: updatedProfile
    });

  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};