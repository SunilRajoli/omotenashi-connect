# Database Schema Documentation

## Overview

Omotenashi Connect uses PostgreSQL 14+ with comprehensive indexing, constraints, and relationships for optimal performance and data integrity.

## Core Tables

### Users & Authentication

#### `users`
- **Primary Key**: `id` (UUID)
- **Unique Constraints**: `email` (case-insensitive)
- **Indexes**: 
  - `email` (unique)
  - `role, is_active` (composite)
- **Soft Delete**: `deleted_at` timestamp

#### `refresh_tokens`
- **Primary Key**: `id` (UUID)
- **Foreign Keys**: `user_id` → `users.id`
- **Indexes**: 
  - `user_id, expires_at`
  - `token_hash` (unique)
- **TTL**: Automatic cleanup of expired tokens

#### `email_verifications`
- **Primary Key**: `id` (UUID)
- **Foreign Keys**: `user_id` → `users.id`
- **Indexes**: `user_id, token`
- **TTL**: Tokens expire in 24 hours

#### `password_resets`
- **Primary Key**: `id` (UUID)
- **Foreign Keys**: `user_id` → `users.id`
- **Indexes**: `user_id, token, expires_at`
- **TTL**: Tokens expire in 1 hour

#### `user_sessions`
- **Primary Key**: `id` (UUID)
- **Foreign Keys**: `user_id` → `users.id`
- **Indexes**: `user_id, expires_at`
- **TTL**: Session expiry tracking

### Businesses

#### `verticals`
- **Primary Key**: `id` (UUID)
- **Indexes**: `slug` (unique)

#### `businesses`
- **Primary Key**: `id` (UUID)
- **Foreign Keys**: 
  - `owner_id` → `users.id`
  - `vertical_id` → `verticals.id`
- **Unique Constraints**: `slug` (unique)
- **Indexes**: 
  - `owner_id`
  - `vertical_id`
  - `slug` (unique)
  - `status, deleted_at`
- **Soft Delete**: `deleted_at` timestamp

#### `business_settings`
- **Primary Key**: `id` (UUID)
- **Foreign Keys**: `business_id` → `businesses.id`
- **Unique Constraints**: `business_id` (one-to-one)
- **Indexes**: `business_id` (unique)

#### `business_verifications`
- **Primary Key**: `id` (UUID)
- **Foreign Keys**: 
  - `business_id` → `businesses.id`
  - `reviewed_by` → `users.id`
- **Indexes**: `business_id, status`

#### `business_documents`
- **Primary Key**: `id` (UUID)
- **Foreign Keys**: 
  - `business_id` → `businesses.id`
  - `uploaded_by` → `users.id`
  - `verified_by` → `users.id`
- **Indexes**: `business_id, document_type`

#### `business_hours`
- **Primary Key**: `id` (UUID)
- **Foreign Keys**: `business_id` → `businesses.id`
- **Indexes**: `business_id, day_of_week`

#### `business_holidays`
- **Primary Key**: `id` (UUID)
- **Foreign Keys**: `business_id` → `businesses.id`
- **Indexes**: `business_id, date`

#### `business_media`
- **Primary Key**: `id` (UUID)
- **Foreign Keys**: 
  - `business_id` → `businesses.id`
  - `uploaded_by` → `users.id`
- **Indexes**: `business_id, display_order`

### Services & Resources

#### `services`
- **Primary Key**: `id` (UUID)
- **Foreign Keys**: 
  - `business_id` → `businesses.id`
  - `policy_id` → `cancellation_policies.id`
- **Indexes**: 
  - `business_id, is_active`
  - `category`
  - `policy_id`
- **Soft Delete**: `deleted_at` timestamp

#### `resources`
- **Primary Key**: `id` (UUID)
- **Foreign Keys**: `business_id` → `businesses.id`
- **Indexes**: `business_id, resource_type`
- **Soft Delete**: `deleted_at` timestamp

#### `service_resources`
- **Primary Key**: `id` (UUID)
- **Foreign Keys**: 
  - `service_id` → `services.id`
  - `resource_id` → `resources.id`
- **Unique Constraints**: `service_id, resource_id` (unique)
- **Indexes**: 
  - `service_id`
  - `resource_id`

### Staff & Availability

#### `staff_assignments`
- **Primary Key**: `id` (UUID)
- **Foreign Keys**: 
  - `user_id` → `users.id`
  - `business_id` → `businesses.id`
- **Indexes**: 
  - `user_id, business_id`
  - `business_id, is_active`
- **Soft Delete**: `terminated_at` timestamp

#### `staff_working_hours`
- **Primary Key**: `id` (UUID)
- **Foreign Keys**: `resource_id` → `resources.id`
- **Indexes**: `resource_id, day_of_week`

#### `staff_exceptions`
- **Primary Key**: `id` (UUID)
- **Foreign Keys**: `resource_id` → `resources.id`
- **Indexes**: `resource_id, date`

### Bookings

#### `bookings`
- **Primary Key**: `id` (UUID)
- **Foreign Keys**: 
  - `business_id` → `businesses.id`
  - `service_id` → `services.id`
  - `resource_id` → `resources.id`
  - `customer_id` → `customers.id`
- **Indexes**: 
  - `business_id, start_at` (composite)
  - `customer_id`
  - `service_id`
  - `resource_id`
  - `status, created_at`
  - `start_at, end_at` (for availability queries)
- **Soft Delete**: `deleted_at` timestamp

#### `booking_history`
- **Primary Key**: `id` (UUID)
- **Foreign Keys**: 
  - `booking_id` → `bookings.id`
  - `changed_by` → `users.id`
- **Indexes**: `booking_id, created_at`

#### `booking_reminders`
- **Primary Key**: `id` (UUID)
- **Foreign Keys**: `booking_id` → `bookings.id`
- **Indexes**: `booking_id, sent_at`

#### `waitlist`
- **Primary Key**: `id` (UUID)
- **Foreign Keys**: 
  - `business_id` → `businesses.id`
  - `service_id` → `services.id`
  - `customer_id` → `customers.id`
- **Indexes**: 
  - `business_id, service_id`
  - `customer_id`
  - `status, created_at`
- **Soft Delete**: `deleted_at` timestamp

### Customers

#### `customers`
- **Primary Key**: `id` (UUID)
- **Foreign Keys**: 
  - `business_id` → `businesses.id`
  - `user_id` → `users.id` (optional)
- **Indexes**: 
  - `business_id`
  - `user_id`
  - `email` (for business)
- **Soft Delete**: `deleted_at` timestamp

#### `customer_notes`
- **Primary Key**: `id` (UUID)
- **Foreign Keys**: 
  - `customer_id` → `customers.id`
  - `created_by` → `users.id`
- **Indexes**: `customer_id, created_at`

### Payments

#### `booking_payments`
- **Primary Key**: `id` (UUID)
- **Foreign Keys**: `booking_id` → `bookings.id`
- **Indexes**: 
  - `booking_id`
  - `status, created_at`
  - `provider, status`

#### `payment_webhooks`
- **Primary Key**: `id` (UUID)
- **Indexes**: `provider, event_type, processed_at`

#### `idempotency_keys`
- **Primary Key**: `id` (UUID)
- **Unique Constraints**: `key` (unique)
- **Indexes**: `key` (unique), `expires_at`

### Reviews

#### `reviews`
- **Primary Key**: `id` (UUID)
- **Foreign Keys**: 
  - `business_id` → `businesses.id`
  - `customer_id` → `customers.id`
  - `booking_id` → `bookings.id`
  - `moderated_by` → `users.id`
  - `responded_by` → `users.id`
- **Indexes**: 
  - `business_id, is_visible`
  - `customer_id`
  - `rating, created_at`
- **Soft Delete**: `deleted_at` timestamp

### System

#### `audit_logs`
- **Primary Key**: `id` (UUID)
- **Foreign Keys**: `actor_user_id` → `users.id`
- **Indexes**: 
  - `entity, entity_id, created_at` (composite)
  - `actor_user_id, created_at`
  - `action, created_at`

#### `notification_outbox`
- **Primary Key**: `id` (UUID)
- **Indexes**: 
  - `recipient_id, delivery_status`
  - `scheduled_at, delivery_status`
  - `created_at`

#### `analytics_daily`
- **Primary Key**: `id` (UUID)
- **Foreign Keys**: `business_id` → `businesses.id`
- **Unique Constraints**: `business_id, date` (unique)
- **Indexes**: 
  - `business_id, date` (unique, composite)
  - `date` (for global analytics)

#### `rate_limits`
- **Primary Key**: `id` (UUID)
- **Unique Constraints**: `key` (unique)
- **Indexes**: `key` (unique), `expires_at`

#### `feature_flags`
- **Primary Key**: `id` (UUID)
- **Unique Constraints**: `name` (unique)
- **Indexes**: `name` (unique), `is_enabled`

#### `cancellation_policies`
- **Primary Key**: `id` (UUID)
- **Foreign Keys**: `business_id` → `businesses.id`
- **Indexes**: `business_id, is_default`
- **Soft Delete**: `deleted_at` timestamp

## Critical Indexes

### Performance-Critical Indexes

```sql
-- Booking queries (most common)
CREATE INDEX idx_bookings_business_date ON bookings(business_id, start_at) WHERE deleted_at IS NULL;
CREATE INDEX idx_bookings_customer ON bookings(customer_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_bookings_status ON bookings(status, created_at) WHERE deleted_at IS NULL;
CREATE INDEX idx_bookings_service ON bookings(service_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_bookings_resource ON bookings(resource_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_bookings_time_range ON bookings(start_at, end_at) WHERE deleted_at IS NULL;

-- Payment queries
CREATE INDEX idx_payments_booking ON booking_payments(booking_id);
CREATE INDEX idx_payments_status ON booking_payments(status, created_at);
CREATE INDEX idx_payments_provider ON booking_payments(provider, created_at);

-- Customer queries
CREATE INDEX idx_customers_business ON customers(business_id, deleted_at) WHERE deleted_at IS NULL;
CREATE INDEX idx_customers_user ON customers(user_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_customers_email ON customers(email) WHERE deleted_at IS NULL;

-- Service queries
CREATE INDEX idx_services_business ON services(business_id, is_active) WHERE deleted_at IS NULL;
CREATE INDEX idx_services_category ON services(category) WHERE deleted_at IS NULL;

-- Review queries
CREATE INDEX idx_reviews_business ON reviews(business_id, is_visible) WHERE deleted_at IS NULL;
CREATE INDEX idx_reviews_customer ON reviews(customer_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_reviews_rating ON reviews(rating, created_at) WHERE deleted_at IS NULL;

-- Analytics queries
CREATE INDEX idx_analytics_business_date ON analytics_daily(business_id, date DESC);
CREATE INDEX idx_analytics_date ON analytics_daily(date DESC);

-- Staff queries
CREATE INDEX idx_staff_business ON staff_assignments(business_id, is_active) WHERE terminated_at IS NULL;
CREATE INDEX idx_staff_user ON staff_assignments(user_id) WHERE terminated_at IS NULL;

-- Audit log queries
CREATE INDEX idx_audit_entity ON audit_logs(entity, entity_id, created_at DESC);
CREATE INDEX idx_audit_actor ON audit_logs(actor_user_id, created_at DESC);
CREATE INDEX idx_audit_action ON audit_logs(action, created_at DESC);
```

### Partial Indexes

Partial indexes are used to exclude soft-deleted records, reducing index size and improving performance:

```sql
-- Only index active records
CREATE INDEX idx_bookings_active ON bookings(business_id, status) WHERE deleted_at IS NULL;
CREATE INDEX idx_services_active ON services(business_id, is_active) WHERE deleted_at IS NULL;
CREATE INDEX idx_customers_active ON customers(business_id) WHERE deleted_at IS NULL;
```

## Constraints

### Unique Constraints

- `users.email` - One email per user
- `businesses.slug` - Unique business slug
- `business_settings.business_id` - One settings per business
- `analytics_daily.business_id, date` - One record per business per day
- `idempotency_keys.key` - Unique idempotency keys
- `rate_limits.key` - Unique rate limit keys
- `feature_flags.name` - Unique feature flag names
- `service_resources.service_id, resource_id` - Unique service-resource pairs

### Foreign Key Constraints

All foreign keys have:
- **ON DELETE CASCADE**: For dependent records (e.g., business → services)
- **ON DELETE SET NULL**: For optional relationships (e.g., customer → user)
- **Referential Integrity**: Enforced at database level

### Check Constraints

```sql
-- Booking time validation
ALTER TABLE bookings ADD CONSTRAINT check_booking_times 
  CHECK (end_at > start_at);

-- Payment amount validation
ALTER TABLE booking_payments ADD CONSTRAINT check_payment_amount 
  CHECK (amount_cents >= 0);

-- Rating validation
ALTER TABLE reviews ADD CONSTRAINT check_rating_range 
  CHECK (rating >= 1 AND rating <= 5);

-- Penalty percent validation
ALTER TABLE cancellation_policies ADD CONSTRAINT check_penalty_percent 
  CHECK (penalty_percent >= 0 AND penalty_percent <= 100);
```

## Soft Delete Implementation

### Soft Delete Pattern

Most tables use soft deletes with `deleted_at` timestamp:

```sql
-- Soft delete query
SELECT * FROM bookings WHERE deleted_at IS NULL;

-- Include deleted records
SELECT * FROM bookings WHERE deleted_at IS NOT NULL;

-- Hard delete (admin only)
DELETE FROM bookings WHERE id = 'xxx';
```

### Soft Delete Benefits

- **Audit Trail**: Preserve data for compliance
- **Recovery**: Ability to restore deleted records
- **Referential Integrity**: Maintain relationships
- **Analytics**: Historical data preservation

## Migration Strategy

### Zero-Downtime Migrations

**Strategy:**
1. **Additive Changes**: Add new columns/tables (nullable)
2. **Backfill Data**: Populate new columns
3. **Make Required**: Update application to use new columns
4. **Remove Old**: Drop old columns after grace period

**Example:**
```sql
-- Step 1: Add new column (nullable)
ALTER TABLE bookings ADD COLUMN new_field TEXT;

-- Step 2: Backfill data
UPDATE bookings SET new_field = old_field;

-- Step 3: Make required (after application update)
ALTER TABLE bookings ALTER COLUMN new_field SET NOT NULL;

-- Step 4: Remove old column (after grace period)
ALTER TABLE bookings DROP COLUMN old_field;
```

### Index Creation

**Strategy:**
- **Concurrent Indexes**: Use `CREATE INDEX CONCURRENTLY` for large tables
- **Off-Peak**: Create indexes during low-traffic periods
- **Monitor**: Track index creation progress

**Example:**
```sql
-- Concurrent index creation (non-blocking)
CREATE INDEX CONCURRENTLY idx_bookings_business_date 
ON bookings(business_id, start_at) 
WHERE deleted_at IS NULL;
```

### Migration Best Practices

1. **Test Migrations**: Test on staging first
2. **Backup Before**: Always backup before migrations
3. **Rollback Plan**: Have rollback scripts ready
4. **Monitor Performance**: Watch for performance impact
5. **Gradual Rollout**: Apply migrations gradually

## Database Extensions

### PostgreSQL Extensions

```sql
-- UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Cryptographic functions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Case-insensitive text
CREATE EXTENSION IF NOT EXISTS "citext";
```

## Data Types

### UUID Usage
- All primary keys use UUID v4
- Generated using `uuid-ossp` extension
- Provides global uniqueness

### JSONB Usage
- `preferences_json` - Customer preferences
- `price_snapshot_json` - Booking price snapshot
- `policy_snapshot_json` - Cancellation policy snapshot
- `metadata` - Flexible metadata storage

### ENUM Types
- `user_role` - User roles (admin, owner, staff, customer)
- `booking_status` - Booking statuses
- `payment_status` - Payment statuses
- `delivery_status` - Notification delivery status
- `note_type` - Customer note types

## Query Optimization

### Best Practices

1. **Use Indexes**: Always query on indexed fields
2. **Limit Results**: Use `LIMIT` and `OFFSET` for pagination
3. **Select Specific Fields**: Avoid `SELECT *`
4. **Use Transactions**: For multi-step operations
5. **Batch Operations**: Group similar queries
6. **Avoid N+1 Queries**: Use eager loading

### Example Optimized Query

```sql
-- Optimized booking query
SELECT 
  b.id,
  b.status,
  b.start_at,
  b.end_at,
  s.name_ja,
  s.name_en,
  c.name,
  c.email
FROM bookings b
INNER JOIN services s ON b.service_id = s.id
INNER JOIN customers c ON b.customer_id = c.id
WHERE b.business_id = $1
  AND b.deleted_at IS NULL
  AND b.start_at >= $2
  AND b.start_at <= $3
ORDER BY b.start_at DESC
LIMIT 20 OFFSET 0;
```

## Database Maintenance

### Regular Maintenance Tasks

**Daily:**
- Monitor slow queries
- Check index usage
- Review connection pool

**Weekly:**
- Analyze table statistics
- Vacuum tables
- Reindex if needed

**Monthly:**
- Review and optimize indexes
- Check table sizes
- Plan capacity

### Vacuum and Analyze

```sql
-- Vacuum tables
VACUUM ANALYZE bookings;
VACUUM ANALYZE customers;
VACUUM ANALYZE services;

-- Reindex if needed
REINDEX TABLE bookings;
```

## Backup Strategy

See [BACKUP_RECOVERY.md](./BACKUP_RECOVERY.md) for detailed backup and recovery procedures.

---

**Last Updated**: 2024
**Version**: 1.0.0
**Status**: Production Ready

