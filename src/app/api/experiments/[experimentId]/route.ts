import { NextResponse } from "next/server";

import { getSessionUserId } from "../../../../server/auth/session";
import { findExperiment } from "../../../../server/services/experiments/experiment-service";

export async function GET(_: Request, context: { params: Promise<{ experimentId: string }> }) {
  const userId = await getSessionUserId();
  if (!userId)
    return NextResponse.json(
      { error: { code: "UNAUTHORIZED", message: "Authentication required." } },
      { status: 401 }
    );
  const { experimentId } = await context.params;
  const experiment = await findExperiment(userId, experimentId);
  if (!experiment)
    return NextResponse.json(
      { error: { code: "NOT_FOUND", message: "Experiment not found." } },
      { status: 404 }
    );
  return NextResponse.json({ experiment });
}
