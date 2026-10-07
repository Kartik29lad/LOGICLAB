import { AppError } from "./app-error";
import { ERROR_CODES, type ErrorCode } from "./error-codes";

/**
 * DomainError extends AppError for core logic and application use-cases.
 */
export abstract class DomainError extends AppError {}

export class ValidationError extends DomainError {
  public readonly code: ErrorCode = ERROR_CODES.VALIDATION_ERROR;
  public readonly statusCode = 400;
}

export class UnauthorizedError extends DomainError {
  public readonly code: ErrorCode = ERROR_CODES.UNAUTHORIZED;
  public readonly statusCode = 401;
}

export class AuthenticationError extends DomainError {
  public readonly code: ErrorCode = ERROR_CODES.AUTH_REQUIRED;
  public readonly statusCode = 401;
}

export class ForbiddenError extends DomainError {
  public readonly code: ErrorCode = ERROR_CODES.FORBIDDEN;
  public readonly statusCode = 403;
}

export class AuthorizationError extends DomainError {
  public readonly code: ErrorCode = ERROR_CODES.FORBIDDEN;
  public readonly statusCode = 403;
}

export class NotFoundError extends DomainError {
  public readonly code: ErrorCode = ERROR_CODES.NOT_FOUND;
  public readonly statusCode = 404;
}

export class ConflictError extends DomainError {
  public readonly code: ErrorCode = ERROR_CODES.CONFLICT;
  public readonly statusCode = 409;
}

export class RateLimitError extends DomainError {
  public readonly code: ErrorCode = ERROR_CODES.RATE_LIMIT_EXCEEDED;
  public readonly statusCode = 429;
}

export class ResourceLimitError extends DomainError {
  public readonly code: ErrorCode = ERROR_CODES.EXECUTION_LIMIT_EXCEEDED;
  public readonly statusCode = 422;
}

// Backwards compatibility alias
export const ExecutionLimitExceededError = ResourceLimitError;
export type ExecutionLimitExceededError = ResourceLimitError;

export class DatabaseError extends DomainError {
  public readonly code: ErrorCode = ERROR_CODES.DATABASE_ERROR;
  public readonly statusCode = 500;

  constructor(message: string, details?: unknown) {
    super(message, details, true);
  }
}

export class ExecutionError extends DomainError {
  public readonly code: ErrorCode = ERROR_CODES.ALGORITHM_EXECUTION_ERROR;
  public readonly statusCode = 500;
}

export class ExternalServiceError extends DomainError {
  public readonly code: ErrorCode = ERROR_CODES.EXTERNAL_SERVICE_ERROR;
  public readonly statusCode = 502;
}
