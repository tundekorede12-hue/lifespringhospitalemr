const { hashPassword, comparePassword, generateToken } = require('../utils/auth');

/**
 * Mock database for demonstration
 * In production, use actual database connection
 */
const users = new Map();

/**
 * User Login
 * @route POST /api/v1/auth/login
 * @param {String} email - User email
 * @param {String} password - User password
 * @returns {Object} User object and JWT token
 */
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        status: 'error',
        message: 'Email and password are required'
      });
    }

    // TODO: Replace with actual database query
    // const user = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    
    // For demonstration, return mock data
    const mockUser = {
      id: 1,
      email: 'dr.smith@lifespring.com',
      first_name: 'John',
      last_name: 'Smith',
      role: 'doctor',
      password_hash: '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcg7b3XeKeUxWdeS'
    };

    if (email !== mockUser.email) {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid email or password'
      });
    }

    // Verify password
    const isPasswordValid = await comparePassword(password, mockUser.password_hash);
    if (!isPasswordValid) {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid email or password'
      });
    }

    // Generate JWT token
    const token = generateToken(mockUser);

    // Log session (TODO: Save to database)
    console.log(`User ${email} logged in at ${new Date().toISOString()}`);

    return res.status(200).json({
      status: 'success',
      message: 'Login successful',
      data: {
        id: mockUser.id,
        email: mockUser.email,
        firstName: mockUser.first_name,
        lastName: mockUser.last_name,
        role: mockUser.role,
        token: token
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Login failed',
      error: error.message
    });
  }
};

/**
 * User Registration
 * @route POST /api/v1/auth/register
 * @param {String} email - User email
 * @param {String} password - User password
 * @param {String} first_name - First name
 * @param {String} last_name - Last name
 * @param {String} role - User role
 * @returns {Object} Created user object
 */
const register = async (req, res) => {
  try {
    const { email, password, first_name, last_name, role = 'staff' } = req.body;

    // Validate input
    if (!email || !password || !first_name || !last_name) {
      return res.status(400).json({
        status: 'error',
        message: 'Email, password, first name, and last name are required'
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid email format'
      });
    }

    // Validate password strength
    if (password.length < 8) {
      return res.status(400).json({
        status: 'error',
        message: 'Password must be at least 8 characters long'
      });
    }

    // Check if user already exists
    if (users.has(email)) {
      return res.status(409).json({
        status: 'error',
        message: 'User with this email already exists'
      });
    }

    // Hash password
    const password_hash = await hashPassword(password);

    // Create user object
    const newUser = {
      id: users.size + 1,
      email,
      first_name,
      last_name,
      role,
      password_hash,
      is_active: true,
      created_at: new Date()
    };

    // Save user (TODO: Save to database)
    users.set(email, newUser);

    // Generate token
    const token = generateToken(newUser);

    return res.status(201).json({
      status: 'success',
      message: 'User registered successfully',
      data: {
        id: newUser.id,
        email: newUser.email,
        firstName: newUser.first_name,
        lastName: newUser.last_name,
        role: newUser.role,
        token: token
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Registration failed',
      error: error.message
    });
  }
};

/**
 * User Logout
 * @route POST /api/v1/auth/logout
 * @returns {Object} Success message
 */
const logout = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // TODO: Invalidate session in database
    console.log(`User ${userId} logged out at ${new Date().toISOString()}`);

    return res.status(200).json({
      status: 'success',
      message: 'Logout successful'
    });
  } catch (error) {
    console.error('Logout error:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Logout failed',
      error: error.message
    });
  }
};

/**
 * Refresh Token
 * @route POST /api/v1/auth/refresh
 * @returns {Object} New JWT token
 */
const refreshToken = async (req, res) => {
  try {
    const user = req.user;
    const newToken = generateToken(user);

    return res.status(200).json({
      status: 'success',
      message: 'Token refreshed successfully',
      data: {
        token: newToken
      }
    });
  } catch (error) {
    console.error('Token refresh error:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Token refresh failed',
      error: error.message
    });
  }
};

/**
 * Get Current User
 * @route GET /api/v1/auth/me
 * @returns {Object} Current user object
 */
const getCurrentUser = async (req, res) => {
  try {
    const user = req.user;

    return res.status(200).json({
      status: 'success',
      message: 'User retrieved successfully',
      data: user
    });
  } catch (error) {
    console.error('Get user error:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to retrieve user',
      error: error.message
    });
  }
};

/**
 * Change Password
 * @route POST /api/v1/auth/change-password
 * @param {String} currentPassword - Current password
 * @param {String} newPassword - New password
 * @returns {Object} Success message
 */
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;

    // Validate input
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        status: 'error',
        message: 'Current password and new password are required'
      });
    }

    // Validate new password strength
    if (newPassword.length < 8) {
      return res.status(400).json({
        status: 'error',
        message: 'New password must be at least 8 characters long'
      });
    }

    // TODO: Get user from database
    // const user = await db.query('SELECT * FROM users WHERE id = ?', [userId]);

    // For demonstration
    const mockUser = {
      id: userId,
      password_hash: '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcg7b3XeKeUxWdeS'
    };

    // Verify current password
    const isPasswordValid = await comparePassword(currentPassword, mockUser.password_hash);
    if (!isPasswordValid) {
      return res.status(401).json({
        status: 'error',
        message: 'Current password is incorrect'
      });
    }

    // Hash new password
    const newPasswordHash = await hashPassword(newPassword);

    // TODO: Update password in database
    console.log(`User ${userId} changed password at ${new Date().toISOString()}`);

    return res.status(200).json({
      status: 'success',
      message: 'Password changed successfully'
    });
  } catch (error) {
    console.error('Change password error:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Password change failed',
      error: error.message
    });
  }
};

module.exports = {
  login,
  register,
  logout,
  refreshToken,
  getCurrentUser,
  changePassword
};
