import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../utils/apiResponse';

/** Catches unmatched routes and forwards a 404 to the error handler. */
export function notFoundHandler(req: Request, res: Response, next: NextFunction): void {
  next(new ApiError(`Route not found: ${req.method} ${req.originalUrl}`, 404));
}

/**
 * Centralized error handler. Every controller in this application either
 * throws an ApiError (or lets a promise rejection bubble up via the
 * asyncHandler wrapper) instead of building its own error responses.
 * This ensures raw database/server errors are never leaked to the client.
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function errorHandler(err: any, req: Request, res: Response, next: NextFunction): void {
  let statusCode = err instanceof ApiError ? err.statusCode : 500;
  let message = err instanceof ApiError ? err.message : 'Unable to process your request. Please try again.';

  // Translate common MySQL errors into safe, user-friendly messages.
  if (err && err.code === 'ER_DUP_ENTRY') {
    statusCode = 409;
    message = 'A record with this unique value already exists.';
  } else if (err && err.code === 'ER_NO_REFERENCED_ROW_2') {
    statusCode = 400;
    message = 'Referenced record does not exist.';
  }

  if (statusCode === 500) {
    // Log full detail server-side only; never send stack traces to the client.
    console.error('[error]', err);
  }

  res.status(statusCode).json({
    success: false,
    message,
  });
}

/** Wraps an async controller so rejected promises are forwarded to errorHandler. */
export function asyncHandler(fn: (req: Request, res: Response, next: NextFunction) => Promise<any>) {
  return (req: Request, res: Response, next: NextFunction): void => {
    fn(req, res, next).catch(next);
  };
}
