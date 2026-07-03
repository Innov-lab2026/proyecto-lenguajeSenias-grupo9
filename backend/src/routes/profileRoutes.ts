import { Router } from 'express'
import { getProfile, updateProfile } from '../controllers/profileController';
import { authMiddleware } from '../middleware/auth';

const router = Router()

router.get('/profile', authMiddleware, getProfile);

router.patch('/profile', authMiddleware, updateProfile);

export default router