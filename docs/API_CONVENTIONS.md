# API Conventions

## Endpoint Structure

All API endpoints are prefixed with `/api/v1`.

### Authentication (`/api/v1/auth`)
- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - Login user
- `POST /api/v1/auth/refresh` - Refresh access token
- `POST /api/v1/auth/logout` - Logout user
- `POST /api/v1/auth/forgot-password` - Request password reset
- `POST /api/v1/auth/reset-password` - Reset password
- `POST /api/v1/auth/change-password` - Change password
- `POST /api/v1/auth/verify-email` - Verify email address
- `POST /api/v1/auth/resend-verification` - Resend verification email
- `GET /api/v1/auth/me` - Get current user

### Businesses (`/api/v1/businesses`)
- `GET /api/v1/businesses` - List businesses
- `POST /api/v1/owner/businesses` - Create business
- `GET /api/v1/businesses/:id` - Get business
- `GET /api/v1/businesses/slug/:slug` - Get business by slug
- `PUT /api/v1/owner/businesses/:id` - Update business
- `DELETE /api/v1/owner/businesses/:id` - Delete business
- `GET /api/v1/businesses/:id/services` - Get business services
- `GET /api/v1/businesses/:id/hours` - Get business hours
- `PUT /api/v1/owner/businesses/:id/hours` - Update business hours
- `GET /api/v1/businesses/:id/settings` - Get business settings
- `PUT /api/v1/owner/businesses/:id/settings` - Update business settings

### Services (`/api/v1/services`)
- `GET /api/v1/services` - List services
- `POST /api/v1/owner/services` - Create service
- `GET /api/v1/services/:id` - Get service
- `PUT /api/v1/owner/services/:id` - Update service
- `DELETE /api/v1/owner/services/:id` - Delete service

### Resources (`/api/v1/resources`)
- `GET /api/v1/resources` - List resources
- `POST /api/v1/owner/resources` - Create resource
- `GET /api/v1/resources/:id` - Get resource
- `PUT /api/v1/owner/resources/:id` - Update resource
- `DELETE /api/v1/owner/resources/:id` - Delete resource

### Bookings (`/api/v1/bookings`)
- `GET /api/v1/bookings` - List bookings
- `POST /api/v1/bookings` - Create booking
- `GET /api/v1/bookings/:id` - Get booking
- `PUT /api/v1/bookings/:id` - Update booking
- `DELETE /api/v1/bookings/:id/cancel` - Cancel booking
- `GET /api/v1/availability` - Check availability
- `GET /api/v1/availability/resources` - Get available resources
- `POST /api/v1/waitlist` - Add to waitlist

### Payments (`/api/v1/payments`)
- `POST /api/v1/payments/intent` - Create payment intent
- `POST /api/v1/payments/confirm` - Confirm payment
- `POST /api/v1/payments/:id/refund` - Refund payment
- `GET /api/v1/payments` - List payments
- `GET /api/v1/payments/:id` - Get payment
- `POST /api/v1/payments/webhook/:provider` - Payment webhook

### Customers (`/api/v1/customers`)
- `GET /api/v1/customers` - List customers
- `POST /api/v1/customers` - Create customer
- `GET /api/v1/customers/:id` - Get customer
- `PUT /api/v1/customers/:id` - Update customer
- `DELETE /api/v1/customers/:id` - Delete customer
- `GET /api/v1/customers/:id/history` - Get customer history
- `POST /api/v1/customers/notes` - Create customer note
- `GET /api/v1/customers/notes` - List customer notes
- `GET /api/v1/customers/notes/:id` - Get customer note
- `PUT /api/v1/customers/notes/:id` - Update customer note
- `DELETE /api/v1/customers/notes/:id` - Delete customer note

### Staff (`/api/v1/staff`)
- `GET /api/v1/staff/assignments` - List staff assignments
- `POST /api/v1/staff/assignments` - Create staff assignment
- `GET /api/v1/staff/assignments/:id` - Get staff assignment
- `PUT /api/v1/staff/assignments/:id` - Update staff assignment
- `DELETE /api/v1/staff/assignments/:id/terminate` - Terminate assignment
- `PUT /api/v1/staff/working-hours` - Update working hours
- `GET /api/v1/staff/working-hours/:resourceId` - Get working hours
- `POST /api/v1/staff/exceptions` - Create exception
- `GET /api/v1/staff/exceptions` - List exceptions
- `GET /api/v1/staff/exceptions/:id` - Get exception
- `PUT /api/v1/staff/exceptions/:id` - Update exception
- `DELETE /api/v1/staff/exceptions/:id` - Delete exception
- `POST /api/v1/staff/assign-to-booking` - Assign staff to booking

### Reviews (`/api/v1/reviews`)
- `GET /api/v1/reviews` - List reviews
- `POST /api/v1/reviews` - Create review
- `GET /api/v1/reviews/:id` - Get review
- `PUT /api/v1/reviews/:id` - Update review
- `POST /api/v1/reviews/:id/moderate` - Moderate review
- `POST /api/v1/reviews/:id/respond` - Respond to review
- `DELETE /api/v1/reviews/:id/delete` - Delete review
- `GET /api/v1/businesses/:businessId/reviews/stats` - Get review stats

### Media (`/api/v1/media`)
- `GET /api/v1/media` - List media
- `POST /api/v1/media` - Upload media
- `GET /api/v1/media/:id` - Get media
- `PUT /api/v1/media/:id` - Update media
- `DELETE /api/v1/media/:id` - Delete media
- `POST /api/v1/media/reorder` - Reorder media

### Analytics (`/api/v1/analytics`)
- `GET /api/v1/analytics` - List analytics
- `GET /api/v1/analytics/:id` - Get analytics
- `GET /api/v1/analytics/dashboard` - Get dashboard stats
- `GET /api/v1/businesses/:businessId/analytics` - Get business analytics

### Notifications (`/api/v1/notifications`)
- `GET /api/v1/notifications` - List notifications
- `POST /api/v1/notifications` - Create notification
- `GET /api/v1/notifications/:id` - Get notification
- `PUT /api/v1/notifications/:id` - Update notification
- `POST /api/v1/notifications/:id/retry` - Retry notification
- `GET /api/v1/notifications/preferences` - Get preferences
- `PUT /api/v1/notifications/preferences` - Update preferences
- `GET /api/v1/notifications/stats` - Get notification stats

### Policies (`/api/v1/policies`)
- `GET /api/v1/policies` - List cancellation policies
- `POST /api/v1/policies` - Create cancellation policy
- `GET /api/v1/policies/:id` - Get cancellation policy
- `PUT /api/v1/policies/:id` - Update cancellation policy
- `DELETE /api/v1/policies/:id` - Delete cancellation policy

### Feature Flags (`/api/v1/feature-flags`)
- `GET /api/v1/feature-flags` - List feature flags (Admin only)
- `POST /api/v1/feature-flags` - Create feature flag (Admin only)
- `GET /api/v1/feature-flags/:id` - Get feature flag (Admin only)
- `GET /api/v1/feature-flags/check/:name` - Check feature flag
- `PUT /api/v1/feature-flags/:id` - Update feature flag (Admin only)
- `DELETE /api/v1/feature-flags/:id` - Delete feature flag (Admin only)

### Audit (`/api/v1/audit`)
- `GET /api/v1/audit` - List audit logs
- `GET /api/v1/audit/:id` - Get audit log
- `GET /api/v1/audit/entity/:entity/:entityId` - Get entity logs

### Admin (`/api/v1/admin`)
- `GET /api/v1/admin/businesses` - List businesses for review (Admin only)
- `GET /api/v1/admin/businesses/:id` - Get business for review (Admin only)
- `POST /api/v1/admin/businesses/:id/approve` - Approve business (Admin only)
- `POST /api/v1/admin/businesses/:id/reject` - Reject business (Admin only)
- `POST /api/v1/admin/businesses/:id/suspend` - Suspend business (Admin only)
- `PUT /api/v1/admin/verifications/:id` - Update verification (Admin only)

## Response Format

### Success Response

```json
{
  "status": "success",
  "message": "Success message",
  "data": {
    // Response data
  }
}
```

### Error Response

```json
{
  "status": "error",
  "message": "Error message",
  "error": {
    "code": "ERROR_CODE",
    "message": "Detailed error message"
  }
}
```

### Paginated Response

```json
{
  "status": "success",
  "message": "List retrieved successfully",
  "data": {
    "items": [],
    "total": 100,
    "page": 1,
    "limit": 20,
    "totalPages": 5
  }
}
```

## Authentication

All protected endpoints require a Bearer token in the Authorization header:

```
Authorization: Bearer <accessToken>
```

## Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `409` - Conflict
- `429` - Too Many Requests
- `500` - Internal Server Error
- `503` - Service Unavailable

## Rate Limiting

- Default: 100 requests per 15 minutes per user/IP
- Authentication endpoints: 10 requests per 15 minutes
- Can be adjusted per endpoint

## Pagination

Most list endpoints support pagination:

- `page` - Page number (default: 1)
- `limit` - Items per page (default: 20, max: 100)

## Filtering

Many endpoints support filtering via query parameters:

- `business_id` - Filter by business
- `user_id` - Filter by user
- `status` - Filter by status
- `start_date` / `end_date` - Date range filtering

## Sorting

List endpoints support sorting:

- Default: `created_at DESC`
- Can be customized per endpoint

## Localization

The API supports Japanese and English:

- `Accept-Language: ja` - Japanese
- `Accept-Language: en` - English (default)

Messages and email templates are localized based on user preferences or Accept-Language header.

## Request/Response Examples

### Example: Create Booking

**Request:**
```json
POST /api/v1/bookings
Authorization: Bearer <accessToken>
Content-Type: application/json

{
  "business_id": "biz_123",
  "service_id": "svc_456",
  "customer_id": "cust_789",
  "resource_id": "res_012",
  "start_at": "2024-12-25T14:00:00Z",
  "end_at": "2024-12-25T15:00:00Z",
  "guest_count": 2,
  "notes": "Window seat preferred",
  "special_requests": "Vegetarian options"
}
```

**Response (201 Created):**
```json
{
  "status": "success",
  "message": "Booking created successfully",
  "data": {
    "booking": {
      "id": "bkg_345",
      "business_id": "biz_123",
      "service_id": "svc_456",
      "customer_id": "cust_789",
      "resource_id": "res_012",
      "status": "pending",
      "confirmation_code": "ABC123",
      "start_at": "2024-12-25T14:00:00Z",
      "end_at": "2024-12-25T15:00:00Z",
      "guest_count": 2,
      "total_amount_cents": 5000,
      "payment_due_at": "2024-12-20T23:59:59Z",
      "notes": "Window seat preferred",
      "special_requests": "Vegetarian options",
      "service": {
        "id": "svc_456",
        "name_ja": "プレミアムマッサージ",
        "name_en": "Premium Massage",
        "duration_minutes": 60,
        "price_cents": 5000
      },
      "customer": {
        "id": "cust_789",
        "name": "田中太郎",
        "email": "tanaka@example.com",
        "phone": "+81-90-1234-5678"
      },
      "created_at": "2024-12-20T10:00:00Z"
    }
  }
}
```

**Error Response (409 Conflict):**
```json
{
  "status": "error",
  "message": "Time slot already booked",
  "error": {
    "code": "BookingConflict",
    "message": "The requested time slot is not available",
    "details": {
      "requested_start": "2024-12-25T14:00:00Z",
      "requested_end": "2024-12-25T15:00:00Z",
      "available_slots": [
        {
          "start": "2024-12-25T13:00:00Z",
          "end": "2024-12-25T14:00:00Z"
        },
        {
          "start": "2024-12-25T15:00:00Z",
          "end": "2024-12-25T16:00:00Z"
        }
      ]
    }
  },
  "timestamp": "2024-12-20T10:00:00Z",
  "requestId": "req_abc123"
}
```

### Example: Create Payment Intent

**Request:**
```json
POST /api/v1/payments/intent
Authorization: Bearer <accessToken>
Content-Type: application/json

{
  "booking_id": "bkg_345",
  "amount_cents": 5000,
  "currency": "JPY",
  "payment_method": "card"
}
```

**Response (201 Created):**
```json
{
  "status": "success",
  "message": "Payment intent created",
  "data": {
    "payment_intent": {
      "id": "pi_123",
      "booking_id": "bkg_345",
      "amount_cents": 5000,
      "currency": "JPY",
      "status": "requires_payment_method",
      "client_secret": "pi_123_secret_abc",
      "provider": "payjp",
      "created_at": "2024-12-20T10:00:00Z"
    }
  }
}
```

### Example: List Bookings

**Request:**
```json
GET /api/v1/bookings?business_id=biz_123&status=confirmed&page=1&limit=20
Authorization: Bearer <accessToken>
```

**Response (200 OK):**
```json
{
  "status": "success",
  "message": "Bookings retrieved successfully",
  "data": {
    "bookings": [
      {
        "id": "bkg_345",
        "business_id": "biz_123",
        "service_id": "svc_456",
        "customer_id": "cust_789",
        "status": "confirmed",
        "confirmation_code": "ABC123",
        "start_at": "2024-12-25T14:00:00Z",
        "end_at": "2024-12-25T15:00:00Z",
        "total_amount_cents": 5000
      }
    ],
    "pagination": {
      "total": 100,
      "page": 1,
      "limit": 20,
      "totalPages": 5
    }
  }
}
```

## Error Handling

### Standardized Error Responses

All errors follow this format:

```json
{
  "status": "error",
  "message": "Human-readable error message",
  "error": {
    "code": "ErrorCode",
    "message": "Detailed error message",
    "details": {
      // Additional context
    }
  },
  "timestamp": "2024-12-25T10:00:00Z",
  "requestId": "req_abc123"
}
```

### Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `AuthenticationFailed` | 401 | Invalid or expired token |
| `InsufficientPermissions` | 403 | User lacks required permissions |
| `ResourceNotFound` | 404 | Requested resource not found |
| `ValidationError` | 400 | Request validation failed |
| `BookingConflict` | 409 | Booking time slot conflict |
| `PaymentFailed` | 402 | Payment processing failed |
| `RateLimitExceeded` | 429 | Too many requests |
| `InternalError` | 500 | Internal server error |
| `ServiceUnavailable` | 503 | External service unavailable |
| `Conflict` | 409 | Resource conflict (duplicate) |
| `BadRequest` | 400 | Invalid request format |

### Error Examples

**Validation Error (400):**
```json
{
  "status": "error",
  "message": "Validation failed",
  "error": {
    "code": "ValidationError",
    "message": "Invalid request data",
    "details": {
      "fields": {
        "email": ["Invalid email format"],
        "phone": ["Phone number is required"]
      }
    }
  },
  "timestamp": "2024-12-25T10:00:00Z",
  "requestId": "req_abc123"
}
```

**Resource Not Found (404):**
```json
{
  "status": "error",
  "message": "Resource not found",
  "error": {
    "code": "ResourceNotFound",
    "message": "Booking with ID 'bkg_999' not found"
  },
  "timestamp": "2024-12-25T10:00:00Z",
  "requestId": "req_abc123"
}
```

**Insufficient Permissions (403):**
```json
{
  "status": "error",
  "message": "Insufficient permissions",
  "error": {
    "code": "InsufficientPermissions",
    "message": "You do not have permission to access this resource"
  },
  "timestamp": "2024-12-25T10:00:00Z",
  "requestId": "req_abc123"
}
```

## API Versioning

### Versioning Strategy

**Current Version:** v1 (stable)

**Version Format:**
- URL-based versioning: `/api/v1/`
- Header-based versioning: `API-Version: 1`

**Deprecation Policy:**
- **Notice Period**: 6 months before deprecation
- **Support Period**: 12 months after v2 release
- **Breaking Changes**: Only in major versions

**Version Lifecycle:**
1. **Development**: New features in development
2. **Beta**: Beta testing with select users
3. **Stable**: Production-ready, fully supported
4. **Deprecated**: 6-month notice period
5. **Retired**: No longer supported

**Version Introduction:**
- v2 will be introduced for breaking changes only
- v1 maintained for 12 months after v2 release
- Migration guide provided for v1 → v2

**Breaking Changes:**
- Endpoint removal
- Request/response format changes
- Authentication method changes
- Required field additions

**Non-Breaking Changes:**
- New endpoints
- Optional fields
- New response fields
- Bug fixes

