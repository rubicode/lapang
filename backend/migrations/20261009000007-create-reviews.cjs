'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('reviews', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.literal('uuid_generate_v4()'),
        primaryKey: true,
        allowNull: false
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
      user_name: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      user_role: {
        type: Sequelize.STRING(50),
        defaultValue: 'Verified Booker'
      },
      rating_overall: {
        type: Sequelize.DECIMAL(3, 1),
        allowNull: false
      },
      rating_floor: {
        type: Sequelize.INTEGER,
        defaultValue: 5
      },
      rating_lighting: {
        type: Sequelize.INTEGER,
        defaultValue: 5
      },
      rating_cleanliness: {
        type: Sequelize.INTEGER,
        defaultValue: 5
      },
      rating_hospitality: {
        type: Sequelize.INTEGER,
        defaultValue: 5
      },
      comment: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      photos: {
        type: Sequelize.JSONB,
        defaultValue: []
      },
      owner_reply: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      owner_replied_at: {
        type: Sequelize.DATE,
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

    await queryInterface.addIndex('reviews', ['venue_id']);
  },

  async down(queryInterface) {
    await queryInterface.dropTable('reviews');
  }
};
