import { NextResponse, type NextRequest } from "next/server";

import { enforceRateLimit, rateLimitKey } from "../../../server/api/rate-limit";
import { readJsonObject, readString } from "../../../server/api/request-validation";
import { assertSameOriginMutation } from "../../../server/security/csrf";
import { assertAllowedFields, readStrictBoolean } from "../../../server/security/input";
import {
  favorite,
  favorites,
  requireActivityUser,
} from "../../../server/services/activity/activity-service";

export async function GET() {
  try {
    return NextResponse.json(
      { items: await favorites(await requireActivityUser()) },
      { headers: { "cache-control": "private, no-store" } }
    );
  } catch (error) {
    return NextResponse.json(
      {
        error: {
          code: "FAVORITES_READ_FAILED",
          message: error instanceof Error ? error.message : "Unable to load favorites.",
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
    await enforceRateLimit(rateLimitKey(request, "favorite", userId), 60, 60_000);
    const body = await readJsonObject(request);
    assertAllowedFields(body, ["slug", "favorite"]);
    const slug = readString(body, "slug", { required: true, maxLength: 200 })!;
    const value = readStrictBoolean(body, "favorite", true);
    await favorite(userId, slug, value);
    return NextResponse.json({ ok: true, favorite: value });
  } catch (error) {
    return NextResponse.json(
      {
        error: {
          code: "FAVORITE_UPDATE_FAILED",
          message: error instanceof Error ? error.message : "Unable to update favorite.",
        },
      },
      { status: 400 }
    );
  }
}
