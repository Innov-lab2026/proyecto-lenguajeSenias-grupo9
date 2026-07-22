import { Request, Response } from 'express'
import { getUserProgressService, updateProgressService } from '../services/progressService'

export const getProgress = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id
    const data = await getUserProgressService(userId)
    res.json({ data })
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
}

export const updateProgress = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id
    const { module_id, completed_islands, xp_gain, stars_gain } = req.body
    
    if (!module_id) {
      return res.status(400).json({ message: 'module_id is required' })
    }

    const data = await updateProgressService(userId, module_id, completed_islands, xp_gain, stars_gain)
    res.json({ data })
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
}
