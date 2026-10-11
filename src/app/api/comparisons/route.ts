import { NextResponse, type NextRequest } from "next/server";

import { RateLimitError } from "../../../errors";
import { enforceRateLimit, rateLimitKey } from "../../../server/api/rate-limit";
import {
  readJsonObject,
  readString,
  readStringArray,
} from "../../../server/api/request-validation";
import { getSessionUserId } from "../../../server/auth/session";
import { assertSameOriginMutation } from "../../../server/security/csrf";
import { assertAllowedFields } from "../../../server/security/input";
import { runComparison } from "../../../server/services/experiments/execution-service";
import { executeComparison } from "../../../server/services/experiments/experiment-service";

export async function POST(request: NextRequest) {
  assertSameOriginMutation(request);
  const userId = await getSessionUserId();
  try {
    try {
      const rateKey = rateLimitKey(request, "comparison", userId ?? "anonymous");
      await enforceRateLimit(rateKey, userId ? 10 : 20, 60_000);
    } catch (rateLimitErr) {
      if (rateLimitErr instanceof RateLimitError) throw rateLimitErr;
    }
    const body = await readJsonObject(request);
    assertAllowedFields(body, ["name", "algorithmSlugs", "input", "configuration"]);
    const name = body.name === undefined ? undefined : readString(body, "name", { maxLength: 200 });
    const algorithmSlugs = readStringArray(body, "algorithmSlugs", {
      min: 2,
      max: 6,
      itemMaxLength: 100,
    });
    if (new Set(algorithmSlugs).size !== algorithmSlugs.length)
      throw new Error("Algorithms cannot be duplicated.");

    if (userId) {
      const result = await executeComparison(userId, {
        name,
        algorithmSlugs,
        input: body.input,
        configuration: body.configuration as Record<string, unknown> | undefined,
      });
      return NextResponse.json(result, { status: 201 });
    }

    const results = runComparison(algorithmSlugs, body.input);
    return NextResponse.json({ results }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      {
        error: {
          code: "COMPARISON_FAILED",
          message: error instanceof Error ? error.message : "Comparison failed.",
        },
      },
      { status: 400 }
    );
  }
}
