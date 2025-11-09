# Omotenashi Connect - Complete Technical Documentation

## Table of Contents

1. [Project Overview](#project-overview)
2. [Architecture](#architecture)
3. [Technology Stack](#technology-stack)
4. [Project Structure](#project-structure)
5. [Database Schema](#database-schema)
6. [API Endpoints](#api-endpoints)
7. [Services Implementation](#services-implementation)
8. [Authentication & Authorization](#authentication--authorization)
9. [Payment Processing](#payment-processing)
10. [Email System](#email-system)
11. [Media Management](#media-management)
12. [Background Jobs](#background-jobs)
13. [Security Features](#security-features)
14. [Testing](#testing)
15. [Deployment](#deployment)
16. [Development Workflow](#development-workflow)

---

## Project Overview

**Omotenashi Connect** is a comprehensive booking and business management platform designed for the Japanese hospitality market. The system provides end-to-end functionality for businesses to manage their services, bookings, customers, staff, payments, and analytics.

### Key Features

- **Multi-tenant Architecture**: Complete business isolation with role-based access control
- **Advanced Booking System**: Real-time availability checking, waitlist management, and booking history
- **Payment Integration**: Support for both PayJP and Stripe payment gateways
- **Customer Relationship Management**: Complete CRM with customer profiles, notes, and history
- **Staff Management**: Staff assignments, working hours, exceptions, and booking assignments
- **Review System**: Customer reviews with moderation and business responses
- **Analytics Dashboard**: Daily aggregated analytics with business insights
- **Email Notifications**: Beautiful HTML email templates in Japanese and English
- **Media Management**: S3-based file storage with presigned URLs
- **Audit Logging**: Comprehensive audit trail for compliance
- **Feature Flags**: Gradual feature rollout system

---

## Architecture

### System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Client Layer                          │
│              (Web App, Mobile App, Admin Panel)             │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                      API Gateway Layer                       │
│  Express.js + Middleware (Auth, Validation, Rate Limiting)  │
└──────────────────────┬──────────────────────────────────────┘
                       │
        ┌──────────────┼──────────────┐
        ▼              ▼              ▼
┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│   Services   │ │   Workers    │ │   Storage    │
│   Layer      │ │   (BullMQ)   │ │   (S3)       │
└──────┬───────┘ └──────┬───────┘ └──────┬───────┘
       │                │                │
       └────────┬───────┴────────────────┘
                ▼
┌─────────────────────────────────────────────────────────────┐
│                    Data Layer                                │
│         PostgreSQL (Primary) + Redis (Cache/Queue)          │
└─────────────────────────────────────────────────────────────┘
```

### Request Flow

1. **Client Request** → Express.js middleware stack
2. **Authentication** → JWT token validation
3. **Authorization** → Role-based access control
4. **Validation** → Zod schema validation
5. **Rate Limiting** → Redis-based rate limiting
6. **Business Logic** → Service layer processing
7. **Database Operations** → Sequelize ORM with transactions
8. **Response** → JSON response with proper status codes

---

## Technology Stack

### Core Technologies

- **Runtime**: Node.js v22.x
- **Language**: TypeScript 5.6.x
- **Framework**: Express.js 4.19.x
- **Database**: PostgreSQL 14.x+
- **Cache/Queue**: Redis 5.0+
- **ORM**: Sequelize 6.37.x

### Key Libraries

- **Authentication**: `jsonwebtoken` - JWT token generation and validation
- **Password Hashing**: `bcrypt` - Secure password hashing
- **Validation**: `zod` - Runtime type validation
- **Job Queue**: `bullmq` - Background job processing
- **Email**: `@sendgrid/mail` - Email delivery
- **Storage**: `@aws-sdk/client-s3` - S3 file storage
- **File Upload**: `multer` - Multipart form data handling
- **Logging**: `pino` - Fast JSON logger
- **API Docs**: `swagger-ui-express` - API documentation

---

## Project Structure

```
omotenashi-connect/
├── src/
│   ├── config/              # Configuration files
│   │   ├── db.ts           # Database connection
│   │   ├── redis.ts        # Redis connection
│   │   ├── sequelize.ts    # Sequelize setup
│   │   ├── env.ts          # Environment variables
│   │   ├── bullmq.ts       # BullMQ queue setup
│   │   ├── payment.ts      # Payment gateway config
│   │   ├── storage.ts      # S3 storage config
│   │   └── swagger.ts      # Swagger documentation
│   │
│   ├── controllers/        # HTTP request handlers (20 files)
│   │   ├── auth.controller.ts
│   │   ├── business.controller.ts
│   │   ├── service.controller.ts
│   │   ├── booking.controller.ts
│   │   ├── payment.controller.ts
│   │   ├── customer.controller.ts
│   │   ├── staff.controller.ts
│   │   ├── review.controller.ts
│   │   ├── media.controller.ts
│   │   ├── analytics.controller.ts
│   │   ├── notification.controller.ts
│   │   ├── admin.controller.ts
│   │   ├── audit.controller.ts
│   │   ├── policy.controller.ts
│   │   └── featureFlag.controller.ts
│   │
│   ├── services/           # Business logic layer (20 files)
│   │   ├── auth.service.ts
│   │   ├── business.service.ts
│   │   ├── serviceCatalog.service.ts
│   │   ├── booking.service.ts
│   │   ├── payment.service.ts
│   │   ├── customer.service.ts
│   │   ├── staff.service.ts
│   │   ├── review.service.ts
│   │   ├── media.service.ts
│   │   ├── analytics.service.ts
│   │   ├── notification.service.ts
│   │   ├── verification.service.ts
│   │   ├── availability.service.ts
│   │   ├── email.service.ts
│   │   ├── storage.service.ts
│   │   ├── audit.service.ts
│   │   ├── policy.service.ts
│   │   └── featureFlag.service.ts
│   │
│   ├── models/             # Sequelize models (33 files)
│   │   ├── user.model.ts
│   │   ├── business.model.ts
│   │   ├── service.model.ts
│   │   ├── booking.model.ts
│   │   ├── customer.model.ts
│   │   ├── staffAssignment.model.ts
│   │   ├── review.model.ts
│   │   ├── payment models...
│   │   └── index.ts        # Model associations
│   │
│   ├── routes/             # Express route definitions (16 files)
│   │   ├── auth.routes.ts
│   │   ├── business.routes.ts
│   │   ├── booking.routes.ts
│   │   ├── payment.routes.ts
│   │   ├── customer.routes.ts
│   │   ├── staff.routes.ts
│   │   └── index.ts        # Main router
│   │
│   ├── validators/         # Zod validation schemas (14 files)
│   │   ├── auth.validator.ts
│   │   ├── business.validator.ts
│   │   ├── booking.validator.ts
│   │   ├── payment.validator.ts
│   │   └── ...
│   │
│   ├── middleware/         # Express middleware (6 files)
│   │   ├── authGuard.ts    # JWT authentication
│   │   ├── validation.ts   # Request validation
│   │   ├── rateLimit.ts    # Rate limiting
│   │   ├── requestLogger.ts
│   │   └── i18n.ts         # Internationalization
│   │
│   ├── jobs/               # Background job workers (6 files)
│   │   ├── email.worker.ts
│   │   ├── analytics.worker.ts
│   │   ├── booking-reminder.worker.ts
│   │   ├── expire-bookings.worker.ts
│   │   ├── webhook.worker.ts
│   │   └── queues.ts       # Queue definitions
│   │
│   ├── templates/          # Email templates
│   │   └── email/
│   │       ├── verification-ja.html
│   │       ├── verification-en.html
│   │       ├── booking-confirmation-ja.html
│   │       └── ...
│   │
│   ├── utils/              # Utility functions
│   │   ├── httpErrors.ts   # Error classes
│   │   ├── messages.ts     # Localized messages
│   │   ├── validators.ts   # Common validators
│   │   ├── crypto.ts       # Cryptographic utilities
│   │   └── logger.ts       # Logger setup
│   │
│   ├── types/              # TypeScript type definitions
│   │   ├── enums.ts        # Enum definitions
│   │   ├── express.d.ts    # Express type extensions
│   │   └── models.d.ts     # Model type definitions
│   │
│   ├── app.ts              # Express app setup
│   └── server.ts           # Server entry point
│
├── tests/                  # Test files
├── migrations/             # Database migrations
├── scripts/                # Utility scripts
├── .env.example            # Environment variables template
├── package.json            # Dependencies and scripts
├── tsconfig.json           # TypeScript configuration
└── README.md               # Project README
```

---

## Database Schema

### Core Entities

#### Users & Authentication
- **User**: User accounts with roles (admin, owner, staff, customer)
- **RefreshToken**: Refresh token storage for JWT rotation
- **EmailVerification**: Email verification tokens
- **PasswordReset**: Password reset tokens
- **UserSession**: Active user sessions

#### Business Management
- **Vertical**: Business categories
- **Business**: Business profiles
- **BusinessSettings**: Business configuration
- **BusinessVerification**: Business verification status
- **BusinessDocument**: Business documents
- **BusinessHour**: Business operating hours
- **BusinessHoliday**: Business holidays
- **BusinessMedia**: Business media files

#### Service Catalog
- **Service**: Service offerings
- **Resource**: Staff, equipment, rooms, etc.
- **ServiceResource**: Many-to-many relationship between services and resources
- **CancellationPolicy**: Cancellation policies with penalties

#### Bookings
- **Booking**: Booking records
- **BookingHistory**: Booking status change history
- **BookingReminder**: Booking reminder tracking
- **Waitlist**: Waitlist entries

#### Customers
- **Customer**: Customer profiles
- **CustomerNote**: Customer notes (allergies, preferences, etc.)

#### Staff
- **StaffAssignment**: Staff-to-business assignments
- **StaffWorkingHour**: Regular working hours
- **StaffException**: Working hour exceptions

#### Payments
- **BookingPayment**: Payment records
- **PaymentWebhook**: Webhook event tracking
- **IdempotencyKey**: Idempotency for payment operations

#### Reviews
- **Review**: Customer reviews with moderation

#### Analytics
- **AnalyticsDaily**: Daily aggregated analytics

#### Notifications
- **NotificationOutbox**: Outgoing notifications

#### System
- **AuditLog**: Audit trail
- **FeatureFlag**: Feature flags
- **RateLimit**: Rate limiting records

### Key Relationships

```
User
├── hasMany → Business (as owner)
├── hasMany → StaffAssignment
├── hasMany → Customer
└── hasMany → AuditLog (as actor)

Business
├── hasMany → Service
├── hasMany → Resource
├── hasMany → Customer
├── hasMany → Booking
├── hasMany → Review
├── hasMany → CancellationPolicy
└── hasMany → StaffAssignment

Service
├── belongsTo → Business
├── belongsTo → CancellationPolicy
├── belongsToMany → Resource (through ServiceResource)
└── hasMany → Booking

Booking
├── belongsTo → Business
├── belongsTo → Service
├── belongsTo → Resource
├── belongsTo → Customer
└── hasMany → BookingPayment

Customer
├── belongsTo → Business
├── belongsTo → User (optional)
├── hasMany → Booking
├── hasMany → Review
└── hasMany → CustomerNote
```

---

## API Endpoints

### Authentication Endpoints

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | `/api/v1/auth/register` | Register new user | Public |
| POST | `/api/v1/auth/login` | Login user | Public |
| POST | `/api/v1/auth/refresh` | Refresh access token | Public |
| POST | `/api/v1/auth/logout` | Logout user | Private |
| POST | `/api/v1/auth/forgot-password` | Request password reset | Public |
| POST | `/api/v1/auth/reset-password` | Reset password | Public |
| POST | `/api/v1/auth/change-password` | Change password | Private |
| POST | `/api/v1/auth/verify-email` | Verify email address | Public |
| POST | `/api/v1/auth/resend-verification` | Resend verification email | Public |
| GET | `/api/v1/auth/me` | Get current user | Private |

### Business Endpoints

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/api/v1/businesses` | List businesses | Public |
| POST | `/api/v1/owner/businesses` | Create business | Owner/Admin |
| GET | `/api/v1/businesses/:id` | Get business | Public |
| GET | `/api/v1/businesses/slug/:slug` | Get business by slug | Public |
| PUT | `/api/v1/owner/businesses/:id` | Update business | Owner/Admin |
| DELETE | `/api/v1/owner/businesses/:id` | Delete business | Owner/Admin |
| GET | `/api/v1/businesses/:id/services` | Get business services | Public |
| GET | `/api/v1/businesses/:id/hours` | Get business hours | Public |
| PUT | `/api/v1/owner/businesses/:id/hours` | Update business hours | Owner/Admin |
| GET | `/api/v1/businesses/:id/settings` | Get business settings | Public |
| PUT | `/api/v1/owner/businesses/:id/settings` | Update business settings | Owner/Admin |

### Service Endpoints

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/api/v1/services` | List services | Public |
| POST | `/api/v1/owner/services` | Create service | Owner/Admin |
| GET | `/api/v1/services/:id` | Get service | Public |
| PUT | `/api/v1/owner/services/:id` | Update service | Owner/Admin |
| DELETE | `/api/v1/owner/services/:id` | Delete service | Owner/Admin |

### Resource Endpoints

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/api/v1/resources` | List resources | Public |
| POST | `/api/v1/owner/resources` | Create resource | Owner/Admin |
| GET | `/api/v1/resources/:id` | Get resource | Public |
| PUT | `/api/v1/owner/resources/:id` | Update resource | Owner/Admin |
| DELETE | `/api/v1/owner/resources/:id` | Delete resource | Owner/Admin |

### Booking Endpoints

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/api/v1/bookings` | List bookings | Private |
| POST | `/api/v1/bookings` | Create booking | Private |
| GET | `/api/v1/bookings/:id` | Get booking | Private |
| PUT | `/api/v1/bookings/:id` | Update booking | Private |
| DELETE | `/api/v1/bookings/:id/cancel` | Cancel booking | Private |
| GET | `/api/v1/availability` | Check availability | Public |
| GET | `/api/v1/availability/resources` | Get available resources | Public |
| POST | `/api/v1/waitlist` | Add to waitlist | Private |

### Payment Endpoints

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | `/api/v1/payments/intent` | Create payment intent | Private |
| POST | `/api/v1/payments/confirm` | Confirm payment | Private |
| POST | `/api/v1/payments/:id/refund` | Refund payment | Owner/Admin |
| GET | `/api/v1/payments` | List payments | Private |
| GET | `/api/v1/payments/:id` | Get payment | Private |
| POST | `/api/v1/payments/webhook/:provider` | Payment webhook | Public |

### Customer Endpoints

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/api/v1/customers` | List customers | Owner/Admin/Customer |
| POST | `/api/v1/customers` | Create customer | Owner/Admin |
| GET | `/api/v1/customers/:id` | Get customer | Owner/Admin/Customer |
| PUT | `/api/v1/customers/:id` | Update customer | Owner/Admin/Customer |
| DELETE | `/api/v1/customers/:id` | Delete customer | Owner/Admin |
| GET | `/api/v1/customers/:id/history` | Get customer history | Owner/Admin/Customer |
| POST | `/api/v1/customers/notes` | Create customer note | Owner/Admin/Staff |
| GET | `/api/v1/customers/notes` | List customer notes | Owner/Admin/Staff/Customer |
| GET | `/api/v1/customers/notes/:id` | Get customer note | Owner/Admin/Staff/Customer |
| PUT | `/api/v1/customers/notes/:id` | Update customer note | Owner/Admin/Staff |
| DELETE | `/api/v1/customers/notes/:id` | Delete customer note | Owner/Admin/Staff |

### Staff Endpoints

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/api/v1/staff/assignments` | List staff assignments | Owner/Admin/Staff |
| POST | `/api/v1/staff/assignments` | Create staff assignment | Owner/Admin |
| GET | `/api/v1/staff/assignments/:id` | Get staff assignment | Owner/Admin/Staff |
| PUT | `/api/v1/staff/assignments/:id` | Update staff assignment | Owner/Admin |
| DELETE | `/api/v1/staff/assignments/:id/terminate` | Terminate assignment | Owner/Admin |
| PUT | `/api/v1/staff/working-hours` | Update working hours | Owner/Admin |
| GET | `/api/v1/staff/working-hours/:resourceId` | Get working hours | Owner/Admin/Staff |
| POST | `/api/v1/staff/exceptions` | Create exception | Owner/Admin |
| GET | `/api/v1/staff/exceptions` | List exceptions | Owner/Admin/Staff |
| GET | `/api/v1/staff/exceptions/:id` | Get exception | Owner/Admin/Staff |
| PUT | `/api/v1/staff/exceptions/:id` | Update exception | Owner/Admin |
| DELETE | `/api/v1/staff/exceptions/:id` | Delete exception | Owner/Admin |
| POST | `/api/v1/staff/assign-to-booking` | Assign staff to booking | Owner/Admin |

### Review Endpoints

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/api/v1/reviews` | List reviews | Public |
| POST | `/api/v1/reviews` | Create review | Private |
| GET | `/api/v1/reviews/:id` | Get review | Public |
| PUT | `/api/v1/reviews/:id` | Update review | Private |
| POST | `/api/v1/reviews/:id/moderate` | Moderate review | Owner/Admin |
| POST | `/api/v1/reviews/:id/respond` | Respond to review | Owner/Admin |
| DELETE | `/api/v1/reviews/:id/delete` | Delete review | Owner/Admin |
| GET | `/api/v1/businesses/:businessId/reviews/stats` | Get review stats | Public |

### Media Endpoints

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/api/v1/media` | List media | Public |
| POST | `/api/v1/media` | Upload media | Owner/Admin |
| GET | `/api/v1/media/:id` | Get media | Public |
| PUT | `/api/v1/media/:id` | Update media | Owner/Admin |
| DELETE | `/api/v1/media/:id` | Delete media | Owner/Admin |
| POST | `/api/v1/media/reorder` | Reorder media | Owner/Admin |

### Analytics Endpoints

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/api/v1/analytics` | List analytics | Owner/Admin |
| GET | `/api/v1/analytics/:id` | Get analytics | Owner/Admin |
| GET | `/api/v1/analytics/dashboard` | Get dashboard stats | Owner/Admin |
| GET | `/api/v1/businesses/:businessId/analytics` | Get business analytics | Owner/Admin |

### Notification Endpoints

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/api/v1/notifications` | List notifications | Private |
| POST | `/api/v1/notifications` | Create notification | Admin |
| GET | `/api/v1/notifications/:id` | Get notification | Private |
| PUT | `/api/v1/notifications/:id` | Update notification | Admin |
| POST | `/api/v1/notifications/:id/retry` | Retry notification | Admin |
| GET | `/api/v1/notifications/preferences` | Get preferences | Private |
| PUT | `/api/v1/notifications/preferences` | Update preferences | Private |
| GET | `/api/v1/notifications/stats` | Get notification stats | Admin |

### Policy Endpoints

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/api/v1/policies` | List policies | Owner/Admin |
| POST | `/api/v1/policies` | Create policy | Owner/Admin |
| GET | `/api/v1/policies/:id` | Get policy | Owner/Admin |
| PUT | `/api/v1/policies/:id` | Update policy | Owner/Admin |
| DELETE | `/api/v1/policies/:id` | Delete policy | Owner/Admin |

### Feature Flag Endpoints

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/api/v1/feature-flags` | List feature flags | Admin |
| POST | `/api/v1/feature-flags` | Create feature flag | Admin |
| GET | `/api/v1/feature-flags/:id` | Get feature flag | Admin |
| GET | `/api/v1/feature-flags/check/:name` | Check feature flag | Private |
| PUT | `/api/v1/feature-flags/:id` | Update feature flag | Admin |
| DELETE | `/api/v1/feature-flags/:id` | Delete feature flag | Admin |

### Audit Endpoints

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/api/v1/audit` | List audit logs | Private |
| GET | `/api/v1/audit/:id` | Get audit log | Private |
| GET | `/api/v1/audit/entity/:entity/:entityId` | Get entity logs | Private |

### Admin Endpoints

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/api/v1/admin/businesses` | List businesses for review | Admin |
| GET | `/api/v1/admin/businesses/:id` | Get business for review | Admin |
| POST | `/api/v1/admin/businesses/:id/approve` | Approve business | Admin |
| POST | `/api/v1/admin/businesses/:id/reject` | Reject business | Admin |
| POST | `/api/v1/admin/businesses/:id/suspend` | Suspend business | Admin |
| PUT | `/api/v1/admin/verifications/:id` | Update verification | Admin |

---

## Services Implementation

### Authentication Service (`auth.service.ts`)

**Functions:**
- `register()` - User registration with email verification
- `login()` - User authentication with JWT tokens
- `refreshToken()` - Token rotation for security
- `logout()` - Token revocation
- `requestPasswordReset()` - Password reset request
- `resetPassword()` - Password reset with token
- `changePassword()` - Password change for authenticated users
- `verifyEmail()` - Email verification
- `resendEmailVerification()` - Resend verification email

**Features:**
- JWT access and refresh tokens
- Token rotation on refresh
- Password hashing with bcrypt
- Email verification workflow
- Password reset workflow

### Business Service (`business.service.ts`)

**Functions:**
- `createBusiness()` - Create new business with default settings
- `listBusinesses()` - List businesses with filters
- `getBusinessById()` - Get business by ID
- `getBusinessBySlug()` - Get business by slug
- `updateBusiness()` - Update business information
- `deleteBusiness()` - Soft delete business
- `getBusinessServices()` - Get all services for a business

**Features:**
- Automatic creation of default settings
- Email notifications on business creation
- Business approval workflow integration
- Soft delete for audit trail

### Service Catalog Service (`serviceCatalog.service.ts`)

**Functions:**
- `createService()` - Create service with resource linking
- `listServices()` - List services with filters
- `getServiceById()` - Get service details
- `updateService()` - Update service
- `deleteService()` - Soft delete service

**Features:**
- Resource linking (many-to-many)
- Cancellation policy assignment
- Price and duration management
- Buffer time configuration
- Email notifications

### Booking Service (`booking.service.ts`)

**Functions:**
- `createBooking()` - Create booking with availability check
- `listBookings()` - List bookings with filters
- `getBookingById()` - Get booking details
- `updateBooking()` - Update booking status
- `cancelBooking()` - Cancel booking with policy enforcement
- `addToWaitlist()` - Add customer to waitlist

**Features:**
- Real-time availability checking
- Automatic resource assignment
- Booking status transitions
- Booking history tracking
- Cancellation policy enforcement
- Email confirmations
- Waitlist management

### Payment Service (`payment.service.ts`)

**Functions:**
- `createPaymentIntent()` - Create payment intent
- `confirmPayment()` - Confirm payment
- `refundPayment()` - Process refund
- `listPayments()` - List payments
- `getPaymentById()` - Get payment details
- `processWebhook()` - Process payment webhooks

**Features:**
- PayJP and Stripe integration
- Idempotency for payment operations
- Webhook event processing
- Payment status tracking
- Refund processing
- Email notifications

### Customer Service (`customer.service.ts`)

**Functions:**
- `createCustomer()` - Create customer profile
- `listCustomers()` - List customers with filters
- `getCustomerById()` - Get customer details
- `updateCustomer()` - Update customer information
- `deleteCustomer()` - Soft delete customer
- `getCustomerHistory()` - Get customer history (bookings, reviews, notes)
- `createCustomerNote()` - Create customer note
- `listCustomerNotes()` - List customer notes
- `getCustomerNoteById()` - Get customer note
- `updateCustomerNote()` - Update customer note
- `deleteCustomerNote()` - Delete customer note

**Features:**
- Customer profile management
- Customer notes (allergies, preferences, restrictions)
- Customer history tracking
- No-show tracking
- Preferences storage (JSON)

### Staff Service (`staff.service.ts`)

**Functions:**
- `createStaffAssignment()` - Assign staff to business
- `listStaffAssignments()` - List staff assignments
- `getStaffAssignmentById()` - Get staff assignment
- `updateStaffAssignment()` - Update staff assignment
- `terminateStaffAssignment()` - Terminate staff assignment
- `updateStaffWorkingHours()` - Update working hours
- `getStaffWorkingHours()` - Get working hours
- `createStaffException()` - Create working hour exception
- `listStaffExceptions()` - List exceptions
- `updateStaffException()` - Update exception
- `deleteStaffException()` - Delete exception
- `assignStaffToBooking()` - Assign staff to booking

**Features:**
- Staff role management (manager, staff, assistant)
- Permission configuration
- Regular working hours
- Exception handling (holidays, special days)
- Booking assignment

### Review Service (`review.service.ts`)

**Functions:**
- `createReview()` - Create review
- `listReviews()` - List reviews with filters
- `getReviewById()` - Get review details
- `updateReview()` - Update review
- `moderateReview()` - Moderate review (approve/reject)
- `respondToReview()` - Business response to review
- `deleteReview()` - Soft delete review
- `getBusinessReviewStats()` - Get review statistics

**Features:**
- Review moderation workflow
- Business responses
- Review visibility control
- Rating aggregation
- Review statistics

### Media Service (`media.service.ts`)

**Functions:**
- `createMedia()` - Upload and create media
- `listMedia()` - List media files
- `getMediaById()` - Get media details
- `updateMedia()` - Update media metadata
- `deleteMedia()` - Delete media (S3 + DB)
- `reorderMedia()` - Reorder media display

**Features:**
- S3 file upload
- Presigned URL generation
- Media metadata management
- Display order management
- Featured media support
- Image and video support

### Analytics Service (`analytics.service.ts`)

**Functions:**
- `listAnalytics()` - List analytics records
- `getAnalyticsById()` - Get analytics record
- `getDashboardStats()` - Get dashboard statistics
- `getBusinessAnalyticsSummary()` - Get business summary

**Features:**
- Daily aggregated analytics
- Dashboard statistics
- Business performance metrics
- Date range filtering

### Notification Service (`notification.service.ts`)

**Functions:**
- `createNotification()` - Create notification
- `listNotifications()` - List notifications
- `getNotificationById()` - Get notification
- `updateNotification()` - Update notification
- `retryNotification()` - Retry failed notification
- `getUserNotificationPreferences()` - Get preferences
- `updateUserNotificationPreferences()` - Update preferences
- `getNotificationStats()` - Get notification statistics

**Features:**
- Email notification queuing
- Notification preferences
- Delivery status tracking
- Retry mechanism
- Notification statistics

### Audit Service (`audit.service.ts`)

**Functions:**
- `createAuditLog()` - Create audit log entry
- `listAuditLogs()` - List audit logs with filters
- `getAuditLogById()` - Get audit log
- `getEntityAuditLogs()` - Get logs for an entity

**Features:**
- Complete audit trail
- Entity change tracking
- Before/after snapshots
- IP and user agent tracking
- Access control

### Policy Service (`policy.service.ts`)

**Functions:**
- `createPolicy()` - Create cancellation policy
- `listPolicies()` - List policies
- `getPolicyById()` - Get policy
- `updatePolicy()` - Update policy
- `deletePolicy()` - Delete policy

**Features:**
- Cancellation policy management
- Default policy handling
- Penalty calculation
- Hours-before cancellation rules

### Feature Flag Service (`featureFlag.service.ts`)

**Functions:**
- `createFeatureFlag()` - Create feature flag
- `listFeatureFlags()` - List feature flags
- `getFeatureFlagById()` - Get feature flag
- `getFeatureFlagByName()` - Check feature flag status
- `updateFeatureFlag()` - Update feature flag
- `deleteFeatureFlag()` - Delete feature flag

**Features:**
- Feature flag management
- Gradual rollout (percentage-based)
- Target user/business filtering
- Admin-only access

### Availability Service (`availability.service.ts`)

**Functions:**
- `checkAvailability()` - Check time slot availability
- `isTimeSlotAvailable()` - Verify specific time slot
- `getAvailableResources()` - Get available resources

**Features:**
- Business hours checking
- Holiday checking
- Existing booking conflicts
- Service buffer time
- Resource availability

### Email Service (`email.service.ts`)

**Functions:**
- `sendEmail()` - Send email directly
- `queueEmail()` - Queue email for background processing
- `sendEmailVerification()` - Email verification email
- `sendPasswordReset()` - Password reset email
- `sendBookingConfirmation()` - Booking confirmation
- `sendBookingReminder()` - Booking reminder
- `sendPaymentReceived()` - Payment received notification
- `sendBusinessCreated()` - Business creation notification
- `sendBusinessApproved()` - Business approval notification
- `sendServiceCreated()` - Service creation notification

**Features:**
- SendGrid integration
- HTML email templates (Japanese & English)
- Email queuing with BullMQ
- Professional sender name
- Template rendering

### Storage Service (`storage.service.ts`)

**Functions:**
- `uploadFile()` - Upload file to S3
- `getFileUrl()` - Get file URL (presigned)
- `deleteFile()` - Delete file from S3
- `generateMediaKey()` - Generate S3 key

**Features:**
- AWS S3 integration
- Presigned URL generation
- File upload handling
- Secure file access

---

## Authentication & Authorization

### JWT Token System

**Access Tokens:**
- Short-lived (15 minutes default)
- Contains: userId, email, role, businessId
- Used for API authentication

**Refresh Tokens:**
- Long-lived (7 days default)
- Stored in database with hash
- Used for token rotation
- Includes unique `jti` (JWT ID) for rotation

### Token Rotation

When refreshing tokens:
1. Verify refresh token
2. Check database for token existence
3. Generate new access token
4. Generate new refresh token with new `jti`
5. Revoke old refresh token
6. Store new refresh token

### Role-Based Access Control

**Roles:**
- **Admin**: Full system access
- **Owner**: Business management access
- **Staff**: Limited business access
- **Customer**: Personal data access

**Access Control:**
- Middleware-based role checking
- Service-level permission validation
- Business isolation for owners
- Resource-level access control

### Password Security

- Bcrypt hashing (12 rounds)
- Password strength validation
- Secure password reset flow
- Password change requires current password

---

## Payment Processing

### Supported Gateways

1. **PayJP** (Primary for Japan)
2. **Stripe** (International)

### Payment Flow

1. **Create Payment Intent**
   - Client requests payment intent
   - Server creates intent with payment gateway
   - Returns client secret

2. **Confirm Payment**
   - Client confirms with payment method
   - Server processes payment
   - Updates booking status
   - Sends confirmation email

3. **Webhook Processing**
   - Gateway sends webhook event
   - Server validates webhook signature
   - Processes event asynchronously
   - Updates payment status
   - Sends notifications

### Idempotency

- All payment operations use idempotency keys
- Prevents duplicate processing
- Key stored in database
- Automatic retry handling

### Refunds

- Full or partial refunds
- Refund reason tracking
- Webhook notification
- Email confirmation

---

## Email System

### Email Templates

**Templates Available:**
- Email verification (JA/EN)
- Password reset (JA/EN)
- Booking confirmation (JA/EN)
- Booking reminder (JA/EN)
- Payment received (JA/EN)
- Business created (JA/EN)
- Business approved (JA/EN)
- Service created (JA/EN)

### Email Queuing

- All emails queued via BullMQ
- Background processing
- Retry mechanism
- Delivery status tracking

### SendGrid Configuration

- API key configuration
- Sender verification required
- Professional sender name
- HTML email templates

---

## Media Management

### S3 Storage

- AWS S3 bucket configuration
- Presigned URLs for secure access
- File upload via multipart/form-data
- Support for images and videos

### File Types Supported

- Images: JPEG, PNG, GIF, WebP
- Videos: MP4, WebM

### Media Management

- Upload with metadata
- Display order management
- Featured media support
- Caption support (JA/EN)
- Soft delete for audit trail

---

## Background Jobs

### Job Queues

1. **Email Queue**
   - Email sending
   - Retry mechanism
   - Delivery tracking

2. **Analytics Queue**
   - Daily analytics aggregation
   - Scheduled via cron

3. **Booking Reminder Queue**
   - Booking reminder emails
   - Scheduled reminders

4. **Expire Bookings Queue**
   - Expire pending bookings
   - Automatic cancellation

5. **Webhook Queue**
   - Payment webhook processing
   - Retry on failure

### Workers

- `email.worker.ts` - Email processing
- `analytics.worker.ts` - Analytics aggregation
- `booking-reminder.worker.ts` - Reminder sending
- `expire-bookings.worker.ts` - Booking expiration
- `webhook.worker.ts` - Webhook processing

---

## Security Features

### Authentication Security

- JWT token-based authentication
- Token rotation on refresh
- Secure password hashing
- Email verification required

### API Security

- Rate limiting (Redis-based)
- CORS configuration
- Helmet security headers
- Input validation (Zod)
- SQL injection protection (Sequelize)
- XSS protection

### Data Security

- Soft deletes for audit trail
- Transaction support
- Business isolation
- Role-based access control
- Audit logging

### Payment Security

- Webhook signature validation
- Idempotency keys
- Secure payment processing
- Refund tracking

---

## Testing

### Test Structure

```
tests/
├── setup.ts              # Test setup and teardown
├── auth.test.ts          # Authentication tests
├── booking.test.ts       # Booking tests
├── payment.test.ts       # Payment tests
└── ...
```

### Running Tests

```bash
npm test                  # Run all tests
npm run test:watch       # Watch mode
npm run test:coverage    # With coverage
```

### Test Database

- Separate test database
- Automatic cleanup
- Transaction rollback
- Model associations setup

---

## Deployment

### Environment Setup

1. **Production Environment Variables**
   - Database connection
   - Redis connection
   - JWT secrets (strong, random)
   - SendGrid API key
   - Payment gateway secrets
   - AWS S3 credentials

2. **Database Migration**
   ```bash
   npm run migrate
   ```

3. **Build Application**
   ```bash
   npm run build
   ```

4. **Start Server**
   ```bash
   npm start
   ```

### Production Considerations

- Use environment-specific configs
- Enable HTTPS
- Configure CORS properly
- Set up monitoring
- Enable logging
- Configure backup strategy
- Set up Redis persistence
- Configure S3 bucket policies

---

## Development Workflow

### Code Structure

1. **Models** - Database schema definitions
2. **Validators** - Request validation schemas
3. **Services** - Business logic
4. **Controllers** - HTTP request handlers
5. **Routes** - API endpoint definitions

### Adding New Features

1. Create/update model
2. Create validator schema
3. Implement service logic
4. Create controller
5. Define routes
6. Add tests
7. Update documentation

### Code Quality

- TypeScript strict mode
- ESLint for code quality
- Prettier for formatting
- Zod for runtime validation
- Comprehensive error handling

---

## Summary

This documentation covers the complete implementation of the Omotenashi Connect platform. The system is production-ready with:

- ✅ **20 Services** - Complete business logic implementation
- ✅ **20 Controllers** - HTTP request handling
- ✅ **33 Models** - Database schema with associations
- ✅ **16 Route Files** - API endpoint definitions
- ✅ **14 Validators** - Request validation schemas
- ✅ **6 Background Workers** - Asynchronous job processing
- ✅ **Complete Authentication** - JWT with token rotation
- ✅ **Payment Integration** - PayJP and Stripe support
- ✅ **Email System** - SendGrid with templates
- ✅ **Media Management** - S3 storage integration
- ✅ **Analytics** - Daily aggregation and dashboard
- ✅ **Audit Logging** - Complete audit trail
- ✅ **Security** - Rate limiting, CORS, validation
- ✅ **Multi-tenancy** - Business isolation
- ✅ **Internationalization** - Japanese and English support

The platform is fully functional and ready for deployment.

---

**Last Updated**: 2024
**Version**: 0.1.0
**Status**: Production Ready

