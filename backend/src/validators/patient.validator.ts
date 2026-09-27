import { ValidationResult } from './auth.validator';

const ALLOWED_GENDERS = ['Male', 'Female', 'Other'];

export function validateCreatePatient(body: any): ValidationResult {
  const errors: Record<string, string> = {};

  if (!body.patient_id || typeof body.patient_id !== 'string' || !body.patient_id.trim()) {
    errors.patient_id = 'Patient ID is required.';
  }

  if (!body.name || typeof body.name !== 'string' || !body.name.trim()) {
    errors.name = 'Name is required.';
  }

  if (body.age === undefined || body.age === null || body.age === '') {
    errors.age = 'Age is required.';
  } else if (isNaN(Number(body.age)) || Number(body.age) <= 0 || Number(body.age) >= 150) {
    errors.age = 'Age must be a valid, reasonable positive number.';
  }

  if (!body.gender || !ALLOWED_GENDERS.includes(body.gender)) {
    errors.gender = 'Gender is required and must be Male, Female, or Other.';
  }

  return { valid: Object.keys(errors).length === 0, errors };
}

export function validateUpdatePatient(body: any): ValidationResult {
  const errors: Record<string, string> = {};

  if (body.name !== undefined && (typeof body.name !== 'string' || !body.name.trim())) {
    errors.name = 'Name cannot be empty.';
  }

  if (body.age !== undefined && (isNaN(Number(body.age)) || Number(body.age) <= 0 || Number(body.age) >= 150)) {
    errors.age = 'Age must be a valid, reasonable positive number.';
  }

  if (body.gender !== undefined && !ALLOWED_GENDERS.includes(body.gender)) {
    errors.gender = 'Gender must be Male, Female, or Other.';
  }

  return { valid: Object.keys(errors).length === 0, errors };
}
