/**
 * Prescription Controller
 * Handles all prescription-related operations
 */

// Mock database for prescriptions and medications
const prescriptions = new Map();
const medications = new Map();
let prescriptionIdCounter = 1;

// Initialize medications database
const initializeMedications = () => {
  const medList = [
    {
      id: 1,
      medication_name: 'Lisinopril',
      generic_name: 'Lisinopril',
      strength: '10mg',
      form: 'tablet',
      manufacturer: 'Pfizer'
    },
    {
      id: 2,
      medication_name: 'Metformin',
      generic_name: 'Metformin HCL',
      strength: '500mg',
      form: 'tablet',
      manufacturer: 'Merck'
    },
    {
      id: 3,
      medication_name: 'Albuterol',
      generic_name: 'Albuterol Sulfate',
      strength: '90mcg',
      form: 'inhaler',
      manufacturer: 'GSK'
    },
    {
      id: 4,
      medication_name: 'Aspirin',
      generic_name: 'Acetylsalicylic Acid',
      strength: '325mg',
      form: 'tablet',
      manufacturer: 'Bayer'
    },
    {
      id: 5,
      medication_name: 'Amoxicillin',
      generic_name: 'Amoxicillin Trihydrate',
      strength: '500mg',
      form: 'capsule',
      manufacturer: 'Sandoz'
    },
    {
      id: 6,
      medication_name: 'Atorvastatin',
      generic_name: 'Atorvastatin Calcium',
      strength: '20mg',
      form: 'tablet',
      manufacturer: 'Pfizer'
    },
    {
      id: 7,
      medication_name: 'Omeprazole',
      generic_name: 'Omeprazole',
      strength: '20mg',
      form: 'capsule',
      manufacturer: 'AstraZeneca'
    },
    {
      id: 8,
      medication_name: 'Ibuprofen',
      generic_name: 'Ibuprofen',
      strength: '400mg',
      form: 'tablet',
      manufacturer: 'Various'
    }
  ];

  medList.forEach(med => medications.set(med.id, med));
};

initializeMedications();

/**
 * Get all medications or search
 * @route GET /api/v1/prescriptions/medications
 * @access Private
 */
const getMedications = async (req, res) => {
  try {
    const { search } = req.query;
    let medList = Array.from(medications.values());

    // Search by medication name or generic name
    if (search) {
      const searchLower = search.toLowerCase();
      medList = medList.filter(m =>
        m.medication_name.toLowerCase().includes(searchLower) ||
        m.generic_name.toLowerCase().includes(searchLower)
      );
    }

    return res.status(200).json({
      status: 'success',
      message: 'Medications retrieved successfully',
      data: medList
    });
  } catch (error) {
    console.error('Get medications error:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to retrieve medications',
      error: error.message
    });
  }
};

/**
 * Create prescription
 * @route POST /api/v1/prescriptions
 * @access Private (Doctor, Admin)
 */
const createPrescription = async (req, res) => {
  try {
    const {
      patient_id,
      medication_id,
      visit_id,
      dosage,
      frequency,
      duration_days,
      quantity,
      refills_allowed = 0,
      instructions,
      start_date,
      prescribing_reason
    } = req.body;

    // Validation
    if (!patient_id || !medication_id || !dosage || !frequency || !start_date) {
      return res.status(400).json({
        status: 'error',
        message: 'patient_id, medication_id, dosage, frequency, and start_date are required'
      });
    }

    // Validate medication exists
    if (!medications.has(medication_id)) {
      return res.status(400).json({
        status: 'error',
        message: 'Medication not found'
      });
    }

    // Validate start date
    const startDate = new Date(start_date);
    if (isNaN(startDate.getTime())) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid start_date format (use YYYY-MM-DD)'
      });
    }

    // Calculate end date if duration provided
    let endDate = null;
    if (duration_days) {
      endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + duration_days);
    }

    // Generate prescription ID
    const prescription_id = `RX${String(prescriptionIdCounter).padStart(7, '0')}`;

    // Create prescription object
    const newPrescription = {
      id: prescriptionIdCounter,
      prescription_id,
      patient_id,
      doctor_id: req.user.id,
      medication_id,
      visit_id: visit_id || null,
      dosage,
      frequency,
      duration_days: duration_days || null,
      quantity: quantity || null,
      refills_allowed,
      refills_remaining: refills_allowed,
      instructions: instructions || null,
      start_date,
      end_date: endDate ? endDate.toISOString().split('T')[0] : null,
      status: 'active',
      prescribing_reason: prescribing_reason || null,
      created_at: new Date(),
      updated_at: new Date()
    };

    // Save prescription
    prescriptions.set(prescriptionIdCounter, newPrescription);
    prescriptionIdCounter++;

    // Log audit
    console.log(`Prescription created: ${prescription_id} for patient ${patient_id} by doctor ${req.user.id}`);

    return res.status(201).json({
      status: 'success',
      message: 'Prescription created successfully',
      data: newPrescription
    });
  } catch (error) {
    console.error('Create prescription error:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to create prescription',
      error: error.message
    });
  }
};

/**
 * Get all prescriptions
 * @route GET /api/v1/prescriptions
 * @access Private
 */
const getAllPrescriptions = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const status = req.query.status || null;

    let prescList = Array.from(prescriptions.values());

    // Filter by status
    if (status) {
      prescList = prescList.filter(p => p.status === status);
    }

    // Pagination
    const total = prescList.length;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedPrescriptions = prescList.slice(startIndex, endIndex);

    // Add medication info to each prescription
    const prescriptionsWithMeds = paginatedPrescriptions.map(p => ({
      ...p,
      medication: medications.get(p.medication_id)
    }));

    return res.status(200).json({
      status: 'success',
      message: 'Prescriptions retrieved successfully',
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      },
      data: prescriptionsWithMeds
    });
  } catch (error) {
    console.error('Get prescriptions error:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to retrieve prescriptions',
      error: error.message
    });
  }
};

/**
 * Get prescription by ID
 * @route GET /api/v1/prescriptions/:id
 * @access Private
 */
const getPrescriptionById = async (req, res) => {
  try {
    const { id } = req.params;
    const prescriptionId = isNaN(id) ? null : parseInt(id);

    let prescription = null;

    if (prescriptionId) {
      prescription = prescriptions.get(prescriptionId);
    } else {
      // Search by prescription_id (RX0000001)
      for (const p of prescriptions.values()) {
        if (p.prescription_id === id) {
          prescription = p;
          break;
        }
      }
    }

    if (!prescription) {
      return res.status(404).json({
        status: 'error',
        message: 'Prescription not found'
      });
    }

    // Add medication info
    const medication = medications.get(prescription.medication_id);

    return res.status(200).json({
      status: 'success',
      message: 'Prescription retrieved successfully',
      data: {
        ...prescription,
        medication
      }
    });
  } catch (error) {
    console.error('Get prescription error:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to retrieve prescription',
      error: error.message
    });
  }
};

/**
 * Get prescriptions for a patient
 * @route GET /api/v1/prescriptions/patient/:patientId
 * @access Private
 */
const getPatientPrescriptions = async (req, res) => {
  try {
    const { patientId } = req.params;
    const status = req.query.status || null;

    let prescList = Array.from(prescriptions.values())
      .filter(p => p.patient_id === parseInt(patientId));

    if (status) {
      prescList = prescList.filter(p => p.status === status);
    }

    // Add medication info
    const prescriptionsWithMeds = prescList.map(p => ({
      ...p,
      medication: medications.get(p.medication_id)
    }));

    return res.status(200).json({
      status: 'success',
      message: 'Patient prescriptions retrieved successfully',
      data: prescriptionsWithMeds
    });
  } catch (error) {
    console.error('Get patient prescriptions error:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to retrieve patient prescriptions',
      error: error.message
    });
  }
};

/**
 * Request prescription refill
 * @route POST /api/v1/prescriptions/:id/refill
 * @access Private
 */
const requestRefill = async (req, res) => {
  try {
    const { id } = req.params;
    const prescriptionId = isNaN(id) ? null : parseInt(id);

    let prescription = null;
    let key = null;

    if (prescriptionId) {
      if (prescriptions.has(prescriptionId)) {
        prescription = prescriptions.get(prescriptionId);
        key = prescriptionId;
      }
    } else {
      for (const [k, p] of prescriptions.entries()) {
        if (p.prescription_id === id) {
          prescription = p;
          key = k;
          break;
        }
      }
    }

    if (!prescription) {
      return res.status(404).json({
        status: 'error',
        message: 'Prescription not found'
      });
    }

    // Check if prescription is active
    if (prescription.status !== 'active') {
      return res.status(400).json({
        status: 'error',
        message: 'Cannot refill inactive prescription'
      });
    }

    // Check if refills are available
    if (prescription.refills_remaining <= 0) {
      return res.status(400).json({
        status: 'error',
        message: 'No refills remaining. Contact doctor for new prescription.'
      });
    }

    // Decrement refills remaining
    prescription.refills_remaining -= 1;
    prescription.updated_at = new Date();
    prescriptions.set(key, prescription);

    // Log audit
    console.log(`Prescription refilled: ${prescription.prescription_id} - Refills remaining: ${prescription.refills_remaining}`);

    return res.status(200).json({
      status: 'success',
      message: 'Refill requested successfully',
      data: {
        prescription_id: prescription.prescription_id,
        refills_remaining: prescription.refills_remaining,
        message: prescription.refills_remaining === 0 ? 'This was the last refill' : `${prescription.refills_remaining} refills remaining`
      }
    });
  } catch (error) {
    console.error('Request refill error:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to request refill',
      error: error.message
    });
  }
};

/**
 * Update prescription
 * @route PUT /api/v1/prescriptions/:id
 * @access Private (Doctor, Admin)
 */
const updatePrescription = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    const prescriptionId = isNaN(id) ? null : parseInt(id);

    let prescription = null;
    let key = null;

    if (prescriptionId) {
      if (prescriptions.has(prescriptionId)) {
        prescription = prescriptions.get(prescriptionId);
        key = prescriptionId;
      }
    } else {
      for (const [k, p] of prescriptions.entries()) {
        if (p.prescription_id === id) {
          prescription = p;
          key = k;
          break;
        }
      }
    }

    if (!prescription) {
      return res.status(404).json({
        status: 'error',
        message: 'Prescription not found'
      });
    }

    // Allowed fields to update
    const allowedFields = ['dosage', 'frequency', 'instructions', 'refills_allowed', 'status'];

    allowedFields.forEach(field => {
      if (updateData.hasOwnProperty(field)) {
        prescription[field] = updateData[field];
      }
    });

    prescription.updated_at = new Date();
    prescriptions.set(key, prescription);

    console.log(`Prescription updated: ${prescription.prescription_id}`);

    return res.status(200).json({
      status: 'success',
      message: 'Prescription updated successfully',
      data: prescription
    });
  } catch (error) {
    console.error('Update prescription error:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to update prescription',
      error: error.message
    });
  }
};

/**
 * Cancel prescription
 * @route DELETE /api/v1/prescriptions/:id
 * @access Private (Doctor, Admin)
 */
const cancelPrescription = async (req, res) => {
  try {
    const { id } = req.params;
    const prescriptionId = isNaN(id) ? null : parseInt(id);

    let prescription = null;
    let key = null;

    if (prescriptionId) {
      if (prescriptions.has(prescriptionId)) {
        prescription = prescriptions.get(prescriptionId);
        key = prescriptionId;
      }
    } else {
      for (const [k, p] of prescriptions.entries()) {
        if (p.prescription_id === id) {
          prescription = p;
          key = k;
          break;
        }
      }
    }

    if (!prescription) {
      return res.status(404).json({
        status: 'error',
        message: 'Prescription not found'
      });
    }

    prescription.status = 'cancelled';
    prescription.updated_at = new Date();
    prescriptions.set(key, prescription);

    console.log(`Prescription cancelled: ${prescription.prescription_id}`);

    return res.status(200).json({
      status: 'success',
      message: 'Prescription cancelled successfully'
    });
  } catch (error) {
    console.error('Cancel prescription error:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to cancel prescription',
      error: error.message
    });
  }
};

module.exports = {
  getMedications,
  createPrescription,
  getAllPrescriptions,
  getPrescriptionById,
  getPatientPrescriptions,
  requestRefill,
  updatePrescription,
  cancelPrescription
};
