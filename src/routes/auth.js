const express = require('express');
const authController = require('../controllers/authController');
const { authMiddleware, roleMiddleware } = require('../middleware/auth');

const router = express.Router();

/**
 * Public Routes
 */

// User login
router.post('/login', authController.login);

// User registration
router.post('/register', authController.register);

/**
 * Protected Routes
 * Requires valid JWT token
 */

// Get current user
router.get('/me', authMiddleware, authController.getCurrentUser);

// Refresh token
router.post('/refresh', authMiddleware, authController.refreshToken);

// Change password
router.post('/change-password', authMiddleware, authController.changePassword);

// Logout
router.post('/logout', authMiddleware, authController.logout);

/**
 * Admin Only Routes
 */

// Example: Get all users (admin only)
router.get('/users', authMiddleware, roleMiddleware(['admin']), (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Admin access granted',
    data: []
  });
});

module.exports = router;
