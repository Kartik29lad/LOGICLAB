import { NextResponse, type NextRequest } from "next/server";

import { enforceRateLimit, rateLimitKey } from "../../../server/api/rate-limit";
import { readJsonObject, readString } from "../../../server/api/request-validation";
import { assertSameOriginMutation } from "../../../server/security/csrf";
import { assertAllowedFields } from "../../../server/security/input";
import {
  history,
  logHistory,
  requireActivityUser,
} from "../../../server/services/activity/activity-service";

export async function GET(request: Request) {
  try {
    const raw = new URL(request.url).searchParams.get("limit");
    const limit = raw === null ? 50 : Number(raw);
    if (!Number.isInteger(limit) || limit < 1 || limit > 100)
      throw new Error("History limit must be between 1 and 100.");
    return NextResponse.json(
      { items: await history(await requireActivityUser(), limit) },
      { headers: { "cache-control": "private, no-store" } }
    );
  } catch (error) {
    return NextResponse.json(
      {
        error: {
          code: "HISTORY_READ_FAILED",
          message: error instanceof Error ? error.message : "Unable to load history.",
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
    await enforceRateLimit(rateLimitKey(request, "history", userId), 60, 60_000);
    const body = await readJsonObject(request);
    assertAllowedFields(body, [
      "actionType",
      "contentItemId",
      "contentSlug",
      "experimentId",
      "comparisonId",
      "contentVersionId",
      "inputData",
      "resultData",
      "executionMetrics",
    ]);
    const actionType = readString(body, "actionType", {
      required: true,
      maxLength: 30,
    })!.toUpperCase();
    if (
      ![
        "VIEW",
        "START",
        "EXECUTE",
        "COMPLETE",
        "PRACTICE",
        "PREDICT",
        "COMPARE",
        "OPEN",
        "SAVE",
      ].includes(actionType)
    )
      throw new Error("Invalid history action type.");
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
    const contentVersionId =
      body.contentVersionId === undefined
        ? undefined
        : readString(body, "contentVersionId", { maxLength: 64 });
    await logHistory(userId, {
      actionType: actionType as
        | "VIEW"
        | "START"
        | "EXECUTE"
        | "COMPLETE"
        | "PRACTICE"
        | "PREDICT"
        | "COMPARE"
        | "OPEN"
        | "SAVE",
      contentItemId,
      contentSlug,
      experimentId,
      comparisonId,
      contentVersionId,
      inputData: body.inputData,
      resultData: body.resultData,
      executionMetrics: body.executionMetrics,
    });
    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      {
        error: {
          code: "HISTORY_CREATE_FAILED",
          message: error instanceof Error ? error.message : "Unable to record history.",
        },
      },
      { status: 400 }
    );
  }
}
