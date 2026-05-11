const express = require('express');
const prescriptionController = require('../controllers/prescriptionController');
const { authMiddleware, roleMiddleware } = require('../middleware/auth');

const router = express.Router();

/**
 * Prescription Routes
 * All routes require authentication
 */

// Get all medications or search
router.get(
  '/medications',
  authMiddleware,
  prescriptionController.getMedications
);

// Create new prescription (Doctor, Admin)
router.post(
  '/',
  authMiddleware,
  roleMiddleware(['admin', 'doctor']),
  prescriptionController.createPrescription
);

// Get all prescriptions
router.get(
  '/',
  authMiddleware,
  prescriptionController.getAllPrescriptions
);

// Get prescriptions for a patient
router.get(
  '/patient/:patientId',
  authMiddleware,
  prescriptionController.getPatientPrescriptions
);

// Get prescription by ID
router.get(
  '/:id',
  authMiddleware,
  prescriptionController.getPrescriptionById
);

// Request refill
router.post(
  '/:id/refill',
  authMiddleware,
  prescriptionController.requestRefill
);

// Update prescription (Doctor, Admin)
router.put(
  '/:id',
  authMiddleware,
  roleMiddleware(['admin', 'doctor']),
  prescriptionController.updatePrescription
);

// Cancel prescription (Doctor, Admin)
router.delete(
  '/:id',
  authMiddleware,
  roleMiddleware(['admin', 'doctor']),
  prescriptionController.cancelPrescription
);

module.exports = router;
