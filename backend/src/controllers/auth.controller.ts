import { Request, Response } from 'express';
import { asyncHandler } from '../middleware/error.middleware';
import { sendSuccess, sendError, ApiError } from '../utils/apiResponse';
import { validateLogin } from '../validators/auth.validator';
import { findUserByEmail, findUserById, verifyPassword, toSafeUser } from '../services/auth.service';
import { signToken } from '../utils/jwt';

export const login = asyncHandler(async (req: Request, res: Response) => {
  const { valid, errors } = validateLogin(req.body);
  if (!valid) {
    sendError(res, 'Validation failed.', 400, errors);
    return;
  }

  const { email, password } = req.body;
  const user = await findUserByEmail(email.trim());

  if (!user) {
    throw new ApiError('Invalid email or password.', 401);
  }

  const passwordMatches = await verifyPassword(password, user.password_hash);
  if (!passwordMatches) {
    throw new ApiError('Invalid email or password.', 401);
  }

  const token = signToken({ id: user.id, email: user.email, role: user.role });

  sendSuccess(res, { token, user: toSafeUser(user) }, 'Login successful.');
});

export const me = asyncHandler(async (req: Request, res: Response) => {
  const user = await findUserById(req.user!.id);
  if (!user) {
    throw new ApiError('User not found.', 404);
  }
  sendSuccess(res, toSafeUser(user), 'Current user retrieved.');
});
