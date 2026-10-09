'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('bookings', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.literal('uuid_generate_v4()'),
        primaryKey: true,
        allowNull: false
      },
      booking_code: {
        type: Sequelize.STRING(50),
        allowNull: false,
        unique: true
      },
      user_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      venue_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'venues',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      court_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'courts',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      venue_name: {
        type: Sequelize.STRING(200),
        allowNull: false
      },
      customer_name: {
        type: Sequelize.STRING(150),
        allowNull: false
      },
      customer_phone: {
        type: Sequelize.STRING(50),
        allowNull: false
      },
      date: {
        type: Sequelize.DATEONLY,
        allowNull: false
      },
      time_slot: {
        type: Sequelize.STRING(20),
        allowNull: false
      },
      total_amount: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      payment_method: {
        type: Sequelize.STRING(50),
        defaultValue: 'QRIS'
      },
      payment_status: {
        type: Sequelize.ENUM('unpaid', 'settlement', 'expire', 'cancel'),
        defaultValue: 'settlement'
      },
      booking_status: {
        type: Sequelize.ENUM('pending', 'confirmed', 'cancelled', 'completed'),
        defaultValue: 'confirmed'
      },
      midtrans_snap_token: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });

    await queryInterface.addIndex('bookings', ['booking_code']);
    await queryInterface.addIndex('bookings', ['venue_id']);
  },

  async down(queryInterface) {
    await queryInterface.dropTable('bookings');
  }
};
