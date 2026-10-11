import { NextRequest } from "next/server";

import { withApiRoute } from "../../../../server/api/route-handler";
import { getDataStructure } from "../../../../server/services/content/content-service";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ structureSlug: string }> }
) {
  return withApiRoute(request, async () => getDataStructure((await context.params).structureSlug), {
    cacheControl: "public, max-age=60, s-maxage=300, stale-while-revalidate=600",
  });
}
