/**
 * Admin Controller (STANDARD_CODE.md Compliance)
 * Menangani HTTP request untuk fitur Dashboard Admin
 */

import { AdminService } from '../services/adminService.js';
import { successResponse } from '../utils/response.js';
import { HTTP_STATUS } from '../constants/index.js';

export class AdminController {
  /**
   * GET /api/v1/admin/overview
   */
  static async getOverview(req, res, next) {
    try {
      const overview = await AdminService.getOverview();
      return successResponse(res, 'Ringkasan platform berhasil diambil', overview, HTTP_STATUS.OK);
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /api/v1/admin/verifications/:id/status
   */
  static async updateStatus(req, res, next) {
    try {
      const { id } = req.params;
      const { status, issueNote } = req.body;
      const updated = await AdminService.updateVerificationStatus(id, { status, issueNote });
      return successResponse(res, `Status verifikasi fasilitas diubah menjadi ${status}`, updated, HTTP_STATUS.OK);
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/v1/admin/invite-owner
   */
  static async inviteOwner(req, res, next) {
    try {
      const newApp = await AdminService.inviteOwner(req.body);
      return successResponse(res, 'Undangan pengelola venue berhasil dikirim', newApp, HTTP_STATUS.CREATED);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/admin/export-csv
   */
  static async exportCsv(req, res, next) {
    try {
      const csv = await AdminService.generateCsv();
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="lapang_verification_queue.csv"');
      return res.status(HTTP_STATUS.OK).send(csv);
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/v1/admin/reset
   */
  static async reset(req, res, next) {
    try {
      await AdminService.resetState();
      return successResponse(res, 'State reset berhasil', null, HTTP_STATUS.OK);
    } catch (error) {
      next(error);
    }
  }
}
