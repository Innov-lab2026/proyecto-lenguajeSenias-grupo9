import { Router } from 'express'
import { completeAlphabetLetter, getAlphabetProgress } from '../controllers/alphabetController'
import { authMiddleware } from '../middleware/auth'

const router = Router()

router.get('/alphabet/progress', authMiddleware, getAlphabetProgress)
router.post('/alphabet/:letter/complete', authMiddleware, completeAlphabetLetter)

export default router
