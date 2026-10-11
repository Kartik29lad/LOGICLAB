import { getLearningPath as getLearningPathDefinition } from "../../../core/learning/learning-path-catalog";
import { AuthorizationError, ValidationError } from "../../../errors";
import { getSessionUserId } from "../../auth/session";
import { executeQuery } from "../../database/connection";
import * as repository from "../../repositories/learning/learning-repository";
import { evaluateAchievements } from "./achievement-service";

export async function requireLearningUser(): Promise<string> {
  const userId = await getSessionUserId();
  if (!userId) throw new AuthorizationError("Authentication required.");
  return userId;
}

async function pathAccess(userId: string, slug: string) {
  const definition = getLearningPathDefinition(slug);
  if (!definition || definition.prerequisitePathSlugs.length === 0)
    return { locked: false, prerequisites: [] as string[] };
  const rows = await executeQuery<{ Slug: string; Status: string }>(
    `SELECT ci.Slug, COALESCE(lp.Status,'NOT_STARTED') Status FROM dbo.ContentItems ci LEFT JOIN dbo.LearningPathProgress lp ON lp.UserId=@userId AND lp.ContentItemId=ci.ContentItemId WHERE ci.ContentType='LEARNING_PATH' AND ci.Slug IN (${definition.prerequisitePathSlugs.map((_, index) => `@slug${index}`).join(",")})`,
    {
      userId,
      ...Object.fromEntries(
        definition.prerequisitePathSlugs.map((item, index) => [`slug${index}`, item])
      ),
    }
  );
  const incomplete = definition.prerequisitePathSlugs.filter(
    (prerequisite) => rows.find((row) => row.Slug === prerequisite)?.Status !== "COMPLETED"
  );
  return { locked: incomplete.length > 0, prerequisites: incomplete };
}

export async function listLearningPaths(userId: string) {
  const rows = await repository.listPaths(userId);
  return Promise.all(
    rows.map(async (path) => ({ ...path, ...(await pathAccess(userId, path.Slug)) }))
  );
}

export async function getLearningPath(userId: string, slug: string) {
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug))
    throw new ValidationError("Invalid learning path slug.");
  const path = await repository.getPath(userId, slug);
  if (!path) throw new ValidationError("Learning path not found.");
  const access = await pathAccess(userId, slug);
  if (access.locked && path.Status === "NOT_STARTED")
    throw new ValidationError(
      `Complete prerequisite paths first: ${access.prerequisites.join(", ")}.`
    );
  const definition = getLearningPathDefinition(slug);
  const progressItems = await repository.listPathItems(userId, slug);
  const rows = definition
    ? await executeQuery<{ Slug: string; ContentType: string; ContentVersionId: string }>(
        `SELECT ci.Slug,ci.ContentType,cv.ContentVersionId FROM dbo.ContentItems ci JOIN dbo.ContentVersions cv ON cv.ContentItemId=ci.ContentItemId AND cv.IsCurrent=1 WHERE ci.Slug IN (${definition.itemSlugs.map((_, index) => `@slug${index}`).join(",")})`,
        Object.fromEntries(definition.itemSlugs.map((item, index) => [`slug${index}`, item]))
      )
    : [];
  const bySlug = new Map(rows.map((row) => [row.Slug, row]));
  const progressBySlug = new Map(progressItems.map((item) => [item.ItemSlug, item]));
  const items = (definition?.itemSlugs ?? [])
    .map((itemSlug) => {
      const row = bySlug.get(itemSlug);
      const progress = progressBySlug.get(itemSlug);
      return (
        progress ??
        (row
          ? {
              ItemProgressId: "",
              ProgressId: "",
              ItemContentItemId: "",
              ItemContentVersionId: row.ContentVersionId,
              ItemSlug: row.Slug,
              ItemContentType: row.ContentType,
              Status: "NOT_STARTED",
              CompletionPercent: 0,
              CompletedAt: null,
            }
          : null)
      );
    })
    .filter(Boolean);
  return { path: { ...path, ...access }, items };
}

export async function refreshLearningState(userId: string, itemSlug: string) {
  await repository.syncPathForCompletedItem(userId, itemSlug);
  return evaluateAchievements(userId);
}

export async function getAchievements(userId: string) {
  await evaluateAchievements(userId);
  return repository.listAchievements(userId);
}
