import { NextResponse, type NextRequest } from "next/server";

import { enforceRateLimit, rateLimitKey } from "../../../server/api/rate-limit";
import {
  readFiniteNumber,
  readJsonObject,
  readString,
} from "../../../server/api/request-validation";
import { assertSameOriginMutation } from "../../../server/security/csrf";
import { assertAllowedFields } from "../../../server/security/input";
import {
  activitySummary,
  logActivity,
  requireActivityUser,
} from "../../../server/services/activity/activity-service";

export async function GET(request: Request) {
  try {
    const raw = new URL(request.url).searchParams.get("days");
    const days = raw === null ? 30 : Number(raw);
    if (!Number.isInteger(days) || days < 1 || days > 365)
      throw new Error("Activity days must be between 1 and 365.");
    return NextResponse.json(await activitySummary(await requireActivityUser(), days), {
      headers: { "cache-control": "private, no-store" },
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: {
          code: "ACTIVITY_READ_FAILED",
          message: error instanceof Error ? error.message : "Unable to load activity.",
        },
      },
      { status: 400 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    assertSameOriginMutation(request);
    const userId = await requireActivityUser();
    await enforceRateLimit(rateLimitKey(request, "activity", userId), 120, 60_000);
    const body = await readJsonObject(request);
    assertAllowedFields(body, [
      "activityType",
      "contentItemId",
      "contentSlug",
      "experimentId",
      "comparisonId",
      "durationSeconds",
      "metadata",
    ]);
    const activityType = readString(body, "activityType", { required: true, maxLength: 40 })!;
    const contentItemId =
      body.contentItemId === undefined
        ? undefined
        : readString(body, "contentItemId", { maxLength: 64 });
    const contentSlug =
      body.contentSlug === undefined
        ? undefined
        : readString(body, "contentSlug", { maxLength: 200 });
    const experimentId =
      body.experimentId === undefined
        ? undefined
        : readString(body, "experimentId", { maxLength: 64 });
    const comparisonId =
      body.comparisonId === undefined
        ? undefined
        : readString(body, "comparisonId", { maxLength: 64 });
    const durationSeconds =
      body.durationSeconds === undefined
        ? undefined
        : readFiniteNumber(body, "durationSeconds", { min: 0, max: 86400, integer: true });
    await logActivity(userId, {
      activityType,
      contentItemId,
      contentSlug,
      experimentId,
      comparisonId,
      durationSeconds,
      metadata: body.metadata,
    });
    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      {
        error: {
          code: "ACTIVITY_CREATE_FAILED",
          message: error instanceof Error ? error.message : "Unable to record activity.",
        },
      },
      { status: 400 }
    );
  }
}
