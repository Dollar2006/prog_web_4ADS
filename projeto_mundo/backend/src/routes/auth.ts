import { Router } from 'express';
import { authController } from '../controllers/auth.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';

const router = Router();

// Rotas públicas
router.post('/login', authController.login);
router.post('/signup', authController.signup);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);

// Rotas protegidas
router.get('/me', authMiddleware, authController.me);
router.post('/update-password', authMiddleware, authController.updatePassword);

export default router;

