'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('venues', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.literal('uuid_generate_v4()'),
        primaryKey: true,
        allowNull: false
      },
      owner_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      city_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'cities',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      name: {
        type: Sequelize.STRING(200),
        allowNull: false
      },
      slug: {
        type: Sequelize.STRING(250),
        allowNull: false,
        unique: true
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      address: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      city_name: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      province_name: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      latitude: {
        type: Sequelize.DECIMAL(10, 8),
        allowNull: false
      },
      longitude: {
        type: Sequelize.DECIMAL(11, 8),
        allowNull: false
      },
      phone_number: {
        type: Sequelize.STRING(50),
        allowNull: true
      },
      opening_hours: {
        type: Sequelize.STRING(100),
        defaultValue: '07:00 - 24:00 WIB'
      },
      floor_type: {
        type: Sequelize.STRING(150),
        allowNull: true
      },
      court_type: {
        type: Sequelize.STRING(50),
        defaultValue: 'Indoor'
      },
      base_price_hourly: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 100000
      },
      main_image_url: {
        type: Sequelize.STRING(500),
        allowNull: false
      },
      gallery_images: {
        type: Sequelize.JSONB,
        defaultValue: []
      },
      rating_avg: {
        type: Sequelize.DECIMAL(3, 2),
        defaultValue: 5.0
      },
      review_count: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      is_verified: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
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

    await queryInterface.addIndex('venues', ['city_name']);
    await queryInterface.addIndex('venues', ['slug']);
  },

  async down(queryInterface) {
    await queryInterface.dropTable('venues');
  }
};
