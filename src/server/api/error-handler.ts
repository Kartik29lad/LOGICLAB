import type { NextResponse } from "next/server";

import type { ApiResponseError } from "../../contracts/api/api-response";
import { AppError } from "../../errors/app-error";
import { ERROR_CODES } from "../../errors/error-codes";
import { serverLogger } from "../../observability/logger/server-logger";
import { ApiResponseBuilder } from "./response-builder";

/**
 * Global route handler error interceptor.
 * Converts domain and system exceptions into controlled, sanitized HTTP responses.
 */
export function handleApiError(error: unknown, requestId?: string): NextResponse<ApiResponseError> {
  if (error instanceof AppError) {
    serverLogger.warn(error.message, {
      requestId,
      code: error.code,
      statusCode: error.statusCode,
      details: error.details,
    });

    const errorDetails = Array.isArray(error.details) ? error.details : undefined;

    return ApiResponseBuilder.error(error.code, error.message, {
      statusCode: error.statusCode,
      requestId,
      details: errorDetails,
    });
  }

  const standardError = error instanceof Error ? error : new Error(String(error));

  serverLogger.error("Unhandled API route exception", {
    requestId,
    name: standardError.name,
    message: standardError.message,
    stack: standardError.stack,
  });

  const isProduction = process.env.NODE_ENV === "production";
  const publicMessage = isProduction
    ? "An unexpected internal error occurred. Please try again later."
    : standardError.message;

  return ApiResponseBuilder.error(ERROR_CODES.INTERNAL_ERROR, publicMessage, {
    statusCode: 500,
    requestId,
  });
}
