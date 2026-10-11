import { parseEnvironment } from "../../config/env";
import { AuthorizationError } from "../../errors";

/**
 * Cookie-authenticated mutations must carry a trusted same-origin signal.
 * We accept Origin or Referer and require both, when present, to agree.
 */
export function assertSameOriginMutation(request: Request): void {
  const method = request.method.toUpperCase();
  if (["GET", "HEAD", "OPTIONS"].includes(method)) return;

  const configured = new Set(parseEnvironment().security.corsAllowedOrigins);
  configured.add(parseEnvironment().appUrl);

  const origin = request.headers.get("origin")?.trim() || null;
  const referer = request.headers.get("referer")?.trim() || null;

  const refererOrigin = referer ? parseOrigin(referer) : null;
  if (referer && !refererOrigin) throw new AuthorizationError("Request origin validation failed.");
  if (!origin && !refererOrigin) {
    throw new AuthorizationError("A same-origin request header is required.");
  }
  if (origin && refererOrigin && origin !== refererOrigin) {
    throw new AuthorizationError("Request origin validation failed.");
  }
  if (origin && !configured.has(origin)) {
    throw new AuthorizationError("Cross-origin request rejected.");
  }
  if (refererOrigin && !configured.has(refererOrigin)) {
    throw new AuthorizationError("Cross-origin request rejected.");
  }
}

function parseOrigin(value: string): string | null {
  try {
    return new URL(value).origin;
  } catch {
    return null;
  }
}
