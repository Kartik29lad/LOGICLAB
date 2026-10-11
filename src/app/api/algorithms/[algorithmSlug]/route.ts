import { NextRequest } from "next/server";

import { withApiRoute } from "../../../../server/api/route-handler";
import { getAlgorithm } from "../../../../server/services/content/content-service";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ algorithmSlug: string }> }
) {
  return withApiRoute(request, async () => getAlgorithm((await context.params).algorithmSlug), {
    cacheControl: "public, max-age=60, s-maxage=300, stale-while-revalidate=600",
  });
}
