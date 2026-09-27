import { Request, Response } from 'express';
import { asyncHandler } from '../middleware/error.middleware';
import { sendSuccess, ApiError } from '../utils/apiResponse';
import { listBiomarkers, listBiomarkersForPatient } from '../services/biomarker.service';
import { getPatientById } from '../services/patient.service';

export const getBiomarkers = asyncHandler(async (req: Request, res: Response) => {
  const biomarkers = await listBiomarkers();
  sendSuccess(res, biomarkers, 'Biomarkers retrieved successfully.');
});

export const getBiomarkersForPatient = asyncHandler(async (req: Request, res: Response) => {
  const patient = await getPatientById(Number(req.params.id));
  if (!patient) {
    throw new ApiError('Patient not found.', 404);
  }
  const biomarkers = await listBiomarkersForPatient(patient.id);
  sendSuccess(res, biomarkers, "Patient's biomarkers retrieved successfully.");
});
