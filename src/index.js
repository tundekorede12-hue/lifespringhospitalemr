const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const patientRoutes = require('./routes/patients');
const appointmentRoutes = require('./routes/appointments');
const medicalHistoryRoutes = require('./routes/medicalHistory');
const prescriptionRoutes = require('./routes/prescriptions');
const labTestsRoutes = require('./routes/labTests');
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

// API Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/patients', patientRoutes);
app.use('/api/v1/appointments', appointmentRoutes);
app.use('/api/v1/medical-history', medicalHistoryRoutes);
app.use('/api/v1/prescriptions', prescriptionRoutes);
app.use('/api/v1/lab-tests', labTestsRoutes);

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
  console.log(`\n🔐 Authentication Endpoints (6):`);
  console.log(`POST   http://localhost:${PORT}/api/v1/auth/register`);
  console.log(`POST   http://localhost:${PORT}/api/v1/auth/login`);
  console.log(`POST   http://localhost:${PORT}/api/v1/auth/logout`);
  console.log(`GET    http://localhost:${PORT}/api/v1/auth/me`);
  console.log(`POST   http://localhost:${PORT}/api/v1/auth/refresh`);
  console.log(`POST   http://localhost:${PORT}/api/v1/auth/change-password`);
  console.log(`\n👥 Patient Management Endpoints (6):`);
  console.log(`POST   http://localhost:${PORT}/api/v1/patients`);
  console.log(`GET    http://localhost:${PORT}/api/v1/patients`);
  console.log(`GET    http://localhost:${PORT}/api/v1/patients/:id`);
  console.log(`PUT    http://localhost:${PORT}/api/v1/patients/:id`);
  console.log(`DELETE http://localhost:${PORT}/api/v1/patients/:id`);
  console.log(`GET    http://localhost:${PORT}/api/v1/patients/stats/overview`);
  console.log(`\n📅 Appointment Management Endpoints (7):`);
  console.log(`POST   http://localhost:${PORT}/api/v1/appointments`);
  console.log(`GET    http://localhost:${PORT}/api/v1/appointments`);
  console.log(`GET    http://localhost:${PORT}/api/v1/appointments/:id`);
  console.log(`GET    http://localhost:${PORT}/api/v1/appointments/patient/:patientId`);
  console.log(`PUT    http://localhost:${PORT}/api/v1/appointments/:id`);
  console.log(`DELETE http://localhost:${PORT}/api/v1/appointments/:id`);
  console.log(`GET    http://localhost:${PORT}/api/v1/appointments/doctor/:doctorId/available`);
  console.log(`\n💊 Medical History & Vitals Endpoints (8):`);
  console.log(`POST   http://localhost:${PORT}/api/v1/medical-history/patient/:patientId/conditions`);
  console.log(`GET    http://localhost:${PORT}/api/v1/medical-history/patient/:patientId/conditions`);
  console.log(`PUT    http://localhost:${PORT}/api/v1/medical-history/conditions/:conditionId`);
  console.log(`DELETE http://localhost:${PORT}/api/v1/medical-history/conditions/:conditionId`);
  console.log(`POST   http://localhost:${PORT}/api/v1/medical-history/patient/:patientId/vitals`);
  console.log(`GET    http://localhost:${PORT}/api/v1/medical-history/patient/:patientId/vitals`);
  console.log(`GET    http://localhost:${PORT}/api/v1/medical-history/patient/:patientId/vitals/latest`);
  console.log(`GET    http://localhost:${PORT}/api/v1/medical-history/patient/:patientId/vitals/trend`);
  console.log(`\n💉 Prescription Management Endpoints (8):`);
  console.log(`GET    http://localhost:${PORT}/api/v1/prescriptions/medications`);
  console.log(`POST   http://localhost:${PORT}/api/v1/prescriptions`);
  console.log(`GET    http://localhost:${PORT}/api/v1/prescriptions`);
  console.log(`GET    http://localhost:${PORT}/api/v1/prescriptions/:id`);
  console.log(`GET    http://localhost:${PORT}/api/v1/prescriptions/patient/:patientId`);
  console.log(`POST   http://localhost:${PORT}/api/v1/prescriptions/:id/refill`);
  console.log(`PUT    http://localhost:${PORT}/api/v1/prescriptions/:id`);
  console.log(`DELETE http://localhost:${PORT}/api/v1/prescriptions/:id`);
  console.log(`\n🧪 Lab Tests & Results Endpoints (8):`);
  console.log(`GET    http://localhost:${PORT}/api/v1/lab-tests/available`);
  console.log(`POST   http://localhost:${PORT}/api/v1/lab-tests/orders`);
  console.log(`GET    http://localhost:${PORT}/api/v1/lab-tests/orders`);
  console.log(`GET    http://localhost:${PORT}/api/v1/lab-tests/orders/:id`);
  console.log(`GET    http://localhost:${PORT}/api/v1/lab-tests/patient/:patientId/orders`);
  console.log(`POST   http://localhost:${PORT}/api/v1/lab-tests/orders/:id/results`);
  console.log(`GET    http://localhost:${PORT}/api/v1/lab-tests/orders/:id/results`);
  console.log(`PUT    http://localhost:${PORT}/api/v1/lab-tests/orders/:id/status`);
  console.log(`\n✅ Total: 43 endpoints available!\n`);
});

module.exports = app;
