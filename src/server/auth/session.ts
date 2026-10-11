import { createHash, randomBytes } from "node:crypto";
import { cookies } from "next/headers";

import { parseEnvironment } from "../../config/env";
import { executeQuery } from "../database/connection";

export const SESSION_COOKIE =
  process.env.NODE_ENV === "production" ? "__Host-logiclab_session" : "logiclab_session";

function hashToken(token: string): Buffer {
  return createHash("sha256").update(token).digest();
}

export async function createSession(userId: string): Promise<void> {
  const token = randomBytes(32).toString("base64url");
  const hash = hashToken(token);
  const seconds = parseEnvironment().security.sessionDurationSeconds;
  await executeQuery(
    `INSERT INTO dbo.UserSessions (UserId, SessionTokenHash, ExpiresAt) VALUES (@userId, @tokenHash, DATEADD(SECOND, @seconds, SYSUTCDATETIME()))`,
    { userId, tokenHash: hash, seconds }
  );
  const store = await cookies();
  store.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: seconds,
  });
}

export async function getSessionUserId(): Promise<string | null> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  const rows = await executeQuery<{ UserId: string }>(
    `SELECT TOP 1 s.UserId FROM dbo.UserSessions s JOIN dbo.Users u ON u.UserId=s.UserId WHERE s.SessionTokenHash = @tokenHash AND s.RevokedAt IS NULL AND s.ExpiresAt > SYSUTCDATETIME() AND u.AccountStatus = 'ACTIVE'`,
    { tokenHash: hashToken(token) }
  );
  if (!rows[0]) return null;
  await executeQuery(
    `UPDATE dbo.UserSessions SET LastSeenAt = SYSUTCDATETIME() WHERE SessionTokenHash = @tokenHash AND RevokedAt IS NULL`,
    { tokenHash: hashToken(token) }
  );
  return rows[0].UserId;
}

export async function revokeCurrentSession(): Promise<void> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (token)
    await executeQuery(
      `UPDATE dbo.UserSessions SET RevokedAt = SYSUTCDATETIME(), RevocationReason = 'LOGOUT' WHERE SessionTokenHash = @tokenHash AND RevokedAt IS NULL`,
      { tokenHash: hashToken(token) }
    );
  store.delete(SESSION_COOKIE);
}

export async function rotateCurrentSession(): Promise<boolean> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (!token) return false;
  const tokenHash = hashToken(token);
  const rows = await executeQuery<{ UserId: string }>(
    `SELECT TOP 1 UserId FROM dbo.UserSessions WHERE SessionTokenHash=@tokenHash AND RevokedAt IS NULL AND ExpiresAt>SYSUTCDATETIME()`,
    { tokenHash }
  );
  if (!rows[0]) {
    store.delete(SESSION_COOKIE);
    return false;
  }
  await executeQuery(
    `UPDATE dbo.UserSessions SET RevokedAt=SYSUTCDATETIME(), RevocationReason='ROTATED' WHERE SessionTokenHash=@tokenHash AND RevokedAt IS NULL`,
    { tokenHash }
  );
  await createSession(rows[0].UserId);
  return true;
}
