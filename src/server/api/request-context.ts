import crypto from "crypto";
import type { NextRequest } from "next/server";

export interface RequestContext {
  requestId: string;
  startTime: number;
  path: string;
  method: string;
  userAgent?: string;
  ipAddress?: string;
}

/**
 * Extracts or initializes a RequestContext for tracing and structured logging.
 */
export function createRequestContext(req: NextRequest): RequestContext {
  const incomingId = req.headers.get("x-request-id");
  const requestId =
    incomingId && incomingId.trim().length > 0 ? incomingId.trim() : crypto.randomUUID();

  return {
    requestId,
    startTime: Date.now(),
    path: req.nextUrl.pathname,
    method: req.method,
    userAgent: req.headers.get("user-agent") ?? undefined,
    ipAddress:
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
      req.headers.get("x-real-ip") ??
      undefined,
  };
}
