/**
 * Lab Tests Controller
 * Handles lab test ordering, tracking, and results management
 */

// Mock database for lab tests, orders, and results
const labTests = new Map();
const labOrders = new Map();
const labResults = new Map();
let orderIdCounter = 1;
let resultIdCounter = 1;

// Initialize lab tests catalog
const initializeLabTests = () => {
  const tests = [
    {
      id: 1,
      test_code: 'CBC',
      test_name: 'Complete Blood Count',
      description: 'Measures red cells, white cells, hemoglobin',
      normal_range: 'Varies by component',
      unit: 'cells/mcL',
      cost: 35.00
    },
    {
      id: 2,
      test_code: 'BMP',
      test_name: 'Basic Metabolic Panel',
      description: 'Tests kidney function and electrolytes',
      normal_range: 'Varies by component',
      unit: 'mmol/L or mg/dL',
      cost: 45.00
    },
    {
      id: 3,
      test_code: 'LFT',
      test_name: 'Liver Function Tests',
      description: 'Tests liver enzymes and bilirubin',
      normal_range: 'Varies by component',
      unit: 'U/L or mg/dL',
      cost: 55.00
    },
    {
      id: 4,
      test_code: 'TSH',
      test_name: 'Thyroid Stimulating Hormone',
      description: 'Tests thyroid function',
      normal_range: '0.4-4.0',
      unit: 'mIU/L',
      cost: 40.00
    },
    {
      id: 5,
      test_code: 'FBS',
      test_name: 'Fasting Blood Sugar',
      description: 'Glucose level after 8-12 hour fast',
      normal_range: '70-100',
      unit: 'mg/dL',
      cost: 25.00
    },
    {
      id: 6,
      test_code: 'LIPID',
      test_name: 'Lipid Panel',
      description: 'Cholesterol and triglycerides',
      normal_range: 'Varies by component',
      unit: 'mg/dL',
      cost: 60.00
    }
  ];

  tests.forEach(test => labTests.set(test.id, test));
};

initializeLabTests();

/**
 * Get available lab tests
 * @route GET /api/v1/lab-tests/available
 * @access Private
 */
const getAvailableTests = async (req, res) => {
  try {
    const { search } = req.query;
    let testList = Array.from(labTests.values());

    // Search by test code or name
    if (search) {
      const searchLower = search.toLowerCase();
      testList = testList.filter(t =>
        t.test_code.toLowerCase().includes(searchLower) ||
        t.test_name.toLowerCase().includes(searchLower)
      );
    }

    return res.status(200).json({
      status: 'success',
      message: 'Lab tests retrieved successfully',
      data: testList
    });
  } catch (error) {
    console.error('Get available tests error:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to retrieve lab tests',
      error: error.message
    });
  }
};

/**
 * Order a lab test
 * @route POST /api/v1/lab-tests/orders
 * @access Private (Doctor, Admin)
 */
const orderLabTest = async (req, res) => {
  try {
    const { patient_id, test_id, visit_id, priority = 'routine', notes } = req.body;

    // Validation
    if (!patient_id || !test_id) {
      return res.status(400).json({
        status: 'error',
        message: 'patient_id and test_id are required'
      });
    }

    // Validate test exists
    if (!labTests.has(test_id)) {
      return res.status(400).json({
        status: 'error',
        message: 'Lab test not found'
      });
    }

    // Validate priority
    const validPriorities = ['routine', 'urgent'];
    if (!validPriorities.includes(priority)) {
      return res.status(400).json({
        status: 'error',
        message: 'Priority must be routine or urgent'
      });
    }

    // Generate order ID
    const order_id = `ORD${String(orderIdCounter).padStart(7, '0')}`;

    // Calculate expected result date (routine: 24-48 hours, urgent: 2-4 hours)
    const expectedResultDate = new Date();
    if (priority === 'urgent') {
      expectedResultDate.setHours(expectedResultDate.getHours() + 4);
    } else {
      expectedResultDate.setDate(expectedResultDate.getDate() + 1);
    }

    // Create order object
    const newOrder = {
      id: orderIdCounter,
      order_id,
      patient_id,
      doctor_id: req.user.id,
      visit_id: visit_id || null,
      test_id,
      order_date: new Date(),
      sample_collection_date: null,
      expected_result_date: expectedResultDate,
      status: 'pending',
      priority,
      notes: notes || null,
      created_at: new Date(),
      updated_at: new Date()
    };

    // Save order
    labOrders.set(orderIdCounter, newOrder);
    orderIdCounter++;

    // Log audit
    console.log(`Lab test ordered: ${order_id} for patient ${patient_id} by doctor ${req.user.id}`);

    return res.status(201).json({
      status: 'success',
      message: 'Lab test ordered successfully',
      data: newOrder
    });
  } catch (error) {
    console.error('Order lab test error:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to order lab test',
      error: error.message
    });
  }
};

/**
 * Get all lab orders
 * @route GET /api/v1/lab-tests/orders
 * @access Private
 */
const getAllOrders = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const status = req.query.status || null;
    const priority = req.query.priority || null;

    let orderList = Array.from(labOrders.values());

    // Filter by status
    if (status) {
      orderList = orderList.filter(o => o.status === status);
    }

    // Filter by priority
    if (priority) {
      orderList = orderList.filter(o => o.priority === priority);
    }

    // Sort by date (newest first)
    orderList.sort((a, b) => new Date(b.order_date) - new Date(a.order_date));

    // Pagination
    const total = orderList.length;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedOrders = orderList.slice(startIndex, endIndex);

    // Add test info to each order
    const ordersWithTests = paginatedOrders.map(o => ({
      ...o,
      test: labTests.get(o.test_id)
    }));

    return res.status(200).json({
      status: 'success',
      message: 'Lab orders retrieved successfully',
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      },
      data: ordersWithTests
    });
  } catch (error) {
    console.error('Get all orders error:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to retrieve lab orders',
      error: error.message
    });
  }
};

/**
 * Get lab order by ID
 * @route GET /api/v1/lab-tests/orders/:id
 * @access Private
 */
const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    const orderId = isNaN(id) ? null : parseInt(id);

    let order = null;

    if (orderId) {
      order = labOrders.get(orderId);
    } else {
      // Search by order_id (ORD0000001)
      for (const o of labOrders.values()) {
        if (o.order_id === id) {
          order = o;
          break;
        }
      }
    }

    if (!order) {
      return res.status(404).json({
        status: 'error',
        message: 'Lab order not found'
      });
    }

    // Add test info
    const test = labTests.get(order.test_id);

    return res.status(200).json({
      status: 'success',
      message: 'Lab order retrieved successfully',
      data: {
        ...order,
        test
      }
    });
  } catch (error) {
    console.error('Get order error:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to retrieve lab order',
      error: error.message
    });
  }
};

/**
 * Get lab orders for a patient
 * @route GET /api/v1/lab-tests/patient/:patientId/orders
 * @access Private
 */
const getPatientOrders = async (req, res) => {
  try {
    const { patientId } = req.params;
    const status = req.query.status || null;

    let orderList = Array.from(labOrders.values())
      .filter(o => o.patient_id === parseInt(patientId));

    if (status) {
      orderList = orderList.filter(o => o.status === status);
    }

    // Sort by date (newest first)
    orderList.sort((a, b) => new Date(b.order_date) - new Date(a.order_date));

    // Add test info
    const ordersWithTests = orderList.map(o => ({
      ...o,
      test: labTests.get(o.test_id)
    }));

    return res.status(200).json({
      status: 'success',
      message: 'Patient lab orders retrieved successfully',
      data: ordersWithTests
    });
  } catch (error) {
    console.error('Get patient orders error:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to retrieve patient lab orders',
      error: error.message
    });
  }
};

/**
 * Submit lab test results
 * @route POST /api/v1/lab-tests/orders/:id/results
 * @access Private (Lab Staff, Admin)
 */
const submitResults = async (req, res) => {
  try {
    const { id } = req.params;
    const { result_value, reference_range, unit, abnormal_flag, notes } = req.body;
    const orderId = isNaN(id) ? null : parseInt(id);

    // Validation
    if (!result_value) {
      return res.status(400).json({
        status: 'error',
        message: 'result_value is required'
      });
    }

    // Validate abnormal flag
    const validFlags = ['H', 'L', 'N'];
    if (abnormal_flag && !validFlags.includes(abnormal_flag)) {
      return res.status(400).json({
        status: 'error',
        message: 'abnormal_flag must be H (high), L (low), or N (normal)'
      });
    }

    let order = null;
    let key = null;

    if (orderId) {
      if (labOrders.has(orderId)) {
        order = labOrders.get(orderId);
        key = orderId;
      }
    } else {
      for (const [k, o] of labOrders.entries()) {
        if (o.order_id === id) {
          order = o;
          key = k;
          break;
        }
      }
    }

    if (!order) {
      return res.status(404).json({
        status: 'error',
        message: 'Lab order not found'
      });
    }

    // Create result object
    const result = {
      id: resultIdCounter,
      order_id: order.id,
      result_value,
      reference_range: reference_range || null,
      unit: unit || null,
      abnormal_flag: abnormal_flag || 'N',
      result_date: new Date(),
      reviewed_by: req.user.id,
      review_date: new Date(),
      notes: notes || null,
      created_at: new Date()
    };

    // Save result
    labResults.set(resultIdCounter, result);
    resultIdCounter++;

    // Update order status to completed
    order.status = 'completed';
    order.updated_at = new Date();
    labOrders.set(key, order);

    // Log audit
    console.log(`Lab result submitted: ${order.order_id} by user ${req.user.id}`);

    return res.status(201).json({
      status: 'success',
      message: 'Lab test result submitted successfully',
      data: result
    });
  } catch (error) {
    console.error('Submit results error:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to submit lab results',
      error: error.message
    });
  }
};

/**
 * Get lab test results
 * @route GET /api/v1/lab-tests/orders/:id/results
 * @access Private
 */
const getOrderResults = async (req, res) => {
  try {
    const { id } = req.params;
    const orderId = isNaN(id) ? null : parseInt(id);

    let order = null;

    if (orderId) {
      order = labOrders.get(orderId);
    } else {
      for (const o of labOrders.values()) {
        if (o.order_id === id) {
          order = o;
          break;
        }
      }
    }

    if (!order) {
      return res.status(404).json({
        status: 'error',
        message: 'Lab order not found'
      });
    }

    // Find results for this order
    const results = Array.from(labResults.values())
      .filter(r => r.order_id === order.id);

    if (results.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'No results found for this order. Results may not have been submitted yet.'
      });
    }

    return res.status(200).json({
      status: 'success',
      message: 'Lab test results retrieved successfully',
      data: {
        order: order,
        test: labTests.get(order.test_id),
        results: results
      }
    });
  } catch (error) {
    console.error('Get results error:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to retrieve lab results',
      error: error.message
    });
  }
};

/**
 * Update lab order status
 * @route PUT /api/v1/lab-tests/orders/:id/status
 * @access Private (Lab Staff, Admin)
 */
const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, sample_collection_date } = req.body;
    const orderId = isNaN(id) ? null : parseInt(id);

    // Validation
    if (!status) {
      return res.status(400).json({
        status: 'error',
        message: 'status is required'
      });
    }

    // Validate status
    const validStatuses = ['pending', 'collected', 'processing', 'completed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid status. Must be: pending, collected, processing, completed, or cancelled'
      });
    }

    let order = null;
    let key = null;

    if (orderId) {
      if (labOrders.has(orderId)) {
        order = labOrders.get(orderId);
        key = orderId;
      }
    } else {
      for (const [k, o] of labOrders.entries()) {
        if (o.order_id === id) {
          order = o;
          key = k;
          break;
        }
      }
    }

    if (!order) {
      return res.status(404).json({
        status: 'error',
        message: 'Lab order not found'
      });
    }

    // Update status
    order.status = status;
    if (sample_collection_date) {
      order.sample_collection_date = new Date(sample_collection_date);
    }
    order.updated_at = new Date();
    labOrders.set(key, order);

    console.log(`Lab order status updated: ${order.order_id} -> ${status}`);

    return res.status(200).json({
      status: 'success',
      message: 'Lab order status updated successfully',
      data: order
    });
  } catch (error) {
    console.error('Update status error:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to update lab order status',
      error: error.message
    });
  }
};

module.exports = {
  getAvailableTests,
  orderLabTest,
  getAllOrders,
  getOrderById,
  getPatientOrders,
  submitResults,
  getOrderResults,
  updateOrderStatus
};
