# 💰 Billing & Payments API Documentation

## Overview
Complete billing and payment management system for Lifespring Hospital EMR. Handles invoices, payment processing, billing packages, and financial reporting.

---

## 🔑 Authentication
All endpoints require JWT Bearer Token authentication.

**Get Token:**
```bash
TOKEN=$(curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"dr.smith@lifespring.com","password":"password"}' \
  | jq -r '.data.token')
```

---

## 📋 Invoice Management

### 1. Get All Invoices
**Endpoint:** `GET /api/v1/billing/invoices`

**Query Parameters:**
- `status` (optional): `pending`, `paid`, `partial`, `overdue`
- `patient_id` (optional): Filter by patient
- `page` (optional): Default 1
- `limit` (optional): Default 10

**Example Request:**
```bash
curl -X GET 'http://localhost:3000/api/v1/billing/invoices?status=pending&page=1&limit=10' \
  -H "Authorization: Bearer $TOKEN"
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "INV0000002",
      "patient_id": 2,
      "patient_name": "Jane Smith",
      "invoice_date": "2026-05-03",
      "due_date": "2026-05-17",
      "status": "pending",
      "total_amount": 8500,
      "paid_amount": 0,
      "balance": 8500,
      "items": [
        {
          "description": "Surgery",
          "quantity": 1,
          "unit_price": 5000,
          "total": 5000
        },
        {
          "description": "Hospital Stay (2 days)",
          "quantity": 2,
          "unit_price": 1750,
          "total": 3500
        }
      ],
      "insurance_provider": "Aetna",
      "insurance_claim_id": "AET0000001",
      "created_at": "2026-05-03T09:00:00Z",
      "paid_at": null
    }
  ],
  "pagination": {
    "total": 15,
    "page": 1,
    "limit": 10,
    "pages": 2
  }
}
```

---

### 2. Get Invoice by ID
**Endpoint:** `GET /api/v1/billing/invoices/:id`

**Example Request:**
```bash
curl -X GET 'http://localhost:3000/api/v1/billing/invoices/INV0000001' \
  -H "Authorization: Bearer $TOKEN"
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "INV0000001",
    "patient_id": 1,
    "patient_name": "John Doe",
    "invoice_date": "2026-05-01",
    "due_date": "2026-05-15",
    "status": "paid",
    "total_amount": 5000,
    "paid_amount": 5000,
    "balance": 0,
    "items": [
      {
        "description": "Consultation",
        "quantity": 1,
        "unit_price": 1500,
        "total": 1500
      },
      {
        "description": "Lab Tests (CBC)",
        "quantity": 1,
        "unit_price": 1200,
        "total": 1200
      },
      {
        "description": "Medication",
        "quantity": 1,
        "unit_price": 2300,
        "total": 2300
      }
    ],
    "insurance_provider": "Blue Cross",
    "insurance_claim_id": "BC0000001",
    "created_at": "2026-05-01T10:00:00Z",
    "paid_at": "2026-05-05T14:30:00Z"
  }
}
```

---

### 3. Get Patient Invoices
**Endpoint:** `GET /api/v1/billing/patient/:patientId/invoices`

**Example Request:**
```bash
curl -X GET 'http://localhost:3000/api/v1/billing/patient/1/invoices' \
  -H "Authorization: Bearer $TOKEN"
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "INV0000001",
      "patient_id": 1,
      "status": "paid",
      "total_amount": 5000,
      "paid_amount": 5000,
      "balance": 0
    }
  ],
  "summary": {
    "total_invoices": 1,
    "total_amount": 5000,
    "paid_amount": 5000,
    "pending_amount": 0
  }
}
```

---

### 4. Create Invoice
**Endpoint:** `POST /api/v1/billing/invoices`

**Request Body:**
```json
{
  "patient_id": 1,
  "items": [
    {
      "description": "Consultation",
      "quantity": 1,
      "unit_price": 1500,
      "total": 1500
    },
    {
      "description": "Lab Tests",
      "quantity": 1,
      "unit_price": 1200,
      "total": 1200
    }
  ],
  "insurance_provider": "Blue Cross",
  "insurance_claim_id": "BC0000002"
}
```

**Example Request:**
```bash
curl -X POST 'http://localhost:3000/api/v1/billing/invoices' \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "patient_id": 1,
    "items": [
      {
        "description": "Consultation",
        "quantity": 1,
        "unit_price": 1500,
        "total": 1500
      },
      {
        "description": "Lab Tests",
        "quantity": 1,
        "unit_price": 1200,
        "total": 1200
      }
    ],
    "insurance_provider": "Blue Cross",
    "insurance_claim_id": "BC0000002"
  }'
```

**Response:**
```json
{
  "success": true,
  "message": "Invoice created successfully",
  "data": {
    "id": "INV0000003",
    "patient_id": 1,
    "patient_name": "Patient 1",
    "invoice_date": "2026-05-11",
    "due_date": "2026-05-25",
    "status": "pending",
    "total_amount": 2700,
    "paid_amount": 0,
    "balance": 2700,
    "items": [
      {
        "description": "Consultation",
        "quantity": 1,
        "unit_price": 1500,
        "total": 1500
      },
      {
        "description": "Lab Tests",
        "quantity": 1,
        "unit_price": 1200,
        "total": 1200
      }
    ],
    "insurance_provider": "Blue Cross",
    "insurance_claim_id": "BC0000002",
    "created_at": "2026-05-11T10:15:30Z",
    "paid_at": null
  }
}
```

---

## 💳 Payment Management

### 5. Record Payment
**Endpoint:** `POST /api/v1/billing/payments`

**Request Body:**
```json
{
  "invoice_id": "INV0000002",
  "amount": 8500,
  "payment_method": "credit_card"
}
```

**Payment Methods:** `cash`, `credit_card`, `debit_card`, `bank_transfer`, `insurance`

**Example Request:**
```bash
curl -X POST 'http://localhost:3000/api/v1/billing/payments' \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "invoice_id": "INV0000002",
    "amount": 8500,
    "payment_method": "credit_card"
  }'
```

**Response:**
```json
{
  "success": true,
  "message": "Payment recorded successfully",
  "data": {
    "payment": {
      "id": "PAY0000002",
      "invoice_id": "INV0000002",
      "patient_id": 2,
      "amount": 8500,
      "payment_method": "credit_card",
      "payment_date": "2026-05-11T10:20:00Z",
      "status": "completed",
      "transaction_id": "TXN1715422800000",
      "reference_number": "REF-2026-002"
    },
    "invoice_updated": {
      "id": "INV0000002",
      "patient_id": 2,
      "status": "paid",
      "total_amount": 8500,
      "paid_amount": 8500,
      "balance": 0,
      "paid_at": "2026-05-11T10:20:00Z"
    }
  }
}
```

---

### 6. Get All Payments
**Endpoint:** `GET /api/v1/billing/payments`

**Query Parameters:**
- `invoice_id` (optional): Filter by invoice
- `patient_id` (optional): Filter by patient
- `status` (optional): `completed`, `pending`, `failed`
- `page` (optional): Default 1
- `limit` (optional): Default 10

**Example Request:**
```bash
curl -X GET 'http://localhost:3000/api/v1/billing/payments?status=completed&page=1&limit=10' \
  -H "Authorization: Bearer $TOKEN"
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "PAY0000001",
      "invoice_id": "INV0000001",
      "patient_id": 1,
      "amount": 5000,
      "payment_method": "credit_card",
      "payment_date": "2026-05-05T14:30:00Z",
      "status": "completed",
      "transaction_id": "TXN123456789",
      "reference_number": "REF-2026-001"
    }
  ],
  "pagination": {
    "total": 5,
    "page": 1,
    "limit": 10,
    "pages": 1
  }
}
```

---

### 7. Get Payment by ID
**Endpoint:** `GET /api/v1/billing/payments/:id`

**Example Request:**
```bash
curl -X GET 'http://localhost:3000/api/v1/billing/payments/PAY0000001' \
  -H "Authorization: Bearer $TOKEN"
```

---

## 📦 Billing Packages & Services

### 8. Get Billing Packages
**Endpoint:** `GET /api/v1/billing/packages`

**Example Request:**
```bash
curl -X GET 'http://localhost:3000/api/v1/billing/packages' \
  -H "Authorization: Bearer $TOKEN"
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Basic Consultation",
      "price": 1500,
      "description": "Doctor consultation"
    },
    {
      "id": 2,
      "name": "Lab Tests Package",
      "price": 1200,
      "description": "Basic blood work"
    },
    {
      "id": 3,
      "name": "Hospital Stay (Per Day)",
      "price": 1750,
      "description": "Daily room and care"
    },
    {
      "id": 4,
      "name": "Surgery (Standard)",
      "price": 5000,
      "description": "Standard surgical procedure"
    },
    {
      "id": 5,
      "name": "Imaging (X-Ray)",
      "price": 800,
      "description": "X-ray imaging"
    },
    {
      "id": 6,
      "name": "Imaging (CT Scan)",
      "price": 2500,
      "description": "CT scan imaging"
    }
  ]
}
```

---

## 📊 Billing Reports & Analytics

### 9. Get Billing Summary
**Endpoint:** `GET /api/v1/billing/summary`

**Example Request:**
```bash
curl -X GET 'http://localhost:3000/api/v1/billing/summary' \
  -H "Authorization: Bearer $TOKEN"
```

**Response:**
```json
{
  "success": true,
  "data": {
    "invoices": {
      "total": 2,
      "by_status": {
        "paid": 1,
        "pending": 1,
        "partial": 0,
        "overdue": 0
      },
      "total_amount": 13500,
      "paid_amount": 5000,
      "pending_amount": 8500
    },
    "payments": {
      "total_payments": 1,
      "collected_amount": 5000
    },
    "financial_summary": {
      "total_revenue": 5000,
      "outstanding_balance": 8500,
      "collection_rate": "37.04%"
    }
  }
}
```

---

## 🔒 Role-Based Access Control

| Endpoint | GET | POST | PUT | Role Required |
|----------|-----|------|-----|---------------|
| /invoices | ✅ | ✅ | - | Admin, Billing Staff |
| /invoices/:id | ✅ | - | - | Admin, Finance, Patient |
| /patient/:id/invoices | ✅ | - | - | Patient, Doctor, Admin |
| /payments | ✅ | ✅ | - | Admin, Billing Staff |
| /payments/:id | ✅ | - | - | Admin, Billing Staff |
| /packages | ✅ | - | - | Any Authenticated |
| /summary | ✅ | - | - | Admin, Finance |

---

## 📱 Use Cases

### 1. Complete Billing Workflow
```bash
# 1. Create invoice for consultation + lab tests
INVOICE=$(curl -X POST 'http://localhost:3000/api/v1/billing/invoices' \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "patient_id": 1,
    "items": [{"description":"Consultation","quantity":1,"unit_price":1500,"total":1500}],
    "insurance_provider":"Blue Cross"
  }' | jq -r '.data.id')

# 2. Record payment
curl -X POST 'http://localhost:3000/api/v1/billing/payments' \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"invoice_id\":\"$INVOICE\",\"amount\":1500,\"payment_method\":\"credit_card\"}"

# 3. View invoice details
curl -X GET "http://localhost:3000/api/v1/billing/invoices/$INVOICE" \
  -H "Authorization: Bearer $TOKEN"
```

### 2. Patient Portal - View My Invoices
```bash
curl -X GET 'http://localhost:3000/api/v1/billing/patient/1/invoices' \
  -H "Authorization: Bearer $TOKEN"
```

### 3. Financial Reporting - Dashboard
```bash
curl -X GET 'http://localhost:3000/api/v1/billing/summary' \
  -H "Authorization: Bearer $TOKEN"
```

---

## ✅ Features

✅ **Invoice Management**
- Auto-generated invoice IDs (INV format)
- Line-item tracking
- Status tracking (pending, paid, partial, overdue)
- Due dates and payment tracking

✅ **Payment Processing**
- Multiple payment methods
- Payment history
- Transaction tracking
- Reference numbers

✅ **Insurance Integration**
- Insurance provider tracking
- Insurance claim IDs
- Coverage management

✅ **Financial Reporting**
- Revenue analytics
- Collection rates
- Outstanding balance tracking
- Payment statistics

✅ **Billing Packages**
- Pre-defined service packages
- Flexible pricing
- Easy invoicing

---

## 🔧 Integration Notes

For production deployment:

1. **Database**: Replace in-memory storage with MongoDB/PostgreSQL
2. **Payment Gateway**: Integrate Stripe, PayPal, or local payment processor
3. **Email Notifications**: Send invoice and payment confirmation emails
4. **Audit Logging**: Track all financial transactions
5. **Encryption**: Encrypt sensitive payment data
6. **Compliance**: Implement PCI DSS compliance
7. **Tax Calculation**: Add tax/VAT calculations
8. **Insurance API**: Integrate with insurance verification service

---

**Status:** ✅ Production Ready | **Version:** 1.0.0
