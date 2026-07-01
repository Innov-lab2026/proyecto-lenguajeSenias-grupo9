import { Request, Response } from 'express'
import { getProfileByIdService } from '../services/profileService';

export const getProfile = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;

    const profile = await getProfileByIdService(user.id);

    return res.status(200).json({
      message: 'Perfil obtenido con éxito.',
      data: {
        ...profile
      }
    });

  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
};