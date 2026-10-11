import { NextRequest, NextResponse } from "next/server";

import { getChallengeDefinition } from "../../../../../content/challenges";
import { evaluateChallenge } from "../../../../../core/challenges";
import { RateLimitError, ValidationError } from "../../../../../errors";
import { handleApiError } from "../../../../../server/api/error-handler";
import {
  claimIdempotency,
  completeIdempotency,
  getIdempotencyKey,
  hashRequest,
} from "../../../../../server/api/idempotency";
import { enforceRateLimit, rateLimitKey } from "../../../../../server/api/rate-limit";
import { createRequestContext } from "../../../../../server/api/request-context";
import {
  readFiniteNumber,
  readJsonObject,
  readString,
} from "../../../../../server/api/request-validation";
import { getSessionUserId } from "../../../../../server/auth/session";
import { SqlChallengeAttemptRepository } from "../../../../../server/repositories/challenges/sql-challenge-attempt-repository";
import { assertSameOriginMutation } from "../../../../../server/security/csrf";
import { assertAllowedFields } from "../../../../../server/security/input";
import { submitChallenge } from "../../../../../server/services/challenges/challenge-service";

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ challengeId: string }> }
) {
  const requestContext = createRequestContext(request);
  try {
    assertSameOriginMutation(request);
    const userId = await getSessionUserId();
    try {
      const rateKey = rateLimitKey(request, "challenge-submit", userId ?? "anonymous");
      await enforceRateLimit(rateKey, 20, 60_000);
    } catch (rateLimitErr) {
      if (rateLimitErr instanceof RateLimitError) throw rateLimitErr;
    }
    const { challengeId } = await context.params;
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(challengeId))
      throw new ValidationError("Invalid challenge id.");
    const body = await readJsonObject(request);
    assertAllowedFields(body, ["answer", "hintsUsed", "timeSpentMs"]);
    const answer = readString(body, "answer", { required: true, maxLength: 2_000 })!;
    const hintsUsed = readFiniteNumber(body, "hintsUsed", { min: 0, max: 10, integer: true }) ?? 0;
    const timeSpentMs = readFiniteNumber(body, "timeSpentMs", {
      min: 0,
      max: 86_400_000,
      integer: true,
    });

    if (!userId) {
      const definition = getChallengeDefinition(challengeId);
      if (!definition) throw new ValidationError("Challenge not found.");
      const evaluation = evaluateChallenge(definition, {
        challengeId,
        answer,
        hintsUsed,
        timeSpentMs,
      });
      const response = NextResponse.json({ evaluation, persisted: false }, { status: 200 });
      response.headers.set("x-request-id", requestContext.requestId);
      return response;
    }

    const key = getIdempotencyKey(request);
    const requestHash = hashRequest({ challengeId, answer, hintsUsed, timeSpentMs });
    if (key) {
      const claim = await claimIdempotency(
        userId,
        `/api/challenges/${challengeId}/submit`,
        key,
        requestHash
      );
      if (claim.replay)
        return new NextResponse(claim.responseJson, {
          status: claim.statusCode,
          headers: { "content-type": "application/json", "x-request-id": requestContext.requestId },
        });
    }
    const result = await submitChallenge(
      { challengeId, answer, hintsUsed, timeSpentMs },
      { userId, repository: new SqlChallengeAttemptRepository() }
    );
    if (key)
      await completeIdempotency(userId, `/api/challenges/${challengeId}/submit`, key, 200, result);
    const response = NextResponse.json(result, { status: 200 });
    response.headers.set("x-request-id", requestContext.requestId);
    return response;
  } catch (error) {
    return handleApiError(error, requestContext.requestId);
  }
}
