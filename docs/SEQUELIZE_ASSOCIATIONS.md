# Sequelize Associations

## Association Overview

This document provides a comprehensive mapping of all Sequelize model associations in Omotenashi Connect. Associations define relationships between models and enable eager loading, cascading operations, and referential integrity.

## Association Types

### belongsTo
- **Foreign Key**: On source model
- **Use Case**: Many-to-one relationship
- **Example**: `Booking.belongsTo(Business)` - Booking has `business_id`

### hasOne
- **Foreign Key**: On target model
- **Use Case**: One-to-one relationship
- **Example**: `Business.hasOne(BusinessSettings)` - BusinessSettings has `business_id`

### hasMany
- **Foreign Key**: On target model
- **Use Case**: One-to-many relationship
- **Example**: `Business.hasMany(Service)` - Service has `business_id`

### belongsToMany
- **Junction Table**: Required
- **Use Case**: Many-to-many relationship
- **Example**: `Service.belongsToMany(Resource, { through: ServiceResource })`

## Model Associations

### User Model

**Outgoing Associations (hasMany):**
- `User.hasMany(RefreshToken, { as: 'refreshTokens' })` - User's refresh tokens
- `User.hasMany(EmailVerification, { as: 'emailVerifications' })` - Email verification records
- `User.hasMany(PasswordReset, { as: 'passwordResets' })` - Password reset tokens
- `User.hasMany(UserSession, { as: 'sessions' })` - Active user sessions
- `User.hasMany(Business, { foreignKey: 'owner_id', as: 'businesses' })` - Businesses owned by user
- `User.hasMany(StaffAssignment, { as: 'staffAssignments' })` - Staff assignments
- `User.hasMany(Customer, { as: 'customers' })` - Customer records linked to user
- `User.hasMany(Review, { foreignKey: 'moderated_by', as: 'moderatedReviews' })` - Reviews moderated by user
- `User.hasMany(Review, { foreignKey: 'responded_by', as: 'respondedReviews' })` - Reviews responded to by user
- `User.hasMany(AuditLog, { foreignKey: 'actor_user_id', as: 'auditLogs' })` - Audit logs where user is actor

**Usage:**
```typescript
const user = await User.findByPk(userId, {
  include: [
    { model: Business, as: 'businesses' },
    { model: RefreshToken, as: 'refreshTokens' }
  ]
});
```

### Vertical Model

**Outgoing Associations (hasMany):**
- `Vertical.hasMany(Business, { as: 'businesses' })` - Businesses in this vertical

**Usage:**
```typescript
const vertical = await Vertical.findByPk(verticalId, {
  include: [{ model: Business, as: 'businesses' }]
});
```

### Business Model

**Incoming Associations (belongsTo):**
- `Business.belongsTo(User, { foreignKey: 'owner_id', as: 'owner' })` - Business owner
- `Business.belongsTo(Vertical, { as: 'vertical' })` - Business vertical/category

**Outgoing Associations (hasOne):**
- `Business.hasOne(BusinessSettings, { as: 'settings' })` - Business settings (one-to-one)

**Outgoing Associations (hasMany):**
- `Business.hasMany(BusinessVerification, { as: 'verifications' })` - Verification records
- `Business.hasMany(BusinessDocument, { as: 'documents' })` - Verification documents
- `Business.hasMany(BusinessHour, { as: 'hours' })` - Operating hours
- `Business.hasMany(BusinessHoliday, { as: 'holidays' })` - Holiday calendar
- `Business.hasMany(BusinessMedia, { as: 'media' })` - Media assets
- `Business.hasMany(Service, { as: 'services' })` - Service catalog
- `Business.hasMany(Resource, { as: 'resources' })` - Physical resources
- `Business.hasMany(Customer, { as: 'customers' })` - Customer records
- `Business.hasMany(Booking, { as: 'bookings' })` - All bookings
- `Business.hasMany(Review, { as: 'reviews' })` - Customer reviews
- `Business.hasMany(CancellationPolicy, { as: 'policies' })` - Cancellation policies
- `Business.hasMany(Waitlist, { as: 'waitlist' })` - Waitlist entries
- `Business.hasMany(StaffAssignment, { as: 'staffAssignments' })` - Staff assignments
- `Business.hasMany(AnalyticsDaily, { as: 'analytics' })` - Daily analytics

**Usage:**
```typescript
const business = await Business.findByPk(businessId, {
  include: [
    { model: User, as: 'owner' },
    { model: Service, as: 'services' },
    { model: BusinessSettings, as: 'settings' }
  ]
});
```

### BusinessSettings Model

**Incoming Associations (belongsTo):**
- `BusinessSettings.belongsTo(Business, { as: 'business' })` - Parent business

### BusinessVerification Model

**Incoming Associations (belongsTo):**
- `BusinessVerification.belongsTo(Business, { as: 'business' })` - Business being verified
- `BusinessVerification.belongsTo(User, { foreignKey: 'reviewed_by', as: 'reviewer' })` - Admin who reviewed

### BusinessDocument Model

**Incoming Associations (belongsTo):**
- `BusinessDocument.belongsTo(Business, { as: 'business' })` - Business document belongs to
- `BusinessDocument.belongsTo(User, { foreignKey: 'uploaded_by', as: 'uploader' })` - User who uploaded
- `BusinessDocument.belongsTo(User, { foreignKey: 'verified_by', as: 'verifier' })` - User who verified

### BusinessHour Model

**Incoming Associations (belongsTo):**
- `BusinessHour.belongsTo(Business, { as: 'business' })` - Business these hours belong to

### BusinessHoliday Model

**Incoming Associations (belongsTo):**
- `BusinessHoliday.belongsTo(Business, { as: 'business' })` - Business this holiday belongs to

### BusinessMedia Model

**Incoming Associations (belongsTo):**
- `BusinessMedia.belongsTo(Business, { as: 'business' })` - Business this media belongs to
- `BusinessMedia.belongsTo(User, { foreignKey: 'uploaded_by', as: 'uploader' })` - User who uploaded

### Service Model

**Incoming Associations (belongsTo):**
- `Service.belongsTo(Business, { as: 'business' })` - Business this service belongs to
- `Service.belongsTo(CancellationPolicy, { foreignKey: 'policy_id', as: 'cancellationPolicy' })` - Cancellation policy

**Outgoing Associations (belongsToMany):**
- `Service.belongsToMany(Resource, { through: ServiceResource, as: 'resources' })` - Resources required for service

**Outgoing Associations (hasMany):**
- `Service.hasMany(Booking, { as: 'bookings' })` - Bookings for this service
- `Service.hasMany(Waitlist, { as: 'waitlist' })` - Waitlist entries for this service

**Usage:**
```typescript
const service = await Service.findByPk(serviceId, {
  include: [
    { model: Business, as: 'business' },
    { model: Resource, as: 'resources' },
    { model: CancellationPolicy, as: 'cancellationPolicy' }
  ]
});
```

### Resource Model

**Incoming Associations (belongsTo):**
- `Resource.belongsTo(Business, { as: 'business' })` - Business this resource belongs to

**Outgoing Associations (belongsToMany):**
- `Resource.belongsToMany(Service, { through: ServiceResource, as: 'services' })` - Services that use this resource

**Outgoing Associations (hasMany):**
- `Resource.hasMany(StaffWorkingHour, { as: 'workingHours' })` - Staff working hours
- `Resource.hasMany(StaffException, { as: 'exceptions' })` - Schedule exceptions
- `Resource.hasMany(Booking, { as: 'bookings' })` - Bookings using this resource

### ServiceResource Model (Junction Table)

**Incoming Associations (belongsTo):**
- `ServiceResource.belongsTo(Service, { as: 'service' })` - Service in relationship
- `ServiceResource.belongsTo(Resource, { as: 'resource' })` - Resource in relationship

### StaffWorkingHour Model

**Incoming Associations (belongsTo):**
- `StaffWorkingHour.belongsTo(Resource, { as: 'resource' })` - Resource (staff) these hours belong to

### StaffException Model

**Incoming Associations (belongsTo):**
- `StaffException.belongsTo(Resource, { as: 'resource' })` - Resource (staff) this exception belongs to

### StaffAssignment Model

**Incoming Associations (belongsTo):**
- `StaffAssignment.belongsTo(User, { as: 'user' })` - User assigned as staff
- `StaffAssignment.belongsTo(Business, { as: 'business' })` - Business staff is assigned to

### CancellationPolicy Model

**Incoming Associations (belongsTo):**
- `CancellationPolicy.belongsTo(Business, { as: 'business' })` - Business this policy belongs to

**Outgoing Associations (hasMany):**
- `CancellationPolicy.hasMany(Service, { foreignKey: 'policy_id', as: 'services' })` - Services using this policy

### Customer Model

**Incoming Associations (belongsTo):**
- `Customer.belongsTo(Business, { as: 'business' })` - Business this customer belongs to
- `Customer.belongsTo(User, { as: 'user' })` - User account (optional)

**Outgoing Associations (hasMany):**
- `Customer.hasMany(CustomerNote, { as: 'notes' })` - Customer notes
- `Customer.hasMany(Booking, { as: 'bookings' })` - Customer bookings
- `Customer.hasMany(Review, { as: 'reviews' })` - Customer reviews
- `Customer.hasMany(Waitlist, { as: 'waitlist' })` - Waitlist entries

**Usage:**
```typescript
const customer = await Customer.findByPk(customerId, {
  include: [
    { model: Business, as: 'business' },
    { model: Booking, as: 'bookings' },
    { model: CustomerNote, as: 'notes' }
  ]
});
```

### CustomerNote Model

**Incoming Associations (belongsTo):**
- `CustomerNote.belongsTo(Customer, { as: 'customer' })` - Customer this note belongs to
- `CustomerNote.belongsTo(User, { foreignKey: 'created_by', as: 'creator' })` - User who created note

### Booking Model

**Incoming Associations (belongsTo):**
- `Booking.belongsTo(Business, { as: 'business' })` - Business booking is for
- `Booking.belongsTo(Service, { as: 'service' })` - Service being booked
- `Booking.belongsTo(Resource, { as: 'resource' })` - Resource being booked
- `Booking.belongsTo(Customer, { as: 'customer' })` - Customer making booking

**Outgoing Associations (hasMany):**
- `Booking.hasMany(BookingHistory, { as: 'history' })` - Booking change history
- `Booking.hasMany(BookingReminder, { as: 'reminders' })` - Booking reminders
- `Booking.hasMany(BookingPayment, { as: 'payments' })` - Payment records

**Outgoing Associations (hasOne):**
- `Booking.hasOne(Review, { as: 'review' })` - Review for this booking

**Usage:**
```typescript
const booking = await Booking.findByPk(bookingId, {
  include: [
    { model: Business, as: 'business' },
    { model: Service, as: 'service' },
    { model: Customer, as: 'customer' },
    { model: BookingPayment, as: 'payments' }
  ]
});
```

### BookingHistory Model

**Incoming Associations (belongsTo):**
- `BookingHistory.belongsTo(Booking, { as: 'booking' })` - Booking this history belongs to
- `BookingHistory.belongsTo(User, { foreignKey: 'changed_by', as: 'changer' })` - User who made change

### BookingReminder Model

**Incoming Associations (belongsTo):**
- `BookingReminder.belongsTo(Booking, { as: 'booking' })` - Booking reminder is for

### Waitlist Model

**Incoming Associations (belongsTo):**
- `Waitlist.belongsTo(Business, { as: 'business' })` - Business waitlist is for
- `Waitlist.belongsTo(Service, { as: 'service' })` - Service waitlist is for
- `Waitlist.belongsTo(Customer, { as: 'customer' })` - Customer on waitlist

### BookingPayment Model

**Incoming Associations (belongsTo):**
- `BookingPayment.belongsTo(Booking, { as: 'booking' })` - Booking this payment is for

### Review Model

**Incoming Associations (belongsTo):**
- `Review.belongsTo(Business, { as: 'business' })` - Business being reviewed
- `Review.belongsTo(Customer, { as: 'customer' })` - Customer who wrote review
- `Review.belongsTo(Booking, { as: 'booking' })` - Booking review is for
- `Review.belongsTo(User, { foreignKey: 'moderated_by', as: 'moderator' })` - User who moderated
- `Review.belongsTo(User, { foreignKey: 'responded_by', as: 'responder' })` - User who responded

**Usage:**
```typescript
const review = await Review.findByPk(reviewId, {
  include: [
    { model: Business, as: 'business' },
    { model: Customer, as: 'customer' },
    { model: Booking, as: 'booking' }
  ]
});
```

### AnalyticsDaily Model

**Incoming Associations (belongsTo):**
- `AnalyticsDaily.belongsTo(Business, { as: 'business' })` - Business analytics are for

### AuditLog Model

**Incoming Associations (belongsTo):**
- `AuditLog.belongsTo(User, { foreignKey: 'actor_user_id', as: 'actor' })` - User who performed action

## Eager Loading Examples

### Loading Business with All Related Data

```typescript
const business = await Business.findByPk(businessId, {
  include: [
    { model: User, as: 'owner' },
    { model: Vertical, as: 'vertical' },
    { model: BusinessSettings, as: 'settings' },
    { model: Service, as: 'services', include: [
      { model: Resource, as: 'resources' }
    ]},
    { model: BusinessHour, as: 'hours' },
    { model: BusinessHoliday, as: 'holidays' }
  ]
});
```

### Loading Booking with Full Details

```typescript
const booking = await Booking.findByPk(bookingId, {
  include: [
    { model: Business, as: 'business', include: [
      { model: BusinessSettings, as: 'settings' }
    ]},
    { model: Service, as: 'service' },
    { model: Resource, as: 'resource' },
    { model: Customer, as: 'customer' },
    { model: BookingPayment, as: 'payments' },
    { model: BookingHistory, as: 'history' }
  ]
});
```

### Loading Customer with History

```typescript
const customer = await Customer.findByPk(customerId, {
  include: [
    { model: Business, as: 'business' },
    { model: Booking, as: 'bookings', include: [
      { model: Service, as: 'service' }
    ]},
    { model: CustomerNote, as: 'notes' },
    { model: Review, as: 'reviews' }
  ]
});
```

## Association Best Practices

### 1. Use Aliases
Always use aliases (`as`) for clarity and to avoid conflicts:
```typescript
User.hasMany(Review, { foreignKey: 'moderated_by', as: 'moderatedReviews' });
User.hasMany(Review, { foreignKey: 'responded_by', as: 'respondedReviews' });
```

### 2. Eager Loading
Use eager loading to avoid N+1 queries:
```typescript
// Bad: N+1 query
const bookings = await Booking.findAll();
for (const booking of bookings) {
  const customer = await Customer.findByPk(booking.customer_id);
}

// Good: Eager loading
const bookings = await Booking.findAll({
  include: [{ model: Customer, as: 'customer' }]
});
```

### 3. Selective Loading
Only load what you need:
```typescript
const business = await Business.findByPk(businessId, {
  include: [
    { 
      model: Service, 
      as: 'services',
      attributes: ['id', 'name_ja', 'name_en', 'price_cents'],
      where: { is_active: true }
    }
  ]
});
```

### 4. Nested Associations
Load nested associations when needed:
```typescript
const booking = await Booking.findByPk(bookingId, {
  include: [
    { 
      model: Service, 
      as: 'service',
      include: [
        { model: Resource, as: 'resources' }
      ]
    }
  ]
});
```

## Cascading Operations

### On Delete

**CASCADE:**
- Business → Services (delete services when business deleted)
- Business → Resources (delete resources when business deleted)
- Booking → BookingHistory (delete history when booking deleted)

**SET NULL:**
- Customer → User (set user_id to null when user deleted)
- Booking → Resource (set resource_id to null when resource deleted)

**RESTRICT:**
- Booking → Service (prevent service deletion if bookings exist)
- BookingPayment → Booking (prevent booking deletion if payments exist)

## Association Indexes

All foreign keys are indexed for performance:
- `business_id` indexes on all business-related tables
- `user_id` indexes on all user-related tables
- `booking_id` indexes on all booking-related tables
- `customer_id` indexes on all customer-related tables
- `service_id` indexes on all service-related tables

See [DATABASE_SCHEMA_FINAL.md](./DATABASE_SCHEMA_FINAL.md) for complete index documentation.

---

**Last Updated**: 2024
**Version**: 1.0.0

