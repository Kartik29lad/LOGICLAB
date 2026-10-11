import { NextResponse, type NextRequest } from "next/server";

import { applySecurityHeaders } from "./server/security/headers";

export function middleware(request: NextRequest) {
  const isApi = request.nextUrl.pathname.startsWith("/api/");
  const isLocal =
    request.nextUrl.hostname === "localhost" || request.nextUrl.hostname === "127.0.0.1";
  if (process.env.NODE_ENV === "production" && !isApi && !isLocal) {
    const canonicalHost = process.env.NEXT_PUBLIC_CANONICAL_HOST;
    const forwardedProto = request.headers.get("x-forwarded-proto")?.split(",")[0]?.trim();
    const isHttp = forwardedProto === "http" || request.nextUrl.protocol === "http:";
    const hostMismatch = Boolean(canonicalHost && request.nextUrl.host !== canonicalHost);
    if (isHttp || hostMismatch) {
      const url = request.nextUrl.clone();
      url.protocol = "https:";
      if (canonicalHost) url.host = canonicalHost;
      return applySecurityHeaders(NextResponse.redirect(url, 308));
    }
  }
  const response = applySecurityHeaders(NextResponse.next());
  if (request.nextUrl.pathname.startsWith("/api/"))
    response.headers.set("Cache-Control", "no-store");
  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
