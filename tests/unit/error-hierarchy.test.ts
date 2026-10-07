import { describe, expect, it } from "vitest";

import {
  AppError,
  AuthenticationError,
  AuthorizationError,
  ConflictError,
  DatabaseError,
  DomainError,
  ExecutionError,
  ExternalServiceError,
  NotFoundError,
  RateLimitError,
  ResourceLimitError,
  UnauthorizedError,
  ValidationError,
} from "../../src/errors";
import { ERROR_CODES } from "../../src/errors/error-codes";

describe("Phase 4: Error Architecture & Error Codes", () => {
  it("ensures all domain errors extend AppError and DomainError", () => {
    const error = new ValidationError("Invalid parameters");
    expect(error).toBeInstanceOf(AppError);
    expect(error).toBeInstanceOf(DomainError);
    expect(error.name).toBe("ValidationError");
    expect(error.timestamp).toBeDefined();
  });

  it("verifies accurate HTTP status codes across the hierarchy", () => {
    expect(new ValidationError("bad input").statusCode).toBe(400);
    expect(new AuthenticationError("login required").statusCode).toBe(401);
    expect(new UnauthorizedError("login required").statusCode).toBe(401);
    expect(new AuthorizationError("forbidden").statusCode).toBe(403);
    expect(new NotFoundError("not found").statusCode).toBe(404);
    expect(new ConflictError("conflict").statusCode).toBe(409);
    expect(new ResourceLimitError("limit reached").statusCode).toBe(422);
    expect(new RateLimitError("too many requests").statusCode).toBe(429);
    expect(new DatabaseError("connection down").statusCode).toBe(500);
    expect(new ExecutionError("loop detected").statusCode).toBe(500);
    expect(new ExternalServiceError("gateway timeout").statusCode).toBe(502);
  });

  it("verifies machine-readable error codes", () => {
    expect(new ValidationError("e").code).toBe(ERROR_CODES.VALIDATION_ERROR);
    expect(new AuthenticationError("e").code).toBe(ERROR_CODES.AUTH_REQUIRED);
    expect(new UnauthorizedError("e").code).toBe(ERROR_CODES.UNAUTHORIZED);
    expect(new AuthorizationError("e").code).toBe(ERROR_CODES.FORBIDDEN);
    expect(new NotFoundError("e").code).toBe(ERROR_CODES.NOT_FOUND);
    expect(new ConflictError("e").code).toBe(ERROR_CODES.CONFLICT);
    expect(new RateLimitError("e").code).toBe(ERROR_CODES.RATE_LIMIT_EXCEEDED);
    expect(new ResourceLimitError("e").code).toBe(ERROR_CODES.EXECUTION_LIMIT_EXCEEDED);
  });

  it("safely serializes to public JSON omitting internal stack traces", () => {
    const error = new NotFoundError("Algorithm not found", { slug: "bogus-sort" });
    const json = error.toPublicJson();

    expect(json.code).toBe(ERROR_CODES.NOT_FOUND);
    expect(json.message).toBe("Algorithm not found");
    expect(json.details).toEqual({ slug: "bogus-sort" });
    expect((json as Record<string, unknown>).stack).toBeUndefined();
  });
});
