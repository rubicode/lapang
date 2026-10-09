'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('sports_categories', {
      id: {
        type: Sequelize.STRING(50),
        primaryKey: true,
        allowNull: false
      },
      name: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      icon: {
        type: Sequelize.STRING(10),
        allowNull: false
      },
      color_hex: {
        type: Sequelize.STRING(10),
        defaultValue: '#1B5E20'
      },
      icon_url: {
        type: Sequelize.STRING(500),
        allowNull: true
      }
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('sports_categories');
  }
};
