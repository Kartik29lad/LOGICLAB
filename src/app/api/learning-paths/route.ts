import { NextResponse } from "next/server";

import {
  getLearningPath,
  listLearningPaths,
  requireLearningUser,
} from "../../../server/services/learning/learning-service";

export async function GET(request: Request) {
  try {
    const userId = await requireLearningUser();
    const slug = new URL(request.url).searchParams.get("slug");
    return NextResponse.json(
      slug ? await getLearningPath(userId, slug) : { paths: await listLearningPaths(userId) }
    );
  } catch (error) {
    return NextResponse.json(
      {
        error: {
          code: "LEARNING_PATH_REQUEST_FAILED",
          message: error instanceof Error ? error.message : "Unable to load learning paths.",
        },
      },
      { status: 400 }
    );
  }
}
