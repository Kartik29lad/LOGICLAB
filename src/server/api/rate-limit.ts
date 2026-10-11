import { createHash } from "node:crypto";

import { RateLimitError } from "../../errors";
import { executeQuery } from "../database/connection";

function keyHash(key: string): Buffer {
  return createHash("sha256").update(key).digest();
}

/**
 * Distributed SQL-backed limiter. The bucket is updated atomically so multiple
 * application instances cannot bypass a per-key limit by keeping local maps.
 */
export async function enforceRateLimit(
  key: string,
  limit: number,
  windowMs: number
): Promise<void> {
  if (!Number.isInteger(limit) || limit <= 0 || !Number.isInteger(windowMs) || windowMs <= 0) {
    throw new Error("Invalid rate-limit configuration.");
  }

  const hash = keyHash(key);
  const rows = await executeQuery<{ RequestCount: number }>(
    `
    DECLARE @Now DATETIME2(3) = SYSUTCDATETIME();
    DECLARE @WindowStart DATETIME2(3) = DATEADD(MILLISECOND, -@windowMs, @Now);
    DECLARE @ExpiresAt DATETIME2(3) = DATEADD(MILLISECOND, @windowMs, @Now);

    UPDATE dbo.ApiRateLimitBuckets WITH (UPDLOCK, HOLDLOCK)
    SET
      RequestCount = CASE WHEN WindowStart < @WindowStart THEN 1 ELSE RequestCount + 1 END,
      WindowStart = CASE WHEN WindowStart < @WindowStart THEN @Now ELSE WindowStart END,
      ExpiresAt = @ExpiresAt,
      UpdatedAt = @Now
    WHERE KeyHash = @keyHash;

    IF @@ROWCOUNT = 0
    BEGIN
      INSERT dbo.ApiRateLimitBuckets(KeyHash, WindowStart, RequestCount, ExpiresAt, UpdatedAt)
      VALUES(@keyHash, @Now, 1, @ExpiresAt, @Now);
    END;

    SELECT RequestCount FROM dbo.ApiRateLimitBuckets WHERE KeyHash=@keyHash;
  `,
    { keyHash: hash, windowMs }
  );

  if (Number(rows[0]?.RequestCount ?? 0) > limit) {
    throw new RateLimitError("Too many requests. Please try again later.");
  }
}

export function rateLimitKey(request: Request, scope: string, userId?: string): string {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    "unknown";
  return `${scope}:${userId ?? ip}`;
}
