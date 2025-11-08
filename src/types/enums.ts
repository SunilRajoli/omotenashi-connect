/**
 * Centralized enums for Omotenashi Connect
 * All enums used across the application
 */

// User roles
export enum UserRole {
  ADMIN = 'admin',
  OWNER = 'owner',
  STAFF = 'staff',
  CUSTOMER = 'customer',
}

// Business status
export enum BusinessStatus {
  PENDING_REVIEW = 'pending_review',
  APPROVED = 'approved',
  SUSPENDED = 'suspended',
}

// Onboarding status
export enum OnboardingStatus {
  INCOMPLETE = 'incomplete',
  PENDING_VERIFICATION = 'pending_verification',
  LIVE = 'live',
}

// Verification status
export enum VerificationStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

// Resource type
export enum ResourceType {
  STAFF = 'staff',
  ROOM = 'room',
  TABLE = 'table',
  TRAINER = 'trainer',
}

// Staff role
export enum StaffRole {
  MANAGER = 'manager',
  RECEPTIONIST = 'receptionist',
  SERVICE_PROVIDER = 'service_provider',
}

// Booking status
export enum BookingStatus {
  PENDING = 'pending',
  PENDING_PAYMENT = 'pending_payment',
  CONFIRMED = 'confirmed',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  NO_SHOW = 'no_show',
  EXPIRED = 'expired',
}

// Booking source
export enum BookingSource {
  WEB = 'web',
  OWNER_PORTAL = 'owner_portal',
  PHONE = 'phone',
  IMPORT = 'import',
}

// Payment mode
export enum PaymentMode {
  DEPOSIT = 'deposit',
  FULL = 'full',
  HOLD = 'hold',
  PAY_ON_ARRIVAL = 'pay_on_arrival',
}

// Payment status
export enum PaymentStatus {
  PENDING = 'pending',
  SUCCEEDED = 'succeeded',
  FAILED = 'failed',
  REFUNDED = 'refunded',
}

// Waitlist status
export enum WaitlistStatus {
  ACTIVE = 'active',
  NOTIFIED = 'notified',
  CONVERTED = 'converted',
  CANCELLED = 'cancelled',
}

// Note type
export enum NoteType {
  ALLERGY = 'allergy',
  PREFERENCE = 'preference',
  RESTRICTION = 'restriction',
  SPECIAL_NEED = 'special_need',
}

// Delivery status
export enum DeliveryStatus {
  QUEUED = 'queued',
  SENT = 'sent',
  DELIVERED = 'delivered',
  FAILED = 'failed',
  BOUNCED = 'bounced',
}

// Locale
export enum Locale {
  JA = 'ja',
  EN = 'en',
}

// Notification tone
export enum NotificationTone {
  POLITE = 'polite',
  CASUAL = 'casual',
  FORMAL = 'formal',
}

