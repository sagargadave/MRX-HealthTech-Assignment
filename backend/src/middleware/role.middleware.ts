import { Request, Response, NextFunction } from 'express';
import { sendError } from '../utils/apiResponse';

/**
 * Restricts a route to one or more roles. Must run AFTER `authenticate`,
 * since it relies on req.user being populated.
 *
 * Currently only the 'doctor' role exists, but this middleware is written
 * so additional roles (e.g. 'admin', 'nurse') can be added later without
 * changing route wiring - just pass more roles into requireRole(...).
 */
export function requireRole(...allowedRoles: string[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      sendError(res, 'Authentication required. Please log in.', 401);
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      sendError(res, 'You do not have permission to perform this action.', 403);
      return;
    }

    next();
  };
}
