import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt';
import { sendError } from '../utils/apiResponse';

/**
 * Verifies the JWT sent in the Authorization header (Bearer token).
 * On success, attaches the decoded payload to req.user.
 * Every protected route in this application relies on this middleware
 * running before the controller executes.
 */
export function authenticate(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    sendError(res, 'Authentication required. Please log in.', 401);
    return;
  }

  const token = authHeader.split(' ')[1];

  try {
    const payload = verifyToken(token);
    req.user = payload;
    next();
  } catch (err) {
    sendError(res, 'Invalid or expired session. Please log in again.', 401);
  }
}
