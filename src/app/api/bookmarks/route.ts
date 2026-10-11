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
  addBookmark,
  bookmarks,
  requireActivityUser,
} from "../../../server/services/activity/activity-service";

export async function GET() {
  try {
    return NextResponse.json(
      { items: await bookmarks(await requireActivityUser()) },
      { headers: { "cache-control": "private, no-store" } }
    );
  } catch (error) {
    return NextResponse.json(
      {
        error: {
          code: "BOOKMARKS_READ_FAILED",
          message: error instanceof Error ? error.message : "Unable to load bookmarks.",
        },
      },
      { status: 401 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    assertSameOriginMutation(request);
    const userId = await requireActivityUser();
    await enforceRateLimit(rateLimitKey(request, "bookmark", userId), 60, 60_000);
    const body = await readJsonObject(request);
    assertAllowedFields(body, ["slug", "experimentId", "stepNumber", "note"]);
    const slug = body.slug === undefined ? undefined : readString(body, "slug", { maxLength: 200 });
    const experimentId =
      body.experimentId === undefined
        ? undefined
        : readString(body, "experimentId", { maxLength: 64 });
    const stepNumber =
      body.stepNumber === undefined
        ? undefined
        : readFiniteNumber(body, "stepNumber", { min: 0, max: 100000, integer: true });
    const note =
      body.note === undefined ? undefined : readString(body, "note", { maxLength: 2000 });
    await addBookmark(userId, { slug, experimentId, stepNumber, note });
    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      {
        error: {
          code: "BOOKMARK_CREATE_FAILED",
          message: error instanceof Error ? error.message : "Unable to create bookmark.",
        },
      },
      { status: 400 }
    );
  }
}
