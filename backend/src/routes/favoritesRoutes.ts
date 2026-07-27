import { Router } from 'express'
import { addFavorite, getFavorites, removeFavorite } from '../controllers/favoritesController'
import { authMiddleware } from '../middleware/auth'

const router = Router()

router.get('/favorites', authMiddleware, getFavorites)
router.post('/favorites', authMiddleware, addFavorite)
router.delete('/favorites/:type/:id', authMiddleware, removeFavorite)

export default router
