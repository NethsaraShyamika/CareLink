import express from 'express';
import * as authController from '../controllers/Authcontroller.js';

const router = express.Router();

// ─── Auth ──────────────────────────────────────────────────────────────────────
router.post('/register', authController.createUser);
router.post('/login',    authController.loginUser);
router.post('/logout',   authController.logoutUser);

// ─── Profile ───────────────────────────────────────────────────────────────────
router.get('/me',    authController.getMyProfile);
router.put('/me',    authController.updateMyProfile);
router.delete('/me', authController.deleteOwnAccount);

// ─── Users ─────────────────────────────────────────────────────────────────────
router.get('/users',  authController.getAllUsers);
router.get('/search', authController.searchUser);

// ─── Password Reset ────────────────────────────────────────────────────────────
router.post('/forgot-password',              authController.forgotPassword);
router.post('/reset-password',               authController.resetPassword);          // OTP flow
router.post('/reset-password/:token',        authController.resetPasswordByToken);   // link flow

// ─── Admin: activate / deactivate ─────────────────────────────────────────────
router.post('/block/:id',   authController.blockUser);   // legacy name kept
router.post('/unblock/:id', authController.unblockUser); // legacy name kept

export default router;