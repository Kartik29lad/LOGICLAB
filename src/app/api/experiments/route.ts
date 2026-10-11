import { NextRequest, NextResponse } from "next/server";

import { handleApiError } from "../../../server/api/error-handler";
import {
  claimIdempotency,
  completeIdempotency,
  getIdempotencyKey,
  hashRequest,
} from "../../../server/api/idempotency";
import { enforceRateLimit, rateLimitKey } from "../../../server/api/rate-limit";
import { createRequestContext } from "../../../server/api/request-context";
import {
  readFiniteNumber,
  readJsonObject,
  readString,
  readStringArray,
} from "../../../server/api/request-validation";
import { withApiRoute } from "../../../server/api/route-handler";
import { assertSameOriginMutation } from "../../../server/security/csrf";
import { assertAllowedFields } from "../../../server/security/input";
import { requireUserId } from "../../../server/services/auth/route-auth";
import {
  executeAndSaveExperiment,
  findExperiments,
} from "../../../server/services/experiments/experiment-service";

export async function GET(request: NextRequest) {
  return withApiRoute(request, async () => ({
    items: await findExperiments(await requireUserId()),
  }));
}

export async function POST(request: NextRequest) {
  const context = createRequestContext(request);
  try {
    assertSameOriginMutation(request);
    const userId = await requireUserId();
    await enforceRateLimit(rateLimitKey(request, "experiment-create", userId), 10, 60_000);
    const body = await readJsonObject(request);
    assertAllowedFields(body, [
      "title",
      "description",
      "algorithmSlugs",
      "input",
      "configuration",
      "seed",
    ]);
    const title = readString(body, "title", { required: true, maxLength: 200 })!;
    const description = readString(body, "description", { maxLength: 2_000 });
    const algorithmSlugs = readStringArray(body, "algorithmSlugs", {
      min: 1,
      max: 6,
      itemMaxLength: 80,
    });
    const seed = readFiniteNumber(body, "seed", { integer: true });
    const key = getIdempotencyKey(request);
    const requestHash = hashRequest({
      title,
      description,
      algorithmSlugs,
      input: body.input,
      configuration: body.configuration,
      seed,
    });
    if (key) {
      const claim = await claimIdempotency(userId, "/api/experiments", key, requestHash);
      if (claim.replay)
        return new NextResponse(claim.responseJson, {
          status: claim.statusCode,
          headers: { "content-type": "application/json", "x-request-id": context.requestId },
        });
    }
    const result = await executeAndSaveExperiment(userId, {
      title,
      description,
      algorithmSlugs,
      input: body.input,
      configuration: body.configuration as Record<string, unknown> | undefined,
      seed,
    });
    const response = {
      experimentId: result.experiment.experimentId,
      results: result.results,
      reproducible: result.reproducible,
    };
    if (key) await completeIdempotency(userId, "/api/experiments", key, 201, response);
    const nextResponse = NextResponse.json(response, { status: 201 });
    nextResponse.headers.set("x-request-id", context.requestId);
    return nextResponse;
  } catch (error) {
    return handleApiError(error, context.requestId);
  }
}
