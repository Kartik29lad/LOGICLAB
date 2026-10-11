import { NextRequest } from "next/server";

import { enforceRateLimit, rateLimitKey } from "@/server/api/rate-limit";
import { readJsonObject, readString } from "@/server/api/request-validation";
import { withApiRoute } from "@/server/api/route-handler";
import { assertAllowedFields } from "@/server/security/input";
import { register } from "@/server/services/auth/auth-service";

export async function POST(request: NextRequest) {
  return withApiRoute(
    request,
    async () => {
      await enforceRateLimit(rateLimitKey(request, "register"), 5, 60 * 60_000);
      const body = await readJsonObject(request);
      assertAllowedFields(body, ["email", "username", "password"]);
      const email = readString(body, "email", { required: true, maxLength: 320 })!;
      const username = readString(body, "username", { required: true, maxLength: 50 })!;
      const password = readString(body, "password", { required: true, maxLength: 256 })!;
      return { user: await register({ email, username, password }) };
    },
    { statusCode: 201 }
  );
}
