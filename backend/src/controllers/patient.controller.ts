import { Request, Response } from 'express';
import { asyncHandler } from '../middleware/error.middleware';
import { sendSuccess, sendError, ApiError } from '../utils/apiResponse';
import { validateCreatePatient, validateUpdatePatient } from '../validators/patient.validator';
import {
  listPatients,
  getPatientById,
  getPatientByPatientId,
  createPatient,
  updatePatient,
  deletePatient,
} from '../services/patient.service';

export const getPatients = asyncHandler(async (req: Request, res: Response) => {
  const search = typeof req.query.search === 'string' ? req.query.search : undefined;
  const gender = typeof req.query.gender === 'string' ? req.query.gender : undefined;

  const patients = await listPatients({ search, gender });
  sendSuccess(res, patients, 'Patients retrieved successfully.');
});

export const getPatient = asyncHandler(async (req: Request, res: Response) => {
  const patient = await getPatientById(Number(req.params.id));
  if (!patient) {
    throw new ApiError('Patient not found.', 404);
  }
  sendSuccess(res, patient, 'Patient retrieved successfully.');
});

export const createPatientHandler = asyncHandler(async (req: Request, res: Response) => {
  const { valid, errors } = validateCreatePatient(req.body);
  if (!valid) {
    sendError(res, 'Validation failed.', 400, errors);
    return;
  }

  const existing = await getPatientByPatientId(req.body.patient_id.trim());
  if (existing) {
    sendError(res, 'Patient ID already exists.', 409);
    return;
  }

  const patient = await createPatient({
    patient_id: req.body.patient_id.trim(),
    name: req.body.name.trim(),
    age: Number(req.body.age),
    gender: req.body.gender,
    medical_history: req.body.medical_history ? String(req.body.medical_history).trim() : null,
  });

  sendSuccess(res, patient, 'Patient created successfully.', 201);
});

export const updatePatientHandler = asyncHandler(async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const existing = await getPatientById(id);
  if (!existing) {
    throw new ApiError('Patient not found.', 404);
  }

  const { valid, errors } = validateUpdatePatient(req.body);
  if (!valid) {
    sendError(res, 'Validation failed.', 400, errors);
    return;
  }

  const updated = await updatePatient(id, {
    name: req.body.name !== undefined ? String(req.body.name).trim() : undefined,
    age: req.body.age !== undefined ? Number(req.body.age) : undefined,
    gender: req.body.gender,
    medical_history:
      req.body.medical_history !== undefined ? String(req.body.medical_history).trim() : undefined,
  });

  sendSuccess(res, updated, 'Patient updated successfully.');
});

export const deletePatientHandler = asyncHandler(async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const existing = await getPatientById(id);
  if (!existing) {
    throw new ApiError('Patient not found.', 404);
  }

  await deletePatient(id);
  sendSuccess(res, null, 'Patient deleted successfully.');
});
