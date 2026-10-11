import { NextResponse, type NextRequest } from "next/server";

import { enforceRateLimit, rateLimitKey } from "../../../../server/api/rate-limit";
import { assertSameOriginMutation } from "../../../../server/security/csrf";
import {
  removeBookmark,
  requireActivityUser,
} from "../../../../server/services/activity/activity-service";

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ bookmarkId: string }> }
) {
  try {
    assertSameOriginMutation(request);
    const userId = await requireActivityUser();
    await enforceRateLimit(rateLimitKey(request, "bookmark-delete", userId), 60, 60_000);
    const { bookmarkId } = await context.params;
    if (!/^[0-9a-fA-F-]{20,64}$/.test(bookmarkId)) throw new Error("Invalid bookmark identifier.");
    await removeBookmark(userId, bookmarkId);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      {
        error: {
          code: "BOOKMARK_DELETE_FAILED",
          message: error instanceof Error ? error.message : "Unable to delete bookmark.",
        },
      },
      { status: 400 }
    );
  }
}
