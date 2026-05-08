# Database Schema Documentation

## Overview
This directory contains the database schema and configuration for the Lifespring Hospital EMR system.

## Files

### `schema.sql`
Main database schema file containing all table definitions, relationships, and indexes.

#### Key Tables:

**Authentication & Users:**
- `users` - Hospital staff and system users
- `user_sessions` - User login sessions and audit trails

**Patient Management:**
- `patients` - Patient demographics and basic information
- `medical_history` - Patient medical conditions and history
- `patient_vitals` - Patient vital signs (BP, HR, temperature, etc.)

**Appointments & Visits:**
- `appointments` - Scheduled appointments
- `visits` - Completed patient visits/consultations

**Prescriptions & Medications:**
- `medications` - Medication catalog
- `prescriptions` - Patient prescriptions

**Laboratory Tests:**
- `lab_tests` - Available laboratory tests
- `lab_orders` - Test orders for patients
- `lab_results` - Test results

**Medical Documents:**
- `medical_documents` - Stores references to patient documents (encrypted)

**Audit & Compliance:**
- `audit_logs` - HIPAA compliance audit trail
- `patient_access_logs` - Track who accessed patient records

**Billing:**
- `invoices` - Patient billing invoices
- `invoice_items` - Line items in invoices
- `payments` - Payment records

### `seed.sql`
Sample/test data for development and testing purposes.

## Setup Instructions

### 1. Create Database
```sql
CREATE DATABASE lifespring_emr;
USE lifespring_emr;
```

### 2. Import Schema
```bash
mysql -u your_username -p lifespring_emr < database/schema.sql
```

### 3. (Optional) Load Sample Data
```bash
mysql -u your_username -p lifespring_emr < database/seed.sql
```

## Database Configuration

### Connection Details
Update your `.env` file with:
```
DB_HOST=localhost
DB_PORT=3306
DB_NAME=lifespring_emr
DB_USER=your_username
DB_PASSWORD=your_password
DB_DIALECT=mysql
```

### Supported Databases
- MySQL 8.0+
- PostgreSQL 12+
- MariaDB 10.3+

## Entity Relationships

```
users
├── user_sessions
├── medical_history (recorded_by)
├── patient_vitals (recorded_by)
├── appointments (doctor_id)
├── visits (doctor_id)
├── prescriptions (doctor_id)
├── lab_orders (doctor_id)
└── audit_logs

patients
├── medical_history
├── patient_vitals
├── appointments
├── visits
│   ├── prescriptions
│   └── lab_orders
├── medical_documents
├── invoices
└── patient_access_logs

prescriptions
├── medications
└── visits

lab_orders
├── lab_tests
└── lab_results

invoices
├── invoice_items
└── payments
```

## HIPAA Compliance Features

1. **Audit Logging**: All database modifications are logged in `audit_logs`
2. **Access Control**: `patient_access_logs` tracks who accessed patient records
3. **Encryption**: Medical documents are encrypted (see `medical_documents.is_encrypted`)
4. **Data Retention**: Records are preserved for compliance
5. **User Roles**: Role-based access control (RBAC) via `users.role`

## Security Best Practices

1. **Password Hashing**: Passwords stored as bcrypt hashes
2. **Indexes**: Strategic indexes on frequently queried fields
3. **Foreign Keys**: Referential integrity maintained
4. **Timestamps**: Track creation and modification times
5. **Soft Deletes**: Consider implementing soft deletes for compliance
6. **Encryption**: Sensitive data should be encrypted at rest and in transit

## Common Queries

### Get Patient Medical Record
```sql
SELECT 
    p.*,
    mh.condition_name,
    mh.status as condition_status,
    pv.blood_pressure_systolic,
    pv.blood_pressure_diastolic,
    pv.recorded_at
FROM patients p
LEFT JOIN medical_history mh ON p.id = mh.patient_id
LEFT JOIN patient_vitals pv ON p.id = pv.patient_id
WHERE p.patient_id = 'PAT001'
ORDER BY pv.recorded_at DESC;
```

### Get Patient Prescriptions
```sql
SELECT 
    pr.prescription_id,
    m.medication_name,
    pr.dosage,
    pr.frequency,
    pr.status,
    pr.start_date,
    pr.end_date
FROM prescriptions pr
JOIN medications m ON pr.medication_id = m.id
WHERE pr.patient_id = 1
AND pr.status = 'active';
```

### Audit Trail - Track Patient Record Access
```sql
SELECT 
    pal.accessed_by,
    u.first_name,
    u.last_name,
    pal.access_type,
    pal.reason,
    pal.access_timestamp
FROM patient_access_logs pal
JOIN users u ON pal.accessed_by = u.id
WHERE pal.patient_id = 1
ORDER BY pal.access_timestamp DESC;
```

## Migrations

For production deployments, consider using a migration tool:
- **Node.js**: Sequelize, TypeORM, Knex.js
- **Python**: Alembic, Django Migrations
- **PHP**: Doctrine Migrations

## Backup & Recovery

### Backup
```bash
mysqldump -u your_username -p lifespring_emr > backup_$(date +%Y%m%d).sql
```

### Restore
```bash
mysql -u your_username -p lifespring_emr < backup_20260508.sql
```

## Performance Optimization

1. **Indexes**: Regularly review slow query logs
2. **Partitioning**: Consider partitioning large tables by date
3. **Archiving**: Archive old records periodically
4. **Statistics**: Keep database statistics updated
5. **Connection Pooling**: Use connection pooling in application

## Support
For questions or issues, contact the development team.
