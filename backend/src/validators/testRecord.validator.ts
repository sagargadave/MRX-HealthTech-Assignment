import { ValidationResult } from './auth.validator';

function isValidDateString(value: unknown): boolean {
  if (typeof value !== 'string') return false;
  const date = new Date(value);
  return !isNaN(date.getTime());
}

export function validateCreateTestRecord(body: any, requirePatientId: boolean): ValidationResult {
  const errors: Record<string, string> = {};

  if (requirePatientId && !body.patient_id) {
    errors.patient_id = 'Patient is required.';
  }

  if (!body.biomarker_id) {
    errors.biomarker_id = 'Biomarker is required.';
  }

  if (body.result_value === undefined || body.result_value === null || body.result_value === '') {
    errors.result_value = 'Result is required.';
  } else if (isNaN(Number(body.result_value))) {
    errors.result_value = 'Please enter a valid result value.';
  }

  if (!body.unit || typeof body.unit !== 'string' || !body.unit.trim()) {
    errors.unit = 'Unit is required.';
  }

  if (!body.test_date) {
    errors.test_date = 'Test date is required.';
  } else if (!isValidDateString(body.test_date)) {
    errors.test_date = 'Test date must be a valid date.';
  }

  return { valid: Object.keys(errors).length === 0, errors };
}

export function validateUpdateTestRecord(body: any): ValidationResult {
  const errors: Record<string, string> = {};

  if (body.result_value !== undefined && isNaN(Number(body.result_value))) {
    errors.result_value = 'Please enter a valid result value.';
  }

  if (body.unit !== undefined && (typeof body.unit !== 'string' || !body.unit.trim())) {
    errors.unit = 'Unit cannot be empty.';
  }

  if (body.test_date !== undefined && !isValidDateString(body.test_date)) {
    errors.test_date = 'Test date must be a valid date.';
  }

  return { valid: Object.keys(errors).length === 0, errors };
}
