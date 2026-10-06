/**
 * Standard Domain Error Hierarchy
 * Provides typed, structured error classes for application-wide failure handling.
 */

export abstract class DomainError extends Error {
  public abstract readonly code: string;
  public abstract readonly statusCode: number;

  constructor(
    message: string,
    public readonly details?: unknown
  ) {
    super(message);
    this.name = this.constructor.name;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class ValidationError extends DomainError {
  public readonly code = "VALIDATION_ERROR";
  public readonly statusCode = 400;
}

export class UnauthorizedError extends DomainError {
  public readonly code = "UNAUTHORIZED";
  public readonly statusCode = 401;
}

export class ForbiddenError extends DomainError {
  public readonly code = "FORBIDDEN";
  public readonly statusCode = 403;
}

export class NotFoundError extends DomainError {
  public readonly code = "NOT_FOUND";
  public readonly statusCode = 404;
}

export class ConflictError extends DomainError {
  public readonly code = "CONFLICT";
  public readonly statusCode = 409;
}

export class ExecutionLimitExceededError extends DomainError {
  public readonly code = "EXECUTION_LIMIT_EXCEEDED";
  public readonly statusCode = 422;
}
