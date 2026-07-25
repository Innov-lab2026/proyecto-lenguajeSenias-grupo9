import { Router } from 'express'
import { getMyAchievements, getMyStickers, purchaseSticker } from '../controllers/gamificationController'
import { authMiddleware } from '../middleware/auth'

const router = Router()

router.get('/stickers/mine', authMiddleware, getMyStickers)
router.post('/stickers/:id/purchase', authMiddleware, purchaseSticker)
router.get('/achievements/mine', authMiddleware, getMyAchievements)

export default router
