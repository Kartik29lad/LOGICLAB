import { describe, expect, it } from "vitest";

import { NotFoundError } from "../../src/errors";
import { sanitizeLogData } from "../../src/observability/logger/server-logger";
import { ExecutionMetricsCollector } from "../../src/observability/metrics/execution-metrics";
import { RequestTracer } from "../../src/observability/tracing/request-tracer";
import { handleApiError } from "../../src/server/api/error-handler";
import { ApiResponseBuilder } from "../../src/server/api/response-builder";

describe("Phase 4: API Responses, Sanitization & Observability", () => {
  it("builds a successful API response envelope with correlation ID", async () => {
    const response = ApiResponseBuilder.success(
      { count: 42 },
      { requestId: "req-123", statusCode: 200 }
    );
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(response.headers.get("x-request-id")).toBe("req-123");
    expect(json.success).toBe(true);
    expect(json.data).toEqual({ count: 42 });
    expect(json.meta?.requestId).toBe("req-123");
    expect(json.meta?.timestamp).toBeDefined();
  });

  it("builds an error API response envelope with proper status code", async () => {
    const response = ApiResponseBuilder.error("TEST_ERROR", "Test failure message", {
      statusCode: 400,
      requestId: "req-456",
    });
    const json = await response.json();

    expect(response.status).toBe(400);
    expect(json.success).toBe(false);
    expect(json.error.code).toBe("TEST_ERROR");
    expect(json.error.message).toBe("Test failure message");
    expect(json.error.requestId).toBe("req-456");
  });

  it("handles known AppError instances and maps HTTP status accordingly", async () => {
    const appError = new NotFoundError("Algorithm not found");
    const response = handleApiError(appError, "req-789");
    const json = await response.json();

    expect(response.status).toBe(404);
    expect(json.success).toBe(false);
    expect(json.error.code).toBe("NOT_FOUND");
    expect(json.error.message).toBe("Algorithm not found");
  });

  it("scrubs sensitive keys (passwords, tokens, secrets) from log payloads", () => {
    const payload = {
      username: "alice",
      password: "secret_password_123",
      sessionToken: "xyz_bearer_token",
      nested: {
        api_key: "sk_live_12345",
        normalField: "public_value",
      },
    };

    const sanitized = sanitizeLogData(payload) as Record<string, unknown>;
    expect(sanitized.username).toBe("alice");
    expect(sanitized.password).toBe("[REDACTED]");
    expect(sanitized.sessionToken).toBe("[REDACTED]");
    expect((sanitized.nested as Record<string, unknown>).api_key).toBe("[REDACTED]");
    expect((sanitized.nested as Record<string, unknown>).normalField).toBe("public_value");
  });

  it("measures high-resolution request trace durations", () => {
    const tracer = new RequestTracer();
    tracer.startSpan("db-query");
    const duration = tracer.endSpan("db-query");

    expect(duration).not.toBeNull();
    expect(typeof duration).toBe("number");
    expect(duration).toBeGreaterThanOrEqual(0);
  });

  it("collects execution metrics accurately", () => {
    const collector = new ExecutionMetricsCollector();
    collector.start();
    collector.recordComparison();
    collector.recordComparison();
    collector.recordSwap();
    collector.recordAccess(4);
    collector.recordStep();
    const metrics = collector.finish();

    expect(metrics.comparisonsCount).toBe(2);
    expect(metrics.swapsCount).toBe(1);
    expect(metrics.arrayAccessesCount).toBe(4);
    expect(metrics.stepCount).toBe(1);
    expect(metrics.executionDurationMs).toBeGreaterThanOrEqual(0);
  });
});
