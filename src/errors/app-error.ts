import type { ErrorCode } from "./error-codes";

/**
 * Base Application Error
 * All system errors (domain, API, database, validation) derive from this class.
 */
export abstract class AppError extends Error {
  public abstract readonly code: ErrorCode | string;
  public abstract readonly statusCode: number;
  public readonly timestamp: string;

  constructor(
    message: string,
    public readonly details?: unknown,
    public readonly isOperational = true
  ) {
    super(message);
    this.name = this.constructor.name;
    this.timestamp = new Date().toISOString();
    Object.setPrototypeOf(this, new.target.prototype);
  }

  /**
   * Serializes the error safely for public API responses.
   * Internal details or stack traces are omitted unless explicitly designated safe.
   */
  public toPublicJson(): { code: string; message: string; details?: unknown } {
    return {
      code: this.code,
      message: this.message,
      ...(this.details !== undefined && { details: this.details }),
    };
  }
}
