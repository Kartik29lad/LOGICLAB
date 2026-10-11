import { executeQuery } from "../../database/connection";

const tableFor = (type: string) =>
  type === "algorithm"
    ? "AlgorithmProgress"
    : type === "data-structure"
      ? "DataStructureProgress"
      : type === "challenge"
        ? "ChallengeProgress"
        : null;
const contentTypeFor = (type: string) =>
  type === "algorithm"
    ? "ALGORITHM"
    : type === "data-structure"
      ? "DATA_STRUCTURE"
      : type === "challenge"
        ? "CHALLENGE"
        : null;

export async function getProgressSummary(userId: string) {
  const rows = await executeQuery<Record<string, unknown>>(
    `
    SELECT
      (SELECT COUNT(*) FROM dbo.AlgorithmProgress WHERE UserId=@userId AND Status='COMPLETED') AlgorithmsCompleted,
      (SELECT COUNT(*) FROM dbo.ChallengeProgress WHERE UserId=@userId AND Status='COMPLETED') ChallengesCompleted,
      (SELECT COALESCE(SUM(COALESCE(TimeSpentMs,0)),0) FROM dbo.ChallengeAttempts WHERE UserId=@userId) ChallengeTimeMs,
      (SELECT TOP 10 ci.Slug, ci.ContentType, ap.CompletedAt FROM dbo.AlgorithmProgress ap JOIN dbo.ContentItems ci ON ci.ContentItemId=ap.ContentItemId WHERE ap.UserId=@userId AND ap.CompletedAt IS NOT NULL ORDER BY ap.CompletedAt DESC FOR JSON PATH) RecentActivity`,
    { userId }
  );
  const row = rows[0] ?? {};
  let recentActivity: Array<Record<string, unknown>> = [];
  if (typeof row.RecentActivity === "string") {
    try {
      recentActivity = JSON.parse(row.RecentActivity);
    } catch {
      recentActivity = [];
    }
  }
  return {
    userId,
    algorithmsCompleted: Number(row.AlgorithmsCompleted ?? 0),
    challengesCompleted: Number(row.ChallengesCompleted ?? 0),
    totalTimeSpentSeconds: Math.round(Number(row.ChallengeTimeMs ?? 0) / 1000),
    recentActivity: recentActivity.map((item) => ({
      itemSlug: String(item.itemSlug ?? item.Slug ?? ""),
      itemType: String(item.itemType ?? item.ContentType ?? ""),
      completedAt: String(item.completedAt ?? item.CompletedAt ?? ""),
    })),
  };
}

export async function updateProgress(
  userId: string,
  input: { itemSlug: string; itemType: string; status: string; score?: number }
) {
  const table = tableFor(input.itemType);
  const contentType = contentTypeFor(input.itemType);
  if (!table || !contentType) throw new Error("Unsupported progress type.");
  const content = await executeQuery<{ ContentItemId: string; ContentVersionId: string }>(
    `SELECT TOP 1 ci.ContentItemId, cv.ContentVersionId FROM dbo.ContentItems ci JOIN dbo.ContentVersions cv ON cv.ContentItemId=ci.ContentItemId AND cv.IsCurrent=1 WHERE ci.ContentType=@contentType AND ci.Slug=@slug AND ci.IsActive=1`,
    { contentType, slug: input.itemSlug }
  );
  if (!content[0]) throw new Error("Content not found.");
  const percent = input.status === "completed" ? 100 : input.status === "in_progress" ? 50 : 0;
  const score = input.score ?? null;
  const query =
    table === "AlgorithmProgress"
      ? `MERGE dbo.AlgorithmProgress AS target USING (SELECT @userId UserId, @contentItemId ContentItemId) AS source ON target.UserId=source.UserId AND target.ContentItemId=source.ContentItemId WHEN MATCHED THEN UPDATE SET Status=@status, CompletionPercent=@percent, BestScore=COALESCE(@score, BestScore), LastViewedAt=SYSUTCDATETIME(), CompletedAt=CASE WHEN @status='COMPLETED' THEN SYSUTCDATETIME() ELSE CompletedAt END, UpdatedAt=SYSUTCDATETIME() WHEN NOT MATCHED THEN INSERT (UserId,ContentItemId,ContentType,ContentVersionId,Status,CompletionPercent,BestScore,FirstViewedAt,LastViewedAt,CompletedAt) VALUES (@userId,@contentItemId,@contentType,@contentVersionId,@status,@percent,@score,SYSUTCDATETIME(),SYSUTCDATETIME(),CASE WHEN @status='COMPLETED' THEN SYSUTCDATETIME() END);`
      : table === "DataStructureProgress"
        ? `MERGE dbo.DataStructureProgress AS target USING (SELECT @userId UserId, @contentItemId ContentItemId) AS source ON target.UserId=source.UserId AND target.ContentItemId=source.ContentItemId WHEN MATCHED THEN UPDATE SET Status=@status, CompletionPercent=@percent, LastViewedAt=SYSUTCDATETIME(), CompletedAt=CASE WHEN @status='COMPLETED' THEN SYSUTCDATETIME() ELSE CompletedAt END, UpdatedAt=SYSUTCDATETIME() WHEN NOT MATCHED THEN INSERT (UserId,ContentItemId,ContentType,ContentVersionId,Status,CompletionPercent,FirstViewedAt,LastViewedAt,CompletedAt) VALUES (@userId,@contentItemId,@contentType,@contentVersionId,@status,@percent,SYSUTCDATETIME(),SYSUTCDATETIME(),CASE WHEN @status='COMPLETED' THEN SYSUTCDATETIME() END);`
        : `MERGE dbo.ChallengeProgress AS target USING (SELECT @userId UserId, @contentItemId ContentItemId) AS source ON target.UserId=source.UserId AND target.ContentItemId=source.ContentItemId WHEN MATCHED THEN UPDATE SET Status=@status, UpdatedAt=SYSUTCDATETIME() WHEN NOT MATCHED THEN INSERT (UserId,ContentItemId,ContentType,ContentVersionId,Status) VALUES (@userId,@contentItemId,@contentType,@contentVersionId,@status);`;
  await executeQuery(query, {
    userId,
    contentItemId: content[0].ContentItemId,
    contentVersionId: content[0].ContentVersionId,
    contentType,
    status: input.status.toUpperCase(),
    percent,
    score,
  });
}
