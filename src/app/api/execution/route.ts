import { NextRequest } from "next/server";

import { enforceRateLimit, rateLimitKey } from "../../../server/api/rate-limit";
import {
  readFiniteNumber,
  readJsonObject,
  readString,
} from "../../../server/api/request-validation";
import { withApiRoute } from "../../../server/api/route-handler";
import { executeAlgorithm } from "../../../server/execution/execution-service";
import { assertAllowedFields } from "../../../server/security/input";
import { requireUserId } from "../../../server/services/auth/route-auth";

export async function POST(request: NextRequest) {
  return withApiRoute(request, async ({ request: req }) => {
    const userId = await requireUserId();
    await enforceRateLimit(rateLimitKey(req, "execution", userId), 30, 60_000);
    const body = await readJsonObject(req);
    assertAllowedFields(body, [
      "algorithmSlug",
      "input",
      "target",
      "startNodeId",
      "targetNodeId",
      "maxSteps",
    ]);
    const algorithmSlug = readString(body, "algorithmSlug", { required: true, maxLength: 80 })!;
    const maxSteps = readFiniteNumber(body, "maxSteps", { min: 1, max: 25_000, integer: true });
    const result = executeAlgorithm({
      algorithmSlug,
      input: body.input,
      target: typeof body.target === "number" ? body.target : undefined,
      startNodeId: typeof body.startNodeId === "string" ? body.startNodeId : undefined,
      targetNodeId: typeof body.targetNodeId === "string" ? body.targetNodeId : undefined,
      maxSteps,
    });
    return result;
  });
}
