const express = require('express');
const labTestsController = require('../controllers/labTestsController');
const { authMiddleware, roleMiddleware } = require('../middleware/auth');

const router = express.Router();

/**
 * Lab Tests Routes
 * All routes require authentication
 */

// Get available lab tests
router.get(
  '/available',
  authMiddleware,
  labTestsController.getAvailableTests
);

// Order a lab test (Doctor, Admin)
router.post(
  '/orders',
  authMiddleware,
  roleMiddleware(['admin', 'doctor']),
  labTestsController.orderLabTest
);

// Get all lab orders
router.get(
  '/orders',
  authMiddleware,
  labTestsController.getAllOrders
);

// Get lab orders for a patient
router.get(
  '/patient/:patientId/orders',
  authMiddleware,
  labTestsController.getPatientOrders
);

// Get lab order by ID
router.get(
  '/orders/:id',
  authMiddleware,
  labTestsController.getOrderById
);

// Submit lab test results (Lab Staff, Admin)
router.post(
  '/orders/:id/results',
  authMiddleware,
  roleMiddleware(['admin', 'nurse']),
  labTestsController.submitResults
);

// Get lab test results
router.get(
  '/orders/:id/results',
  authMiddleware,
  labTestsController.getOrderResults
);

// Update lab order status (Lab Staff, Admin)
router.put(
  '/orders/:id/status',
  authMiddleware,
  roleMiddleware(['admin', 'nurse']),
  labTestsController.updateOrderStatus
);

module.exports = router;
