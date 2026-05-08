-- Lifespring Hospital EMR Database Schema
-- Created: 2026-05-08

-- =====================================================
-- USER & AUTHENTICATION TABLES
-- =====================================================

-- Users table (doctors, nurses, admin staff)
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone VARCHAR(15),
    role VARCHAR(50) NOT NULL DEFAULT 'staff', -- admin, doctor, nurse, staff, patient
    department VARCHAR(100),
    employee_id VARCHAR(50) UNIQUE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    last_login TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_role (role)
);

-- User sessions for tracking logins
CREATE TABLE user_sessions (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL,
    token VARCHAR(500) UNIQUE NOT NULL,
    ip_address VARCHAR(45),
    user_agent TEXT,
    login_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    logout_at TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_token (token)
);

-- =====================================================
-- PATIENT TABLES
-- =====================================================

-- Patients table
CREATE TABLE patients (
    id SERIAL PRIMARY KEY,
    patient_id VARCHAR(50) UNIQUE NOT NULL, -- Hospital assigned ID
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    date_of_birth DATE NOT NULL,
    gender ENUM('M', 'F', 'Other') NOT NULL,
    phone VARCHAR(15),
    email VARCHAR(255),
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(100),
    postal_code VARCHAR(20),
    emergency_contact_name VARCHAR(100),
    emergency_contact_phone VARCHAR(15),
    blood_type VARCHAR(10),
    allergies TEXT,
    insurance_provider VARCHAR(100),
    insurance_number VARCHAR(100),
    registration_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(50) DEFAULT 'active', -- active, inactive, deceased
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uq_patient_id (patient_id),
    INDEX idx_patient_id (patient_id),
    INDEX idx_email (email),
    INDEX idx_status (status)
);

-- Patient medical history
CREATE TABLE medical_history (
    id SERIAL PRIMARY KEY,
    patient_id INT NOT NULL,
    condition_name VARCHAR(255) NOT NULL,
    description TEXT,
    diagnosis_date DATE,
    status VARCHAR(50), -- active, resolved, chronic
    notes TEXT,
    recorded_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
    FOREIGN KEY (recorded_by) REFERENCES users(id),
    INDEX idx_patient_id (patient_id),
    INDEX idx_status (status)
);

-- Patient vitals/measurements
CREATE TABLE patient_vitals (
    id SERIAL PRIMARY KEY,
    patient_id INT NOT NULL,
    blood_pressure_systolic INT,
    blood_pressure_diastolic INT,
    heart_rate INT,
    temperature DECIMAL(5, 2),
    respiratory_rate INT,
    weight DECIMAL(6, 2), -- in kg
    height DECIMAL(6, 2), -- in cm
    bmi DECIMAL(5, 2),
    oxygen_saturation DECIMAL(5, 2), -- percentage
    recorded_by INT,
    recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    notes TEXT,
    FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
    FOREIGN KEY (recorded_by) REFERENCES users(id),
    INDEX idx_patient_id (patient_id),
    INDEX idx_recorded_at (recorded_at)
);

-- =====================================================
-- APPOINTMENTS & VISITS
-- =====================================================

-- Appointments
CREATE TABLE appointments (
    id SERIAL PRIMARY KEY,
    appointment_id VARCHAR(50) UNIQUE NOT NULL,
    patient_id INT NOT NULL,
    doctor_id INT NOT NULL,
    appointment_date DATE NOT NULL,
    appointment_time TIME NOT NULL,
    duration_minutes INT DEFAULT 30,
    reason VARCHAR(255),
    status VARCHAR(50) DEFAULT 'scheduled', -- scheduled, confirmed, completed, cancelled, no-show
    appointment_type VARCHAR(100), -- consultation, follow-up, routine checkup, urgent
    location VARCHAR(255),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
    FOREIGN KEY (doctor_id) REFERENCES users(id),
    INDEX idx_patient_id (patient_id),
    INDEX idx_doctor_id (doctor_id),
    INDEX idx_appointment_date (appointment_date),
    INDEX idx_status (status)
);

-- Patient visits/consultations
CREATE TABLE visits (
    id SERIAL PRIMARY KEY,
    visit_id VARCHAR(50) UNIQUE NOT NULL,
    appointment_id INT,
    patient_id INT NOT NULL,
    doctor_id INT NOT NULL,
    visit_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    chief_complaint TEXT,
    diagnosis TEXT NOT NULL,
    treatment_plan TEXT,
    notes TEXT,
    visit_type VARCHAR(50), -- consultation, follow-up, emergency
    status VARCHAR(50) DEFAULT 'completed',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (appointment_id) REFERENCES appointments(id),
    FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
    FOREIGN KEY (doctor_id) REFERENCES users(id),
    INDEX idx_patient_id (patient_id),
    INDEX idx_doctor_id (doctor_id),
    INDEX idx_visit_date (visit_date)
);

-- =====================================================
-- PRESCRIPTIONS & MEDICATIONS
-- =====================================================

-- Medications database
CREATE TABLE medications (
    id SERIAL PRIMARY KEY,
    medication_name VARCHAR(255) UNIQUE NOT NULL,
    generic_name VARCHAR(255),
    strength VARCHAR(100),
    form VARCHAR(100), -- tablet, capsule, liquid, injection, etc.
    manufacturer VARCHAR(255),
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_medication_name (medication_name)
);

-- Prescriptions
CREATE TABLE prescriptions (
    id SERIAL PRIMARY KEY,
    prescription_id VARCHAR(50) UNIQUE NOT NULL,
    patient_id INT NOT NULL,
    doctor_id INT NOT NULL,
    medication_id INT NOT NULL,
    visit_id INT,
    dosage VARCHAR(100) NOT NULL, -- e.g., "500mg"
    frequency VARCHAR(100) NOT NULL, -- e.g., "twice daily"
    duration_days INT,
    quantity INT,
    refills_allowed INT DEFAULT 0,
    refills_remaining INT,
    instructions TEXT,
    start_date DATE NOT NULL,
    end_date DATE,
    status VARCHAR(50) DEFAULT 'active', -- active, completed, cancelled, expired
    prescribing_reason TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
    FOREIGN KEY (doctor_id) REFERENCES users(id),
    FOREIGN KEY (medication_id) REFERENCES medications(id),
    FOREIGN KEY (visit_id) REFERENCES visits(id),
    INDEX idx_patient_id (patient_id),
    INDEX idx_prescription_id (prescription_id),
    INDEX idx_status (status)
);

-- =====================================================
-- LABORATORY & TESTS
-- =====================================================

-- Lab tests catalog
CREATE TABLE lab_tests (
    id SERIAL PRIMARY KEY,
    test_code VARCHAR(50) UNIQUE NOT NULL,
    test_name VARCHAR(255) NOT NULL,
    description TEXT,
    normal_range VARCHAR(255),
    unit VARCHAR(50),
    cost DECIMAL(10, 2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_test_code (test_code)
);

-- Lab test orders
CREATE TABLE lab_orders (
    id SERIAL PRIMARY KEY,
    order_id VARCHAR(50) UNIQUE NOT NULL,
    patient_id INT NOT NULL,
    doctor_id INT NOT NULL,
    visit_id INT,
    test_id INT NOT NULL,
    order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    sample_collection_date TIMESTAMP,
    expected_result_date DATE,
    status VARCHAR(50) DEFAULT 'pending', -- pending, collected, processing, completed, cancelled
    priority VARCHAR(50) DEFAULT 'routine', -- routine, urgent
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
    FOREIGN KEY (doctor_id) REFERENCES users(id),
    FOREIGN KEY (visit_id) REFERENCES visits(id),
    FOREIGN KEY (test_id) REFERENCES lab_tests(id),
    INDEX idx_patient_id (patient_id),
    INDEX idx_status (status),
    INDEX idx_order_date (order_date)
);

-- Lab test results
CREATE TABLE lab_results (
    id SERIAL PRIMARY KEY,
    order_id INT NOT NULL,
    result_value VARCHAR(255),
    reference_range VARCHAR(255),
    unit VARCHAR(50),
    abnormal_flag VARCHAR(10), -- H (high), L (low), N (normal)
    result_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    reviewed_by INT,
    review_date TIMESTAMP,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES lab_orders(id) ON DELETE CASCADE,
    FOREIGN KEY (reviewed_by) REFERENCES users(id),
    INDEX idx_order_id (order_id)
);

-- =====================================================
-- MEDICAL DOCUMENTS
-- =====================================================

-- Medical documents (reports, X-rays, notes, etc.)
CREATE TABLE medical_documents (
    id SERIAL PRIMARY KEY,
    document_id VARCHAR(50) UNIQUE NOT NULL,
    patient_id INT NOT NULL,
    visit_id INT,
    document_type VARCHAR(100), -- report, image, prescription, lab_result, discharge_summary
    file_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_size INT,
    mime_type VARCHAR(100),
    uploaded_by INT NOT NULL,
    upload_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    description TEXT,
    is_encrypted BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
    FOREIGN KEY (visit_id) REFERENCES visits(id),
    FOREIGN KEY (uploaded_by) REFERENCES users(id),
    INDEX idx_patient_id (patient_id),
    INDEX idx_document_id (document_id),
    INDEX idx_document_type (document_type)
);

-- =====================================================
-- AUDIT & COMPLIANCE
-- =====================================================

-- Audit logs for HIPAA compliance
CREATE TABLE audit_logs (
    id SERIAL PRIMARY KEY,
    user_id INT,
    action VARCHAR(255) NOT NULL,
    entity_type VARCHAR(100), -- patient, prescription, appointment, etc.
    entity_id INT,
    old_values JSON,
    new_values JSON,
    ip_address VARCHAR(45),
    user_agent TEXT,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    INDEX idx_user_id (user_id),
    INDEX idx_timestamp (timestamp),
    INDEX idx_entity_type (entity_type)
);

-- Patient access logs (who accessed patient records and when)
CREATE TABLE patient_access_logs (
    id SERIAL PRIMARY KEY,
    patient_id INT NOT NULL,
    accessed_by INT,
    access_type VARCHAR(50), -- view, edit, delete
    reason VARCHAR(255),
    ip_address VARCHAR(45),
    access_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
    FOREIGN KEY (accessed_by) REFERENCES users(id),
    INDEX idx_patient_id (patient_id),
    INDEX idx_accessed_by (accessed_by),
    INDEX idx_access_timestamp (access_timestamp)
);

-- =====================================================
-- BILLING & PAYMENTS
-- =====================================================

-- Invoices/Bills
CREATE TABLE invoices (
    id SERIAL PRIMARY KEY,
    invoice_number VARCHAR(50) UNIQUE NOT NULL,
    patient_id INT NOT NULL,
    visit_id INT,
    invoice_date DATE NOT NULL,
    due_date DATE,
    subtotal DECIMAL(10, 2),
    tax DECIMAL(10, 2),
    total_amount DECIMAL(10, 2) NOT NULL,
    paid_amount DECIMAL(10, 2) DEFAULT 0,
    status VARCHAR(50) DEFAULT 'pending', -- pending, paid, partially_paid, overdue, cancelled
    payment_method VARCHAR(100),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
    FOREIGN KEY (visit_id) REFERENCES visits(id),
    INDEX idx_patient_id (patient_id),
    INDEX idx_status (status),
    INDEX idx_invoice_date (invoice_date)
);

-- Invoice items
CREATE TABLE invoice_items (
    id SERIAL PRIMARY KEY,
    invoice_id INT NOT NULL,
    description VARCHAR(255) NOT NULL,
    item_type VARCHAR(100), -- consultation, test, medication, procedure
    quantity INT,
    unit_price DECIMAL(10, 2),
    total_price DECIMAL(10, 2),
    FOREIGN KEY (invoice_id) REFERENCES invoices(id) ON DELETE CASCADE,
    INDEX idx_invoice_id (invoice_id)
);

-- Payments
CREATE TABLE payments (
    id SERIAL PRIMARY KEY,
    payment_id VARCHAR(50) UNIQUE NOT NULL,
    invoice_id INT NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    payment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    payment_method VARCHAR(100), -- cash, credit_card, bank_transfer, insurance
    reference_number VARCHAR(100),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (invoice_id) REFERENCES invoices(id) ON DELETE CASCADE,
    INDEX idx_invoice_id (invoice_id),
    INDEX idx_payment_date (payment_date)
);
