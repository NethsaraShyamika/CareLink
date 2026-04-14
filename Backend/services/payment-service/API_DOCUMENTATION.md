# Payment Service API Documentation

## Service Overview

**Service Name:** Payment Service  
**Architecture:** Microservice (Independent, Stateless)  
**Port:** 5005  
**Database:** MongoDB (paymentDB)  
**Authentication:** JWT (Stateless)  
**Payment Gateways:** Stripe, PayHere  

## Service Interfaces (API Endpoints)

### 1. Stripe Payment Intent Creation
```
POST /api/payments/stripe/create-intent
```

**Authentication:** Required (JWT Token)  
**Authorization:** Patient only  
**Rate Limited:** 20 requests per 15 minutes  

**Request Headers:**
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "appointmentId": "ObjectId",
  "doctorId": "ObjectId",
  "amount": 5000
}
```

**Response (200):**
```json
{
  "success": true,
  "paymentId": "ObjectId",
  "clientSecret": "pi_xxxxx_secret_xxxxx"
}
```

**Error Responses:**
- 400: Missing required fields
- 401: Token required
- 403: Invalid or expired token / Insufficient permissions
- 500: Failed to create payment intent

---

### 2. Stripe Webhook Handler
```
POST /api/payments/stripe/webhook
```

**Authentication:** Not Required (Stripe signature validation)  
**Authorization:** N/A  
**Rate Limited:** No  

**Request Headers:**
```
stripe-signature: t=<timestamp>,v1=<signature>
Content-Type: application/json
```

**Request Body:**
```json
{
  "id": "evt_xxxxx",
  "type": "payment_intent.succeeded|payment_intent.payment_failed",
  "data": {
    "object": {
      "id": "pi_xxxxx",
      "status": "succeeded|failed"
    }
  }
}
```

**Response (200):**
```json
{
  "received": true
}
```

**Events Handled:**
- `payment_intent.succeeded` - Update payment status to "completed"
- `payment_intent.payment_failed` - Update payment status to "failed"

---

### 3. Confirm Stripe Payment
```
POST /api/payments/stripe/confirm
```

**Authentication:** Required (JWT Token)  
**Authorization:** Patient only  
**Rate Limited:** No  

**Request Headers:**
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "paymentIntentId": "pi_xxxxx",
  "paymentId": "ObjectId"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Payment confirmed successfully"
}
```

---

### 4. Get Patient Payment History
```
GET /api/payments/history
```

**Authentication:** Required (JWT Token)  
**Authorization:** Patient only  

**Request Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response (200):**
```json
{
  "success": true,
  "count": 5,
  "payments": [
    {
      "_id": "ObjectId",
      "amount": 5000,
      "currency": "LKR",
      "gateway": "stripe|payhere",
      "status": "completed|pending|failed",
      "createdAt": "2026-03-27T10:30:00Z"
    }
  ]
}
```

**Query Parameters:** None  
**Pagination:** Fixed limit of 20 records  
**Sorting:** By creation date (newest first)  

---

### 5. Get Payment by ID
```
GET /api/payments/:id
```

**Authentication:** Required (JWT Token)  
**Authorization:** Patient (own payments only) / Admin (any payment)  

**Request Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response (200):**
```json
{
  "success": true,
  "payment": {
    "_id": "ObjectId",
    "patientId": "ObjectId",
    "appointmentId": "ObjectId",
    "doctorId": "ObjectId",
    "amount": 5000,
    "currency": "LKR",
    "gateway": "stripe",
    "status": "completed",
    "gatewayOrderId": "pi_xxxxx",
    "gatewayPaymentId": "ch_xxxxx",
    "createdAt": "2026-03-27T10:30:00Z",
    "updatedAt": "2026-03-27T10:35:00Z"
  }
}
```

**Error Responses:**
- 403: Access denied (patient viewing another's payment)
- 404: Payment not found

---

### 6. Get Payment by Appointment ID
```
GET /api/payments/appointment/:appointmentId
```

**Authentication:** Required (JWT Token)  
**Authorization:** Patient, Doctor, Admin (can all access)  

**Request Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response (200):**
```json
{
  "success": true,
  "payment": {
    "_id": "ObjectId",
    "appointmentId": "ObjectId",
    "status": "completed|pending|failed",
    "amount": 5000,
    "gateway": "stripe"
  }
}
```

**Error Responses:**
- 404: No payment found for this appointment

---

### 7. Get All Payments (Admin)
```
GET /api/payments/admin/all
```

**Authentication:** Required (JWT Token)  
**Authorization:** Admin only  

**Request Headers:**
```
Authorization: Bearer <jwt_token>
```

**Query Parameters:**
| Parameter | Type | Values | Example |
|-----------|------|--------|---------|
| `status` | string | pending, completed, failed, refunded, cancelled | `?status=completed` |
| `gateway` | string | stripe, payhere | `?gateway=stripe` |
| `page` | integer | >= 1 (default: 1) | `?page=1` |
| `limit` | integer | 1-100 (default: 20) | `?limit=20` |

**Example Request:**
```
GET /api/payments/admin/all?status=completed&gateway=stripe&page=1&limit=20
```

**Response (200):**
```json
{
  "success": true,
  "total": 150,
  "page": 1,
  "payments": [
    {
      "_id": "ObjectId",
      "patientId": "ObjectId",
      "appointmentId": "ObjectId",
      "doctorId": "ObjectId",
      "amount": 5000,
      "currency": "LKR",
      "gateway": "stripe",
      "status": "completed",
      "createdAt": "2026-03-27T10:30:00Z"
    }
  ]
}
```

---

## Authentication & Authorization

### JWT Token Structure
```json
{
  "userId": "ObjectId",
  "role": "patient|doctor|admin",
  "iat": 1234567890,
  "exp": 1234671490
}
```

### Middleware Implementation

**verifyToken() Middleware:**
- Extracts token from Authorization header
- Validates JWT signature using JWT_SECRET
- Decodes token and attaches user info to request
- Returns 401 if token missing, 403 if invalid

**requireRole(...roles) Middleware:**
- Checks if user role matches allowed roles
- Returns 403 if authorization fails
- Allows multiple roles: `requireRole("patient", "admin")`

### Role Permissions

| Endpoint | Patient | Doctor | Admin |
|----------|---------|--------|-------|
| POST /stripe/create-intent | ✅ | ❌ | ❌ |
| POST /stripe/confirm | ✅ | ❌ | ❌ |
| POST /stripe/webhook | N/A | N/A | N/A |
| GET /history | ✅ (own) | ❌ | ❌ |
| GET /:id | ✅ (own) | ❌ | ✅ (any) |
| GET /appointment/:id | ✅ | ✅ | ✅ |
| GET /admin/all | ❌ | ❌ | ✅ |

---

## Data Models

### Payment Schema
```javascript
{
  _id: ObjectId,
  patientId: ObjectId (ref: "Patient"),
  appointmentId: ObjectId (ref: "Appointment"),
  doctorId: ObjectId (ref: "Doctor"),
  
  // Payment Details
  amount: Number (in LKR),
  currency: String (default: "LKR"),
  gateway: String (enum: ["stripe", "payhere"]),
  status: String (enum: ["pending", "completed", "failed", "refunded", "cancelled"]),
  
  // Gateway-Specific IDs
  gatewayOrderId: String (PayHere order_id or Stripe PaymentIntent ID),
  gatewayPaymentId: String (PayHere payment_id or Stripe charge ID),
  gatewayResponse: Object (raw response for debugging),
  
  // Refund
  refundedAt: Date,
  refundReason: String,
  
  // Timestamps
  createdAt: Date,
  updatedAt: Date
}
```

---

## HTTP Status Codes

| Code | Meaning | Common Causes |
|------|---------|---------------|
| 200 | OK | Request successful |
| 400 | Bad Request | Missing required fields, invalid data |
| 401 | Unauthorized | Missing JWT token |
| 403 | Forbidden | Invalid token, insufficient permissions |
| 404 | Not Found | Payment not found, appointment not found |
| 429 | Too Many Requests | Rate limit exceeded (20/15min for payment creation) |
| 500 | Internal Server Error | Database error, Stripe API error |

---

## Rate Limiting

**Applied To:** Payment creation endpoint only  
**Rule:** 20 requests per 15 minutes per user  
**Purpose:** Prevent abuse of payment intent creation

**Error Response (429):**
```json
{
  "message": "Too many payment requests. Please try again later."
}
```

---

## Integration with Other Services

### Dependencies
- **Auth Service:** Validates JWT tokens (same JWT_SECRET)
- **Patient Service:** Patient information reference
- **Doctor Service:** Doctor information reference
- **Appointment Service:** Appointment information reference
- **Notification Service:** Sends payment confirmation notifications

### Communication Patterns
- **Synchronous:** JWT validation (local)
- **Asynchronous:** Payment confirmation webhooks (Stripe)

---

## Security Considerations

1. **Authentication:** JWT-based stateless authentication
2. **Authorization:** Role-based access control (patient, doctor, admin)
3. **Webhook Validation:** Stripe signature verification
4. **Rate Limiting:** Prevents payment intent abuse
5. **Data Protection:** 
   - Gateway response not returned to frontend
   - Patient can only view own payments
6. **CORS:** Configured to specific client URL

---

## Environment Variables Required

```env
# Service Configuration
PAYMENT_DB_URI=mongodb+srv://...
PORT=5005

# Security
JWT_SECRET=your_secret_key_here

# Stripe
STRIPE_SECRET_KEY=sk_test_xxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxx

# Client Configuration
CLIENT_URL=http://localhost:3000
```

---

## Error Handling

All errors follow standard format:
```json
{
  "message": "Error description",
  "code": "ERROR_CODE" // optional
}
```

Common Errors:
- "Access token required" (401)
- "Invalid or expired token" (403)
- "Insufficient permissions" (403)
- "appointmentId, doctorId, and amount are required" (400)
- "Failed to create payment intent" (500)
- "Payment not found" (404)

---

## API Version
**Current Version:** 1.0.0  
**Base Path:** `/api/payments`  
**Protocol:** HTTP/HTTPS  

---

## Testing

Use the provided Postman collection for comprehensive testing:
- Payment creation flow
- Authorization scenarios
- Error handling
- Admin operations
- Role-based access control

See `POSTMAN_COLLECTION_GUIDE.md` for detailed testing instructions.

---

**Last Updated:** March 27, 2026  
**Microservice Architecture:** SE3020 - Distributed Systems  
**Healthcare Platform Assignment**
