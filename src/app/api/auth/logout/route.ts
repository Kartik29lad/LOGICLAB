import { NextResponse, type NextRequest } from "next/server";

import { revokeCurrentSession } from "@/server/auth/session";
import { assertSameOriginMutation } from "@/server/security/csrf";

export async function POST(request: NextRequest) {
  assertSameOriginMutation(request);
  await revokeCurrentSession();
  return NextResponse.json({ ok: true }, { headers: { "cache-control": "no-store" } });
}
