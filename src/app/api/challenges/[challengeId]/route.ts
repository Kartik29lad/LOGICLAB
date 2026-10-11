import { NextRequest } from "next/server";

import { getChallengeDefinition } from "../../../../content/challenges";
import { NotFoundError } from "../../../../errors";
import { withApiRoute } from "../../../../server/api/route-handler";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ challengeId: string }> }
) {
  return withApiRoute(request, async () => {
    const challenge = getChallengeDefinition((await context.params).challengeId);
    if (!challenge) throw new NotFoundError("Challenge not found.");
    return { challenge };
  });
}
