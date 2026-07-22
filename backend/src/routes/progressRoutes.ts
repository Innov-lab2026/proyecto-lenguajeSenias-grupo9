import { Router } from 'express'
import { getProgress, updateProgress } from '../controllers/progressController'
import { authMiddleware } from '../middleware/auth'

const router = Router()

router.get('/progress', authMiddleware, getProgress)
router.post('/progress', authMiddleware, updateProgress)

export default router
