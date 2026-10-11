import { executeQuery, withTransaction } from "../../database/connection";

export interface LearningPathRow {
  ProgressId: string;
  ContentItemId: string;
  Slug: string;
  DisplayName: string;
  ContentVersionId: string;
  Status: string;
  CompletionPercent: number;
  ItemsCompleted: number;
  LastActivityAt: string | null;
  CompletedAt: string | null;
}

export interface LearningPathItemRow {
  ItemProgressId: string;
  ProgressId: string;
  ItemContentItemId: string;
  ItemContentVersionId: string;
  ItemSlug: string;
  ItemContentType: string;
  Status: string;
  CompletionPercent: number;
  CompletedAt: string | null;
}

async function resolveContent(slug: string) {
  const rows = await executeQuery<{ ContentItemId: string; ContentVersionId: string }>(
    `SELECT TOP 1 ci.ContentItemId, cv.ContentVersionId FROM dbo.ContentItems ci JOIN dbo.ContentVersions cv ON cv.ContentItemId=ci.ContentItemId AND cv.IsCurrent=1 WHERE ci.Slug=@slug AND ci.IsActive=1`,
    { slug }
  );
  return rows[0] ?? null;
}

export async function listPaths(userId: string): Promise<LearningPathRow[]> {
  return executeQuery<LearningPathRow>(
    `SELECT ci.ContentItemId, ci.Slug, ci.DisplayName, cv.ContentVersionId, COALESCE(lp.Status,'NOT_STARTED') Status, COALESCE(lp.CompletionPercent,0) CompletionPercent, COALESCE(lp.ItemsCompleted,0) ItemsCompleted, lp.LastActivityAt, lp.CompletedAt FROM dbo.ContentItems ci JOIN dbo.ContentVersions cv ON cv.ContentItemId=ci.ContentItemId AND cv.IsCurrent=1 LEFT JOIN dbo.LearningPathProgress lp ON lp.UserId=@userId AND lp.ContentItemId=ci.ContentItemId WHERE ci.ContentType='LEARNING_PATH' AND ci.IsActive=1 ORDER BY ci.DisplayName`,
    { userId }
  );
}

export async function getPath(userId: string, slug: string) {
  const rows = await executeQuery<LearningPathRow>(
    `SELECT TOP 1 ci.ContentItemId, ci.Slug, ci.DisplayName, cv.ContentVersionId, COALESCE(lp.Status,'NOT_STARTED') Status, COALESCE(lp.CompletionPercent,0) CompletionPercent, COALESCE(lp.ItemsCompleted,0) ItemsCompleted, lp.LastActivityAt, lp.CompletedAt FROM dbo.ContentItems ci JOIN dbo.ContentVersions cv ON cv.ContentItemId=ci.ContentItemId AND cv.IsCurrent=1 LEFT JOIN dbo.LearningPathProgress lp ON lp.UserId=@userId AND lp.ContentItemId=ci.ContentItemId WHERE ci.ContentType='LEARNING_PATH' AND ci.Slug=@slug AND ci.IsActive=1`,
    { userId, slug }
  );
  return rows[0] ?? null;
}

export async function listPathItems(userId: string, slug: string): Promise<LearningPathItemRow[]> {
  return executeQuery<LearningPathItemRow>(
    `SELECT lip.ItemProgressId, lip.ProgressId, lip.ItemContentItemId, lip.ItemContentVersionId, ci.Slug ItemSlug, lip.ItemContentType, lip.Status, lip.CompletionPercent, lip.CompletedAt FROM dbo.LearningPathProgress lp JOIN dbo.ContentItems path ON path.ContentItemId=lp.ContentItemId JOIN dbo.LearningPathItemProgress lip ON lip.ProgressId=lp.ProgressId JOIN dbo.ContentItems ci ON ci.ContentItemId=lip.ItemContentItemId WHERE lp.UserId=@userId AND path.Slug=@slug ORDER BY lip.ItemProgressId`,
    { userId, slug }
  );
}

export async function syncPathForCompletedItem(userId: string, itemSlug: string): Promise<void> {
  const pathRows = await executeQuery<{
    ContentItemId: string;
    ContentVersionId: string;
    Slug: string;
    ContentType: string;
  }>(
    `SELECT ci.ContentItemId, cv.ContentVersionId, ci.Slug, ci.ContentType FROM dbo.ContentItems ci JOIN dbo.ContentVersions cv ON cv.ContentItemId=ci.ContentItemId AND cv.IsCurrent=1 WHERE ci.ContentType='LEARNING_PATH' AND ci.IsActive=1`,
    {}
  );
  if (pathRows.length === 0) return;
  const { getLearningPath } = await import("../../../core/learning/learning-path-catalog");
  for (const path of pathRows) {
    const definition = getLearningPath(path.Slug);
    if (!definition || !definition.itemSlugs.includes(itemSlug)) continue;
    if (definition.prerequisitePathSlugs.length > 0) {
      const prerequisiteRows = await executeQuery<{ Slug: string; Status: string }>(
        `SELECT ci.Slug, COALESCE(lp.Status,'NOT_STARTED') Status FROM dbo.ContentItems ci LEFT JOIN dbo.LearningPathProgress lp ON lp.UserId=@userId AND lp.ContentItemId=ci.ContentItemId WHERE ci.ContentType='LEARNING_PATH' AND ci.Slug IN (${definition.prerequisitePathSlugs.map((_, index) => `@prereq${index}`).join(",")})`,
        Object.fromEntries(
          definition.prerequisitePathSlugs.map((slug, index) => [`prereq${index}`, slug])
        )
      );
      if (
        definition.prerequisitePathSlugs.some(
          (prerequisite) =>
            prerequisiteRows.find((row) => row.Slug === prerequisite)?.Status !== "COMPLETED"
        )
      )
        continue;
    }
    const target = await resolveContent(path.Slug);
    if (!target) continue;
    const itemRows = await executeQuery<{
      ContentItemId: string;
      ContentVersionId: string;
      Slug: string;
      ContentType: string;
    }>(
      `SELECT ci.ContentItemId, cv.ContentVersionId, ci.Slug, ci.ContentType FROM dbo.ContentItems ci JOIN dbo.ContentVersions cv ON cv.ContentItemId=ci.ContentItemId AND cv.IsCurrent=1 WHERE ci.Slug IN (${definition.itemSlugs.map((_, index) => `@slug${index}`).join(",")}) AND ci.IsActive=1`,
      Object.fromEntries(definition.itemSlugs.map((slug, index) => [`slug${index}`, slug]))
    );
    const sourceProgress = await executeQuery<{
      ContentItemId: string;
      ContentType: string;
      Status: string;
      CompletionPercent: number;
      CompletedAt: string | null;
    }>(
      `SELECT ap.ContentItemId, ap.ContentType, ap.Status, ap.CompletionPercent, ap.CompletedAt FROM dbo.AlgorithmProgress ap WHERE ap.UserId=@userId UNION ALL SELECT dp.ContentItemId, dp.ContentType, dp.Status, dp.CompletionPercent, dp.CompletedAt FROM dbo.DataStructureProgress dp WHERE dp.UserId=@userId UNION ALL SELECT cp.ContentItemId, cp.ContentType, cp.Status, CASE WHEN cp.Status='COMPLETED' THEN 100 ELSE 0 END CompletionPercent, cp.CompletedAt FROM dbo.ChallengeProgress cp WHERE cp.UserId=@userId`,
      { userId }
    );
    const sourceMap = new Map(sourceProgress.map((row) => [row.ContentItemId, row]));
    await withTransaction(async (tx) => {
      const request = tx.request();
      const pathProgress = await request
        .input("userId", userId)
        .input("pathId", target.ContentItemId)
        .query<{ ProgressId: string }>(
          `SELECT ProgressId FROM dbo.LearningPathProgress WHERE UserId=@userId AND ContentItemId=@pathId`
        );
      let progressId = pathProgress.recordset[0]?.ProgressId;
      if (!progressId) {
        const inserted = await tx
          .request()
          .input("userId", userId)
          .input("pathId", target.ContentItemId)
          .input("pathVersionId", target.ContentVersionId)
          .query<{ ProgressId: string }>(
            `INSERT dbo.LearningPathProgress(UserId,ContentItemId,ContentType,ContentVersionId,Status,CompletionPercent,ItemsCompleted,StartedAt,LastActivityAt) OUTPUT INSERTED.ProgressId VALUES(@userId,@pathId,'LEARNING_PATH',@pathVersionId,'IN_PROGRESS',0,0,SYSUTCDATETIME(),SYSUTCDATETIME())`
          );
        progressId = inserted.recordset[0].ProgressId;
      }
      for (const item of itemRows) {
        const progress = sourceMap.get(item.ContentItemId);
        const status =
          progress?.Status === "COMPLETED"
            ? "COMPLETED"
            : progress?.Status === "IN_PROGRESS"
              ? "IN_PROGRESS"
              : "NOT_STARTED";
        await tx
          .request()
          .input("progressId", progressId)
          .input("itemId", item.ContentItemId)
          .input("itemType", item.ContentType)
          .input("versionId", item.ContentVersionId)
          .input("status", status)
          .input("percent", status === "COMPLETED" ? 100 : status === "IN_PROGRESS" ? 50 : 0)
          .query(
            `MERGE dbo.LearningPathItemProgress AS target USING (SELECT @progressId ProgressId,@itemId ItemContentItemId) AS source ON target.ProgressId=source.ProgressId AND target.ItemContentItemId=source.ItemContentItemId WHEN MATCHED THEN UPDATE SET ItemContentVersionId=@versionId,ItemContentType=(SELECT ContentType FROM dbo.ContentItems WHERE ContentItemId=@itemId),Status=@status,CompletionPercent=@percent,LastActivityAt=SYSUTCDATETIME(),CompletedAt=CASE WHEN @status='COMPLETED' THEN COALESCE(target.CompletedAt,SYSUTCDATETIME()) ELSE target.CompletedAt END,UpdatedAt=SYSUTCDATETIME() WHEN NOT MATCHED THEN INSERT(ProgressId,ItemContentItemId,ItemContentType,ItemContentVersionId,Status,CompletionPercent,StartedAt,LastActivityAt,CompletedAt) VALUES(@progressId,@itemId,(SELECT ContentType FROM dbo.ContentItems WHERE ContentItemId=@itemId),@versionId,@status,@percent,CASE WHEN @status='NOT_STARTED' THEN NULL ELSE SYSUTCDATETIME() END,SYSUTCDATETIME(),CASE WHEN @status='COMPLETED' THEN SYSUTCDATETIME() END);`
          );
      }
      const count = itemRows.filter(
        (item) => sourceMap.get(item.ContentItemId)?.Status === "COMPLETED"
      ).length;
      const percent =
        itemRows.length === 0 ? 0 : Math.round((count / itemRows.length) * 10000) / 100;
      const status =
        count === itemRows.length && itemRows.length > 0
          ? "COMPLETED"
          : count > 0
            ? "IN_PROGRESS"
            : "NOT_STARTED";
      await tx
        .request()
        .input("progressId", progressId)
        .input("percent", percent)
        .input("count", count)
        .input("status", status)
        .query(
          `UPDATE dbo.LearningPathProgress SET Status=@status,CompletionPercent=@percent,ItemsCompleted=@count,CurrentItemContentItemId=(SELECT TOP 1 ItemContentItemId FROM dbo.LearningPathItemProgress WHERE ProgressId=@progressId AND Status<>'COMPLETED' ORDER BY ItemContentItemId),CurrentItemContentType=(SELECT TOP 1 ItemContentType FROM dbo.LearningPathItemProgress WHERE ProgressId=@progressId AND Status<>'COMPLETED' ORDER BY ItemContentItemId),LastActivityAt=SYSUTCDATETIME(),CompletedAt=CASE WHEN @status='COMPLETED' THEN COALESCE(CompletedAt,SYSUTCDATETIME()) ELSE CompletedAt END,UpdatedAt=SYSUTCDATETIME() WHERE ProgressId=@progressId`
        );
    });
  }
}

export async function listAchievements(userId: string) {
  return executeQuery(
    `SELECT a.AchievementCode,a.Name,a.Description,a.Category,a.Icon,ua.EarnedAt,ua.ProgressData FROM dbo.Achievements a LEFT JOIN dbo.UserAchievements ua ON ua.AchievementId=a.AchievementId AND ua.UserId=@userId WHERE a.IsActive=1 ORDER BY CASE WHEN ua.EarnedAt IS NULL THEN 1 ELSE 0 END, ua.EarnedAt DESC, a.Category, a.Name`,
    { userId }
  );
}
