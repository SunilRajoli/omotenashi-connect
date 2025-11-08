/**
 * Model type definitions
 * Shared interfaces for model attributes
 */

import {
  UserRole,
  BusinessStatus,
  OnboardingStatus,
  VerificationStatus,
  ResourceType,
  StaffRole,
  BookingStatus,
  BookingSource,
  PaymentMode,
  PaymentStatus,
  WaitlistStatus,
  NoteType,
  DeliveryStatus,
} from './enums';

// User types
export interface UserAttributes {
  id: string;
  email: string;
  password_hash: string;
  family_name?: string;
  given_name?: string;
  family_name_kana?: string;
  given_name_kana?: string;
  display_name?: string;
  phone?: string;
  timezone: string;
  role: UserRole;
  is_active: boolean;
  deleted_at?: Date;
  created_at: Date;
  updated_at: Date;
}

// Business types
export interface BusinessAttributes {
  id: string;
  owner_id: string;
  vertical_id?: string;
  slug: string;
  display_name_ja?: string;
  display_name_en?: string;
  name_kana?: string;
  description_ja?: string;
  description_en?: string;
  postal_code?: string;
  prefecture?: string;
  city?: string;
  street?: string;
  building?: string;
  latitude?: number;
  longitude?: number;
  phone?: string;
  email?: string;
  timezone: string;
  status: BusinessStatus;
  onboarding_status: OnboardingStatus;
  deleted_at?: Date;
  created_at: Date;
  updated_at: Date;
}

// Booking types
export interface BookingAttributes {
  id: string;
  business_id: string;
  service_id?: string;
  resource_id?: string;
  customer_id?: string;
  start_at: Date;
  end_at: Date;
  status: BookingStatus;
  source: BookingStatus;
  price_snapshot_json?: Record<string, unknown>;
  policy_snapshot_json?: Record<string, unknown>;
  metadata: Record<string, unknown>;
  deleted_at?: Date;
  created_at: Date;
  updated_at: Date;
}

// Payment types
export interface PaymentAttributes {
  id: string;
  booking_id: string;
  provider?: string;
  provider_charge_id?: string;
  provider_intent_id?: string;
  amount_cents: number;
  currency: string;
  mode: PaymentMode;
  status: PaymentStatus;
  raw_response?: Record<string, unknown>;
  created_at: Date;
  updated_at: Date;
}

// Service types
export interface ServiceAttributes {
  id: string;
  business_id: string;
  category?: string;
  name_en: string;
  name_ja?: string;
  description_en?: string;
  description_ja?: string;
  duration_minutes?: number;
  price_cents?: number;
  buffer_before: number;
  buffer_after: number;
  policy_id?: string;
  metadata: Record<string, unknown>;
  is_active: boolean;
  deleted_at?: Date;
  created_at: Date;
  updated_at: Date;
}

// Resource types
export interface ResourceAttributes {
  id: string;
  business_id: string;
  type: ResourceType;
  name: string;
  capacity: number;
  attributes_json: Record<string, unknown>;
  is_active: boolean;
  deleted_at?: Date;
  created_at: Date;
  updated_at: Date;
}

// Customer types
export interface CustomerAttributes {
  id: string;
  business_id: string;
  user_id?: string;
  name?: string;
  email?: string;
  phone?: string;
  preferences_json: Record<string, unknown>;
  no_show_count: number;
  deleted_at?: Date;
  created_at: Date;
}

// Review types
export interface ReviewAttributes {
  id: string;
  booking_id?: string;
  business_id: string;
  customer_id?: string;
  rating: number;
  comment?: string;
  sentiment_score?: number;
  is_visible: boolean;
  moderated_by?: string;
  moderated_at?: Date;
  moderation_reason?: string;
  response_text?: string;
  responded_by?: string;
  responded_at?: Date;
  deleted_at?: Date;
  created_at: Date;
}

