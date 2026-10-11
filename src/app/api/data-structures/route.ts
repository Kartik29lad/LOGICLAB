import { NextRequest } from "next/server";

import { withApiRoute } from "../../../server/api/route-handler";
import { listDataStructures } from "../../../server/services/content/content-service";

export async function GET(request: NextRequest) {
  return withApiRoute(request, async () => ({ items: listDataStructures() }), {
    cacheControl: "public, max-age=60, s-maxage=300, stale-while-revalidate=600",
  });
}
