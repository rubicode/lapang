'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // 1. Add fields to venues table
    await queryInterface.addColumn('venues', 'district', {
      type: Sequelize.STRING(150),
      defaultValue: 'Downtown Sports District',
      allowNull: true
    });

    await queryInterface.addColumn('venues', 'unique_visitors_count', {
      type: Sequelize.INTEGER,
      defaultValue: 3842,
      allowNull: true
    });

    await queryInterface.addColumn('venues', 'currency', {
      type: Sequelize.STRING(10),
      defaultValue: 'USD',
      allowNull: true
    });

    await queryInterface.addColumn('venues', 'early_bird_promo_active', {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
      allowNull: true
    });

    await queryInterface.addColumn('venues', 'early_bird_discount_percent', {
      type: Sequelize.INTEGER,
      defaultValue: 20,
      allowNull: true
    });

    // 2. Add fields to courts table
    await queryInterface.addColumn('courts', 'match_format', {
      type: Sequelize.STRING(50),
      defaultValue: '5-a-side',
      allowNull: true
    });

    await queryInterface.addColumn('courts', 'surface_spec', {
      type: Sequelize.STRING(100),
      defaultValue: 'Outdoor Pro',
      allowNull: true
    });

    await queryInterface.addColumn('courts', 'main_image', {
      type: Sequelize.STRING(500),
      allowNull: true
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('courts', 'main_image');
    await queryInterface.removeColumn('courts', 'surface_spec');
    await queryInterface.removeColumn('courts', 'match_format');

    await queryInterface.removeColumn('venues', 'early_bird_discount_percent');
    await queryInterface.removeColumn('venues', 'early_bird_promo_active');
    await queryInterface.removeColumn('venues', 'currency');
    await queryInterface.removeColumn('venues', 'unique_visitors_count');
    await queryInterface.removeColumn('venues', 'district');
  }
};
