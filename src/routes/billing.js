// Billing & Payments Routes
// Protected endpoints for invoice, payment, and billing management

const express = require('express');
const router = express.Router();
const billingController = require('../controllers/billingController');

// Middleware for authentication check (simplified)
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ success: false, message: 'No token provided' });
  // Token validation logic would go here
  next();
};

// Invoice Endpoints
// GET /api/v1/billing/invoices - Get all invoices (Admin, Billing Staff)
router.get('/invoices', authenticateToken, billingController.getAllInvoices);

// GET /api/v1/billing/invoices/:id - Get invoice by ID (Admin, Finance, Patient)
router.get('/invoices/:id', authenticateToken, billingController.getInvoiceById);

// GET /api/v1/billing/patient/:patientId/invoices - Get patient invoices (Patient, Doctor, Admin)
router.get('/patient/:patientId/invoices', authenticateToken, billingController.getPatientInvoices);

// POST /api/v1/billing/invoices - Create invoice (Admin, Doctor, Billing Staff)
router.post('/invoices', authenticateToken, billingController.createInvoice);

// Payment Endpoints
// POST /api/v1/billing/payments - Record payment (Admin, Billing Staff)
router.post('/payments', authenticateToken, billingController.recordPayment);

// GET /api/v1/billing/payments - Get all payments (Admin, Billing Staff)
router.get('/payments', authenticateToken, billingController.getAllPayments);

// GET /api/v1/billing/payments/:id - Get payment by ID (Admin, Billing Staff)
router.get('/payments/:id', authenticateToken, billingController.getPaymentById);

// Billing Package & Info Endpoints
// GET /api/v1/billing/packages - Get billing packages (Any authenticated user)
router.get('/packages', authenticateToken, billingController.getBillingPackages);

// GET /api/v1/billing/summary - Get billing summary (Admin, Finance)
router.get('/summary', authenticateToken, billingController.getBillingSummary);

module.exports = router;
