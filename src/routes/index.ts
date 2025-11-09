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

export default router;

