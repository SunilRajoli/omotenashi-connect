'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('reviews', {
      id: {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.literal('gen_random_uuid()')
      },
      booking_id: {
        type: Sequelize.UUID,
        allowNull: true,
        unique: true,
        references: { model: 'bookings', key: 'id' },
        onDelete: 'CASCADE'
      },
      business_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'businesses', key: 'id' },
        onDelete: 'CASCADE'
      },
      customer_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: { model: 'customers', key: 'id' },
        onDelete: 'SET NULL'
      },
      rating: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      comment: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      sentiment_score: {
        type: Sequelize.DECIMAL,
        allowNull: true
      },
      is_visible: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true
      },
      moderated_by: {
        type: Sequelize.UUID,
        allowNull: true,
        references: { model: 'users', key: 'id' }
      },
      moderated_at: {
        type: Sequelize.DATE,
        allowNull: true
      },
      moderation_reason: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      response_text: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      responded_by: {
        type: Sequelize.UUID,
        allowNull: true,
        references: { model: 'users', key: 'id' }
      },
      responded_at: {
        type: Sequelize.DATE,
        allowNull: true
      },
      deleted_at: {
        type: Sequelize.DATE,
        allowNull: true
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('now()')
      }
    });

    await queryInterface.addConstraint('reviews', {
      fields: ['rating'],
      type: 'check',
      where: {
        rating: {
          [Sequelize.Op.between]: [1, 5]
        }
      }
    });

    await queryInterface.addIndex('reviews', ['business_id', 'created_at']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('reviews');
  }
};