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
