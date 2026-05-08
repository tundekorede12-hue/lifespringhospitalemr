const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const { errorHandler, rateLimitMiddleware } = require('./middleware/auth');

const app = express();
const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || 'development';

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(rateLimitMiddleware(100, 15 * 60 * 1000)); // 100 requests per 15 minutes

// Health Check Endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'Lifespring Hospital EMR Server is running',
    timestamp: new Date().toISOString(),
    environment: NODE_ENV
  });
});

// API Status
app.get('/api/v1/status', (req, res) => {
  res.status(200).json({
    status: 'active',
    message: 'API is operational',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// Authentication Routes
app.use('/api/v1/auth', authRoutes);

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: 'The requested endpoint does not exist',
    path: req.path,
    method: req.method
  });
});

// Error Handler
app.use(errorHandler);

// Start Server
app.listen(PORT, () => {
  console.log(`\n🏥 Lifespring Hospital EMR Server`);
  console.log(`Environment: ${NODE_ENV}`);
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`\n📚 API Documentation:`);
  console.log(`Health Check: http://localhost:${PORT}/health`);
  console.log(`API Status: http://localhost:${PORT}/api/v1/status`);
  console.log(`\n🔐 Authentication Endpoints:`);
  console.log(`POST   http://localhost:${PORT}/api/v1/auth/register`);
  console.log(`POST   http://localhost:${PORT}/api/v1/auth/login`);
  console.log(`POST   http://localhost:${PORT}/api/v1/auth/logout`);
  console.log(`GET    http://localhost:${PORT}/api/v1/auth/me`);
  console.log(`POST   http://localhost:${PORT}/api/v1/auth/refresh`);
  console.log(`POST   http://localhost:${PORT}/api/v1/auth/change-password\n`);
});

module.exports = app;
