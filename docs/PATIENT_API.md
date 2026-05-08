# Patient Management API Documentation

## Overview
The Patient Management API provides comprehensive CRUD operations for managing patient records in the Lifespring Hospital EMR system.

## Features
- ✅ Create new patient records
- ✅ Retrieve patient information
- ✅ Update patient details
- ✅ Soft delete patients (deactivate)
- ✅ Search and filter patients
- ✅ Pagination support
- ✅ Patient statistics
- ✅ Role-based access control
- ✅ Audit logging

## Patient Endpoints

### 1. Create Patient
**Endpoint:** `POST /api/v1/patients`

**Description:** Create a new patient record

**Access:** Required - Doctor, Nurse, Admin

**Headers Required:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "first_name": "James",
  "last_name": "Anderson",
  "date_of_birth": "1985-03-15",
  "gender": "M",
  "phone": "555-1001",
  "email": "james.anderson@email.com",
  "address": "123 Oak Street",
  "city": "New York",
  "state": "NY",
  "postal_code": "10001",
  "emergency_contact_name": "Mary Anderson",
  "emergency_contact_phone": "555-1002",
  "blood_type": "O+",
  "allergies": "Penicillin",
  "insurance_provider": "BlueCross",
  "insurance_number": "BC123456"
}
```

**Response (201 Created):**
```json
{
  "status": "success",
  "message": "Patient created successfully",
  "data": {
    "id": 1,
    "patient_id": "PAT000001",
    "first_name": "James",
    "last_name": "Anderson",
    "date_of_birth": "1985-03-15",
    "gender": "M",
    "phone": "555-1001",
    "email": "james.anderson@email.com",
    "address": "123 Oak Street",
    "city": "New York",
    "state": "NY",
    "postal_code": "10001",
    "emergency_contact_name": "Mary Anderson",
    "emergency_contact_phone": "555-1002",
    "blood_type": "O+",
    "allergies": "Penicillin",
    "insurance_provider": "BlueCross",
    "insurance_number": "BC123456",
    "status": "active",
    "created_at": "2026-05-08T17:15:00Z",
    "updated_at": "2026-05-08T17:15:00Z"
  }
}
```

**Validation Rules:**
- First name, last name, date of birth, and gender are required
- Email must be in valid format (if provided)
- Date of birth must be in YYYY-MM-DD format
- Gender: M, F, or Other

---

### 2. Get All Patients
**Endpoint:** `GET /api/v1/patients`

**Description:** Retrieve all patients with pagination and filtering

**Access:** Required - Any authenticated user

**Headers Required:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
```
page=1                    # Page number (default: 1)
limit=10                  # Items per page (default: 10, max: 100)
status=active             # Filter by status: active, inactive, deceased
search=James              # Search by name, patient ID, or email
```

**Example Request:**
```bash
GET /api/v1/patients?page=1&limit=10&status=active&search=James
```

**Response (200 OK):**
```json
{
  "status": "success",
  "message": "Patients retrieved successfully",
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 25,
    "pages": 3
  },
  "data": [
    {
      "id": 1,
      "patient_id": "PAT000001",
      "first_name": "James",
      "last_name": "Anderson",
      "date_of_birth": "1985-03-15",
      "gender": "M",
      "phone": "555-1001",
      "email": "james.anderson@email.com",
      "status": "active",
      "created_at": "2026-05-08T17:15:00Z"
    }
  ]
}
```

---

### 3. Get Patient by ID
**Endpoint:** `GET /api/v1/patients/:id`

**Description:** Retrieve a specific patient by ID or patient_id

**Access:** Required - Any authenticated user

**Headers Required:**
```
Authorization: Bearer <token>
```

**URL Parameters:**
```
:id = Patient ID (e.g., 1) or Patient ID code (e.g., PAT000001)
```

**Example Request:**
```bash
GET /api/v1/patients/PAT000001
# or
GET /api/v1/patients/1
```

**Response (200 OK):**
```json
{
  "status": "success",
  "message": "Patient retrieved successfully",
  "data": {
    "id": 1,
    "patient_id": "PAT000001",
    "first_name": "James",
    "last_name": "Anderson",
    "date_of_birth": "1985-03-15",
    "gender": "M",
    "phone": "555-1001",
    "email": "james.anderson@email.com",
    "address": "123 Oak Street",
    "city": "New York",
    "state": "NY",
    "postal_code": "10001",
    "emergency_contact_name": "Mary Anderson",
    "emergency_contact_phone": "555-1002",
    "blood_type": "O+",
    "allergies": "Penicillin",
    "insurance_provider": "BlueCross",
    "insurance_number": "BC123456",
    "status": "active",
    "created_at": "2026-05-08T17:15:00Z",
    "updated_at": "2026-05-08T17:15:00Z"
  }
}
```

**Error Response (404 Not Found):**
```json
{
  "status": "error",
  "message": "Patient not found"
}
```

---

### 4. Update Patient
**Endpoint:** `PUT /api/v1/patients/:id`

**Description:** Update patient information

**Access:** Required - Doctor, Nurse, Admin

**Headers Required:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**URL Parameters:**
```
:id = Patient ID (e.g., 1) or Patient ID code (e.g., PAT000001)
```

**Request Body (All fields optional):**
```json
{
  "phone": "555-2001",
  "email": "james.anderson.new@email.com",
  "address": "456 Elm Avenue",
  "city": "Boston",
  "state": "MA",
  "postal_code": "02101",
  "emergency_contact_phone": "555-2002",
  "allergies": "Penicillin, Aspirin",
  "status": "active"
}
```

**Updatable Fields:**
- first_name, last_name, phone, email, address, city, state, postal_code
- emergency_contact_name, emergency_contact_phone
- blood_type, allergies, insurance_provider, insurance_number, status

**Response (200 OK):**
```json
{
  "status": "success",
  "message": "Patient updated successfully",
  "data": {
    "id": 1,
    "patient_id": "PAT000001",
    "first_name": "James",
    "last_name": "Anderson",
    "phone": "555-2001",
    "email": "james.anderson.new@email.com",
    "address": "456 Elm Avenue",
    "city": "Boston",
    "state": "MA",
    "postal_code": "02101",
    "updated_at": "2026-05-08T17:20:00Z"
  }
}
```

---

### 5. Delete/Deactivate Patient
**Endpoint:** `DELETE /api/v1/patients/:id`

**Description:** Soft delete (deactivate) a patient record

**Access:** Required - Admin only

**Headers Required:**
```
Authorization: Bearer <token>
```

**URL Parameters:**
```
:id = Patient ID (e.g., 1) or Patient ID code (e.g., PAT000001)
```

**Response (200 OK):**
```json
{
  "status": "success",
  "message": "Patient deactivated successfully"
}
```

**Note:** This is a soft delete. The patient record remains in the database with status set to 'inactive'.

---

### 6. Get Patient Statistics
**Endpoint:** `GET /api/v1/patients/stats/overview`

**Description:** Get overview statistics of all patients

**Access:** Required - Doctor, Admin

**Headers Required:**
```
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "status": "success",
  "message": "Patient statistics retrieved successfully",
  "data": {
    "total_patients": 25,
    "active_patients": 23,
    "inactive_patients": 2,
    "patients_with_email": 20,
    "patients_with_phone": 24,
    "patients_by_blood_type": {
      "O+": 8,
      "A+": 6,
      "B+": 5,
      "AB+": 3,
      "O-": 2,
      "A-": 1
    }
  }
}
```

---

## Access Control

| Endpoint | GET | POST | PUT | DELETE |
|----------|-----|------|-----|--------|
| `/patients` | ✅ All | ✅ Doctor/Nurse/Admin | - | - |
| `/patients/:id` | ✅ All | - | ✅ Doctor/Nurse/Admin | ✅ Admin |
| `/patients/stats/overview` | ✅ Doctor/Admin | - | - | - |

---

## Testing with cURL

### Create Patient
```bash
curl -X POST http://localhost:3000/api/v1/patients \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "first_name": "John",
    "last_name": "Doe",
    "date_of_birth": "1990-05-15",
    "gender": "M",
    "phone": "555-0100",
    "email": "john.doe@email.com",
    "city": "New York",
    "state": "NY",
    "blood_type": "A+",
    "allergies": "None"
  }'
```

### Get All Patients
```bash
curl -X GET "http://localhost:3000/api/v1/patients?page=1&limit=10&status=active" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Get Patient by ID
```bash
curl -X GET http://localhost:3000/api/v1/patients/PAT000001 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Update Patient
```bash
curl -X PUT http://localhost:3000/api/v1/patients/PAT000001 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "555-0200",
    "city": "Boston"
  }'
```

### Get Statistics
```bash
curl -X GET http://localhost:3000/api/v1/patients/stats/overview \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## Error Responses

### 400 Bad Request
```json
{
  "status": "error",
  "message": "First name, last name, date of birth, and gender are required"
}
```

### 401 Unauthorized
```json
{
  "status": "error",
  "message": "Invalid or expired token"
}
```

### 403 Forbidden
```json
{
  "status": "error",
  "message": "Insufficient permissions",
  "requiredRoles": ["admin"],
  "userRole": "staff"
}
```

### 404 Not Found
```json
{
  "status": "error",
  "message": "Patient not found"
}
```

### 500 Internal Server Error
```json
{
  "status": "error",
  "message": "Failed to create patient",
  "error": "Error details here"
}
```

---

## Database Integration

Currently using in-memory storage for demonstration. To integrate with actual database:

### Replace in `patientController.js`:
```javascript
// Instead of:
const patient = patients.get(patientId);

// Use database query:
const patient = await db.query(
  'SELECT * FROM patients WHERE id = ?',
  [patientId]
);
```

---

## Filtering & Search

### Search Example
```bash
GET /api/v1/patients?search=Anderson
```
Searches in: first_name, last_name, patient_id, email

### Filter by Status
```bash
GET /api/v1/patients?status=active
```
Values: active, inactive, deceased

### Pagination Example
```bash
GET /api/v1/patients?page=2&limit=20
```

---

## Next Steps

1. ✅ Database integration (MySQL/PostgreSQL)
2. ✅ Medical history endpoints
3. ✅ Patient vitals tracking
4. ✅ Appointment management
5. ✅ Prescription management
6. ✅ Lab test ordering

---

## Support
For questions or issues, contact the development team.
