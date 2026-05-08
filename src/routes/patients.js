const express = require('express');
const patientController = require('../controllers/patientController');
const { authMiddleware, roleMiddleware } = require('../middleware/auth');

const router = express.Router();

/**
 * Patient Routes
 * All routes require authentication
 */

// Get patient statistics (Admin, Doctor)
router.get(
  '/stats/overview',
  authMiddleware,
  roleMiddleware(['admin', 'doctor']),
  patientController.getPatientStats
);

// Create new patient (Doctor, Admin)
router.post(
  '/',
  authMiddleware,
  roleMiddleware(['admin', 'doctor', 'nurse']),
  patientController.createPatient
);

// Get all patients
router.get(
  '/',
  authMiddleware,
  patientController.getAllPatients
);

// Get patient by ID
router.get(
  '/:id',
  authMiddleware,
  patientController.getPatientById
);

// Update patient (Doctor, Admin)
router.put(
  '/:id',
  authMiddleware,
  roleMiddleware(['admin', 'doctor', 'nurse']),
  patientController.updatePatient
);

// Delete/Deactivate patient (Admin only)
router.delete(
  '/:id',
  authMiddleware,
  roleMiddleware(['admin']),
  patientController.deletePatient
);

module.exports = router;
