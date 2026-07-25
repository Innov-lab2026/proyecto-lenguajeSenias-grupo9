import { Request, Response } from 'express'
import {
  completeLessonService,
  evaluateAchievementsService,
  getCompletedLessonsService,
  getUserStatsService,
} from '../services/progressService'

export const getStats = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id
    const data = await getUserStatsService(userId)
    res.json({ data })
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
}

export const getCompletedLessons = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id
    const data = await getCompletedLessonsService(userId)
    res.json({ data })
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
}

export const completeLesson = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id
    const { is_perfect } = req.body

    if (typeof is_perfect !== 'boolean') {
      return res.status(400).json({ message: 'is_perfect (boolean) es requerido' })
    }

    const result = await completeLessonService(userId, req.params.id as string, is_perfect)

    if (!result.success && result.message === 'Lesson not found') {
      return res.status(404).json({ message: result.message })
    }

    // Sólo evaluar logros si la lección se completó de verdad ahora (no en un
    // reintento sobre una ya completada, para no llamar la RPC de más).
    const earnedAchievements = result.success ? await evaluateAchievementsService(userId) : []

    return res.json({ data: { ...result, earned_achievements: earnedAchievements } })
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
}
