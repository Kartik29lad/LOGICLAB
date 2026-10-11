import { NextRequest } from "next/server";

import { enforceRateLimit, rateLimitKey } from "@/server/api/rate-limit";
import { readJsonObject, readString } from "@/server/api/request-validation";
import { withApiRoute } from "@/server/api/route-handler";
import { assertAllowedFields } from "@/server/security/input";
import { login } from "@/server/services/auth/auth-service";

export async function POST(request: NextRequest) {
  return withApiRoute(request, async () => {
    await enforceRateLimit(rateLimitKey(request, "login"), 10, 60_000);
    const body = await readJsonObject(request);
    assertAllowedFields(body, ["email", "password"]);
    const email = readString(body, "email", { required: true, maxLength: 320 })!;
    const password = readString(body, "password", { required: true, maxLength: 256 })!;
    const user = await login({ email, password });
    return { user };
  });
}
