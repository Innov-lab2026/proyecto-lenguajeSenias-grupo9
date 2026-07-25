import { Request, Response } from 'express'
import {
  getAchievementsService,
  getModuleLessonsService,
  getModulesService,
  getStickersService,
  getVideosService,
} from '../services/contentService'

export const getModules = async (req: Request, res: Response) => {
  try {
    const data = await getModulesService()
    res.json({ data })
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
}

export const getModuleLessons = async (req: Request, res: Response) => {
  try {
    const data = await getModuleLessonsService(req.params.id as string)
    res.json({ data })
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
}

export const getVideos = async (req: Request, res: Response) => {
  try {
    const data = await getVideosService()
    res.json({ data })
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
}

export const getStickers = async (req: Request, res: Response) => {
  try {
    const data = await getStickersService()
    res.json({ data })
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
}

export const getAchievements = async (req: Request, res: Response) => {
  try {
    const data = await getAchievementsService()
    res.json({ data })
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
}
