import express from 'express';
import * as authController from '../controllers/authController.js';
import { verifyToken, requireRole, isAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

// ─── Public Routes (No Authentication Required) ────────────────────────────────
router.post('/register', authController.createUser);
router.post('/login', authController.loginUser);
router.post('/logout', authController.logoutUser);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);
router.post('/reset-password/:token', authController.resetPasswordByToken);

// ─── Protected Routes (Authentication Required) ────────────────────────────────
router.get('/me', verifyToken, authController.getMyProfile);
router.put('/me', verifyToken, authController.updateMyProfile);
router.delete('/me', verifyToken, authController.deleteOwnAccount);
router.get('/search', verifyToken, authController.searchUser);

// ─── Admin Routes (Admin Only) ─────────────────────────────────────────────────
router.get('/users', verifyToken, requireRole('admin'), authController.getAllUsers);
router.post('/block/:id', verifyToken, requireRole('admin'), authController.blockUser);
router.post('/unblock/:id', verifyToken, requireRole('admin'), authController.unblockUser);

export default router;