-- Lifespring Hospital EMR - Sample Data
-- Created: 2026-05-08

-- Insert sample users (admin, doctors, nurses)
INSERT INTO users (email, password_hash, first_name, last_name, phone, role, department, employee_id) VALUES
('admin@lifespring.com', '$2b$10$admin_hash_placeholder', 'Admin', 'User', '555-0001', 'admin', 'Administration', 'EMP001'),
('dr.smith@lifespring.com', '$2b$10$doctor_hash_placeholder', 'John', 'Smith', '555-0002', 'doctor', 'Internal Medicine', 'EMP002'),
('dr.johnson@lifespring.com', '$2b$10$doctor_hash_placeholder', 'Sarah', 'Johnson', '555-0003', 'doctor', 'Cardiology', 'EMP003'),
('nurse.williams@lifespring.com', '$2b$10$nurse_hash_placeholder', 'Emily', 'Williams', '555-0004', 'nurse', 'Ward A', 'EMP004'),
('staff.brown@lifespring.com', '$2b$10$staff_hash_placeholder', 'Michael', 'Brown', '555-0005', 'staff', 'Reception', 'EMP005');

-- Insert sample patients
INSERT INTO patients (patient_id, first_name, last_name, date_of_birth, gender, phone, email, address, city, state, postal_code, emergency_contact_name, emergency_contact_phone, blood_type, allergies, insurance_provider, insurance_number) VALUES
('PAT001', 'James', 'Anderson', '1985-03-15', 'M', '555-1001', 'james.anderson@email.com', '123 Oak St', 'New York', 'NY', '10001', 'Mary Anderson', '555-1002', 'O+', 'Penicillin', 'BlueCross', 'BC123456'),
('PAT002', 'Lisa', 'Martinez', '1992-07-22', 'F', '555-1003', 'lisa.martinez@email.com', '456 Elm Ave', 'New York', 'NY', '10002', 'Carlos Martinez', '555-1004', 'A-', 'Aspirin', 'Aetna', 'AE789012'),
('PAT003', 'Robert', 'Thompson', '1978-11-30', 'M', '555-1005', 'robert.thompson@email.com', '789 Pine Rd', 'New York', 'NY', '10003', 'Jennifer Thompson', '555-1006', 'B+', 'None', 'United Health', 'UH345678'),
('PAT004', 'Patricia', 'Garcia', '1988-05-18', 'F', '555-1007', 'patricia.garcia@email.com', '321 Maple Dr', 'New York', 'NY', '10004', 'David Garcia', '555-1008', 'AB+', 'Sulfa drugs', 'Cigna', 'CG901234'),
('PAT005', 'William', 'Lee', '1995-09-12', 'M', '555-1009', 'william.lee@email.com', '654 Cedar Ln', 'New York', 'NY', '10005', 'Michelle Lee', '555-1010', 'O-', 'None', 'Humana', 'HM567890');

-- Insert sample medical history
INSERT INTO medical_history (patient_id, condition_name, description, diagnosis_date, status, recorded_by) VALUES
(1, 'Hypertension', 'High blood pressure - Stage 1', '2023-01-15', 'chronic', 2),
(1, 'Type 2 Diabetes', 'Diagnosed with controlled blood sugar levels', '2022-06-20', 'chronic', 2),
(2, 'Asthma', 'Mild intermittent asthma', '2021-08-10', 'chronic', 3),
(3, 'Coronary Artery Disease', 'CAD - Post stent placement', '2023-03-05', 'active', 3),
(5, 'Anxiety Disorder', 'Generalized anxiety disorder', '2023-02-14', 'active', 2);

-- Insert sample medications
INSERT INTO medications (medication_name, generic_name, strength, form, manufacturer) VALUES
('Lisinopril', 'Lisinopril', '10mg', 'tablet', 'Pfizer'),
('Metformin', 'Metformin HCL', '500mg', 'tablet', 'Merck'),
('Albuterol', 'Albuterol Sulfate', '90mcg', 'inhaler', 'GSK'),
('Aspirin', 'Acetylsalicylic Acid', '325mg', 'tablet', 'Bayer'),
('Amoxicillin', 'Amoxicillin Trihydrate', '500mg', 'capsule', 'Sandoz'),
('Atorvastatin', 'Atorvastatin Calcium', '20mg', 'tablet', 'Pfizer'),
('Omeprazole', 'Omeprazole', '20mg', 'capsule', 'AstraZeneca');

-- Insert sample lab tests
INSERT INTO lab_tests (test_code, test_name, description, normal_range, unit, cost) VALUES
('CBC', 'Complete Blood Count', 'Measures red cells, white cells, hemoglobin', 'Varies by component', 'cells/mcL', 35.00),
('BMP', 'Basic Metabolic Panel', 'Tests kidney function and electrolytes', 'Varies by component', 'mmol/L or mg/dL', 45.00),
('LFT', 'Liver Function Tests', 'Tests liver enzymes and bilirubin', 'Varies by component', 'U/L or mg/dL', 55.00),
('TSH', 'Thyroid Stimulating Hormone', 'Tests thyroid function', '0.4-4.0', 'mIU/L', 40.00),
('FBS', 'Fasting Blood Sugar', 'Glucose level after 8-12 hour fast', '70-100', 'mg/dL', 25.00),
('LIPID', 'Lipid Panel', 'Cholesterol and triglycerides', 'Varies by component', 'mg/dL', 60.00);
