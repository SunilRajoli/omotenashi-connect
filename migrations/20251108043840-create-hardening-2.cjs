'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    console.log('Applying final hardening fixes...');

    // Add missing composite unique constraint on staff_working_hours
    // Check if constraint exists first to avoid errors
    const [constraintCheck] = await queryInterface.sequelize.query(`
      SELECT 1 FROM pg_constraint 
      WHERE conname = 'uq_staff_working_hours_resource_day'
    `);
    
    if (constraintCheck.length === 0) {
      await queryInterface.addConstraint('staff_working_hours', {
        fields: ['resource_id', 'day_of_week'],
        type: 'unique',
        name: 'uq_staff_working_hours_resource_day'
      });
    }

    // Add missing index on booking_payments.booking_id
    const [indexBookingPayments] = await queryInterface.sequelize.query(`
      SELECT 1 FROM pg_indexes 
      WHERE indexname = 'idx_booking_payments_booking'
    `);
    if (indexBookingPayments.length === 0) {
      await queryInterface.addIndex('booking_payments', ['booking_id'], {
        name: 'idx_booking_payments_booking'
      });
    }

    // Add soft delete to cancellation_policies
    const [columnCancellationPolicies] = await queryInterface.sequelize.query(`
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'cancellation_policies' AND column_name = 'deleted_at'
    `);
    if (columnCancellationPolicies.length === 0) {
      await queryInterface.addColumn('cancellation_policies', 'deleted_at', {
        type: Sequelize.DATE,
        allowNull: true
      });
    }

    // Add soft delete to business_media
    const [columnBusinessMedia] = await queryInterface.sequelize.query(`
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'business_media' AND column_name = 'deleted_at'
    `);
    if (columnBusinessMedia.length === 0) {
      await queryInterface.addColumn('business_media', 'deleted_at', {
        type: Sequelize.DATE,
        allowNull: true
      });
    }

    // Add composite index for business hours queries
    const [indexBusinessHours] = await queryInterface.sequelize.query(`
      SELECT 1 FROM pg_indexes 
      WHERE indexname = 'idx_business_hours_lookup'
    `);
    if (indexBusinessHours.length === 0) {
      await queryInterface.addIndex('business_hours', ['business_id', 'day_of_week'], {
        name: 'idx_business_hours_lookup'
      });
    }

    // Add index for staff exception lookups
    const [indexStaffExceptions] = await queryInterface.sequelize.query(`
      SELECT 1 FROM pg_indexes 
      WHERE indexname = 'idx_staff_exceptions_lookup'
    `);
    if (indexStaffExceptions.length === 0) {
      await queryInterface.addIndex('staff_exceptions', ['resource_id', 'date'], {
        name: 'idx_staff_exceptions_lookup'
      });
    }

    // Add index for service-policy lookups
    const [indexServices] = await queryInterface.sequelize.query(`
      SELECT 1 FROM pg_indexes 
      WHERE indexname = 'idx_services_policy'
    `);
    if (indexServices.length === 0) {
      await queryInterface.addIndex('services', ['policy_id'], {
        name: 'idx_services_policy'
      });
    }

    // Add index for customer user lookups
    const [indexCustomers] = await queryInterface.sequelize.query(`
      SELECT 1 FROM pg_indexes 
      WHERE indexname = 'idx_customers_user'
    `);
    if (indexCustomers.length === 0) {
      await queryInterface.addIndex('customers', ['user_id'], {
        name: 'idx_customers_user'
      });
    }

    // Add index for booking reminders scheduling
    const [indexBookingReminders] = await queryInterface.sequelize.query(`
      SELECT 1 FROM pg_indexes 
      WHERE indexname = 'idx_booking_reminders_schedule'
    `);
    if (indexBookingReminders.length === 0) {
      await queryInterface.addIndex('booking_reminders', ['scheduled_at', 'sent_at'], {
        name: 'idx_booking_reminders_schedule'
      });
    }

    // Add index for idempotency key expiry cleanup
    const [indexIdempotencyKeys] = await queryInterface.sequelize.query(`
      SELECT 1 FROM pg_indexes 
      WHERE indexname = 'idx_idempotency_keys_expiry'
    `);
    if (indexIdempotencyKeys.length === 0) {
      await queryInterface.addIndex('idempotency_keys', ['expires_at'], {
        name: 'idx_idempotency_keys_expiry'
      });
    }

    // Add index for review booking lookups
    const [indexReviews] = await queryInterface.sequelize.query(`
      SELECT 1 FROM pg_indexes 
      WHERE indexname = 'idx_reviews_booking'
    `);
    if (indexReviews.length === 0) {
      await queryInterface.addIndex('reviews', ['booking_id'], {
        name: 'idx_reviews_booking'
      });
    }

    // Ensure btree_gist is enabled (required for overlap constraint)
    await queryInterface.sequelize.query('CREATE EXTENSION IF NOT EXISTS btree_gist;');

    // Add check constraint for rate_limits.count
    const [constraintRateLimits] = await queryInterface.sequelize.query(`
      SELECT 1 FROM pg_constraint 
      WHERE conname = 'chk_rate_limits_count_positive'
    `);
    if (constraintRateLimits.length === 0) {
      await queryInterface.sequelize.query(`
        ALTER TABLE rate_limits
        ADD CONSTRAINT chk_rate_limits_count_positive
        CHECK (count > 0);
      `);
    }

    // Add verification for business postal codes in Japan format
    await queryInterface.sequelize.query(`
      ALTER TABLE businesses
      DROP CONSTRAINT IF EXISTS chk_businesses_postal_code;
      
      ALTER TABLE businesses
      ADD CONSTRAINT chk_businesses_postal_code
      CHECK (postal_code ~ '^\\d{3}-\\d{4}$' OR postal_code IS NULL);
    `);

    // Ensure phone number format constraint is correct
    await queryInterface.sequelize.query(`
      ALTER TABLE users
      DROP CONSTRAINT IF EXISTS chk_users_phone_format;
      
      ALTER TABLE users
      ADD CONSTRAINT chk_users_phone_format
      CHECK (phone ~ '^(0\\d{1,4}-?\\d{1,4}-?\\d{4}|)$' OR phone IS NULL);
    `);

    // Create index on notifications for failed deliveries
    await queryInterface.sequelize.query(`
      CREATE INDEX IF NOT EXISTS idx_notifications_failed
      ON notifications_outbox(created_at DESC)
      WHERE delivery_status = 'failed' AND attempts < 5;
    `);

    // Create index for analytics aggregation queries (without volatile function)
    // Instead of using CURRENT_DATE in the predicate, create a regular composite index
    await queryInterface.sequelize.query(`
      CREATE INDEX IF NOT EXISTS idx_analytics_daily_recent
      ON analytics_daily(business_id, date DESC);
    `);

    // Create partial index for pending verifications
    await queryInterface.sequelize.query(`
      CREATE INDEX IF NOT EXISTS idx_business_verifications_pending
      ON business_verifications(business_id, created_at DESC)
      WHERE status = 'pending';
    `);

    // Create index for webhook retry processing
    await queryInterface.sequelize.query(`
      CREATE INDEX IF NOT EXISTS idx_payment_webhooks_retry
      ON payment_webhooks(provider, retry_count, created_at)
      WHERE processed_at IS NULL AND retry_count < 5;
    `);

    // Add comment to critical tables for documentation
    await queryInterface.sequelize.query(`
      COMMENT ON TABLE bookings IS 'Core booking table with GIST overlap prevention';
      COMMENT ON CONSTRAINT no_overlap ON bookings IS 'Prevents double-booking on same resource';
      COMMENT ON TABLE idempotency_keys IS 'Ensures payment operations are idempotent';
      COMMENT ON TABLE rate_limits IS 'API rate limiting per user/IP';
    `);

    console.log('Final hardening complete - all 2% fixes applied');
  },

  async down(queryInterface, Sequelize) {
    // Remove added indexes
    await queryInterface.removeIndex('payment_webhooks', 'idx_payment_webhooks_retry');
    await queryInterface.removeIndex('business_verifications', 'idx_business_verifications_pending');
    await queryInterface.removeIndex('analytics_daily', 'idx_analytics_daily_recent');
    await queryInterface.removeIndex('notifications_outbox', 'idx_notifications_failed');
    await queryInterface.removeIndex('reviews', 'idx_reviews_booking');
    await queryInterface.removeIndex('idempotency_keys', 'idx_idempotency_keys_expiry');
    await queryInterface.removeIndex('booking_reminders', 'idx_booking_reminders_schedule');
    await queryInterface.removeIndex('customers', 'idx_customers_user');
    await queryInterface.removeIndex('services', 'idx_services_policy');
    await queryInterface.removeIndex('staff_exceptions', 'idx_staff_exceptions_lookup');
    await queryInterface.removeIndex('business_hours', 'idx_business_hours_lookup');
    await queryInterface.removeIndex('booking_payments', 'idx_booking_payments_booking');

    // Remove soft delete columns
    await queryInterface.removeColumn('business_media', 'deleted_at');
    await queryInterface.removeColumn('cancellation_policies', 'deleted_at');

    // Remove unique constraint
    await queryInterface.removeConstraint('staff_working_hours', 'uq_staff_working_hours_resource_day');
  }
};