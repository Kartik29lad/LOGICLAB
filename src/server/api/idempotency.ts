import crypto from "node:crypto";

import { ConflictError, ValidationError } from "../../errors";
import { executeQuery } from "../database/connection";

export function getIdempotencyKey(request: Request): string | undefined {
  const key = request.headers.get("idempotency-key")?.trim();
  if (!key) return undefined;
  if (key.length < 8 || key.length > 128)
    throw new ValidationError("Idempotency-Key must be between 8 and 128 characters.");
  return key;
}

export async function claimIdempotency(
  userId: string,
  route: string,
  key: string,
  requestHash: string
): Promise<{ replay: false } | { replay: true; statusCode: number; responseJson: string }> {
  const existing = await executeQuery<{
    RequestHash: string;
    StatusCode: number;
    ResponseJson: string;
  }>(
    `SELECT RequestHash,StatusCode,ResponseJson FROM dbo.ApiIdempotencyKeys WHERE UserId=@userId AND Route=@route AND IdempotencyKey=@key`,
    { userId, route, key }
  );
  if (existing[0]) {
    if (existing[0].RequestHash !== requestHash)
      throw new ConflictError("The idempotency key was already used with a different request.");
    if (existing[0].StatusCode === 0)
      throw new ConflictError("An identical request is already being processed.");
    return {
      replay: true,
      statusCode: existing[0].StatusCode,
      responseJson: existing[0].ResponseJson,
    };
  }
  await executeQuery(
    `INSERT dbo.ApiIdempotencyKeys(UserId,Route,IdempotencyKey,RequestHash,StatusCode,ResponseJson) VALUES(@userId,@route,@key,@hash,0,@response)`,
    { userId, route, key, hash: requestHash, response: "" }
  );
  return { replay: false };
}

export async function completeIdempotency(
  userId: string,
  route: string,
  key: string,
  statusCode: number,
  response: unknown
): Promise<void> {
  await executeQuery(
    `UPDATE dbo.ApiIdempotencyKeys SET StatusCode=@statusCode,ResponseJson=@response,UpdatedAt=SYSUTCDATETIME() WHERE UserId=@userId AND Route=@route AND IdempotencyKey=@key`,
    { userId, route, key, statusCode, response: JSON.stringify(response) }
  );
}

export function hashRequest(value: unknown): string {
  return crypto.createHash("sha256").update(JSON.stringify(value)).digest("hex");
}
