import { Request, Response } from 'express';
import { asyncHandler } from '../middleware/error.middleware';
import { sendSuccess } from '../utils/apiResponse';
import { buildPatientReport } from '../services/report.service';

export const getPatientReport = asyncHandler(async (req: Request, res: Response) => {
  const report = await buildPatientReport(Number(req.params.id));
  sendSuccess(res, report, 'Report generated successfully.');
});
