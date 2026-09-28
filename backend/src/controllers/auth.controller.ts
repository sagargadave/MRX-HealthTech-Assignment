import { Request, Response } from 'express';
import { asyncHandler } from '../middleware/error.middleware';
import { sendSuccess, sendError, ApiError } from '../utils/apiResponse';
import { validateLogin, validateRegister } from '../validators/auth.validator';
import { findUserByEmail, findUserById, verifyPassword, toSafeUser, createUser, hashPassword } from '../services/auth.service';
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

export const register = asyncHandler(async (req: Request, res: Response) => {
  const { valid, errors } = validateRegister(req.body);
  if (!valid) { sendError(res, 'Validation failed.', 400, errors); return; }

  const email = req.body.email.trim().toLowerCase();
  if (await findUserByEmail(email)) {
    sendError(res, 'An account with this email already exists.', 409); return;
  }
  const user = await createUser({
    name: req.body.name.trim(),
    email,
    passwordHash: await hashPassword(req.body.password),
    role: 'doctor',                       // set by the server, never from the client
  });
  sendSuccess(res, toSafeUser(user), 'Registration successful. Please log in.', 201);
});