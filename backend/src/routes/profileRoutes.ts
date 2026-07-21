import { Router } from 'express'
import { deleteAvatar, getProfile, updateProfile, uploadAvatar } from '../controllers/profileController';
import { authMiddleware } from '../middleware/auth';

const router = Router()

router.get('/profile', authMiddleware, getProfile);

router.patch('/profile', authMiddleware, updateProfile);
router.put('/profile/avatar', authMiddleware, uploadAvatar);
router.delete('/profile/avatar', authMiddleware, deleteAvatar);

export default router
