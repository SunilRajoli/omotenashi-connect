# Sequelize Associations

## Association Overview

This document maps all Sequelize model associations.

### User Associations
- User -> RefreshToken (hasMany)
- User -> EmailVerification (hasMany)
- User -> PasswordReset (hasMany)
- User -> UserSession (hasMany)
- User -> Business (hasMany, as owner)

### Business Associations
- Business -> User (belongsTo, owner)
- Business -> Vertical (belongsTo)
- Business -> BusinessSettings (hasOne)
- Business -> BusinessVerification (hasOne)
- Business -> BusinessDocument (hasMany)
- Business -> BusinessHour (hasMany)
- Business -> BusinessHoliday (hasMany)
- Business -> BusinessMedia (hasMany)
- Business -> Service (hasMany)
- Business -> StaffWorkingHour (hasMany)
- Business -> StaffException (hasMany)

### Service Associations
- Service -> Business (belongsTo)
- Service -> ServiceResource (hasMany)
- Service -> Booking (hasMany)
- Service -> StaffAssignment (hasMany)

### Resource Associations
- Resource -> Business (belongsTo)
- Resource -> ServiceResource (hasMany)

### Booking Associations
- Booking -> Business (belongsTo)
- Booking -> Service (belongsTo)
- Booking -> Customer (belongsTo)
- Booking -> BookingHistory (hasMany)
- Booking -> BookingReminder (hasOne)
- Booking -> BookingPayment (hasMany)

### Customer Associations
- Customer -> Business (belongsTo)
- Customer -> Booking (hasMany)
- Customer -> CustomerNote (hasMany)

## Association Types

- `belongsTo`: Foreign key on source model
- `hasOne`: Foreign key on target model
- `hasMany`: Foreign key on target model
- `belongsToMany`: Junction table required

