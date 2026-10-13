import { OwnerService } from '../services/ownerService.js';

export class OwnerController {
  static async getOverview(req, res) {
    try {
      const data = await OwnerService.getOverview(req.user.id);
      res.status(200).json({
        success: true,
        message: 'Owner dashboard overview berhasil dimuat dari PostgreSQL.',
        data
      });
    } catch (error) {
      console.error('OwnerController.getOverview error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Gagal memuat overview owner dashboard.'
      });
    }
  }

  static async createCourt(req, res) {
    try {
      const court = await OwnerService.createCourt(req.user.id, req.body);
      res.status(201).json({
        success: true,
        message: 'Lapangan baru berhasil ditambahkan ke database.',
        data: court
      });
    } catch (error) {
      console.error('OwnerController.createCourt error:', error);
      res.status(400).json({
        success: false,
        message: error.message || 'Gagal menambahkan lapangan.'
      });
    }
  }

  static async updateCourt(req, res) {
    try {
      const court = await OwnerService.updateCourt(req.user.id, req.params.id, req.body);
      res.status(200).json({
        success: true,
        message: 'Data lapangan berhasil diperbarui.',
        data: court
      });
    } catch (error) {
      console.error('OwnerController.updateCourt error:', error);
      res.status(400).json({
        success: false,
        message: error.message || 'Gagal memperbarui lapangan.'
      });
    }
  }

  static async toggleEarlyBirdPromo(req, res) {
    try {
      const { promoActive } = req.body;
      const result = await OwnerService.toggleEarlyBirdPromo(req.user.id, promoActive);
      res.status(200).json({
        success: true,
        message: result.earlyBirdPromoActive
          ? 'Early Bird Promotion (diskon 20%) berhasil diaktifkan!'
          : 'Early Bird Promotion berhasil dinonaktifkan.',
        data: result
      });
    } catch (error) {
      console.error('OwnerController.toggleEarlyBirdPromo error:', error);
      res.status(400).json({
        success: false,
        message: error.message || 'Gagal mengubah status promosi.'
      });
    }
  }

  static async exportReport(req, res) {
    try {
      const csv = await OwnerService.exportReport(req.user.id);
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="pitch-gallery-owner-report.csv"');
      res.status(200).send(csv);
    } catch (error) {
      console.error('OwnerController.exportReport error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Gagal mengekspor laporan owner.'
      });
    }
  }

  static async getBookings(req, res) {
    try {
      const { status, search, courtId, page, limit } = req.query;
      const data = await OwnerService.getBookings(req.user.id, {
        status,
        search,
        courtId,
        page,
        limit
      });
      res.status(200).json({
        success: true,
        message: 'Data booking owner berhasil dimuat dari PostgreSQL.',
        data
      });
    } catch (error) {
      console.error('OwnerController.getBookings error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Gagal memuat data booking.'
      });
    }
  }

  static async updateBookingStatus(req, res) {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const updated = await OwnerService.updateBookingStatus(req.user.id, id, status);
      res.status(200).json({
        success: true,
        message: `Status booking berhasil diubah menjadi ${status}.`,
        data: updated
      });
    } catch (error) {
      console.error('OwnerController.updateBookingStatus error:', error);
      res.status(400).json({
        success: false,
        message: error.message || 'Gagal memperbarui status booking.'
      });
    }
  }

  static async getSchedules(req, res) {
    try {
      const { courtId, date } = req.query;
      const data = await OwnerService.getSchedules(req.user.id, { courtId, date });
      res.status(200).json({
        success: true,
        message: 'Data jadwal court berhasil dimuat dari PostgreSQL.',
        data
      });
    } catch (error) {
      console.error('OwnerController.getSchedules error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Gagal memuat jadwal.'
      });
    }
  }

  static async toggleScheduleBlock(req, res) {
    try {
      const { courtId, date, timeSlot, status } = req.body;
      const result = await OwnerService.toggleScheduleBlock(req.user.id, {
        courtId,
        date,
        timeSlot,
        status
      });
      res.status(200).json({
        success: true,
        message: `Slot ${timeSlot} berhasil diatur ke ${status || 'blocked'}.`,
        data: result
      });
    } catch (error) {
      console.error('OwnerController.toggleScheduleBlock error:', error);
      res.status(400).json({
        success: false,
        message: error.message || 'Gagal mengubah status slot jadwal.'
      });
    }
  }

  static async getRevenueData(req, res) {
    try {
      const { period } = req.query;
      const data = await OwnerService.getRevenueData(req.user.id, { period });
      res.status(200).json({
        success: true,
        message: 'Data finansial & revenue berhasil dimuat dari PostgreSQL.',
        data
      });
    } catch (error) {
      console.error('OwnerController.getRevenueData error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Gagal memuat data revenue.'
      });
    }
  }

  static async getSettings(req, res) {
    try {
      const data = await OwnerService.getSettings(req.user.id);
      res.status(200).json({
        success: true,
        message: 'Pengaturan owner berhasil dimuat dari PostgreSQL.',
        data
      });
    } catch (error) {
      console.error('OwnerController.getSettings error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Gagal memuat pengaturan.'
      });
    }
  }

  static async updateSettings(req, res) {
    try {
      const data = await OwnerService.updateSettings(req.user.id, req.body);
      res.status(200).json({
        success: true,
        message: 'Pengaturan venue & akun berhasil diperbarui di PostgreSQL.',
        data
      });
    } catch (error) {
      console.error('OwnerController.updateSettings error:', error);
      res.status(400).json({
        success: false,
        message: error.message || 'Gagal memperbarui pengaturan.'
      });
    }
  }
}
