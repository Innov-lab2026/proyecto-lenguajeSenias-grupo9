import { Router } from 'express'
import {
  getAchievements,
  getAllLessons,
  getModuleLessons,
  getModules,
  getStickers,
  getVideos,
} from '../controllers/contentController'
import { authMiddleware } from '../middleware/auth'

const router = Router()

router.get('/modules', authMiddleware, getModules)
router.get('/modules/:id/lessons', authMiddleware, getModuleLessons)
router.get('/lessons', authMiddleware, getAllLessons)
router.get('/videos', authMiddleware, getVideos)
router.get('/stickers', authMiddleware, getStickers)
router.get('/achievements', authMiddleware, getAchievements)

export default router
