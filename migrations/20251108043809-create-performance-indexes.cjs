'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Additional performance indexes not covered in previous migrations
    
    // User indexes
    await queryInterface.sequelize.query(`
      CREATE INDEX IF NOT EXISTS idx_users_active 
      ON users(is_active, role) 
      WHERE deleted_at IS NULL;
    `);

    // Business indexes
    await queryInterface.sequelize.query(`
      CREATE INDEX IF NOT EXISTS idx_businesses_active 
      ON businesses(id) 
      WHERE deleted_at IS NULL AND status = 'approved';
    `);

    // Service indexes
    await queryInterface.sequelize.query(`
      CREATE INDEX IF NOT EXISTS idx_services_business_category 
      ON services(business_id, category) 
      WHERE deleted_at IS NULL AND is_active = TRUE;
    `);

    // Resource indexes
    await queryInterface.sequelize.query(`
      CREATE INDEX IF NOT EXISTS idx_resources_business_type 
      ON resources(business_id, type) 
      WHERE deleted_at IS NULL AND is_active = TRUE;
    `);

    // Booking indexes
    await queryInterface.sequelize.query(`
      CREATE INDEX IF NOT EXISTS idx_bookings_business_status_date 
      ON bookings(business_id, status, start_at DESC) 
      WHERE deleted_at IS NULL;
    `);

    await queryInterface.sequelize.query(`
      CREATE INDEX IF NOT EXISTS idx_bookings_customer_recent 
      ON bookings(customer_id, created_at DESC) 
      WHERE deleted_at IS NULL;
    `);

    // Payment indexes
    await queryInterface.sequelize.query(`
      CREATE INDEX IF NOT EXISTS idx_booking_payments_provider 
      ON booking_payments(provider, status, created_at DESC);
    `);

    // Customer indexes
    await queryInterface.sequelize.query(`
      CREATE INDEX IF NOT EXISTS idx_customers_business_created 
      ON customers(business_id, created_at DESC) 
      WHERE deleted_at IS NULL;
    `);

    // Review indexes
    await queryInterface.sequelize.query(`
      CREATE INDEX IF NOT EXISTS idx_reviews_business_rating 
      ON reviews(business_id, rating, created_at DESC) 
      WHERE deleted_at IS NULL AND is_visible = TRUE;
    `);

    // Audit log indexes
    await queryInterface.sequelize.query(`
      CREATE INDEX IF NOT EXISTS idx_audit_logs_actor 
      ON audit_logs(actor_user_id, created_at DESC);
    `);

    await queryInterface.sequelize.query(`
      CREATE INDEX IF NOT EXISTS idx_audit_logs_created 
      ON audit_logs(created_at DESC);
    `);

    console.log('Performance indexes created successfully');
  },

  async down(queryInterface, Sequelize) {
    // Drop indexes in reverse order
    await queryInterface.removeIndex('audit_logs', 'idx_audit_logs_created');
    await queryInterface.removeIndex('audit_logs', 'idx_audit_logs_actor');
    await queryInterface.removeIndex('reviews', 'idx_reviews_business_rating');
    await queryInterface.removeIndex('customers', 'idx_customers_business_created');
    await queryInterface.removeIndex('booking_payments', 'idx_booking_payments_provider');
    await queryInterface.removeIndex('bookings', 'idx_bookings_customer_recent');
    await queryInterface.removeIndex('bookings', 'idx_bookings_business_status_date');
    await queryInterface.removeIndex('resources', 'idx_resources_business_type');
    await queryInterface.removeIndex('services', 'idx_services_business_category');
    await queryInterface.removeIndex('businesses', 'idx_businesses_active');
    await queryInterface.removeIndex('users', 'idx_users_active');
  }
};