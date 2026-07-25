import { Router } from 'express'
import { completeLesson, getCompletedLessons, getStats } from '../controllers/progressController'
import { authMiddleware } from '../middleware/auth'

const router = Router()

router.get('/stats', authMiddleware, getStats)
router.get('/lessons/completed', authMiddleware, getCompletedLessons)
router.post('/lessons/:id/complete', authMiddleware, completeLesson)

export default router
