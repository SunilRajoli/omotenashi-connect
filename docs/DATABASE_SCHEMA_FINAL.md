# Database Schema

## Core Tables

### Users & Authentication
- `users` - User accounts
- `refresh_tokens` - JWT refresh tokens
- `email_verifications` - Email verification records
- `password_resets` - Password reset tokens
- `user_sessions` - Active user sessions

### Businesses
- `verticals` - Business categories
- `businesses` - Business entities
- `business_settings` - Business configuration
- `business_verifications` - Verification status
- `business_documents` - Verification documents
- `business_hours` - Operating hours
- `business_holidays` - Holiday calendar
- `business_media` - Business media assets

### Services & Resources
- `services` - Service catalog
- `resources` - Physical resources (rooms, equipment)
- `service_resources` - Service-resource mapping

### Staff & Availability
- `staff_working_hours` - Staff schedules
- `staff_exceptions` - Schedule exceptions
- `staff_assignments` - Staff-to-service assignments

### Bookings
- `bookings` - Booking records
- `booking_history` - Booking state changes
- `booking_reminders` - Reminder scheduling
- `waitlist` - Waitlist entries

### Customers
- `customers` - Customer records
- `customer_notes` - Customer notes

### Payments
- `booking_payments` - Payment records
- `payment_webhooks` - Webhook events
- `idempotency_keys` - Idempotency tracking

### Reviews
- `reviews` - Review records
- Review moderation features

### System
- `audit_logs` - Audit trail
- `notification_outbox` - Notification queue
- `analytics_daily` - Daily analytics aggregates
- `rate_limits` - Rate limiting records
- `feature_flags` - Feature flag configuration
- `cancellation_policies` - Cancellation policy templates

