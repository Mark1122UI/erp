import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { InvalidIdError } from './errors.js';

/**
 * Recursively sanitizes objects to prevent NoSQL Operator Injection (e.g. $gt, $where, $ne).
 */
export function sanitizeNoSql<T = any>(obj: T): T {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map((item) => sanitizeNoSql(item)) as unknown as T;
  }

  const cleanObj: Record<string, any> = {};
  for (const [key, value] of Object.entries(obj as Record<string, any>)) {
    // Strip keys starting with $ or containing a dot that could be used for operator or nested path injection
    if (key.startsWith('$') || key.includes('.')) {
      continue;
    }
    cleanObj[key] = sanitizeNoSql(value);
  }

  return cleanObj as T;
}

/**
 * Express middleware to sanitize req.body, req.query, and req.params against NoSQL injection.
 */
export function mongoSanitizer(req: Request, res: Response, next: NextFunction): void {
  if (req.body && typeof req.body === 'object') {
    req.body = sanitizeNoSql(req.body);
  }
  if (req.query && typeof req.query === 'object') {
    req.query = sanitizeNoSql(req.query);
  }
  if (req.params && typeof req.params === 'object') {
    req.params = sanitizeNoSql(req.params);
  }
  next();
}

/**
 * Validates and converts an ID string into a safe mongoose.Types.ObjectId.
 * Throws InvalidIdError if invalid, preventing any malformed query execution.
 */
export function ensureValidObjectId(id: string, fieldName: string = 'id'): mongoose.Types.ObjectId {
  if (!id || typeof id !== 'string' || !mongoose.Types.ObjectId.isValid(id.trim())) {
    throw new InvalidIdError(`Invalid identifier format for '${fieldName}': '${id}'`);
  }
  return new mongoose.Types.ObjectId(id.trim());
}
