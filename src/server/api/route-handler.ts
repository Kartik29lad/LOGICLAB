import type { NextRequest } from "next/server";

import { serverLogger } from "../../observability/logger/server-logger";
import { assertSameOriginMutation } from "../security/csrf";
import { applySecurityHeaders } from "../security/headers";
import { handleApiError } from "./error-handler";
import { createRequestContext } from "./request-context";
import { ApiResponseBuilder } from "./response-builder";

export interface RouteContext {
  requestId: string;
  request: NextRequest;
}

export async function withApiRoute<T>(
  request: NextRequest,
  handler: (context: RouteContext) => Promise<T>,
  options?: { statusCode?: number; cacheControl?: string }
) {
  const context = createRequestContext(request);
  try {
    assertSameOriginMutation(request);
    const data = await handler({ requestId: context.requestId, request });
    const response = applySecurityHeaders(
      ApiResponseBuilder.success(data, {
        requestId: context.requestId,
        statusCode: options?.statusCode ?? 200,
      })
    );
    const durationMs = Date.now() - context.startTime;
    response.headers.set("server-timing", `app;dur=${durationMs}`);
    if (options?.cacheControl) response.headers.set("cache-control", options.cacheControl);
    return response;
  } catch (error) {
    return applySecurityHeaders(handleApiError(error, context.requestId));
  } finally {
    serverLogger.info("API request completed", {
      requestId: context.requestId,
      method: context.method,
      path: context.path,
      durationMs: Date.now() - context.startTime,
    });
  }
}
