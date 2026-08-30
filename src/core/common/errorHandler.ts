import { Request, Response, NextFunction } from 'express';
import { AppError } from './errors.js';
import { env } from '../../config/env.js';

export function errorHandler(
  err: any,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction
): void {
  const requestId = (req.headers['x-request-id'] as string) || `req_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const timestamp = new Date().toISOString();

  // 1. Handle Known Operational Domain Errors
  if (err instanceof AppError) {
    if (env.NODE_ENV !== 'test') {
      console.warn(`[${requestId}] Operational Error (${err.code}): ${err.message}`, err.details || '');
    }

    res.status(err.statusCode).json({
      success: false,
      error: {
        code: err.code,
        message: err.message,
        details: err.details,
        requestId,
        timestamp,
      },
    });
    return;
  }

  // 2. Handle MongoDB Cast / Validation Errors
  if (err.name === 'CastError') {
    res.status(400).json({
      success: false,
      error: {
        code: 'INVALID_ID_FORMAT',
        message: `Invalid ID format for field '${err.path}'`,
        requestId,
        timestamp,
      },
    });
    return;
  }

  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    res.status(409).json({
      success: false,
      error: {
        code: 'DUPLICATE_KEY_ERROR',
        message: `A record with that '${field}' already exists`,
        details: err.keyValue,
        requestId,
        timestamp,
      },
    });
    return;
  }

  // 3. Handle JSON Parsing Errors
  if (err instanceof SyntaxError && 'body' in err) {
    res.status(400).json({
      success: false,
      error: {
        code: 'MALFORMED_JSON',
        message: 'Request body contains invalid JSON syntax',
        requestId,
        timestamp,
      },
    });
    return;
  }

  // 4. Handle Unexpected Programmer / System Errors
  console.error(`❌ [${requestId}] UNHANDLED SYSTEM ERROR:`, err);

  const safeMessage = env.NODE_ENV === 'production'
    ? 'An unexpected error occurred. Please contact system support.'
    : err.message || 'Internal Server Error';

  res.status(500).json({
    success: false,
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message: safeMessage,
      requestId,
      timestamp,
    },
  });
}
