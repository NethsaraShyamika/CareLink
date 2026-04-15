const express = require('express');
const router = express.Router();
const { register, login } = require('../controllers/Authcontroller.js');
const userController = require('../controllers/userController.js');

// Auth routes
router.post('/register', register);
router.post('/login', login);

// User routes
router.post('/create', userController.createUser);
router.post('/logout', userController.logoutUser);
router.get('/me', userController.getMyProfile);
router.get('/users', userController.getAllUsers);
router.put('/me', userController.updateMyProfile);
router.delete('/me', userController.deleteOwnAccount);
router.post('/forgot-password', userController.forgotPassword);
router.post('/reset-password', userController.resetPassword);
router.get('/search', userController.searchUser);
router.post('/block/:id', userController.blockUser);
router.post('/unblock/:id', userController.unblockUser);

module.exports = router;