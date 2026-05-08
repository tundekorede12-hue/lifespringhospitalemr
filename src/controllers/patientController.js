/**
 * Patient Controller
 * Handles all patient-related operations
 */

// Mock database for patients
const patients = new Map();
let patientIdCounter = 1;

/**
 * Create a new patient
 * @route POST /api/v1/patients
 * @access Private (Doctor, Admin)
 */
const createPatient = async (req, res) => {
  try {
    const {
      first_name,
      last_name,
      date_of_birth,
      gender,
      phone,
      email,
      address,
      city,
      state,
      postal_code,
      emergency_contact_name,
      emergency_contact_phone,
      blood_type,
      allergies,
      insurance_provider,
      insurance_number
    } = req.body;

    // Validation
    if (!first_name || !last_name || !date_of_birth || !gender) {
      return res.status(400).json({
        status: 'error',
        message: 'First name, last name, date of birth, and gender are required'
      });
    }

    // Validate email format if provided
    if (email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({
          status: 'error',
          message: 'Invalid email format'
        });
      }
    }

    // Validate date of birth
    const dob = new Date(date_of_birth);
    if (isNaN(dob.getTime())) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid date of birth format (use YYYY-MM-DD)'
      });
    }

    // Generate patient ID
    const patient_id = `PAT${String(patientIdCounter).padStart(6, '0')}`;

    // Create patient object
    const newPatient = {
      id: patientIdCounter,
      patient_id,
      first_name,
      last_name,
      date_of_birth,
      gender,
      phone: phone || null,
      email: email || null,
      address: address || null,
      city: city || null,
      state: state || null,
      postal_code: postal_code || null,
      emergency_contact_name: emergency_contact_name || null,
      emergency_contact_phone: emergency_contact_phone || null,
      blood_type: blood_type || null,
      allergies: allergies || null,
      insurance_provider: insurance_provider || null,
      insurance_number: insurance_number || null,
      status: 'active',
      created_at: new Date(),
      updated_at: new Date()
    };

    // Save patient
    patients.set(patientIdCounter, newPatient);
    patientIdCounter++;

    // Log audit
    console.log(`Patient created: ${patient_id} by user ${req.user.id}`);

    return res.status(201).json({
      status: 'success',
      message: 'Patient created successfully',
      data: newPatient
    });
  } catch (error) {
    console.error('Create patient error:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to create patient',
      error: error.message
    });
  }
};

/**
 * Get all patients
 * @route GET /api/v1/patients
 * @access Private (Any authenticated user)
 * @query {Number} page - Page number (default: 1)
 * @query {Number} limit - Items per page (default: 10)
 * @query {String} status - Filter by status (active, inactive, deceased)
 */
const getAllPatients = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const status = req.query.status || null;
    const search = req.query.search || null;

    let patientList = Array.from(patients.values());

    // Filter by status
    if (status) {
      patientList = patientList.filter(p => p.status === status);
    }

    // Search by name or patient ID
    if (search) {
      const searchLower = search.toLowerCase();
      patientList = patientList.filter(p =>
        p.first_name.toLowerCase().includes(searchLower) ||
        p.last_name.toLowerCase().includes(searchLower) ||
        p.patient_id.includes(searchLower) ||
        (p.email && p.email.toLowerCase().includes(searchLower))
      );
    }

    // Pagination
    const total = patientList.length;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedPatients = patientList.slice(startIndex, endIndex);

    return res.status(200).json({
      status: 'success',
      message: 'Patients retrieved successfully',
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      },
      data: paginatedPatients
    });
  } catch (error) {
    console.error('Get patients error:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to retrieve patients',
      error: error.message
    });
  }
};

/**
 * Get patient by ID
 * @route GET /api/v1/patients/:id
 * @access Private
 */
const getPatientById = async (req, res) => {
  try {
    const { id } = req.params;
    const patientId = isNaN(id) ? null : parseInt(id);

    let patient = null;

    // Search by numeric ID or patient_id (PAT000001)
    if (patientId) {
      patient = patients.get(patientId);
    } else {
      // Search by patient_id string
      for (const p of patients.values()) {
        if (p.patient_id === id) {
          patient = p;
          break;
        }
      }
    }

    if (!patient) {
      return res.status(404).json({
        status: 'error',
        message: 'Patient not found'
      });
    }

    return res.status(200).json({
      status: 'success',
      message: 'Patient retrieved successfully',
      data: patient
    });
  } catch (error) {
    console.error('Get patient error:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to retrieve patient',
      error: error.message
    });
  }
};

/**
 * Update patient
 * @route PUT /api/v1/patients/:id
 * @access Private (Doctor, Admin)
 */
const updatePatient = async (req, res) => {
  try {
    const { id } = req.params;
    const patientId = isNaN(id) ? null : parseInt(id);
    const updateData = req.body;

    // Find patient
    let patient = null;
    let key = null;

    if (patientId) {
      if (patients.has(patientId)) {
        patient = patients.get(patientId);
        key = patientId;
      }
    } else {
      for (const [k, p] of patients.entries()) {
        if (p.patient_id === id) {
          patient = p;
          key = k;
          break;
        }
      }
    }

    if (!patient) {
      return res.status(404).json({
        status: 'error',
        message: 'Patient not found'
      });
    }

    // Allowed fields to update
    const allowedFields = [
      'first_name', 'last_name', 'phone', 'email', 'address',
      'city', 'state', 'postal_code', 'emergency_contact_name',
      'emergency_contact_phone', 'blood_type', 'allergies',
      'insurance_provider', 'insurance_number', 'status'
    ];

    // Update patient with allowed fields only
    allowedFields.forEach(field => {
      if (updateData.hasOwnProperty(field)) {
        patient[field] = updateData[field];
      }
    });

    patient.updated_at = new Date();
    patients.set(key, patient);

    // Log audit
    console.log(`Patient updated: ${patient.patient_id} by user ${req.user.id}`);

    return res.status(200).json({
      status: 'success',
      message: 'Patient updated successfully',
      data: patient
    });
  } catch (error) {
    console.error('Update patient error:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to update patient',
      error: error.message
    });
  }
};

/**
 * Delete patient (soft delete - mark as inactive)
 * @route DELETE /api/v1/patients/:id
 * @access Private (Admin only)
 */
const deletePatient = async (req, res) => {
  try {
    const { id } = req.params;
    const patientId = isNaN(id) ? null : parseInt(id);

    // Find patient
    let patient = null;
    let key = null;

    if (patientId) {
      if (patients.has(patientId)) {
        patient = patients.get(patientId);
        key = patientId;
      }
    } else {
      for (const [k, p] of patients.entries()) {
        if (p.patient_id === id) {
          patient = p;
          key = k;
          break;
        }
      }
    }

    if (!patient) {
      return res.status(404).json({
        status: 'error',
        message: 'Patient not found'
      });
    }

    // Soft delete - mark as inactive
    patient.status = 'inactive';
    patient.updated_at = new Date();
    patients.set(key, patient);

    // Log audit
    console.log(`Patient deactivated: ${patient.patient_id} by user ${req.user.id}`);

    return res.status(200).json({
      status: 'success',
      message: 'Patient deactivated successfully'
    });
  } catch (error) {
    console.error('Delete patient error:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to delete patient',
      error: error.message
    });
  }
};

/**
 * Get patient statistics
 * @route GET /api/v1/patients/stats/overview
 * @access Private (Admin, Doctor)
 */
const getPatientStats = async (req, res) => {
  try {
    const patientList = Array.from(patients.values());

    const stats = {
      total_patients: patientList.length,
      active_patients: patientList.filter(p => p.status === 'active').length,
      inactive_patients: patientList.filter(p => p.status === 'inactive').length,
      patients_with_email: patientList.filter(p => p.email).length,
      patients_with_phone: patientList.filter(p => p.phone).length,
      patients_by_blood_type: {}
    };

    // Count by blood type
    patientList.forEach(p => {
      if (p.blood_type) {
        stats.patients_by_blood_type[p.blood_type] =
          (stats.patients_by_blood_type[p.blood_type] || 0) + 1;
      }
    });

    return res.status(200).json({
      status: 'success',
      message: 'Patient statistics retrieved successfully',
      data: stats
    });
  } catch (error) {
    console.error('Get stats error:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to retrieve statistics',
      error: error.message
    });
  }
};

module.exports = {
  createPatient,
  getAllPatients,
  getPatientById,
  updatePatient,
  deletePatient,
  getPatientStats
};
