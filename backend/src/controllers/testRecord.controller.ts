import { Request, Response } from 'express';
import { asyncHandler } from '../middleware/error.middleware';
import { sendSuccess, sendError, ApiError } from '../utils/apiResponse';
import { validateCreateTestRecord, validateUpdateTestRecord } from '../validators/testRecord.validator';
import { getPatientById } from '../services/patient.service';
import { getBiomarkerById } from '../services/biomarker.service';
import {
  listAllTestRecords,
  listTestRecordsForPatient,
  getTestRecordById,
  createTestRecord,
  updateTestRecord,
  deleteTestRecord,
} from '../services/testRecord.service';

function serializeRecord(r: any) {
  return {
    id: r.id,
    patientDbId: r.patient_id,
    patientId: r.patient_display_id,
    patientName: r.patient_name,
    biomarkerId: r.biomarker_id,
    biomarker: r.biomarker_name,
    resultValue: Number(r.result_value),
    unit: r.unit,
    testDate: r.test_date,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  };
}

export const getAllTestRecords = asyncHandler(async (req: Request, res: Response) => {
  const records = await listAllTestRecords();
  sendSuccess(res, records.map(serializeRecord), 'Test records retrieved successfully.');
});

export const getTestRecordsForPatient = asyncHandler(async (req: Request, res: Response) => {
  const patient = await getPatientById(Number(req.params.id));
  if (!patient) {
    throw new ApiError('Patient not found.', 404);
  }
  const records = await listTestRecordsForPatient(patient.id);
  sendSuccess(res, records.map(serializeRecord), "Patient's test records retrieved successfully.");
});

export const createTestRecordForPatient = asyncHandler(async (req: Request, res: Response) => {
  const patient = await getPatientById(Number(req.params.id));
  if (!patient) {
    throw new ApiError('Patient not found.', 404);
  }

  const { valid, errors } = validateCreateTestRecord(req.body, false);
  if (!valid) {
    sendError(res, 'Validation failed.', 400, errors);
    return;
  }

  const biomarker = await getBiomarkerById(Number(req.body.biomarker_id));
  if (!biomarker) {
    sendError(res, 'Selected biomarker does not exist.', 400);
    return;
  }

  const record = await createTestRecord({
    patient_id: patient.id,
    biomarker_id: biomarker.id,
    result_value: Number(req.body.result_value),
    unit: String(req.body.unit).trim(),
    test_date: req.body.test_date,
  });

  sendSuccess(res, serializeRecord(record), 'Test record created successfully.', 201);
});

export const updateTestRecordHandler = asyncHandler(async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const existing = await getTestRecordById(id);
  if (!existing) {
    throw new ApiError('Test record not found.', 404);
  }

  const { valid, errors } = validateUpdateTestRecord(req.body);
  if (!valid) {
    sendError(res, 'Validation failed.', 400, errors);
    return;
  }

  if (req.body.biomarker_id !== undefined) {
    const biomarker = await getBiomarkerById(Number(req.body.biomarker_id));
    if (!biomarker) {
      sendError(res, 'Selected biomarker does not exist.', 400);
      return;
    }
  }

  const updated = await updateTestRecord(id, {
    biomarker_id: req.body.biomarker_id !== undefined ? Number(req.body.biomarker_id) : undefined,
    result_value: req.body.result_value !== undefined ? Number(req.body.result_value) : undefined,
    unit: req.body.unit !== undefined ? String(req.body.unit).trim() : undefined,
    test_date: req.body.test_date !== undefined ? req.body.test_date : undefined,
  });

  sendSuccess(res, serializeRecord(updated), 'Test record updated successfully.');
});

export const deleteTestRecordHandler = asyncHandler(async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const existing = await getTestRecordById(id);
  if (!existing) {
    throw new ApiError('Test record not found.', 404);
  }

  await deleteTestRecord(id);
  sendSuccess(res, null, 'Test record deleted successfully.');
});
