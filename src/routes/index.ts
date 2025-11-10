/**
 * Main API Router
 * Combines all route modules
 */

import { Router } from 'express';
import authRoutes from './auth.routes';
import ownerRoutes from './owner.routes';
import publicRoutes from './public.routes';
import serviceRoutes from './service.routes';
import resourceRoutes from './resource.routes';
import bookingRoutes from './booking.routes';
import paymentRoutes from './payment.routes';
import adminRoutes from './admin.routes';
import reviewRoutes from './review.routes';
import mediaRoutes from './media.routes';
import analyticsRoutes from './analytics.routes';
import notificationRoutes from './notification.routes';
import staffRoutes from './staff.routes';
import customerRoutes from './customer.routes';
import auditRoutes from './audit.routes';
import policyRoutes from './policy.routes';
import featureFlagRoutes from './featureFlag.routes';
import lineRoutes from './line.routes';
import qrcodeRoutes from './qrcode.routes';
import depositRoutes from './deposit.routes';
import pricingRoutes from './pricing.routes';
import groupBookingRoutes from './groupBooking.routes';
import membershipRoutes from './membership.routes';
import waitlistRoutes from './waitlist.routes';
import invoiceRoutes from './invoice.routes';
import customerTagRoutes from './customerTag.routes';
import customerSegmentRoutes from './customerSegment.routes';

const router = Router();

// Authentication routes
router.use('/auth', authRoutes);

// Public routes (no authentication required)
router.use('/public', publicRoutes);

// Owner routes (authentication required)
router.use('/owner', ownerRoutes);

// Service routes (public + owner)
router.use('/', serviceRoutes);
router.use('/owner', serviceRoutes);

// Resource routes (public + owner)
router.use('/', resourceRoutes);
router.use('/owner', resourceRoutes);

// Booking routes (includes availability and waitlist)
router.use('/', bookingRoutes);

// Payment routes
router.use('/', paymentRoutes);

// Admin routes (admin only)
router.use('/', adminRoutes);

// Review routes (public + owner/admin)
router.use('/', reviewRoutes);

// Media routes (public + owner/admin)
router.use('/', mediaRoutes);

// Analytics routes (owner/admin only)
router.use('/', analyticsRoutes);

// Notification routes (user/admin)
router.use('/', notificationRoutes);

// Staff routes (owner/admin/staff)
router.use('/', staffRoutes);

// Customer routes (owner/admin/customer)
router.use('/', customerRoutes);

// Audit routes (user/admin)
router.use('/', auditRoutes);

// Policy routes (owner/admin)
router.use('/', policyRoutes);

// Feature flag routes (admin only)
router.use('/', featureFlagRoutes);

// LINE routes (user/admin)
router.use('/line', lineRoutes);

// QR code routes (staff/admin)
router.use('/qr-codes', qrcodeRoutes);

// Deposit routes (owner/admin)
router.use('/', depositRoutes);

// Pricing routes (owner/admin)
router.use('/', pricingRoutes);

// Group booking routes (owner/admin/customer)
router.use('/', groupBookingRoutes);

// Membership routes (owner/admin/customer)
router.use('/', membershipRoutes);

// Waitlist routes (owner/admin/customer)
router.use('/waitlist', waitlistRoutes);

// Invoice routes (owner/admin/customer)
router.use('/invoices', invoiceRoutes);

// Customer tag routes (owner/admin)
router.use('/customer-tags', customerTagRoutes);

// Customer segment routes (owner/admin)
router.use('/customer-segments', customerSegmentRoutes);

export default router;

