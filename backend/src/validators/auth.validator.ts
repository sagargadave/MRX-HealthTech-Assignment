export interface ValidationResult {
  valid: boolean;
  errors: Record<string, string>;
}

export function validateLogin(body: any): ValidationResult {
  const errors: Record<string, string> = {};

  if (!body.email || typeof body.email !== 'string' || !body.email.trim()) {
    errors.email = 'Email is required.';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email.trim())) {
    errors.email = 'Please provide a valid email address.';
  }

  if (!body.password || typeof body.password !== 'string' || !body.password.trim()) {
    errors.password = 'Password is required.';
  }

  return { valid: Object.keys(errors).length === 0, errors };
}

export function validateRegister(body: any): ValidationResult {
  const errors: Record<string, string> = {};
  if (!body.name || typeof body.name !== 'string' || !body.name.trim())
    errors.name = 'Name is required.';
  if (!body.email || typeof body.email !== 'string' || !body.email.trim())
    errors.email = 'Email is required.';
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email.trim()))
    errors.email = 'Please provide a valid email address.';
  const pw = body.password;
  if (!pw || typeof pw !== 'string') errors.password = 'Password is required.';
  else if (pw.length < 8 || pw.length > 72 || !/[A-Za-z]/.test(pw) || !/\d/.test(pw))
    errors.password = 'Password must be 8–72 characters with a letter and a number.';
  return { valid: Object.keys(errors).length === 0, errors };
}