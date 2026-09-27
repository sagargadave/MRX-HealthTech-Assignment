import { Request, Response } from 'express';
import { asyncHandler } from '../middleware/error.middleware';
import { sendSuccess } from '../utils/apiResponse';
import { getDashboardStats, getRecentTestRecords } from '../services/dashboard.service';

export const getStats = asyncHandler(async (req: Request, res: Response) => {
  const stats = await getDashboardStats();
  sendSuccess(res, stats, 'Dashboard stats retrieved successfully.');
});

export const getRecentTests = asyncHandler(async (req: Request, res: Response) => {
  const limit = req.query.limit ? Number(req.query.limit) : 10;
  const records = await getRecentTestRecords(limit);
  sendSuccess(
    res,
    records.map((r) => ({
      id: r.id,
      patientDbId: r.patient_id,
      patientId: r.patient_display_id,
      patientName: r.patient_name,
      biomarker: r.biomarker_name,
      result: Number(r.result_value),
      unit: r.unit,
      testDate: r.test_date,
    })),
    'Recent test records retrieved successfully.'
  );
});
