/**
 * API type definitions
 * Request/Response types for API endpoints
 */

import {
  UserRole,
  BookingStatus,
  PaymentStatus,
} from './enums';

// Common API response wrapper
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
  };
}

// Pagination parameters
export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// Auth API types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    role: UserRole;
    display_name?: string;
  };
}

export interface RegisterRequest {
  email: string;
  password: string;
  family_name?: string;
  given_name?: string;
  family_name_kana?: string;
  given_name_kana?: string;
  phone?: string;
  role?: UserRole;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

// Business API types
export interface CreateBusinessRequest {
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
  phone?: string;
  email?: string;
  vertical_id?: string;
}

export interface UpdateBusinessRequest {
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
  phone?: string;
  email?: string;
}

// Booking API types
export interface CreateBookingRequest {
  business_id: string;
  service_id?: string;
  resource_id?: string;
  customer_id?: string;
  start_at: string; // ISO 8601
  end_at: string; // ISO 8601
  metadata?: Record<string, unknown>;
}

export interface UpdateBookingRequest {
  start_at?: string;
  end_at?: string;
  status?: BookingStatus;
  metadata?: Record<string, unknown>;
}

export interface BookingResponse {
  id: string;
  business_id: string;
  service_id?: string;
  resource_id?: string;
  customer_id?: string;
  start_at: string;
  end_at: string;
  status: BookingStatus;
  price_snapshot_json?: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

// Availability API types
export interface AvailabilityRequest {
  business_id: string;
  service_id?: string;
  resource_id?: string;
  date: string; // YYYY-MM-DD
  duration_minutes?: number;
}

export interface TimeSlot {
  start: string; // ISO 8601
  end: string; // ISO 8601
  available: boolean;
  resource_id?: string;
  resource_name?: string;
}

export interface AvailabilityResponse {
  date: string;
  slots: TimeSlot[];
  business_hours?: {
    open: string;
    close: string;
    is_closed: boolean;
  };
}

// Payment API types
export interface CreatePaymentRequest {
  booking_id: string;
  amount_cents: number;
  mode: 'deposit' | 'full' | 'hold' | 'pay_on_arrival';
  provider?: 'stripe' | 'payjp';
  idempotency_key?: string;
}

export interface PaymentResponse {
  id: string;
  booking_id: string;
  amount_cents: number;
  currency: string;
  mode: string;
  status: PaymentStatus;
  provider?: string;
  provider_charge_id?: string;
  created_at: string;
}

// Service API types
export interface CreateServiceRequest {
  business_id: string;
  category?: string;
  name_en: string;
  name_ja?: string;
  description_en?: string;
  description_ja?: string;
  duration_minutes?: number;
  price_cents?: number;
  buffer_before?: number;
  buffer_after?: number;
  policy_id?: string;
  metadata?: Record<string, unknown>;
}

// Resource API types
export interface CreateResourceRequest {
  business_id: string;
  type: 'staff' | 'room' | 'table' | 'trainer';
  name: string;
  capacity?: number;
  attributes_json?: Record<string, unknown>;
}

// Review API types
export interface CreateReviewRequest {
  booking_id: string;
  rating: number; // 1-5
  comment?: string;
}

export interface ReviewResponse {
  id: string;
  booking_id?: string;
  business_id: string;
  customer_id?: string;
  rating: number;
  comment?: string;
  is_visible: boolean;
  created_at: string;
}

// Customer API types
export interface CreateCustomerRequest {
  business_id: string;
  name?: string;
  email?: string;
  phone?: string;
  user_id?: string;
  preferences_json?: Record<string, unknown>;
}

// Admin API types
export interface BusinessVerificationRequest {
  business_id: string;
  status: 'approved' | 'rejected';
  notes?: string;
}

export interface AnalyticsRequest {
  business_id: string;
  start_date: string; // YYYY-MM-DD
  end_date: string; // YYYY-MM-DD
  metrics?: string[]; // ['bookings', 'revenue', 'cancellations', 'no_shows']
}

export interface AnalyticsResponse {
  period: {
    start: string;
    end: string;
  };
  metrics: {
    bookings: number;
    revenue_cents: number;
    cancellations: number;
    no_shows: number;
    review_avg?: number;
  };
  daily?: Array<{
    date: string;
    bookings: number;
    revenue_cents: number;
  }>;
}

// Error response
export interface ErrorResponse {
  success: false;
  error: string;
  code?: string;
  details?: Record<string, unknown>;
}

