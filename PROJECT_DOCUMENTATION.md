# Omotenashi Connect - Complete Project Documentation

## Executive Summary

**Omotenashi Connect** is a comprehensive booking and business management platform designed specifically for Japanese service businesses. The platform provides end-to-end solutions for managing bookings, payments, customers, staff, and business operations with full Japanese and English localization support.

**Version:** 1.0.0  
**Status:** Production Ready  
**Last Updated:** January 2025

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Key Features](#key-features)
3. [Technology Stack](#technology-stack)
4. [Architecture](#architecture)
5. [API Documentation](#api-documentation)
6. [Database Schema](#database-schema)
7. [Security Features](#security-features)
8. [Performance & Scalability](#performance--scalability)
9. [Deployment Guide](#deployment-guide)
10. [Development Workflow](#development-workflow)
11. [Testing Strategy](#testing-strategy)
12. [Monitoring & Operations](#monitoring--operations)
13. [Documentation Structure](#documentation-structure)

---

## Project Overview

### What is Omotenashi Connect?

Omotenashi Connect is a full-stack booking management system that enables Japanese service businesses (restaurants, spas, salons, fitness centers, etc.) to:

- Manage their business profile and services
- Accept and manage customer bookings
- Process payments securely
- Manage staff schedules and assignments
- Track customer relationships and history
- Generate analytics and reports
- Handle reviews and customer feedback

### Target Users

1. **Business Owners**: Manage their business, services, bookings, and staff
2. **Customers**: Book services, make payments, leave reviews
3. **Staff Members**: View schedules, manage bookings
4. **Administrators**: Approve businesses, manage platform-wide settings

### Business Value

- **Streamlined Operations**: Automated booking management reduces manual work
- **Increased Revenue**: Online booking availability increases customer reach
- **Better Customer Experience**: Easy booking process and automated reminders
- **Data-Driven Decisions**: Comprehensive analytics for business insights
- **Multi-Language Support**: Japanese and English for international reach

---

## Key Features

### 1. Authentication & Authorization

- **JWT-based Authentication**: Secure token-based authentication
- **Token Rotation**: Automatic refresh token rotation for security
- **Role-Based Access Control (RBAC)**: Admin, Owner, Staff, Customer roles
- **Multi-Tenant Isolation**: Businesses are completely isolated
- **Password Management**: Secure password reset and change flows
- **Email Verification**: Email verification for new accounts

**Security Features:**
- Bcrypt password hashing (12 salt rounds)
- Refresh tokens stored in database (hashed)
- Token expiration and revocation
- Rate limiting on authentication endpoints

### 2. Business Management

- **Business Profile**: Complete business information with bilingual support
- **Business Settings**: Configurable settings per business
- **Business Hours**: Flexible operating hours management
- **Holiday Calendar**: Custom holiday management
- **Media Gallery**: Image and video management with S3 storage
- **Verification Workflow**: Admin approval process for new businesses
- **Business Suspension**: Admin can suspend/reject businesses

**Business Information:**
- Display name (Japanese/English)
- Description (Japanese/English)
- Address (Japanese/English)
- Contact information
- Business category (vertical)
- Status (pending, approved, rejected, suspended)

### 3. Service Catalog

- **Service Management**: CRUD operations for services
- **Pricing**: Flexible pricing in Japanese Yen
- **Duration**: Service duration in minutes
- **Resource Linking**: Link services to required resources
- **Cancellation Policies**: Per-service cancellation rules
- **Service Categories**: Organize services by category
- **Active/Inactive Status**: Control service availability

**Service Features:**
- Bilingual names and descriptions
- Price in cents (JPY)
- Duration in minutes
- Buffer time between bookings
- Required resources (rooms, equipment, staff)

### 4. Resource Management

- **Resource Types**: Staff, Room, Equipment
- **Resource Assignment**: Link resources to services
- **Availability Tracking**: Track resource availability
- **Resource Capacity**: Define capacity for shared resources

### 5. Booking System

- **Booking Creation**: Create bookings with availability checking
- **Availability Checking**: Real-time availability validation
- **Conflict Detection**: Prevents double-booking
- **Booking Status**: Pending, Confirmed, Cancelled, Completed, No-Show
- **Booking History**: Complete audit trail of booking changes
- **Waitlist Management**: Add customers to waitlist when slots are full
- **Booking Reminders**: Automated email reminders (24 hours before)
- **Booking Expiration**: Automatic expiration of unpaid bookings

**Booking Features:**
- Guest count tracking
- Special requests and notes
- Price snapshots (preserve pricing at booking time)
- Policy snapshots (preserve cancellation policy)
- Payment due dates
- Confirmation codes

### 6. Payment Processing

- **Payment Gateways**: PayJP (Japan) and Stripe (International)
- **Payment Intent Creation**: Secure payment intent creation
- **Payment Confirmation**: Client-side payment confirmation
- **Webhook Processing**: Asynchronous payment status updates
- **Refund Processing**: Full and partial refunds
- **Idempotency**: Prevents duplicate payments
- **Payment History**: Complete payment records

**Payment Features:**
- Multiple payment methods
- Payment status tracking
- Automatic email notifications
- Webhook signature verification
- Idempotency key support

### 7. Customer Management (CRM)

- **Customer Profiles**: Complete customer information
- **Customer Notes**: Allergy, preference, restriction tracking
- **Customer History**: Booking history, review history
- **No-Show Tracking**: Track customer no-shows
- **Customer Preferences**: Store customer preferences
- **User Linking**: Link customers to user accounts (optional)

**Customer Notes:**
- Allergy information
- Preferences
- Restrictions
- Special needs

### 8. Staff Management

- **Staff Assignments**: Assign users to businesses as staff
- **Staff Roles**: Manager, Staff, Assistant roles
- **Working Hours**: Regular working hours per day of week
- **Schedule Exceptions**: Override regular hours for specific dates
- **Booking Assignments**: Assign staff to specific bookings
- **Permission Management**: Role-based permissions

**Staff Features:**
- Regular working hours
- Holiday exceptions
- Special working days
- Booking assignments
- Role-based access

### 9. Reviews & Moderation

- **Review Creation**: Customers can leave reviews
- **Review Moderation**: Admin/owner moderation workflow
- **Business Responses**: Businesses can respond to reviews
- **Review Visibility**: Control review visibility
- **Review Statistics**: Average rating, review count
- **Rating System**: 1-5 star rating system

**Review Features:**
- Bilingual comments
- Business responses
- Moderation workflow
- Review statistics
- Rating distribution

### 10. Media Management

- **File Uploads**: Upload images and videos
- **S3 Storage**: Secure cloud storage
- **Presigned URLs**: Secure temporary access URLs
- **Media Metadata**: Captions, display order, featured status
- **Media Reordering**: Drag-and-drop reordering
- **Soft Deletion**: Recoverable media deletion

**Supported Formats:**
- Images: JPEG, PNG, GIF, WebP
- Videos: MP4, WebM
- Max file size: 10MB (configurable)

### 11. Analytics & Reporting

- **Daily Aggregation**: Pre-calculated daily metrics
- **Dashboard Statistics**: Real-time business metrics
- **Revenue Tracking**: Gross, net, refund tracking
- **Booking Metrics**: Booking volume, cancellation rate
- **Customer Metrics**: New vs. returning customers
- **Service Analytics**: Service popularity and revenue
- **Review Analytics**: Average ratings, review trends

**Analytics Metrics:**
- Total bookings (by status)
- Revenue (gross, net, refunds)
- Customer metrics (new, returning)
- Service popularity
- Resource utilization
- Review statistics

### 12. Notifications

- **Email Notifications**: Automated email sending
- **Notification Preferences**: User-configurable preferences
- **Delivery Tracking**: Track notification delivery status
- **Retry Mechanism**: Automatic retry for failed notifications
- **Notification Statistics**: Delivery rate tracking

**Notification Types:**
- Booking confirmations
- Booking reminders
- Payment confirmations
- Business approvals
- Service creation notifications

### 13. Audit Logging

- **Complete Audit Trail**: Track all user actions
- **Entity Change Tracking**: Before/after snapshots
- **IP and User Agent**: Request metadata tracking
- **Access Control**: Role-based audit log access

### 14. Feature Flags

- **Feature Toggle**: Enable/disable features dynamically
- **Gradual Rollout**: Percentage-based rollout
- **Target Filtering**: User/business-specific targeting
- **Admin Management**: Admin-only feature flag management

### 15. Cancellation Policies

- **Policy Management**: Create and manage cancellation policies
- **Hours Before Cancellation**: Time-based cancellation rules
- **Penalty Calculation**: Percentage-based penalties
- **Default Policies**: Set default policies per business

---

## Technology Stack

### Backend

- **Runtime**: Node.js v22.x
- **Framework**: Express.js 4.19.x
- **Language**: TypeScript 5.6.x
- **ORM**: Sequelize 6.37.x
- **Database**: PostgreSQL 14.x+
- **Cache/Queue**: Redis 5.0+ with BullMQ
- **Validation**: Zod 3.23.x
- **Logging**: Pino (with pino-pretty for development)

### External Services

- **Email**: SendGrid
- **Storage**: AWS S3
- **Payments**: PayJP, Stripe

### Development Tools

- **Testing**: Jest
- **Linting**: ESLint
- **Formatting**: Prettier
- **Type Checking**: TypeScript

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

### Layer Structure

- **Controllers**: Handle HTTP requests/responses
- **Services**: Business logic and orchestration
- **Models**: Database entities (Sequelize)
- **Routes**: API endpoint definitions
- **Middleware**: Auth, validation, rate limiting, logging
- **Workers**: Background job processing (BullMQ)

---

## API Documentation

### Base URL

- **Development**: `http://localhost:4000/api/v1`
- **Production**: `https://api.omotenashi-connect.com/api/v1`

### Authentication

All protected endpoints require a Bearer token:

```
Authorization: Bearer <accessToken>
```

### API Endpoints Summary

#### Authentication (`/api/v1/auth`)
- `POST /register` - Register new user
- `POST /login` - Login user
- `POST /refresh` - Refresh access token
- `POST /logout` - Logout user
- `POST /forgot-password` - Request password reset
- `POST /reset-password` - Reset password
- `POST /change-password` - Change password
- `POST /verify-email` - Verify email address
- `POST /resend-verification` - Resend verification email
- `GET /me` - Get current user

#### Businesses (`/api/v1/businesses`)
- `GET /businesses` - List businesses (public)
- `GET /businesses/:id` - Get business (public)
- `GET /businesses/slug/:slug` - Get business by slug (public)
- `POST /owner/businesses` - Create business (owner)
- `PUT /owner/businesses/:id` - Update business (owner)
- `DELETE /owner/businesses/:id` - Delete business (owner)
- `GET /businesses/:id/services` - Get business services
- `GET /businesses/:id/hours` - Get business hours
- `PUT /owner/businesses/:id/hours` - Update business hours (owner)
- `GET /businesses/:id/settings` - Get business settings
- `PUT /owner/businesses/:id/settings` - Update business settings (owner)

#### Services (`/api/v1/services`)
- `GET /services` - List services (public)
- `GET /services/:id` - Get service (public)
- `POST /owner/services` - Create service (owner)
- `PUT /owner/services/:id` - Update service (owner)
- `DELETE /owner/services/:id` - Delete service (owner)

#### Resources (`/api/v1/resources`)
- `GET /resources` - List resources (public)
- `GET /resources/:id` - Get resource (public)
- `POST /owner/resources` - Create resource (owner)
- `PUT /owner/resources/:id` - Update resource (owner)
- `DELETE /owner/resources/:id` - Delete resource (owner)

#### Bookings (`/api/v1/bookings`)
- `GET /bookings` - List bookings
- `POST /bookings` - Create booking
- `GET /bookings/:id` - Get booking
- `PUT /bookings/:id` - Update booking
- `POST /bookings/:id/cancel` - Cancel booking
- `GET /availability` - Check availability
- `GET /availability/resources` - Get available resources
- `POST /waitlist` - Add to waitlist

#### Payments (`/api/v1/payments`)
- `POST /payments/intent` - Create payment intent
- `POST /payments/confirm` - Confirm payment
- `POST /payments/:id/refund` - Refund payment
- `GET /payments` - List payments
- `GET /payments/:id` - Get payment
- `POST /payments/webhook/:provider` - Payment webhook

#### Customers (`/api/v1/customers`)
- `GET /customers` - List customers
- `POST /customers` - Create customer
- `GET /customers/:id` - Get customer
- `PUT /customers/:id` - Update customer
- `DELETE /customers/:id` - Delete customer
- `GET /customers/:id/history` - Get customer history
- `POST /customers/notes` - Create customer note
- `GET /customers/notes` - List customer notes
- `GET /customers/notes/:id` - Get customer note
- `PUT /customers/notes/:id` - Update customer note
- `DELETE /customers/notes/:id` - Delete customer note

#### Staff (`/api/v1/staff`)
- `GET /staff/assignments` - List staff assignments
- `POST /staff/assignments` - Create staff assignment
- `GET /staff/assignments/:id` - Get staff assignment
- `PUT /staff/assignments/:id` - Update staff assignment
- `DELETE /staff/assignments/:id/terminate` - Terminate assignment
- `PUT /staff/working-hours` - Update working hours
- `GET /staff/working-hours/:resourceId` - Get working hours
- `POST /staff/exceptions` - Create exception
- `GET /staff/exceptions` - List exceptions
- `GET /staff/exceptions/:id` - Get exception
- `PUT /staff/exceptions/:id` - Update exception
- `DELETE /staff/exceptions/:id` - Delete exception
- `POST /staff/assign-to-booking` - Assign staff to booking

#### Reviews (`/api/v1/reviews`)
- `GET /reviews` - List reviews
- `POST /reviews` - Create review
- `GET /reviews/:id` - Get review
- `PUT /reviews/:id` - Update review
- `POST /reviews/:id/moderate` - Moderate review
- `POST /reviews/:id/respond` - Respond to review
- `DELETE /reviews/:id/delete` - Delete review
- `GET /businesses/:businessId/reviews/stats` - Get review stats

#### Media (`/api/v1/media`)
- `GET /media` - List media
- `POST /media` - Upload media
- `GET /media/:id` - Get media
- `PUT /media/:id` - Update media
- `DELETE /media/:id` - Delete media
- `POST /media/reorder` - Reorder media

#### Analytics (`/api/v1/analytics`)
- `GET /analytics` - List analytics
- `GET /analytics/:id` - Get analytics
- `GET /analytics/dashboard` - Get dashboard stats
- `GET /businesses/:businessId/analytics` - Get business analytics

#### Notifications (`/api/v1/notifications`)
- `GET /notifications` - List notifications
- `POST /notifications` - Create notification
- `GET /notifications/:id` - Get notification
- `PUT /notifications/:id` - Update notification
- `POST /notifications/:id/retry` - Retry notification
- `GET /notifications/preferences` - Get preferences
- `PUT /notifications/preferences` - Update preferences
- `GET /notifications/stats` - Get notification stats

#### Policies (`/api/v1/policies`)
- `GET /policies` - List cancellation policies
- `POST /policies` - Create cancellation policy
- `GET /policies/:id` - Get cancellation policy
- `PUT /policies/:id` - Update cancellation policy
- `DELETE /policies/:id` - Delete cancellation policy

#### Feature Flags (`/api/v1/feature-flags`)
- `GET /feature-flags` - List feature flags (admin)
- `POST /feature-flags` - Create feature flag (admin)
- `GET /feature-flags/:id` - Get feature flag (admin)
- `GET /feature-flags/check/:name` - Check feature flag
- `PUT /feature-flags/:id` - Update feature flag (admin)
- `DELETE /feature-flags/:id` - Delete feature flag (admin)

#### Audit (`/api/v1/audit`)
- `GET /audit` - List audit logs
- `GET /audit/:id` - Get audit log
- `GET /audit/entity/:entity/:entityId` - Get entity logs

#### Admin (`/api/v1/admin`)
- `GET /admin/businesses` - List businesses for review (admin)
- `GET /admin/businesses/:id` - Get business for review (admin)
- `POST /admin/businesses/:id/approve` - Approve business (admin)
- `POST /admin/businesses/:id/reject` - Reject business (admin)
- `POST /admin/businesses/:id/suspend` - Suspend business (admin)
- `PUT /admin/verifications/:id` - Update verification (admin)

### Response Format

**Success Response:**
```json
{
  "status": "success",
  "message": "Operation completed successfully",
  "data": {
    // Response data
  }
}
```

**Error Response:**
```json
{
  "status": "error",
  "message": "Error message",
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

### Rate Limiting

**Redis-Based Rate Limiting:**
- **Standard Endpoints**: 1000 requests per hour per IP/user
- **Authentication Endpoints**: 5 requests per 15 minutes per IP (prevents brute force)
- **Payment Endpoints**: 10 requests per minute per user (prevents payment abuse)
- **Strict Endpoints**: 100 requests per 15 minutes per IP/user
- **Per-User Limits**: 1000 requests per hour per authenticated user

**Implementation:**
- Redis-first approach with database fallback
- Atomic operations using Redis INCR
- Connection reuse for optimal performance
- Rate limit headers: `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`
- Automatic expiration of rate limit windows
- Non-blocking analytics logging

---

## Database Schema

### Core Tables

**Users & Authentication:**
- `users` - User accounts
- `refresh_tokens` - JWT refresh tokens
- `email_verifications` - Email verification records
- `password_resets` - Password reset tokens
- `user_sessions` - Active user sessions

**Businesses:**
- `verticals` - Business categories
- `businesses` - Business entities
- `business_settings` - Business configuration
- `business_verifications` - Verification status
- `business_documents` - Verification documents
- `business_hours` - Operating hours
- `business_holidays` - Holiday calendar
- `business_media` - Business media assets

**Services & Resources:**
- `services` - Service catalog
- `resources` - Physical resources (rooms, equipment, staff)
- `service_resources` - Service-resource mapping

**Staff:**
- `staff_assignments` - Staff-to-business assignments
- `staff_working_hours` - Staff schedules
- `staff_exceptions` - Schedule exceptions

**Bookings:**
- `bookings` - Booking records
- `booking_history` - Booking state changes
- `booking_reminders` - Reminder scheduling
- `waitlist` - Waitlist entries

**Customers:**
- `customers` - Customer records
- `customer_notes` - Customer notes

**Payments:**
- `booking_payments` - Payment records
- `payment_webhooks` - Webhook events
- `idempotency_keys` - Idempotency tracking

**Reviews:**
- `reviews` - Review records

**System:**
- `audit_logs` - Audit trail
- `notification_outbox` - Notification queue
- `analytics_daily` - Daily analytics aggregates
- `rate_limits` - Rate limiting records
- `feature_flags` - Feature flag configuration
- `cancellation_policies` - Cancellation policy templates

### Database Features

- **UUID Primary Keys**: All tables use UUID v4
- **Soft Deletes**: Most tables support soft deletion
- **Timestamps**: Automatic created_at/updated_at tracking
- **Indexes**: Comprehensive indexing for performance
- **Foreign Keys**: Referential integrity enforced
- **Constraints**: Unique, check constraints for data validation

### Critical Indexes

- Booking queries: `business_id + start_at`, `customer_id`, `status`
- Payment queries: `booking_id`, `status + created_at`
- Customer queries: `business_id`, `user_id`, `email`
- Service queries: `business_id + is_active`, `category`
- Review queries: `business_id + is_visible`, `rating`
- Analytics queries: `business_id + date`, `date`

---

## Security Features

### Authentication Security

- **JWT Tokens**: HS256 algorithm
- **Token Rotation**: Automatic refresh token rotation
- **Token Expiration**: Access tokens (15 min), Refresh tokens (7 days)
- **Password Hashing**: Bcrypt with 12 salt rounds
- **Secret Rotation**: JWT secrets rotated every 90 days

### API Security

- **Rate Limiting**: Redis-based rate limiting with atomic operations and connection reuse
  - Environment-specific rate limits for different endpoint types
  - Automatic fallback to database when Redis is unavailable
  - Rate limit headers included in all responses
- **Webhook Verification**: HMAC-SHA256 signature verification
- **CORS**: Configured for specific origins
- **Security Headers**: Helmet middleware
- **Input Validation**: Zod schema validation
- **SQL Injection Prevention**: Sequelize ORM parameterized queries

### Data Security

- **Encryption at Rest**: Database and S3 encryption
- **Encryption in Transit**: HTTPS enforced
- **PII Protection**: Access control and audit logging
- **Data Retention**: 7-year retention (Japan standard)
- **Soft Deletes**: Recoverable data deletion

### Compliance

- **GDPR**: EU customer data protection
- **PCI DSS**: Payment card industry compliance
- **Japan Privacy Law**: Personal Information Protection Act compliance

---

## Performance & Scalability

### Database Performance

- **Indexing Strategy**: Comprehensive indexes on foreign keys and commonly queried fields
- **Connection Pooling**: Environment-specific connection pool configuration
  - **Production**: Min 10, max 50 connections (idle: 10s, acquire: 30s, evict: 1s)
  - **Development**: Min 2, max 10 connections (idle: 10s, acquire: 30s, evict: 1s)
  - **Test**: Min 2, max 5 connections (idle: 10s, acquire: 30s, evict: 1s)
- **Read Replicas**: For reporting and analytics queries
- **Query Optimization**: Eager loading, selective fields, pagination
- **Transaction Management**: Proper transaction handling for data consistency

### Caching Strategy

- **Redis Caching**: 
  - Business data (5 min TTL)
  - Availability checks (1 min TTL)
  - User sessions (token expiry TTL)
  - Service catalog (10 min TTL)
  - Analytics (15 min TTL)

### Scalability

- **Horizontal Scaling**: Stateless design, load balancer distribution
- **Vertical Scaling**: Database and Redis resource scaling
- **Background Jobs**: BullMQ for asynchronous processing
- **CDN**: Static asset delivery

### Performance Targets

- **Response Times**: p50 < 200ms, p95 < 500ms, p99 < 1000ms
- **Concurrent Users**: 1000+ supported
- **Requests per Second**: 500+ supported

---

## Deployment Guide

### Prerequisites

- Node.js v22.x
- PostgreSQL 14.x+
- Redis 5.0+
- AWS S3 (for media storage)
- SendGrid account (for emails)

### Environment Variables

See `.env.example` for complete list. Key variables:

- Database: `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASS`
- Redis: `REDIS_HOST`, `REDIS_PORT`
- JWT: `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`
- Payments: `PAYJP_SECRET`, `STRIPE_SECRET`
- Email: `SENDGRID_API_KEY`, `FROM_EMAIL`, `FROM_NAME`
- Storage: `AWS_REGION`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `S3_BUCKET`

### Deployment Steps

1. **Clone Repository**
   ```bash
   git clone https://github.com/SunilRajoli/omotenashi-connect.git
   cd omotenashi-connect
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Configure Environment**
   ```bash
   cp .env.example .env
   # Edit .env with production values
   ```

4. **Database Setup**
   ```bash
   createdb omotenashi_connect
   npm run migrate
   ```

5. **Build Application**
   ```bash
   npm run build
   ```

6. **Start Application**
   ```bash
   npm start
   # Or with PM2
   pm2 start dist/server.js --name omotenashi-connect
   ```

### Docker Deployment

```bash
docker-compose up -d
```

See `docs/DEPLOYMENT_GUIDE.md` for detailed deployment instructions.

---

## Development Workflow

### Git Workflow

- **Main Branch**: Production-ready code
- **Staging Branch**: Pre-production testing
- **Feature Branches**: `feature/TICKET-123-description`

### Pull Request Requirements

- Minimum 2 approvals
- All tests passing
- Code coverage > 80%
- No ESLint errors
- Documentation updated

### CI/CD Pipeline

1. **On PR**: Linting, tests, coverage check
2. **On Merge to Staging**: Deploy to staging, run E2E tests
3. **On Release Tag**: Security scan, deploy to production, gradual rollout

### Code Review Checklist

- [ ] Security: No secrets, proper auth checks
- [ ] Performance: No N+1 queries, proper indexes
- [ ] Error handling: All edge cases covered
- [ ] Tests: Unit + integration tests
- [ ] Documentation: Updated if API changed

---

## Testing Strategy

### Test Coverage

- **Unit Tests**: > 80% coverage
- **Integration Tests**: All critical paths
- **E2E Tests**: Main user journeys

### Test Types

1. **Unit Tests** (`*.test.ts`): Service logic, utilities, validators
2. **Integration Tests** (`*.integration.test.ts`): API endpoints, database operations
3. **E2E Tests** (`*.e2e.test.ts`): Complete user journeys

### Running Tests

```bash
npm test              # Run all tests
npm run test:watch    # Watch mode
npm run test:coverage # With coverage
```

### Performance Testing

- **Tools**: k6, Artillery
- **Targets**: 1000 concurrent users, p95 < 500ms
- **Scenarios**: Booking flow, payment flow, availability checking

---

## Monitoring & Operations

### Metrics Tracked

- **Application**: Request rate, response times (p50, p95, p99), error rate
- **Database**: Query execution time, connection pool usage, slow queries
- **Redis**: Cache hit rate, memory usage, command execution time
- **Queue**: Queue length, job processing rate, failed jobs
- **Business**: Bookings, payments, customer registrations, revenue

### Monitoring Tools

- **APM**: Datadog (recommended), New Relic, AppSignal
- **Logging**: Pino → CloudWatch/Elasticsearch
- **Alerts**: PagerDuty for critical failures
- **Health Checks**: `/health` endpoint

### Critical Alerts

- Payment gateway failures
- Email delivery failures > 5%
- Database connection failures
- Queue backlog > 1000 jobs
- API error rate > 1%

### Backup & Recovery

- **Database**: Daily full backups, hourly incremental
- **S3 Media**: Cross-region replication
- **Redis**: RDB snapshots every 6 hours
- **RTO**: 4 hours (Recovery Time Objective)
- **RPO**: 1 hour (Recovery Point Objective)

---

## Documentation Structure

### Main Documentation Files

- **README.md**: Project overview and quick start
- **DOCUMENTATION.md**: Complete technical documentation
- **PROJECT_DOCUMENTATION.md**: This file - comprehensive project overview

### Documentation Folders

**`docs/`** - Technical documentation:
- `README.md` - Documentation index
- `ARCHITECTURE.md` - System architecture
- `API_CONVENTIONS.md` - API design conventions
- `DATABASE_SCHEMA_FINAL.md` - Database schema
- `SECURITY.md` - Security documentation
- `PERFORMANCE.md` - Performance tuning
- `MONITORING_SETUP.md` - Monitoring & observability
- `BACKUP_RECOVERY.md` - Backup & disaster recovery
- `DEPLOYMENT_GUIDE.md` - Deployment instructions
- `DEVELOPMENT_WORKFLOW.md` - Development process
- `INTERNATIONALIZATION.md` - i18n guide
- `JAPAN_LOCALIZATION_GUIDE.md` - Japanese localization
- `TROUBLESHOOTING.md` - Common issues and solutions
- `TEST_PLAN.md` - Testing strategy
- `RUNBOOKS.md` - Operational procedures
- `SEQUELIZE_ASSOCIATIONS.md` - Model associations
- `ANALYTICS.md` - Analytics documentation

**`docs/openapi/`** - OpenAPI specifications:
- `openapi.yaml` - Main OpenAPI spec
- Individual resource specs (auth, businesses, services, etc.)

---

## Key Statistics

### Codebase

- **Total TypeScript Files**: 198 files
- **Lines of Code**: ~50,000+ lines
- **Services**: 30+ service modules
- **Controllers**: 30+ controller modules
- **Routes**: 20+ route modules
- **Models**: 50+ database models
- **Validators**: 20+ validator modules
- **Build Errors**: 0
- **Lint Errors**: 0

### API Endpoints

- **Total Endpoints**: 100+ endpoints
- **Public Endpoints**: ~20 endpoints
- **Authenticated Endpoints**: ~80 endpoints
- **Admin-Only Endpoints**: ~10 endpoints

### Database

- **Tables**: 50+ tables
- **Indexes**: 50+ indexes (including partial indexes for performance)
- **Associations**: 80+ model associations
- **Migrations**: Complete migration system with rollback support

---

## Project Status

### ✅ Completed Features

- [x] Authentication & Authorization
- [x] Business Management
- [x] Service Catalog
- [x] Resource Management
- [x] Booking System
- [x] Payment Processing
- [x] Customer Management (CRM)
- [x] Staff Management
- [x] Reviews & Moderation
- [x] Media Management
- [x] Analytics & Reporting
- [x] Notifications
- [x] Audit Logging
- [x] Feature Flags
- [x] Cancellation Policies
- [x] Email Templates (Japanese & English)
- [x] Internationalization (i18n)
- [x] Comprehensive Documentation

### 🎯 Production Ready

- ✅ All core features implemented
- ✅ Security best practices implemented
- ✅ Performance optimization completed
  - ✅ Environment-specific connection pooling configured
  - ✅ Redis-based rate limiting with atomic operations
  - ✅ Database indexes optimized
- ✅ Monitoring and alerting configured
- ✅ Backup and recovery procedures documented
- ✅ Comprehensive documentation
- ✅ Testing framework in place
- ✅ Deployment guides available
- ✅ Zero build errors
- ✅ Zero lint errors

---

## Getting Started

### For Developers

1. **Read**: `README.md` for setup instructions
2. **Review**: `docs/ARCHITECTURE.md` for system design
3. **Check**: `docs/API_CONVENTIONS.md` for API standards
4. **Follow**: `docs/DEVELOPMENT_WORKFLOW.md` for development process

### For DevOps

1. **Follow**: `docs/DEPLOYMENT_GUIDE.md` for deployment
2. **Set Up**: `docs/MONITORING_SETUP.md` for monitoring
3. **Configure**: `docs/BACKUP_RECOVERY.md` for backups
4. **Review**: `docs/RUNBOOKS.md` for operations

### For API Consumers

1. **Check**: `docs/openapi.yaml` for API specification
2. **Review**: `docs/API_CONVENTIONS.md` for conventions
3. **See**: `DOCUMENTATION.md` for detailed API docs

---

## Support & Resources

### Documentation

- **Main Documentation**: `DOCUMENTATION.md`
- **Project Overview**: This file (`PROJECT_DOCUMENTATION.md`)
- **Technical Docs**: `docs/` folder
- **API Specs**: `docs/openapi/` folder

### Troubleshooting

- **Common Issues**: `docs/TROUBLESHOOTING.md`
- **Operational Procedures**: `docs/RUNBOOKS.md`
- **Error Codes**: See API documentation

### Contact

- **Repository**: https://github.com/SunilRajoli/omotenashi-connect
- **Documentation**: See `docs/` folder
- **Issues**: GitHub Issues

---

## Conclusion

Omotenashi Connect is a **production-ready, enterprise-grade** booking and business management platform designed for Japanese service businesses. The platform provides:

- ✅ **Complete Feature Set**: All core features implemented
- ✅ **Enterprise Security**: Comprehensive security measures
- ✅ **High Performance**: Optimized for scale
- ✅ **Production Operations**: Monitoring, backups, disaster recovery
- ✅ **Comprehensive Documentation**: Complete technical documentation
- ✅ **Developer-Friendly**: Clear architecture and development workflow

The platform is ready for production deployment and can handle thousands of concurrent users with sub-second response times.

---

**Version**: 1.0.0  
**Status**: Production Ready  
**Last Updated**: January 2025

### Recent Improvements (January 2025)

- ✅ **Connection Pooling**: Added environment-specific connection pool configuration
  - Production: 10-50 connections
  - Development: 2-10 connections
  - Test: 2-5 connections
- ✅ **Rate Limiting**: Improved Redis-based rate limiting implementation
  - Atomic operations using Redis INCR
  - Connection reuse for optimal performance
  - Automatic fallback to database when Redis is unavailable
  - Rate limit headers in all responses
- ✅ **Code Quality**: Fixed all build and lint errors
  - Zero TypeScript compilation errors
  - Zero ESLint errors
  - Improved type safety throughout

