import { Router } from 'express';
import { AuthController } from './auth.controller.js';
import { requireAuth } from '../../middlewares/auth.js';

const router = Router();

router.post('/signup', AuthController.signup);
router.get('/verify-email', AuthController.verifyEmail);
router.post('/login', AuthController.login);
router.post('/refresh', AuthController.refresh);
router.post('/logout', AuthController.logout);
router.post('/forgot-password', AuthController.forgotPassword);
router.post('/reset-password', AuthController.resetPassword);
router.get('/me', requireAuth, AuthController.me);

export default router;
