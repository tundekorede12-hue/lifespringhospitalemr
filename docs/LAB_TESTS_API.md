# Lab Tests & Results API Documentation

## Overview
The Lab Tests & Results API provides comprehensive management of laboratory test ordering, sample tracking, and result submission in the Lifespring Hospital EMR system.

## Features
- ✅ Complete lab test catalog
- ✅ Order management and tracking
- ✅ Sample collection tracking
- ✅ Results submission and storage
- ✅ Priority-based processing
- ✅ Abnormal flag tracking
- ✅ Role-based access control
- ✅ Audit logging

## Lab Test Endpoints

### 1. Get Available Lab Tests
**Endpoint:** `GET /api/v1/lab-tests/available`

**Description:** Browse available laboratory tests

**Access:** Required - Any authenticated user

**Headers Required:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
```
search=CBC    # Search by test code or name (optional)
```

**Response (200 OK):**
```json
{
  "status": "success",
  "message": "Lab tests retrieved successfully",
  "data": [
    {
      "id": 1,
      "test_code": "CBC",
      "test_name": "Complete Blood Count",
      "description": "Measures red cells, white cells, hemoglobin",
      "normal_range": "Varies by component",
      "unit": "cells/mcL",
      "cost": 35.00
    },
    {
      "id": 2,
      "test_code": "BMP",
      "test_name": "Basic Metabolic Panel",
      "description": "Tests kidney function and electrolytes",
      "normal_range": "Varies by component",
      "unit": "mmol/L or mg/dL",
      "cost": 45.00
    }
  ]
}
```

---

### 2. Order Lab Test
**Endpoint:** `POST /api/v1/lab-tests/orders`

**Description:** Create a new lab test order for a patient

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
  "test_id": 1,
  "visit_id": null,
  "priority": "routine",
  "notes": "Annual checkup"
}
```

**Required Fields:**
- patient_id
- test_id

**Optional Fields:**
- visit_id
- priority (default: "routine")
- notes

**Response (201 Created):**
```json
{
  "status": "success",
  "message": "Lab test ordered successfully",
  "data": {
    "id": 1,
    "order_id": "ORD0000001",
    "patient_id": 1,
    "doctor_id": 2,
    "test_id": 1,
    "order_date": "2026-05-11T12:45:00Z",
    "sample_collection_date": null,
    "expected_result_date": "2026-05-12T12:45:00Z",
    "status": "pending",
    "priority": "routine",
    "notes": "Annual checkup",
    "created_at": "2026-05-11T12:45:00Z",
    "updated_at": "2026-05-11T12:45:00Z"
  }
}
```

**Priority Options:**
- **routine** - Result expected in 24-48 hours
- **urgent** - Result expected in 2-4 hours

---

### 3. Get All Lab Orders
**Endpoint:** `GET /api/v1/lab-tests/orders`

**Description:** Retrieve all lab orders with pagination and filtering

**Access:** Required - Any authenticated user

**Headers Required:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
```
page=1                    # Page number (default: 1)
limit=10                  # Items per page (default: 10)
status=pending            # Filter by status
priority=routine          # Filter by priority
```

**Valid Status Values:**
- pending
- collected
- processing
- completed
- cancelled

**Response (200 OK):**
```json
{
  "status": "success",
  "message": "Lab orders retrieved successfully",
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 15,
    "pages": 2
  },
  "data": [
    {
      "id": 1,
      "order_id": "ORD0000001",
      "patient_id": 1,
      "test_id": 1,
      "status": "pending",
      "priority": "routine",
      "order_date": "2026-05-11T12:45:00Z",
      "test": {
        "test_code": "CBC",
        "test_name": "Complete Blood Count"
      }
    }
  ]
}
```

---

### 4. Get Lab Order by ID
**Endpoint:** `GET /api/v1/lab-tests/orders/:id`

**Description:** Retrieve a specific lab order

**Access:** Required - Any authenticated user

**Headers Required:**
```
Authorization: Bearer <token>
```

**URL Parameters:**
```
:id = Order ID (numeric or ORD0000001)
```

**Response (200 OK):**
```json
{
  "status": "success",
  "message": "Lab order retrieved successfully",
  "data": {
    "id": 1,
    "order_id": "ORD0000001",
    "patient_id": 1,
    "doctor_id": 2,
    "test_id": 1,
    "order_date": "2026-05-11T12:45:00Z",
    "sample_collection_date": null,
    "expected_result_date": "2026-05-12T12:45:00Z",
    "status": "pending",
    "priority": "routine",
    "notes": "Annual checkup",
    "test": {
      "id": 1,
      "test_code": "CBC",
      "test_name": "Complete Blood Count",
      "description": "Measures red cells, white cells, hemoglobin",
      "normal_range": "Varies by component",
      "unit": "cells/mcL",
      "cost": 35.00
    }
  }
}
```

---

### 5. Get Patient Lab Orders
**Endpoint:** `GET /api/v1/lab-tests/patient/:patientId/orders`

**Description:** Retrieve all lab orders for a specific patient

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
status=completed    # Filter by status (optional)
```

**Response (200 OK):**
```json
{
  "status": "success",
  "message": "Patient lab orders retrieved successfully",
  "data": [
    {
      "order_id": "ORD0000001",
      "test_id": 1,
      "status": "completed",
      "priority": "routine",
      "test": {
        "test_code": "CBC",
        "test_name": "Complete Blood Count"
      }
    }
  ]
}
```

---

### 6. Submit Lab Test Results
**Endpoint:** `POST /api/v1/lab-tests/orders/:id/results`

**Description:** Submit results for a completed lab test

**Access:** Required - Lab Staff (Nurse), Admin

**Headers Required:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**URL Parameters:**
```
:id = Order ID (numeric or ORD0000001)
```

**Request Body:**
```json
{
  "result_value": "7.2",
  "reference_range": "4.5-8.0",
  "unit": "10^3/mcL",
  "abnormal_flag": "N",
  "notes": "Within normal range"
}
```

**Required Fields:**
- result_value

**Optional Fields:**
- reference_range
- unit
- abnormal_flag (H, L, or N)
- notes

**Abnormal Flag Values:**
- **H** - High (above normal range)
- **L** - Low (below normal range)
- **N** - Normal (within range)

**Response (201 Created):**
```json
{
  "status": "success",
  "message": "Lab test result submitted successfully",
  "data": {
    "id": 1,
    "order_id": 1,
    "result_value": "7.2",
    "reference_range": "4.5-8.0",
    "unit": "10^3/mcL",
    "abnormal_flag": "N",
    "result_date": "2026-05-12T08:30:00Z",
    "reviewed_by": 4,
    "review_date": "2026-05-12T08:30:00Z",
    "notes": "Within normal range",
    "created_at": "2026-05-12T08:30:00Z"
  }
}
```

---

### 7. Get Lab Test Results
**Endpoint:** `GET /api/v1/lab-tests/orders/:id/results`

**Description:** Retrieve results for a lab test order

**Access:** Required - Any authenticated user

**Headers Required:**
```
Authorization: Bearer <token>
```

**URL Parameters:**
```
:id = Order ID (numeric or ORD0000001)
```

**Response (200 OK):**
```json
{
  "status": "success",
  "message": "Lab test results retrieved successfully",
  "data": {
    "order": {
      "order_id": "ORD0000001",
      "patient_id": 1,
      "status": "completed",
      "priority": "routine"
    },
    "test": {
      "test_code": "CBC",
      "test_name": "Complete Blood Count",
      "normal_range": "Varies by component"
    },
    "results": [
      {
        "id": 1,
        "result_value": "7.2",
        "reference_range": "4.5-8.0",
        "unit": "10^3/mcL",
        "abnormal_flag": "N",
        "result_date": "2026-05-12T08:30:00Z",
        "notes": "Within normal range"
      }
    ]
  }
}
```

**Error Response - No Results (404 Not Found):**
```json
{
  "status": "error",
  "message": "No results found for this order. Results may not have been submitted yet."
}
```

---

### 8. Update Lab Order Status
**Endpoint:** `PUT /api/v1/lab-tests/orders/:id/status`

**Description:** Update the status of a lab order

**Access:** Required - Lab Staff (Nurse), Admin

**Headers Required:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**URL Parameters:**
```
:id = Order ID (numeric or ORD0000001)
```

**Request Body:**
```json
{
  "status": "processing",
  "sample_collection_date": "2026-05-11T13:00:00Z"
}
```

**Required Fields:**
- status

**Valid Status Values:**
- pending
- collected
- processing
- completed
- cancelled

**Optional Fields:**
- sample_collection_date

**Response (200 OK):**
```json
{
  "status": "success",
  "message": "Lab order status updated successfully",
  "data": {
    "order_id": "ORD0000001",
    "status": "processing",
    "sample_collection_date": "2026-05-11T13:00:00Z",
    "updated_at": "2026-05-11T13:05:00Z"
  }
}
```

---

## Lab Order Status Workflow

```
pending → collected → processing → completed
   ↓
 cancelled
```

**Status Meanings:**
- **pending** - Order created, awaiting sample collection
- **collected** - Sample collected from patient
- **processing** - Sample being analyzed
- **completed** - Results available
- **cancelled** - Order cancelled

---

## Pre-populated Lab Tests

| Code | Test Name | Normal Range | Unit | Cost |
|------|-----------|--------------|------|------|
| CBC | Complete Blood Count | Varies | cells/mcL | $35.00 |
| BMP | Basic Metabolic Panel | Varies | mmol/L | $45.00 |
| LFT | Liver Function Tests | Varies | U/L | $55.00 |
| TSH | Thyroid Stimulating Hormone | 0.4-4.0 | mIU/L | $40.00 |
| FBS | Fasting Blood Sugar | 70-100 | mg/dL | $25.00 |
| LIPID | Lipid Panel | Varies | mg/dL | $60.00 |

---

## Access Control

| Endpoint | GET | POST | PUT |
|----------|-----|------|-----|
| `/lab-tests/available` | ✅ All | - | - |
| `/lab-tests/orders` | ✅ All | ✅ Doctor/Admin | - |
| `/lab-tests/orders/:id` | ✅ All | - | ✅ Lab Staff/Admin |
| `/lab-tests/orders/:id/results` | ✅ All | ✅ Lab Staff/Admin | - |

---

## Testing with cURL

### Get Available Tests
```bash
curl -X GET "http://localhost:3000/api/v1/lab-tests/available?search=CBC" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Order Lab Test
```bash
curl -X POST http://localhost:3000/api/v1/lab-tests/orders \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "patient_id": 1,
    "test_id": 1,
    "priority": "routine",
    "notes": "Annual checkup"
  }'
```

### Get Patient Lab Orders
```bash
curl -X GET "http://localhost:3000/api/v1/lab-tests/patient/1/orders?status=completed" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Update Order Status
```bash
curl -X PUT http://localhost:3000/api/v1/lab-tests/orders/ORD0000001/status \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "processing",
    "sample_collection_date": "2026-05-11T13:00:00Z"
  }'
```

### Submit Lab Results
```bash
curl -X POST http://localhost:3000/api/v1/lab-tests/orders/ORD0000001/results \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "result_value": "7.2",
    "reference_range": "4.5-8.0",
    "unit": "10^3/mcL",
    "abnormal_flag": "N",
    "notes": "Within normal range"
  }'
```

### Get Lab Results
```bash
curl -X GET http://localhost:3000/api/v1/lab-tests/orders/ORD0000001/results \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## Error Responses

### 400 Bad Request
```json
{
  "status": "error",
  "message": "patient_id and test_id are required"
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
  "message": "Lab order not found"
}
```

---

## Database Integration

Currently using in-memory storage. To integrate with database:

```javascript
// Replace:
const order = labOrders.get(id);

// With:
const order = await db.query(
  'SELECT * FROM lab_orders WHERE id = ?',
  [id]
);
```

---

## Next Steps

1. ✅ Database integration (MySQL/PostgreSQL)
2. ✅ Billing and invoicing system
3. ✅ Notifications and alerts
4. ✅ Reporting and analytics
5. ✅ Frontend dashboard

---

## Support
For questions or issues, contact the development team.
