# Authentication API Documentation

## Overview
The authentication system provides secure user authentication, authorization, and session management for the Lifespring Hospital EMR.

## Features
- ✅ User registration and login
- ✅ JWT token-based authentication
- ✅ Password hashing with bcryptjs
- ✅ Role-based access control (RBAC)
- ✅ Token refresh mechanism
- ✅ Rate limiting
- ✅ Session management
- ✅ Audit logging

## Authentication Endpoints

### 1. User Registration
**Endpoint:** `POST /api/v1/auth/register`

**Description:** Create a new user account

**Request Body:**
```json
{
  "email": "user@lifespring.com",
  "password": "SecurePassword123!",
  "first_name": "John",
  "last_name": "Doe",
  "role": "doctor"
}
```

**Response (201 Created):**
```json
{
  "status": "success",
  "message": "User registered successfully",
  "data": {
    "id": 1,
    "email": "user@lifespring.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "doctor",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Validation Rules:**
- Email must be valid format
- Password must be at least 8 characters
- First name and last name required
- Role: admin, doctor, nurse, staff, patient

---

### 2. User Login
**Endpoint:** `POST /api/v1/auth/login`

**Description:** Authenticate user and receive JWT token

**Request Body:**
```json
{
  "email": "user@lifespring.com",
  "password": "SecurePassword123!"
}
```

**Response (200 OK):**
```json
{
  "status": "success",
  "message": "Login successful",
  "data": {
    "id": 1,
    "email": "user@lifespring.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "doctor",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Error Response (401 Unauthorized):**
```json
{
  "status": "error",
  "message": "Invalid email or password"
}
```

---

### 3. Get Current User
**Endpoint:** `GET /api/v1/auth/me`

**Description:** Retrieve current authenticated user information

**Headers Required:**
```
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "status": "success",
  "message": "User retrieved successfully",
  "data": {
    "id": 1,
    "email": "user@lifespring.com",
    "role": "doctor",
    "firstName": "John",
    "lastName": "Doe"
  }
}
```

---

### 4. Refresh Token
**Endpoint:** `POST /api/v1/auth/refresh`

**Description:** Generate a new JWT token

**Headers Required:**
```
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "status": "success",
  "message": "Token refreshed successfully",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

---

### 5. Change Password
**Endpoint:** `POST /api/v1/auth/change-password`

**Description:** Change user password

**Headers Required:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "currentPassword": "OldPassword123!",
  "newPassword": "NewPassword456!"
}
```

**Response (200 OK):**
```json
{
  "status": "success",
  "message": "Password changed successfully"
}
```

**Error Response (401 Unauthorized):**
```json
{
  "status": "error",
  "message": "Current password is incorrect"
}
```

---

### 6. Logout
**Endpoint:** `POST /api/v1/auth/logout`

**Description:** Logout user and invalidate session

**Headers Required:**
```
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "status": "success",
  "message": "Logout successful"
}
```

---

## JWT Token Structure

Each JWT token contains the following claims:

```json
{
  "id": 1,
  "email": "user@lifespring.com",
  "role": "doctor",
  "firstName": "John",
  "lastName": "Doe",
  "iat": 1683604800,
  "exp": 1683691200
}
```

**Token Details:**
- **iat** (issued at): Timestamp when token was created
- **exp** (expiration): Token expiration time (default: 24 hours)
- **Expiry Configuration:** Set in `.env` as `JWT_EXPIRY`

---

## Role-Based Access Control (RBAC)

### Available Roles
| Role | Description | Permissions |
|------|-------------|-------------|
| **admin** | Hospital administrator | All operations |
| **doctor** | Medical doctor | Patient records, prescriptions, appointments |
| **nurse** | Nursing staff | Patient vitals, basic records |
| **staff** | General staff | Limited access |
| **patient** | Patient account | Own records only |

### Protected Routes Example
```javascript
// Admin only
router.get('/admin/users', authMiddleware, roleMiddleware(['admin']), handler);

// Doctor or Admin
router.post('/prescriptions', authMiddleware, roleMiddleware(['doctor', 'admin']), handler);

// All authenticated users
router.get('/my-profile', authMiddleware, handler);
```

---

## Error Handling

### Common Error Responses

**401 Unauthorized**
```json
{
  "status": "error",
  "message": "Invalid or expired token"
}
```

**403 Forbidden**
```json
{
  "status": "error",
  "message": "Insufficient permissions",
  "requiredRoles": ["admin"],
  "userRole": "staff"
}
```

**429 Too Many Requests**
```json
{
  "status": "error",
  "message": "Too many requests. Please try again later."
}
```

**400 Bad Request**
```json
{
  "status": "error",
  "message": "Email and password are required"
}
```

---

## Security Features

### Password Security
- Passwords hashed with bcryptjs (salt rounds: 10)
- Minimum 8 characters required
- Never stored or transmitted in plain text

### Token Security
- JWT signed with HS256 algorithm
- Tokens expire after 24 hours (configurable)
- Tokens invalidated on logout
- Rate limiting: 100 requests per 15 minutes

### Audit Trail
- Login/logout events logged
- Password changes logged
- Failed authentication attempts logged
- IP address tracking

---

## Testing with cURL

### Register User
```bash
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@lifespring.com",
    "password": "TestPass123!",
    "first_name": "John",
    "last_name": "Doe",
    "role": "doctor"
  }'
```

### Login User
```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@lifespring.com",
    "password": "TestPass123!"
  }'
```

### Get Current User
```bash
curl -X GET http://localhost:3000/api/v1/auth/me \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Refresh Token
```bash
curl -X POST http://localhost:3000/api/v1/auth/refresh \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Logout
```bash
curl -X POST http://localhost:3000/api/v1/auth/logout \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## Environment Variables

Add to `.env` file:
```
JWT_SECRET=your_very_secure_secret_key_with_special_chars!@#$%
JWT_EXPIRY=24h
NODE_ENV=development
PORT=3000
```

---

## Next Steps

1. ✅ Integration with database (replace mock data)
2. ⏳ Email verification for registration
3. ⏳ Password reset functionality
4. ⏳ Two-factor authentication (2FA)
5. ⏳ OAuth integration (Google, Microsoft)
6. ⏳ Audit logging to database

---

## Support
For issues or questions, contact the development team.
