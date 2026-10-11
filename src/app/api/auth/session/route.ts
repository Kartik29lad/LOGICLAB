import { NextResponse, type NextRequest } from "next/server";

import { getSessionUserId, rotateCurrentSession } from "@/server/auth/session";
import { findUserById } from "@/server/repositories/users/user-repository";
import { assertSameOriginMutation } from "@/server/security/csrf";

export async function GET() {
  const id = await getSessionUserId();
  if (!id)
    return NextResponse.json(
      { authenticated: false },
      { headers: { "cache-control": "private, no-store" } }
    );
  const user = await findUserById(id);
  if (!user || user.accountStatus !== "ACTIVE")
    return NextResponse.json(
      { authenticated: false },
      { headers: { "cache-control": "private, no-store" } }
    );
  return NextResponse.json(
    { authenticated: true, user: { id: user.id, email: user.email, username: user.username } },
    { headers: { "cache-control": "private, no-store" } }
  );
}

export async function POST(request: NextRequest) {
  assertSameOriginMutation(request);
  const rotated = await rotateCurrentSession();
  if (!rotated)
    return NextResponse.json(
      { ok: false, error: "Unauthenticated" },
      { status: 401, headers: { "cache-control": "no-store" } }
    );
  return NextResponse.json({ ok: true }, { headers: { "cache-control": "no-store" } });
}
