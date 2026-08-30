export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly details?: any;
  public readonly isOperational: boolean;

  constructor(message: string, statusCode: number = 500, code: string = 'INTERNAL_SERVER_ERROR', details?: any) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = 'Resource not found', details?: any) {
    super(message, 404, 'NOT_FOUND', details);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string = 'Authentication required or token expired', details?: any) {
    super(message, 401, 'UNAUTHORIZED', details);
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string = 'Access denied: insufficient permissions', details?: any) {
    super(message, 403, 'FORBIDDEN', details);
  }
}

export class ValidationError extends AppError {
  constructor(message: string = 'Invalid request parameters', details?: any) {
    super(message, 400, 'VALIDATION_ERROR', details);
  }
}

export class BadRequestError extends AppError {
  constructor(message: string = 'Bad request', details?: any) {
    super(message, 400, 'BAD_REQUEST', details);
  }
}

export class ConflictError extends AppError {
  constructor(message: string = 'Resource conflict detected', details?: any) {
    super(message, 409, 'CONFLICT', details);
  }
}

export class TenantIsolationError extends AppError {
  constructor(message: string = 'Cross-tenant access violation detected', details?: any) {
    super(message, 403, 'TENANT_ISOLATION_VIOLATION', details);
  }
}

export class TooManyRequestsError extends AppError {
  constructor(message: string = 'Too many requests, please try again later', details?: any) {
    super(message, 429, 'TOO_MANY_REQUESTS', details);
  }
}

export class InvalidIdError extends AppError {
  constructor(message: string = 'Invalid ID format provided', details?: any) {
    super(message, 400, 'INVALID_ID_FORMAT', details);
  }
}
