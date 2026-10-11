import { executeQuery } from "../../database/connection";

export type ActivityAction =
  "VIEW" | "START" | "EXECUTE" | "COMPLETE" | "PRACTICE" | "PREDICT" | "COMPARE" | "OPEN" | "SAVE";

export interface HistoryInput {
  actionType: ActivityAction;
  contentItemId?: string;
  experimentId?: string;
  comparisonId?: string;
  contentVersionId?: string;
  inputData?: unknown;
  resultData?: unknown;
  executionMetrics?: unknown;
}

export interface ActivityInput {
  activityType: string;
  contentItemId?: string;
  experimentId?: string;
  comparisonId?: string;
  durationSeconds?: number;
  metadata?: unknown;
}

const json = (value: unknown) => (value === undefined ? null : JSON.stringify(value));

export async function resolveContentItem(slug: string) {
  const rows = await executeQuery<{ ContentItemId: string; ContentVersionId: string }>(
    `SELECT TOP 1 ci.ContentItemId, cv.ContentVersionId FROM dbo.ContentItems ci LEFT JOIN dbo.ContentVersions cv ON cv.ContentItemId=ci.ContentItemId AND cv.IsCurrent=1 WHERE ci.Slug=@slug AND ci.IsActive=1`,
    { slug }
  );
  return rows[0] ?? null;
}

export async function listFavorites(userId: string) {
  return executeQuery(
    `SELECT f.FavoriteId, ci.Slug, ci.ContentType, ci.DisplayName, f.CreatedAt FROM dbo.Favorites f JOIN dbo.ContentItems ci ON ci.ContentItemId=f.ContentItemId WHERE f.UserId=@userId ORDER BY f.CreatedAt DESC`,
    { userId }
  );
}

export async function setFavorite(userId: string, slug: string, favorite: boolean) {
  const rows = await executeQuery<{ ContentItemId: string }>(
    `SELECT TOP 1 ContentItemId FROM dbo.ContentItems WHERE Slug=@slug AND IsActive=1`,
    { slug }
  );
  if (!rows[0]) throw new Error("Content not found.");
  if (favorite) {
    await executeQuery(
      `IF NOT EXISTS (SELECT 1 FROM dbo.Favorites WHERE UserId=@userId AND ContentItemId=@contentItemId) INSERT dbo.Favorites(UserId,ContentItemId) VALUES(@userId,@contentItemId)`,
      { userId, contentItemId: rows[0].ContentItemId }
    );
  } else {
    await executeQuery(
      `DELETE dbo.Favorites WHERE UserId=@userId AND ContentItemId=@contentItemId`,
      { userId, contentItemId: rows[0].ContentItemId }
    );
  }
}

export async function listBookmarks(userId: string) {
  return executeQuery(
    `SELECT b.BookmarkId,b.ContentItemId,b.ExperimentId,b.StepNumber,b.Note,b.CreatedAt,b.UpdatedAt,ci.Slug,ci.ContentType,ci.DisplayName FROM dbo.Bookmarks b LEFT JOIN dbo.ContentItems ci ON ci.ContentItemId=b.ContentItemId WHERE b.UserId=@userId ORDER BY b.CreatedAt DESC`,
    { userId }
  );
}

export async function createBookmark(
  userId: string,
  input: { slug?: string; experimentId?: string; stepNumber?: number; note?: string }
) {
  if (Boolean(input.slug) === Boolean(input.experimentId))
    throw new Error("Provide exactly one bookmark target.");
  let contentItemId: string | null = null;
  if (input.slug) {
    const rows = await executeQuery<{ ContentItemId: string }>(
      `SELECT TOP 1 ContentItemId FROM dbo.ContentItems WHERE Slug=@slug AND IsActive=1`,
      { slug: input.slug }
    );
    if (!rows[0]) throw new Error("Content not found.");
    contentItemId = rows[0].ContentItemId;
  } else {
    const rows = await executeQuery<{ ExperimentId: string }>(
      `SELECT TOP 1 ExperimentId FROM dbo.Experiments WHERE ExperimentId=@experimentId AND UserId=@userId`,
      { experimentId: input.experimentId, userId }
    );
    if (!rows[0]) throw new Error("Experiment not found.");
  }
  const step = input.stepNumber === undefined ? null : input.stepNumber;
  if (step !== null && (!Number.isInteger(step) || step < 0))
    throw new Error("Step number must be a non-negative integer.");
  await executeQuery(
    `INSERT dbo.Bookmarks(UserId,ContentItemId,ExperimentId,StepNumber,Note) VALUES(@userId,@contentItemId,@experimentId,@step,@note)`,
    {
      userId,
      contentItemId,
      experimentId: input.experimentId ?? null,
      step,
      note: input.note?.trim() || null,
    }
  );
}

export async function deleteBookmark(userId: string, bookmarkId: string) {
  await executeQuery(`DELETE dbo.Bookmarks WHERE BookmarkId=@bookmarkId AND UserId=@userId`, {
    bookmarkId,
    userId,
  });
}

export async function listHistory(userId: string, limit = 50) {
  const safeLimit = Math.min(Math.max(Math.trunc(limit), 1), 100);
  return executeQuery(
    `SELECT TOP ${safeLimit} h.HistoryId,h.ActionType,h.CreatedAt,h.ContentItemId,h.ExperimentId,h.ComparisonId,ci.Slug,ci.ContentType,ci.DisplayName FROM dbo.History h LEFT JOIN dbo.ContentItems ci ON ci.ContentItemId=h.ContentItemId WHERE h.UserId=@userId ORDER BY h.CreatedAt DESC`,
    { userId }
  );
}

export async function recordHistory(userId: string, input: HistoryInput) {
  const targetCount = [input.contentItemId, input.experimentId, input.comparisonId].filter(
    Boolean
  ).length;
  if (targetCount !== 1) throw new Error("History requires exactly one target.");
  await assertHistoryTargetOwnership(userId, input);
  await executeQuery(
    `INSERT dbo.History(UserId,ContentItemId,ExperimentId,ComparisonId,ContentVersionId,ActionType,InputData,ResultData,ExecutionMetrics) VALUES(@userId,@contentItemId,@experimentId,@comparisonId,@contentVersionId,@actionType,@inputData,@resultData,@executionMetrics)`,
    {
      userId,
      contentItemId: input.contentItemId ?? null,
      experimentId: input.experimentId ?? null,
      comparisonId: input.comparisonId ?? null,
      contentVersionId: input.contentVersionId ?? null,
      actionType: input.actionType,
      inputData: json(input.inputData),
      resultData: json(input.resultData),
      executionMetrics: json(input.executionMetrics),
    }
  );
}

export async function recordActivity(userId: string, input: ActivityInput) {
  const targets = [input.contentItemId, input.experimentId, input.comparisonId].filter(
    Boolean
  ).length;
  if (targets > 1) throw new Error("Activity can reference at most one target.");
  await assertActivityTargetOwnership(userId, input);
  const duration =
    input.durationSeconds === undefined ? null : Math.max(0, Math.trunc(input.durationSeconds));
  await executeQuery(
    `INSERT dbo.UserActivity(UserId,ActivityDate,ActivityType,ContentItemId,ExperimentId,ComparisonId,DurationSeconds,Metadata) VALUES(@userId,CONVERT(date,SYSUTCDATETIME()),@activityType,@contentItemId,@experimentId,@comparisonId,@duration,@metadata); MERGE dbo.UserDailyActivity AS d USING (SELECT @userId UserId, CONVERT(date,SYSUTCDATETIME()) ActivityDate) AS s ON d.UserId=s.UserId AND d.ActivityDate=s.ActivityDate WHEN MATCHED THEN UPDATE SET ActivityCount=d.ActivityCount+1, LearningMinutes=d.LearningMinutes+CASE WHEN @duration IS NULL THEN 0 ELSE @duration/60 END, AlgorithmsCompleted=d.AlgorithmsCompleted+CASE WHEN @activityType='ALGORITHM_COMPLETED' THEN 1 ELSE 0 END, DataStructuresCompleted=d.DataStructuresCompleted+CASE WHEN @activityType='DATA_STRUCTURE_COMPLETED' THEN 1 ELSE 0 END, ChallengesCompleted=d.ChallengesCompleted+CASE WHEN @activityType='CHALLENGE_COMPLETED' THEN 1 ELSE 0 END, UpdatedAt=SYSUTCDATETIME() WHEN NOT MATCHED THEN INSERT(UserId,ActivityDate,ActivityCount,LearningMinutes,AlgorithmsCompleted,DataStructuresCompleted,ChallengesCompleted) VALUES(@userId,s.ActivityDate,1,CASE WHEN @duration IS NULL THEN 0 ELSE @duration/60 END,CASE WHEN @activityType='ALGORITHM_COMPLETED' THEN 1 ELSE 0 END,CASE WHEN @activityType='DATA_STRUCTURE_COMPLETED' THEN 1 ELSE 0 END,CASE WHEN @activityType='CHALLENGE_COMPLETED' THEN 1 ELSE 0 END);`,
    {
      userId,
      activityType: input.activityType.trim().slice(0, 40),
      contentItemId: input.contentItemId ?? null,
      experimentId: input.experimentId ?? null,
      comparisonId: input.comparisonId ?? null,
      duration,
      metadata: json(input.metadata),
    }
  );
}

async function assertHistoryTargetOwnership(userId: string, input: HistoryInput): Promise<void> {
  if (input.experimentId) {
    const rows = await executeQuery(
      `SELECT TOP 1 ExperimentId FROM dbo.Experiments WHERE ExperimentId=@id AND UserId=@userId`,
      { id: input.experimentId, userId }
    );
    if (!rows[0]) throw new Error("Experiment not found.");
  }
  if (input.comparisonId) {
    const rows = await executeQuery(
      `SELECT TOP 1 ComparisonId FROM dbo.Comparisons WHERE ComparisonId=@id AND UserId=@userId`,
      { id: input.comparisonId, userId }
    );
    if (!rows[0]) throw new Error("Comparison not found.");
  }
  if (input.contentItemId) {
    const rows = await executeQuery(
      `SELECT TOP 1 ContentItemId FROM dbo.ContentItems WHERE ContentItemId=@id AND IsActive=1`,
      { id: input.contentItemId }
    );
    if (!rows[0]) throw new Error("Content not found.");
  }
}

async function assertActivityTargetOwnership(userId: string, input: ActivityInput): Promise<void> {
  if (input.experimentId) {
    const rows = await executeQuery(
      `SELECT TOP 1 ExperimentId FROM dbo.Experiments WHERE ExperimentId=@id AND UserId=@userId`,
      { id: input.experimentId, userId }
    );
    if (!rows[0]) throw new Error("Experiment not found.");
  }
  if (input.comparisonId) {
    const rows = await executeQuery(
      `SELECT TOP 1 ComparisonId FROM dbo.Comparisons WHERE ComparisonId=@id AND UserId=@userId`,
      { id: input.comparisonId, userId }
    );
    if (!rows[0]) throw new Error("Comparison not found.");
  }
  if (input.contentItemId) {
    const rows = await executeQuery(
      `SELECT TOP 1 ContentItemId FROM dbo.ContentItems WHERE ContentItemId=@id AND IsActive=1`,
      { id: input.contentItemId }
    );
    if (!rows[0]) throw new Error("Content not found.");
  }
}

export async function getActivitySummary(userId: string, days = 30) {
  const safeDays = Math.min(Math.max(Math.trunc(days), 1), 365);
  const daily = await executeQuery(
    `SELECT TOP ${safeDays} ActivityDate,ActivityCount,LearningMinutes,ChallengesCompleted,AlgorithmsCompleted,DataStructuresCompleted FROM dbo.UserDailyActivity WHERE UserId=@userId ORDER BY ActivityDate DESC`,
    { userId }
  );
  return { days: daily };
}
