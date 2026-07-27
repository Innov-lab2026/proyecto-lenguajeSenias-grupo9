import { Request, Response } from 'express'
import {
  getMyAchievementsService,
  getMyStickersService,
  purchaseStickerService,
} from '../services/gamificationService'

export const getMyStickers = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id
    const data = await getMyStickersService(userId)
    res.json({ data })
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
}

export const getMyAchievements = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id
    const data = await getMyAchievementsService(userId)
    res.json({ data })
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
}

export const purchaseSticker = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id
    const stickerId = req.params.id as string

    const result = await purchaseStickerService(userId, stickerId)

    if (!result.success && result.message === 'Sticker not found') {
      return res.status(404).json({ message: result.message })
    }
    if (!result.success && result.message === 'Not enough points') {
      return res.status(400).json(result)
    }

    return res.json({ data: result })
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
}
