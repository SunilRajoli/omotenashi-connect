# Backend Overview

## Core Components

### Authentication & Authorization
- JWT-based authentication with token rotation
- Role-based access control (RBAC)
- Multi-tenant isolation
- Refresh token management
- Password reset flow
- Email verification

### Business Management
- Vertical-based categorization
- Business settings and verification
- Hours, holidays, and media management
- Business approval workflow
- Business suspension/rejection

### Service Catalog
- Service CRUD operations
- Resource management
- Service-resource linking
- Cancellation policies
- Pricing and duration management

### Booking System
- Service-based bookings
- Resource allocation
- Staff assignments
- Waitlist management
- Availability checking
- Booking history tracking
- Booking reminders

### Payment Processing
- PayJP and Stripe integration
- Payment intent creation
- Payment confirmation
- Webhook handling
- Idempotency for transactions
- Refund processing
- Payment history

### Customer Management (CRM)
- Customer CRUD operations
- Customer notes (allergies, preferences, restrictions)
- Customer history (bookings, reviews, notes)
- No-show tracking
- Preferences storage

### Staff Management
- Staff assignments
- Working hours management
- Schedule exceptions
- Booking assignments
- Role and permission management

### Reviews & Moderation
- Review creation
- Review moderation workflow
- Business responses
- Review visibility control
- Review statistics

### Media Management
- S3 file uploads
- Presigned URLs
- Media metadata management
- Display order management
- Featured media support

### Analytics
- Daily analytics aggregation
- Dashboard statistics
- Business performance metrics
- Date range filtering
- Revenue tracking

### Notifications
- Email notifications
- Notification preferences
- Delivery status tracking
- Retry mechanism
- Notification statistics

### Audit Logging
- Complete audit trail
- Entity change tracking
- Before/after snapshots
- IP and user agent tracking
- Access control

### Feature Flags
- Feature flag management
- Gradual rollout (percentage-based)
- Target user/business filtering
- Admin-only access

### Cancellation Policies
- Policy management
- Default policy handling
- Penalty calculation
- Hours-before cancellation rules

## Technical Architecture

### Request Processing
1. **Middleware Stack**: Auth → Validation → Rate Limiting → Business Logic
2. **Service Layer**: Business logic processing
3. **Data Layer**: Database operations with transactions
4. **Response**: JSON response with proper formatting

### Background Processing
- **Email Queue**: Asynchronous email sending
- **Analytics Queue**: Daily analytics aggregation
- **Reminder Queue**: Booking reminder emails
- **Expiration Queue**: Automatic booking expiration
- **Webhook Queue**: Payment webhook processing

### Data Storage
- **PostgreSQL**: Primary database
- **Redis**: Caching and rate limiting
- **S3**: Media file storage
- **BullMQ**: Job queue storage

## Integration Points

### External Services
- **SendGrid**: Email delivery
- **PayJP**: Payment processing (Japan)
- **Stripe**: Payment processing (International)
- **AWS S3**: Media storage

### Internal Services
- **Email Service**: Template rendering and sending
- **Storage Service**: S3 upload/download
- **Payment Service**: Gateway abstraction
- **Analytics Service**: Data aggregation

---

**Last Updated**: 2024
**Version**: 1.0.0

