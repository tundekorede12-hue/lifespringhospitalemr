# Prescription Management API Documentation

## Overview
The Prescription Management API provides comprehensive management of patient prescriptions, medications, refills, and prescription tracking in the Lifespring Hospital EMR system.

## Features
- ✅ Complete medication database
- ✅ Create and manage prescriptions
- ✅ Prescription refill tracking
- ✅ Medication search and filtering
- ✅ Patient-specific prescription history
- ✅ Prescription status tracking
- ✅ Role-based access control
- ✅ Audit logging

## Prescription Endpoints

### 1. Get Medications
**Endpoint:** `GET /api/v1/prescriptions/medications`

**Description:** Search and retrieve available medications

**Access:** Required - Any authenticated user

**Headers Required:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
```
search=Lisinopril    # Search by medication or generic name (optional)
```

**Response (200 OK):**
```json
{
  "status": "success",
  "message": "Medications retrieved successfully",
  "data": [
    {
      "id": 1,
      "medication_name": "Lisinopril",
      "generic_name": "Lisinopril",
      "strength": "10mg",
      "form": "tablet",
      "manufacturer": "Pfizer"
    },
    {
      "id": 2,
      "medication_name": "Metformin",
      "generic_name": "Metformin HCL",
      "strength": "500mg",
      "form": "tablet",
      "manufacturer": "Merck"
    }
  ]
}
```

---

### 2. Create Prescription
**Endpoint:** `POST /api/v1/prescriptions`

**Description:** Create a new prescription for a patient

**Access:** Required - Doctor, Admin

**Headers Required:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "patient_id": 1,
  "medication_id": 1,
  "visit_id": null,
  "dosage": "10mg",
  "frequency": "Once daily",
  "duration_days": 30,
  "quantity": 30,
  "refills_allowed": 3,
  "instructions": "Take with food",
  "start_date": "2026-05-08",
  "prescribing_reason": "Hypertension management"
}
```

**Required Fields:**
- patient_id
- medication_id
- dosage
- frequency
- start_date

**Response (201 Created):**
```json
{
  "status": "success",
  "message": "Prescription created successfully",
  "data": {
    "id": 1,
    "prescription_id": "RX0000001",
    "patient_id": 1,
    "doctor_id": 2,
    "medication_id": 1,
    "dosage": "10mg",
    "frequency": "Once daily",
    "duration_days": 30,
    "quantity": 30,
    "refills_allowed": 3,
    "refills_remaining": 3,
    "instructions": "Take with food",
    "start_date": "2026-05-08",
    "end_date": "2026-06-07",
    "status": "active",
    "prescribing_reason": "Hypertension management",
    "created_at": "2026-05-08T17:30:00Z",
    "updated_at": "2026-05-08T17:30:00Z"
  }
}
```

---

### 3. Get All Prescriptions
**Endpoint:** `GET /api/v1/prescriptions`

**Description:** Retrieve all prescriptions with pagination and filtering

**Access:** Required - Any authenticated user

**Headers Required:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
```
page=1                    # Page number (default: 1)
limit=10                  # Items per page (default: 10)
status=active             # Filter by status: active, completed, cancelled, expired
```

**Example Request:**
```bash
GET /api/v1/prescriptions?page=1&limit=10&status=active
```

**Response (200 OK):**
```json
{
  "status": "success",
  "message": "Prescriptions retrieved successfully",
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 15,
    "pages": 2
  },
  "data": [
    {
      "id": 1,
      "prescription_id": "RX0000001",
      "patient_id": 1,
      "dosage": "10mg",
      "frequency": "Once daily",
      "status": "active",
      "refills_remaining": 3,
      "medication": {
        "id": 1,
        "medication_name": "Lisinopril",
        "strength": "10mg"
      }
    }
  ]
}
```

---

### 4. Get Prescription by ID
**Endpoint:** `GET /api/v1/prescriptions/:id`

**Description:** Retrieve a specific prescription

**Access:** Required - Any authenticated user

**Headers Required:**
```
Authorization: Bearer <token>
```

**URL Parameters:**
```
:id = Prescription ID (numeric or RX0000001)
```

**Response (200 OK):**
```json
{
  "status": "success",
  "message": "Prescription retrieved successfully",
  "data": {
    "id": 1,
    "prescription_id": "RX0000001",
    "patient_id": 1,
    "doctor_id": 2,
    "medication_id": 1,
    "dosage": "10mg",
    "frequency": "Once daily",
    "duration_days": 30,
    "quantity": 30,
    "refills_allowed": 3,
    "refills_remaining": 3,
    "instructions": "Take with food",
    "start_date": "2026-05-08",
    "end_date": "2026-06-07",
    "status": "active",
    "medication": {
      "id": 1,
      "medication_name": "Lisinopril",
      "generic_name": "Lisinopril",
      "strength": "10mg",
      "form": "tablet",
      "manufacturer": "Pfizer"
    }
  }
}
```

---

### 5. Get Patient Prescriptions
**Endpoint:** `GET /api/v1/prescriptions/patient/:patientId`

**Description:** Retrieve all prescriptions for a specific patient

**Access:** Required - Any authenticated user

**Headers Required:**
```
Authorization: Bearer <token>
```

**URL Parameters:**
```
:patientId = Patient ID
```

**Query Parameters:**
```
status=active    # Filter by status (optional)
```

**Response (200 OK):**
```json
{
  "status": "success",
  "message": "Patient prescriptions retrieved successfully",
  "data": [
    {
      "prescription_id": "RX0000001",
      "dosage": "10mg",
      "frequency": "Once daily",
      "status": "active",
      "refills_remaining": 3,
      "start_date": "2026-05-08",
      "medication": {
        "medication_name": "Lisinopril",
        "strength": "10mg"
      }
    }
  ]
}
```

---

### 6. Request Refill
**Endpoint:** `POST /api/v1/prescriptions/:id/refill`

**Description:** Request a refill for an active prescription

**Access:** Required - Any authenticated user

**Headers Required:**
```
Authorization: Bearer <token>
```

**URL Parameters:**
```
:id = Prescription ID (numeric or RX0000001)
```

**Response (200 OK):**
```json
{
  "status": "success",
  "message": "Refill requested successfully",
  "data": {
    "prescription_id": "RX0000001",
    "refills_remaining": 2,
    "message": "2 refills remaining"
  }
}
```

**Error Response - No Refills (400 Bad Request):**
```json
{
  "status": "error",
  "message": "No refills remaining. Contact doctor for new prescription."
}
```

**Error Response - Inactive Prescription (400 Bad Request):**
```json
{
  "status": "error",
  "message": "Cannot refill inactive prescription"
}
```

---

### 7. Update Prescription
**Endpoint:** `PUT /api/v1/prescriptions/:id`

**Description:** Update prescription details

**Access:** Required - Doctor, Admin

**Headers Required:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**URL Parameters:**
```
:id = Prescription ID (numeric or RX0000001)
```

**Request Body (all fields optional):**
```json
{
  "dosage": "20mg",
  "frequency": "Twice daily",
  "instructions": "Take with meals",
  "refills_allowed": 5,
  "status": "active"
}
```

**Updatable Fields:**
- dosage
- frequency
- instructions
- refills_allowed
- status

**Response (200 OK):**
```json
{
  "status": "success",
  "message": "Prescription updated successfully",
  "data": {
    "prescription_id": "RX0000001",
    "dosage": "20mg",
    "frequency": "Twice daily",
    "refills_allowed": 5
  }
}
```

---

### 8. Cancel Prescription
**Endpoint:** `DELETE /api/v1/prescriptions/:id`

**Description:** Cancel a prescription

**Access:** Required - Doctor, Admin

**Headers Required:**
```
Authorization: Bearer <token>
```

**URL Parameters:**
```
:id = Prescription ID (numeric or RX0000001)
```

**Response (200 OK):**
```json
{
  "status": "success",
  "message": "Prescription cancelled successfully"
}
```

---

## Prescription Status Workflow

```
created → active → completed
   ↓
 cancelled
   ↓
 expired
```

**Status Meanings:**
- **active** - Currently valid and can be refilled
- **completed** - Prescription course finished
- **cancelled** - Cancelled by doctor or patient
- **expired** - Prescription end date has passed

---

## Pre-populated Medications

| ID | Medication | Generic Name | Strength | Form |
|----|-----------|--------------|----------|------|
| 1 | Lisinopril | Lisinopril | 10mg | tablet |
| 2 | Metformin | Metformin HCL | 500mg | tablet |
| 3 | Albuterol | Albuterol Sulfate | 90mcg | inhaler |
| 4 | Aspirin | Acetylsalicylic Acid | 325mg | tablet |
| 5 | Amoxicillin | Amoxicillin Trihydrate | 500mg | capsule |
| 6 | Atorvastatin | Atorvastatin Calcium | 20mg | tablet |
| 7 | Omeprazole | Omeprazole | 20mg | capsule |
| 8 | Ibuprofen | Ibuprofen | 400mg | tablet |

---

## Access Control

| Endpoint | GET | POST | PUT | DELETE |
|----------|-----|------|-----|--------|
| `/prescriptions/medications` | ✅ All | - | - | - |
| `/prescriptions` | ✅ All | ✅ Doctor/Admin | - | - |
| `/prescriptions/:id` | ✅ All | - | ✅ Doctor/Admin | ✅ Doctor/Admin |
| `/prescriptions/:id/refill` | - | ✅ All | - | - |

---

## Testing with cURL

### Search Medications
```bash
curl -X GET "http://localhost:3000/api/v1/prescriptions/medications?search=Lisinopril" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Create Prescription
```bash
curl -X POST http://localhost:3000/api/v1/prescriptions \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "patient_id": 1,
    "medication_id": 1,
    "dosage": "10mg",
    "frequency": "Once daily",
    "duration_days": 30,
    "quantity": 30,
    "refills_allowed": 3,
    "instructions": "Take with food",
    "start_date": "2026-05-08",
    "prescribing_reason": "Hypertension management"
  }'
```

### Get Patient Prescriptions
```bash
curl -X GET "http://localhost:3000/api/v1/prescriptions/patient/1?status=active" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Request Refill
```bash
curl -X POST http://localhost:3000/api/v1/prescriptions/RX0000001/refill \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Update Prescription
```bash
curl -X PUT http://localhost:3000/api/v1/prescriptions/RX0000001 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "dosage": "20mg",
    "frequency": "Twice daily"
  }'
```

### Cancel Prescription
```bash
curl -X DELETE http://localhost:3000/api/v1/prescriptions/RX0000001 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## Error Responses

### 400 Bad Request
```json
{
  "status": "error",
  "message": "patient_id, medication_id, dosage, frequency, and start_date are required"
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
  "message": "Insufficient permissions"
}
```

### 404 Not Found
```json
{
  "status": "error",
  "message": "Prescription not found"
}
```

---

## Database Integration

Currently using in-memory storage. To integrate with database:

```javascript
// Replace:
const prescription = prescriptions.get(id);

// With:
const prescription = await db.query(
  'SELECT * FROM prescriptions WHERE id = ?',
  [id]
);
```

---

## Next Steps

1. ✅ Database integration (MySQL/PostgreSQL)
2. ✅ Lab tests and results management
3. ✅ Drug interaction checking
4. ✅ Insurance validation
5. ✅ Prescription notifications
6. ✅ Pharmacy integration

---

## Support
For questions or issues, contact the development team.
