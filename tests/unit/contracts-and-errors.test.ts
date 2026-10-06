import { describe, expect, it } from "vitest";

import {
  ConflictError,
  DomainError,
  ExecutionLimitExceededError,
  ForbiddenError,
  NotFoundError,
  UnauthorizedError,
  ValidationError,
} from "@/errors/domain-errors";

describe("Domain Error Hierarchy", () => {
  it("instantiates ValidationError with 400 status and details", () => {
    const error = new ValidationError("Invalid input", [{ field: "size", message: "Too large" }]);
    expect(error).toBeInstanceOf(DomainError);
    expect(error.code).toBe("VALIDATION_ERROR");
    expect(error.statusCode).toBe(400);
    expect(error.message).toBe("Invalid input");
    expect(error.details).toBeDefined();
  });

  it("instantiates UnauthorizedError and ForbiddenError with correct codes", () => {
    const unauth = new UnauthorizedError("Session expired");
    expect(unauth.statusCode).toBe(401);
    expect(unauth.code).toBe("UNAUTHORIZED");

    const forbidden = new ForbiddenError("Insufficient rights");
    expect(forbidden.statusCode).toBe(403);
    expect(forbidden.code).toBe("FORBIDDEN");
  });

  it("instantiates NotFoundError with 404", () => {
    const notFound = new NotFoundError("Algorithm not found");
    expect(notFound.statusCode).toBe(404);
    expect(notFound.code).toBe("NOT_FOUND");
  });

  it("instantiates ConflictError and ExecutionLimitExceededError with proper codes", () => {
    const conflict = new ConflictError("Resource already exists");
    expect(conflict.statusCode).toBe(409);

    const limitExceeded = new ExecutionLimitExceededError("Step limit reached");
    expect(limitExceeded.statusCode).toBe(422);
    expect(limitExceeded.code).toBe("EXECUTION_LIMIT_EXCEEDED");
  });
});
