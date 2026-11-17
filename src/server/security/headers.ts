import type { NextResponse } from "next/server";

import { parseEnvironment } from "../../config/env";

export function applySecurityHeaders<T>(response: NextResponse<T>): NextResponse<T> {
  let isProduction = process.env.NODE_ENV === "production";
  let appUrl = process.env.NEXT_PUBLIC_APP_URL?.trim() || "";

  try {
    const env = parseEnvironment();
    isProduction = env.isProduction;
    appUrl = env.appUrl;
  } catch {
    // Fall back safely if strict server environment validation throws in edge/middleware
  }

  const directives = [
    "default-src 'self'",
    "base-uri 'self'",
    "object-src 'none'",
    "frame-ancestors 'none'",
    "form-action 'self'",
    "img-src 'self' data: blob:",
    "font-src 'self' data:",
    "style-src 'self' 'unsafe-inline'",
    isProduction
      ? "script-src 'self' 'unsafe-inline'"
      : "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
    appUrl ? `connect-src 'self' ${appUrl}` : "connect-src 'self'",
  ];

  response.headers.set("Content-Security-Policy", directives.join("; "));
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  response.headers.set("Cross-Origin-Opener-Policy", "same-origin");
  response.headers.set("Cross-Origin-Resource-Policy", "same-origin");
  if (isProduction) {
    response.headers.set("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
  }
  return response;
}
