import { Request, Response } from 'express';
import { asyncHandler } from '../middleware/error.middleware';
import { sendSuccess, ApiError } from '../utils/apiResponse';
import { getPatientById } from '../services/patient.service';
import { getBiomarkerById } from '../services/biomarker.service';
import { getTrendForPatientBiomarker } from '../services/testRecord.service';

export const getPatientTrend = asyncHandler(async (req: Request, res: Response) => {
  const patient = await getPatientById(Number(req.params.id));
  if (!patient) {
    throw new ApiError('Patient not found.', 404);
  }

  const biomarker = await getBiomarkerById(Number(req.params.biomarkerId));
  if (!biomarker) {
    throw new ApiError('Biomarker not found.', 404);
  }

  const records = await getTrendForPatientBiomarker(patient.id, biomarker.id);

  sendSuccess(
    res,
    {
      patientId: patient.patient_id,
      biomarker: biomarker.name,
      unit: records.length > 0 ? records[records.length - 1].unit : biomarker.default_unit,
      records: records.map((r) => ({
        date: r.test_date,
        value: Number(r.result_value),
      })),
    },
    'Trend data retrieved successfully.'
  );
});
