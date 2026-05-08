const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || 'development';

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Health Check Endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'Lifespring Hospital EMR Server is running',
    timestamp: new Date().toISOString(),
    environment: NODE_ENV
  });
});

// API Routes (placeholder)
app.get('/api/v1/status', (req, res) => {
  res.status(200).json({
    status: 'active',
    message: 'API is operational'
  });
});

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: 'The requested endpoint does not exist'
  });
});

// Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Internal Server Error',
    message: NODE_ENV === 'development' ? err.message : 'An error occurred'
  });
});

// Start Server
app.listen(PORT, () => {
  console.log(`\n🏥 Lifespring Hospital EMR Server`);
  console.log(`Environment: ${NODE_ENV}`);
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Health Check: http://localhost:${PORT}/health\n`);
});

module.exports = app;
