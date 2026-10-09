'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('amenities', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      name: {
        type: Sequelize.STRING(100),
        allowNull: false,
        unique: true
      },
      icon: {
        type: Sequelize.STRING(50),
        defaultValue: 'check'
      }
    });

    await queryInterface.createTable('venue_amenities', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
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
      amenity_name: {
        type: Sequelize.STRING(100),
        allowNull: false
      }
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('venue_amenities');
    await queryInterface.dropTable('amenities');
  }
};
