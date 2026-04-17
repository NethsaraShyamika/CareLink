# Payment Service API - Postman Collection Guide

## Overview
This Postman collection provides comprehensive testing for the Payment Microservice APIs used in the Healthcare Platform (SE3020 - Distributed Systems Assignment).

## Files Included
- `Payment-Service-API.postman_collection.json` - Complete API collection
- `Payment-Service-Environment.postman_environment.json` - Environment variables

## Setup Instructions

### 1. Import the Collection in Postman

#### Option A: Import via File
1. Open Postman
2. Click **Import** (top-left corner)
3. Select **Upload Files**
4. Choose `Payment-Service-API.postman_collection.json`
5. Click **Import**

#### Option B: Import via Link
1. In Postman, click **Import**
2. Paste the collection JSON content
3. Click **Import**

### 2. Import the Environment

1. In Postman, click on the **Environments** tab (left sidebar)
2. Click **Import**
3. Choose `Payment-Service-Environment.postman_environment.json`
4. Click **Import**

### 3. Select the Environment

1. Click the environment dropdown (top-right, near the eye icon)
2. Select **"Payment Service - Local Development"**

### 4. Configure Environment Variables

Update the following environment variables based on your setup:

| Variable | Default | Description |
|----------|---------|-------------|
| `base_url` | `http://localhost:5005` | Payment Service URL |
| `auth_service_url` | `http://localhost:5000` | Authentication Service URL |
| `appointment_id` | `65a5c7f9d0c5e8f1a2b3c4d5` | Sample appointment ID (update with real ID) |
| `doctor_id` | `65a5c7f9d0c5e8f1a2b3c4d6` | Sample doctor ID (update with real ID) |

## API Endpoints Tested

### 1. Authentication & Setup
- **Generate Patient Token** - Login as patient and save JWT token
- **Generate Doctor Token** - Login as doctor and save JWT token
- **Generate Admin Token** - Login as admin and save JWT token

### 2. Stripe Payment Operations
- **Create Stripe Payment Intent** - Initialize payment (patient only)
- **Confirm Stripe Payment** - Confirm successful payment
- **Stripe Webhook** - Handle Stripe events

### 3. Patient Payment Operations
- **Get Patient Payment History** - View own payment history
- **Get Payment by ID** - View payment details

### 4. Appointment Payment Status
- **Get Payment by Appointment ID** - Check payment for specific appointment

### 5. Admin Payment Management
- **Get All Payments** - View all payments with filters
- **Get All Payments - With Filters** - View payments by status or gateway

### 6. Error Scenarios & Authorization Tests
- **Missing Authorization Header** (401)
- **Invalid Token** (403)
- **Doctor Access to Patient-Only Endpoint** (403)
- **Patient Access to Admin Endpoint** (403)
- **Invalid Payment ID** (404)

## How to Use

### Step 1: Generate Authentication Tokens
1. Run **"1. Authentication & Setup"** folder requests in sequence:
   - "Generate Patient Token"
   - "Generate Doctor Token"
   - "Generate Admin Token"

2. Tokens will be automatically saved to environment variables

### Step 2: Test Payment Creation Flow
1. Update `appointment_id` and `doctor_id` variables with real IDs
2. Run **"Create Stripe Payment Intent (Patient Only)"**
3. It will automatically save:
   - `payment_id`
   - `client_secret`

### Step 3: Test Payment Retrieval
1. Run requests from **"3. Patient Payment Operations"**
2. Verify payment history and details are returned

### Step 4: Test Role-Based Access Control
1. Run requests from **"6. Error Scenarios & Authorization Tests"**
2. Verify appropriate error codes and messages

### Step 5: Admin Operations
1. Run **"Get All Payments (Admin Only)"** with admin token
2. Try different filter combinations:
   - By status: `?status=completed`
   - By gateway: `?gateway=stripe`
   - By page: `?page=1&limit=10`

## API Documentation

### Authentication
All protected endpoints require JWT token in Authorization header:
```
Authorization: Bearer {{patient_token}}
```

### Response Format
```json
{
  "success": true,
  "message": "optional message",
  "data": {}
}
```

### Error Responses

| Status Code | Meaning | Example |
|------------|---------|---------|
| 200 | Success | `{"success": true, "data": {...}}` |
| 400 | Bad Request | Missing required fields |
| 401 | Unauthorized | Missing token |
| 403 | Forbidden | Invalid token or insufficient permissions |
| 404 | Not Found | Payment/appointment not found |
| 500 | Server Error | Database or server error |

## Role-Based Access Control

### Patient
- ✅ Create Stripe Payment Intent
- ✅ Confirm Stripe Payment
- ✅ View own payment history
- ✅ View own payment details
- ✅ View payment by appointment ID
- ❌ Access admin endpoints

### Doctor
- ✅ View payment by appointment ID
- ❌ Create payments
- ❌ View other users' payment history

### Admin
- ✅ View all payments
- ✅ Filter and paginate payments
- ✅ View any payment details
- ✅ Monitor all payment transactions

## Testing Scenarios

### Scenario 1: Successful Payment Flow
```
1. Generate Patient Token
2. Create Stripe Payment Intent
3. Get Payment by ID (verify pending status)
4. Simulate Stripe Webhook
5. Get Payment by ID (verify completed status)
```

### Scenario 2: Role-Based Access Control
```
1. Generate all tokens (patient, doctor, admin)
2. Run error test: Doctor tries to create payment (403)
3. Run error test: Patient tries admin endpoint (403)
4. Verify appropriate 403 responses
```

### Scenario 3: Payment History & Filtering
```
1. Generate Patient Token
2. Get Patient Payment History
3. Generate Admin Token
4. Get All Payments with filters
5. Try different status/gateway combinations
```

## Environment Setup for Different Stages

### Development (Local)
```
base_url: http://localhost:5005
auth_service_url: http://localhost:5000
```

### Production
```
base_url: https://payment-api.yourdomain.com
auth_service_url: https://auth-api.yourdomain.com
```

### Docker/Kubernetes
```
base_url: http://payment-service:5005
auth_service_url: http://auth-service:5000
```

## Troubleshooting

### Issue: "token required" error (401)
**Solution:** Run the Generate Token requests first and ensure tokens are saved to environment variables

### Issue: "Invalid or expired token" error (403)
**Solution:** 
- Regenerate tokens
- Verify JWT_SECRET matches between services
- Check token expiration time

### Issue: "Insufficient permissions" error (403)
**Solution:**
- Verify using correct role token (patient, doctor, or admin)
- Check requireRole middleware in routes

### Issue: "Payment not found" error (404)
**Solution:**
- Verify `payment_id` is correct
- Ensure Create Payment Intent was called successfully first
- Check MongoDB connection

### Issue: Rate limit error (429)
**Solution:**
- Payment creation is limited to 20 requests per 15 minutes
- Wait 15 minutes or restart the service
- This is intentional security measure

## Advanced Usage

### Using Pre-request Scripts
Requests have automatic token extraction scripts that save responses to environment variables.

### Using Test Scripts
Each request has built-in tests that:
- Verify status codes
- Check response structure
- Extract and save important data

### Running Collections
1. Click the 3-dot menu next to collection name
2. Select "Run collection"
3. Configure run settings
4. Click "Run"

## Security Notes

For your assignment submission:

1. **Never commit real tokens** - Use placeholder values
2. **JWT_SECRET** - Keep in .env file, not in Postman
3. **API Keys** - Don't expose Stripe keys in collection
4. **Test Data** - Use dummy IDs for demonstration
5. **Webhook Testing** - Use Stripe CLI for webhook testing in production

### Stripe Webhook Testing with CLI
```bash
# Install Stripe CLI
npm install -g @stripe/cli

# Login to Stripe
stripe login

# Forward webhooks to local service
stripe listen --forward-to localhost:5005/api/payments/stripe/webhook

# Trigger test events
stripe trigger payment_intent.succeeded
```

## For Your SE3020 Assignment

### Documentation Checklist
- ✅ Service interfaces documented in collection
- ✅ Authentication mechanism (JWT) shown in headers
- ✅ Role-based access control tested
- ✅ Error scenarios covered
- ✅ API response formats documented
- ✅ Integration examples provided

### Video Demo Script
When recording your demo video:
1. Show collection import and setup (30 seconds)
2. Demonstrate token generation (30 seconds)
3. Test payment creation flow (1 minute)
4. Show error handling (30 seconds)
5. Demonstrate admin filtering (30 seconds)
6. Explain role-based access control (1 minute)

### Report Integration
Include this in your report PDF:
- API endpoint table (copy from this guide)
- Authentication flow diagram
- Role-based access control table
- Example request/response pairs
- Security implementation details

## Additional Resources

- [Postman Documentation](https://learning.postman.com/)
- [Stripe API Reference](https://stripe.com/docs/api)
- [JWT Guide](https://jwt.io/)
- [REST API Best Practices](https://restfulapi.net/)

## Support for Your Team

This collection is designed to:
- ✅ Facilitate testing during development
- ✅ Serve as API documentation
- ✅ Demonstrate microservices communication
- ✅ Show security implementation
- ✅ Provide examples for assignment report

---

**Created for SE3020 - Distributed Systems Assignment**  
**Healthcare Platform - Microservices Architecture**  
**Payment Service - March 2026**
