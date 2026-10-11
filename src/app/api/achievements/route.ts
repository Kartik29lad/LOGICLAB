import { NextResponse } from "next/server";

import {
  getAchievements,
  requireLearningUser,
} from "../../../server/services/learning/learning-service";

export async function GET() {
  try {
    return NextResponse.json({ achievements: await getAchievements(await requireLearningUser()) });
  } catch (error) {
    return NextResponse.json(
      {
        error: {
          code: "ACHIEVEMENT_REQUEST_FAILED",
          message: error instanceof Error ? error.message : "Unable to load achievements.",
        },
      },
      { status: 400 }
    );
  }
}
