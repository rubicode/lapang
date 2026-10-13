'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // 1. Tambah field untuk antrean verifikasi fasilitas di tabel 'venues'
    const venueTableInfo = await queryInterface.describeTable('venues');

    if (!venueTableInfo.verification_status) {
      await queryInterface.addColumn('venues', 'verification_status', {
        type: Sequelize.STRING(50),
        defaultValue: 'Verified',
        allowNull: false
      });
    }

    if (!venueTableInfo.verification_submitted_at) {
      await queryInterface.addColumn('venues', 'verification_submitted_at', {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        allowNull: false
      });
    }

    if (!venueTableInfo.verification_documents) {
      await queryInterface.addColumn('venues', 'verification_documents', {
        type: Sequelize.JSONB,
        defaultValue: [],
        allowNull: false
      });
    }

    if (!venueTableInfo.verification_notes) {
      await queryInterface.addColumn('venues', 'verification_notes', {
        type: Sequelize.TEXT,
        allowNull: true
      });
    }

    if (!venueTableInfo.verification_issue_note) {
      await queryInterface.addColumn('venues', 'verification_issue_note', {
        type: Sequelize.TEXT,
        allowNull: true
      });
    }

    if (!venueTableInfo.sport_type) {
      await queryInterface.addColumn('venues', 'sport_type', {
        type: Sequelize.STRING(100),
        allowNull: true
      });
    }

    // 2. Tambah field untuk pemantauan lapangan (Active Field Monitoring & IoT Telemetry) di tabel 'courts'
    const courtTableInfo = await queryInterface.describeTable('courts');

    if (!courtTableInfo.monitoring_status) {
      await queryInterface.addColumn('courts', 'monitoring_status', {
        type: Sequelize.STRING(50),
        defaultValue: 'LIVE',
        allowNull: false
      });
    }

    if (!courtTableInfo.occupancy_rate) {
      await queryInterface.addColumn('courts', 'occupancy_rate', {
        type: Sequelize.INTEGER,
        defaultValue: 60,
        allowNull: false
      });
    }

    if (!courtTableInfo.active_players_count) {
      await queryInterface.addColumn('courts', 'active_players_count', {
        type: Sequelize.INTEGER,
        defaultValue: 8,
        allowNull: false
      });
    }

    if (!courtTableInfo.current_match) {
      await queryInterface.addColumn('courts', 'current_match', {
        type: Sequelize.STRING(255),
        allowNull: true
      });
    }

    if (!courtTableInfo.lighting_telemetry) {
      await queryInterface.addColumn('courts', 'lighting_telemetry', {
        type: Sequelize.STRING(100),
        defaultValue: 'Active (1000 Lux)',
        allowNull: true
      });
    }

    if (!courtTableInfo.temperature_telemetry) {
      await queryInterface.addColumn('courts', 'temperature_telemetry', {
        type: Sequelize.STRING(50),
        defaultValue: '24°C',
        allowNull: true
      });
    }

    if (!courtTableInfo.pitch_health_telemetry) {
      await queryInterface.addColumn('courts', 'pitch_health_telemetry', {
        type: Sequelize.STRING(100),
        defaultValue: 'Optimal (Moisture 22%)',
        allowNull: true
      });
    }

    if (!courtTableInfo.time_remaining) {
      await queryInterface.addColumn('courts', 'time_remaining', {
        type: Sequelize.STRING(100),
        allowNull: true
      });
    }

    if (!courtTableInfo.maintenance_task) {
      await queryInterface.addColumn('courts', 'maintenance_task', {
        type: Sequelize.TEXT,
        allowNull: true
      });
    }

    if (!courtTableInfo.expected_online) {
      await queryInterface.addColumn('courts', 'expected_online', {
        type: Sequelize.STRING(100),
        allowNull: true
      });
    }
  },

  async down(queryInterface) {
    const venueCols = [
      'verification_status',
      'verification_submitted_at',
      'verification_documents',
      'verification_notes',
      'verification_issue_note',
      'sport_type'
    ];
    for (const col of venueCols) {
      try {
        await queryInterface.removeColumn('venues', col);
      } catch {}
    }

    const courtCols = [
      'monitoring_status',
      'occupancy_rate',
      'active_players_count',
      'current_match',
      'lighting_telemetry',
      'temperature_telemetry',
      'pitch_health_telemetry',
      'time_remaining',
      'maintenance_task',
      'expected_online'
    ];
    for (const col of courtCols) {
      try {
        await queryInterface.removeColumn('courts', col);
      } catch {}
    }
  }
};
