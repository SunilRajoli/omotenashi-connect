/**
 * HTTP Error classes
 * Custom error classes for API responses
 */

/**
 * Base HTTP Error class
 */
export class HttpError extends Error {
  statusCode: number;
  code?: string;
  details?: Record<string, unknown>;

  constructor(
    message: string,
    statusCode: number = 500,
    code?: string,
    details?: Record<string, unknown>
  ) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Bad Request (400)
 */
export class BadRequestError extends HttpError {
  constructor(message: string = 'Bad Request', details?: Record<string, unknown>) {
    super(message, 400, 'BAD_REQUEST', details);
  }
}

/**
 * Unauthorized (401)
 */
export class UnauthorizedError extends HttpError {
  constructor(message: string = 'Unauthorized', details?: Record<string, unknown>) {
    super(message, 401, 'UNAUTHORIZED', details);
  }
}

/**
 * Forbidden (403)
 */
export class ForbiddenError extends HttpError {
  constructor(message: string = 'Forbidden', details?: Record<string, unknown>) {
    super(message, 403, 'FORBIDDEN', details);
  }
}

/**
 * Not Found (404)
 */
export class NotFoundError extends HttpError {
  constructor(message: string = 'Not Found', details?: Record<string, unknown>) {
    super(message, 404, 'NOT_FOUND', details);
  }
}

/**
 * Conflict (409)
 */
export class ConflictError extends HttpError {
  constructor(message: string = 'Conflict', details?: Record<string, unknown>) {
    super(message, 409, 'CONFLICT', details);
  }
}

/**
 * Validation Error (422)
 */
export class ValidationError extends HttpError {
  constructor(message: string = 'Validation Error', details?: Record<string, unknown>) {
    super(message, 422, 'VALIDATION_ERROR', details);
  }
}

/**
 * Too Many Requests (429)
 */
export class TooManyRequestsError extends HttpError {
  constructor(message: string = 'Too Many Requests', details?: Record<string, unknown>) {
    super(message, 429, 'TOO_MANY_REQUESTS', details);
  }
}

/**
 * Internal Server Error (500)
 */
export class InternalServerError extends HttpError {
  constructor(message: string = 'Internal Server Error', details?: Record<string, unknown>) {
    super(message, 500, 'INTERNAL_SERVER_ERROR', details);
  }
}

/**
 * Service Unavailable (503)
 */
export class ServiceUnavailableError extends HttpError {
  constructor(message: string = 'Service Unavailable', details?: Record<string, unknown>) {
    super(message, 503, 'SERVICE_UNAVAILABLE', details);
  }
}

/**
 * Check if error is an HttpError
 */
export function isHttpError(error: unknown): error is HttpError {
  return error instanceof HttpError;
}

/**
 * Convert error to HTTP error response
 */
export function toHttpError(error: unknown): HttpError {
  if (isHttpError(error)) {
    return error;
  }

  if (error instanceof Error) {
    return new InternalServerError(error.message);
  }

  return new InternalServerError('Unknown error');
}

/**
 * Localized HTTP Error
 * Extends HttpError with locale support
 */
export class LocalizedHttpError extends HttpError {
  locale: 'ja' | 'en';

  constructor(
    message: string,
    statusCode: number = 500,
    code?: string,
    details?: Record<string, unknown>,
    locale: 'ja' | 'en' = 'ja'
  ) {
    super(message, statusCode, code, details);
    this.locale = locale;
  }
}

