import { NextResponse, type NextRequest } from "next/server";

import {
  readFiniteNumber,
  readJsonObject,
  readString,
} from "../../../server/api/request-validation";
import { getSessionUserId } from "../../../server/auth/session";
import {
  getProgressSummary,
  updateProgress,
} from "../../../server/repositories/progress/progress-repository";
import { assertSameOriginMutation } from "../../../server/security/csrf";
import { assertAllowedFields } from "../../../server/security/input";
import { refreshLearningState } from "../../../server/services/learning/learning-service";

export async function GET() {
  const userId = await getSessionUserId();
  if (!userId)
    return NextResponse.json(
      { error: { code: "UNAUTHORIZED", message: "Authentication required." } },
      { status: 401 }
    );
  return NextResponse.json(await getProgressSummary(userId), {
    headers: { "cache-control": "private, no-store" },
  });
}

export async function POST(request: NextRequest) {
  assertSameOriginMutation(request);
  const userId = await getSessionUserId();
  if (!userId)
    return NextResponse.json(
      { error: { code: "UNAUTHORIZED", message: "Authentication required." } },
      { status: 401 }
    );
  try {
    const body = await readJsonObject(request);
    assertAllowedFields(body, ["itemSlug", "itemType", "status", "score"]);
    const itemSlug = readString(body, "itemSlug", { required: true, maxLength: 200 })!;
    const itemType = readString(body, "itemType", { required: true, maxLength: 40 })!;
    const status = readString(body, "status", { required: true, maxLength: 30 })!.toUpperCase();
    if (!["algorithm", "data-structure", "challenge"].includes(itemType))
      throw new Error("Unsupported progress type.");
    if (!["NOT_STARTED", "IN_PROGRESS", "COMPLETED"].includes(status))
      throw new Error("Invalid progress status.");
    const score =
      body.score === undefined ? undefined : readFiniteNumber(body, "score", { min: 0, max: 100 });
    await updateProgress(userId, { itemSlug, itemType, status, score });
    const learning = await refreshLearningState(userId, itemSlug);
    return NextResponse.json(
      { ok: true, learning },
      { headers: { "cache-control": "private, no-store" } }
    );
  } catch (error) {
    return NextResponse.json(
      {
        error: {
          code: "PROGRESS_UPDATE_FAILED",
          message: error instanceof Error ? error.message : "Unable to update progress.",
        },
      },
      { status: 400 }
    );
  }
}
