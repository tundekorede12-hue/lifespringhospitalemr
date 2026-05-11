/**
 * Billing & Payments Controller
 * Handles invoices, payments, and financial operations
 */

// Mock database for invoices, payments, and packages
const invoices = new Map();
const payments = new Map();
const billingPackages = new Map();
let invoiceCounter = 1;
let paymentCounter = 1;

// Initialize billing packages
const initializePackages = () => {
  const packages = [
    { id: 1, name: 'Basic Consultation', price: 1500, description: 'Doctor consultation' },
    { id: 2, name: 'Lab Tests Package', price: 1200, description: 'Basic blood work' },
    { id: 3, name: 'Hospital Stay (Per Day)', price: 1750, description: 'Daily room and care' },
    { id: 4, name: 'Surgery (Standard)', price: 5000, description: 'Standard surgical procedure' },
    { id: 5, name: 'Imaging (X-Ray)', price: 800, description: 'X-ray imaging' },
    { id: 6, name: 'Imaging (CT Scan)', price: 2500, description: 'CT scan imaging' }
  ];
  packages.forEach(pkg => billingPackages.set(pkg.id, pkg));
};

initializePackages();

// Mock patient database
const mockPatients = {
  1: { id: 1, first_name: 'John', last_name: 'Doe' },
  2: { id: 2, first_name: 'Jane', last_name: 'Smith' },
  3: { id: 3, first_name: 'Bob', last_name: 'Johnson' }
};

/**
 * Get all invoices
 * @route GET /api/v1/billing/invoices
 * @access Private (Admin, Billing Staff)
 */
const getAllInvoices = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const status = req.query.status || null;
    const patientId = req.query.patient_id || null;

    let invoiceList = Array.from(invoices.values());

    // Filter by status
    if (status) {
      invoiceList = invoiceList.filter(inv => inv.status === status);
    }

    // Filter by patient
    if (patientId) {
      invoiceList = invoiceList.filter(inv => inv.patient_id === parseInt(patientId));
    }

    // Pagination
    const total = invoiceList.length;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedInvoices = invoiceList.slice(startIndex, endIndex);

    return res.status(200).json({
      success: true,
      data: paginatedInvoices,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get invoices error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve invoices',
      error: error.message
    });
  }
};

/**
 * Get invoice by ID
 * @route GET /api/v1/billing/invoices/:id
 * @access Private
 */
const getInvoiceById = async (req, res) => {
  try {
    const { id } = req.params;
    const invoiceId = isNaN(id) ? null : parseInt(id);
    let invoice = null;

    if (invoiceId) {
      invoice = invoices.get(invoiceId);
    } else {
      for (const inv of invoices.values()) {
        if (inv.id === id) {
          invoice = inv;
          break;
        }
      }
    }

    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: 'Invoice not found'
      });
    }

    return res.status(200).json({
      success: true,
      data: invoice
    });
  } catch (error) {
    console.error('Get invoice error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve invoice',
      error: error.message
    });
  }
};

/**
 * Get invoices for a patient
 * @route GET /api/v1/billing/patient/:patientId/invoices
 * @access Private
 */
const getPatientInvoices = async (req, res) => {
  try {
    const { patientId } = req.params;
    const patientIdInt = parseInt(patientId);

    const patientInvoices = Array.from(invoices.values())
      .filter(inv => inv.patient_id === patientIdInt);

    const totalAmount = patientInvoices.reduce((sum, inv) => sum + inv.total_amount, 0);
    const paidAmount = patientInvoices.reduce((sum, inv) => sum + inv.paid_amount, 0);
    const pendingAmount = totalAmount - paidAmount;

    return res.status(200).json({
      success: true,
      data: patientInvoices,
      summary: {
        total_invoices: patientInvoices.length,
        total_amount: totalAmount,
        paid_amount: paidAmount,
        pending_amount: pendingAmount
      }
    });
  } catch (error) {
    console.error('Get patient invoices error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve patient invoices',
      error: error.message
    });
  }
};

/**
 * Create invoice
 * @route POST /api/v1/billing/invoices
 * @access Private (Admin, Doctor, Billing Staff)
 */
const createInvoice = async (req, res) => {
  try {
    const {
      patient_id,
      items,
      insurance_provider = null,
      insurance_claim_id = null
    } = req.body;

    // Validation
    if (!patient_id || !items || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'patient_id and items are required'
      });
    }

    // Calculate total
    const totalAmount = items.reduce((sum, item) => sum + item.total, 0);

    // Generate invoice ID
    const invoiceId = `INV${String(invoiceCounter).padStart(7, '0')}`;

    // Calculate due date (14 days from now)
    const invoiceDate = new Date();
    const dueDate = new Date(invoiceDate);
    dueDate.setDate(dueDate.getDate() + 14);

    // Get patient name
    const patient = mockPatients[patient_id] || { first_name: 'Patient', last_name: '' };
    const patientName = `${patient.first_name} ${patient.last_name}`;

    const newInvoice = {
      id: invoiceId,
      patient_id,
      patient_name: patientName,
      invoice_date: invoiceDate.toISOString().split('T')[0],
      due_date: dueDate.toISOString().split('T')[0],
      status: 'pending',
      total_amount: totalAmount,
      paid_amount: 0,
      balance: totalAmount,
      items,
      insurance_provider,
      insurance_claim_id,
      created_at: new Date().toISOString(),
      paid_at: null
    };

    invoices.set(invoiceCounter, newInvoice);
    invoiceCounter++;

    console.log(`Invoice created: ${invoiceId} for patient ${patient_id}`);

    return res.status(201).json({
      success: true,
      message: 'Invoice created successfully',
      data: newInvoice
    });
  } catch (error) {
    console.error('Create invoice error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create invoice',
      error: error.message
    });
  }
};

/**
 * Record payment
 * @route POST /api/v1/billing/payments
 * @access Private (Admin, Billing Staff)
 */
const recordPayment = async (req, res) => {
  try {
    const {
      invoice_id,
      amount,
      payment_method = 'cash'
    } = req.body;

    // Validation
    if (!invoice_id || !amount) {
      return res.status(400).json({
        success: false,
        message: 'invoice_id and amount are required'
      });
    }

    // Find invoice
    let invoice = null;
    let invoiceKey = null;

    for (const [key, inv] of invoices.entries()) {
      if (inv.id === invoice_id) {
        invoice = inv;
        invoiceKey = key;
        break;
      }
    }

    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: 'Invoice not found'
      });
    }

    // Generate payment ID
    const paymentId = `PAY${String(paymentCounter).padStart(7, '0')}`;
    const transactionId = `TXN${Date.now()}`;
    const referenceNumber = `REF-${new Date().getFullYear()}-${paymentCounter}`;

    // Create payment record
    const newPayment = {
      id: paymentId,
      invoice_id,
      patient_id: invoice.patient_id,
      amount,
      payment_method,
      payment_date: new Date().toISOString(),
      status: 'completed',
      transaction_id: transactionId,
      reference_number: referenceNumber
    };

    // Update invoice
    invoice.paid_amount += amount;
    invoice.balance = invoice.total_amount - invoice.paid_amount;

    // Update invoice status
    if (invoice.balance <= 0) {
      invoice.status = 'paid';
      invoice.paid_at = new Date().toISOString();
    } else if (invoice.paid_amount > 0) {
      invoice.status = 'partial';
    }

    // Save payment and updated invoice
    payments.set(paymentCounter, newPayment);
    invoices.set(invoiceKey, invoice);
    paymentCounter++;

    console.log(`Payment recorded: ${paymentId} for invoice ${invoice_id}`);

    return res.status(201).json({
      success: true,
      message: 'Payment recorded successfully',
      data: {
        payment: newPayment,
        invoice_updated: invoice
      }
    });
  } catch (error) {
    console.error('Record payment error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to record payment',
      error: error.message
    });
  }
};

/**
 * Get all payments
 * @route GET /api/v1/billing/payments
 * @access Private (Admin, Billing Staff)
 */
const getAllPayments = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const status = req.query.status || null;
    const invoiceId = req.query.invoice_id || null;

    let paymentList = Array.from(payments.values());

    if (status) {
      paymentList = paymentList.filter(p => p.status === status);
    }

    if (invoiceId) {
      paymentList = paymentList.filter(p => p.invoice_id === invoiceId);
    }

    const total = paymentList.length;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedPayments = paymentList.slice(startIndex, endIndex);

    return res.status(200).json({
      success: true,
      data: paginatedPayments,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get payments error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve payments',
      error: error.message
    });
  }
};

/**
 * Get payment by ID
 * @route GET /api/v1/billing/payments/:id
 * @access Private
 */
const getPaymentById = async (req, res) => {
  try {
    const { id } = req.params;

    let payment = null;
    for (const p of payments.values()) {
      if (p.id === id) {
        payment = p;
        break;
      }
    }

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }

    return res.status(200).json({
      success: true,
      data: payment
    });
  } catch (error) {
    console.error('Get payment error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve payment',
      error: error.message
    });
  }
};

/**
 * Get billing packages
 * @route GET /api/v1/billing/packages
 * @access Private
 */
const getBillingPackages = async (req, res) => {
  try {
    const packagesList = Array.from(billingPackages.values());

    return res.status(200).json({
      success: true,
      data: packagesList
    });
  } catch (error) {
    console.error('Get packages error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve packages',
      error: error.message
    });
  }
};

/**
 * Get billing summary
 * @route GET /api/v1/billing/summary
 * @access Private (Admin, Finance)
 */
const getBillingSummary = async (req, res) => {
  try {
    const invoiceList = Array.from(invoices.values());
    const paymentList = Array.from(payments.values());

    // Invoice stats
    const totalInvoices = invoiceList.length;
    const paidInvoices = invoiceList.filter(inv => inv.status === 'paid').length;
    const pendingInvoices = invoiceList.filter(inv => inv.status === 'pending').length;
    const partialInvoices = invoiceList.filter(inv => inv.status === 'partial').length;

    // Amount stats
    const totalAmount = invoiceList.reduce((sum, inv) => sum + inv.total_amount, 0);
    const paidAmount = invoiceList.reduce((sum, inv) => sum + inv.paid_amount, 0);
    const pendingAmount = totalAmount - paidAmount;
    const collectionRate = totalAmount > 0 ? ((paidAmount / totalAmount) * 100).toFixed(2) : 0;

    return res.status(200).json({
      success: true,
      data: {
        invoices: {
          total: totalInvoices,
          by_status: {
            paid: paidInvoices,
            pending: pendingInvoices,
            partial: partialInvoices,
            overdue: 0
          },
          total_amount: totalAmount,
          paid_amount: paidAmount,
          pending_amount: pendingAmount
        },
        payments: {
          total_payments: paymentList.length,
          collected_amount: paidAmount
        },
        financial_summary: {
          total_revenue: paidAmount,
          outstanding_balance: pendingAmount,
          collection_rate: `${collectionRate}%`
        }
      }
    });
  } catch (error) {
    console.error('Get summary error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve billing summary',
      error: error.message
    });
  }
};

module.exports = {
  getAllInvoices,
  getInvoiceById,
  getPatientInvoices,
  createInvoice,
  recordPayment,
  getAllPayments,
  getPaymentById,
  getBillingPackages,
  getBillingSummary
};
