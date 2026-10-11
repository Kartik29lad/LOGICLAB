import {
  DEFAULT_ACHIEVEMENT_RULES,
  type AchievementRule,
} from "../../../core/learning/achievement-rules";
import { executeQuery, withTransaction } from "../../database/connection";

function parseCriteria(value: unknown): AchievementRule | null {
  if (typeof value !== "string") return null;
  try {
    const parsed = JSON.parse(value) as AchievementRule;
    return parsed && typeof parsed.type === "string" ? parsed : null;
  } catch {
    return null;
  }
}

async function metrics(userId: string) {
  const rows = await executeQuery<{
    CompletedConcepts: number;
    CompletedChallenges: number;
    FirstExecution: number;
    Categories: number;
    CompletedPaths: number;
  }>(
    `SELECT (SELECT COUNT(*) FROM dbo.AlgorithmProgress WHERE UserId=@userId AND Status='COMPLETED') + (SELECT COUNT(*) FROM dbo.DataStructureProgress WHERE UserId=@userId AND Status='COMPLETED') CompletedConcepts, (SELECT COUNT(*) FROM dbo.ChallengeProgress WHERE UserId=@userId AND Status='COMPLETED') CompletedChallenges, (SELECT COUNT(*) FROM dbo.UserActivity WHERE UserId=@userId AND ActivityType IN ('EXECUTE','ALGORITHM_EXECUTION','DATA_STRUCTURE_EXECUTION')) FirstExecution, (SELECT COUNT(*) FROM (SELECT DISTINCT ci.Category FROM dbo.AlgorithmProgress p JOIN dbo.ContentItems ci ON ci.ContentItemId=p.ContentItemId WHERE p.UserId=@userId AND p.Status='COMPLETED' UNION SELECT DISTINCT ci.Category FROM dbo.DataStructureProgress p JOIN dbo.ContentItems ci ON ci.ContentItemId=p.ContentItemId WHERE p.UserId=@userId AND p.Status='COMPLETED') categories) Categories, (SELECT COUNT(*) FROM dbo.LearningPathProgress WHERE UserId=@userId AND Status='COMPLETED') CompletedPaths`,
    { userId }
  );
  const row = rows[0] ?? {
    CompletedConcepts: 0,
    CompletedChallenges: 0,
    FirstExecution: 0,
    Categories: 0,
    CompletedPaths: 0,
    MaxStreak: 0,
  };
  const activity = await executeQuery<{ ActivityDate: string }>(
    `SELECT ActivityDate FROM dbo.UserDailyActivity WHERE UserId=@userId AND ActivityCount>0 ORDER BY ActivityDate`,
    { userId }
  );
  let maxStreak = 0;
  let streak = 0;
  let previous: number | null = null;
  for (const day of activity) {
    const current = new Date(day.ActivityDate).getTime();
    if (previous !== null && current - previous === 86_400_000) streak += 1;
    else streak = 1;
    maxStreak = Math.max(maxStreak, streak);
    previous = current;
  }
  return { ...row, MaxStreak: maxStreak };
}

export async function evaluateAchievements(userId: string) {
  const current = await metrics(userId);
  const definitions = await seedDefaultAchievements();
  const earned: string[] = [];
  await withTransaction(async (tx) => {
    for (const achievement of definitions) {
      const rule = parseCriteria(achievement.Criteria);
      if (!rule || !isSatisfied(rule, current)) continue;
      const result = await tx
        .request()
        .input("userId", userId)
        .input("achievementId", achievement.AchievementId)
        .input("progressData", JSON.stringify(current))
        .query<{ UserAchievementId: string }>(
          `IF NOT EXISTS (SELECT 1 FROM dbo.UserAchievements WHERE UserId=@userId AND AchievementId=@achievementId) BEGIN INSERT dbo.UserAchievements(UserId,AchievementId,ProgressData) OUTPUT INSERTED.UserAchievementId VALUES(@userId,@achievementId,@progressData) END`
        );
      if (result.recordset.length) earned.push(achievement.AchievementCode);
    }
  });
  return { earned, metrics: current };
}

function isSatisfied(
  rule: AchievementRule,
  m: {
    CompletedConcepts: number;
    CompletedChallenges: number;
    FirstExecution: number;
    Categories: number;
    CompletedPaths: number;
    MaxStreak: number;
  }
): boolean {
  switch (rule.type) {
    case "FIRST_EXECUTION":
      return m.FirstExecution > 0;
    case "COMPLETED_CONCEPTS":
      return m.CompletedConcepts >= (rule.threshold ?? Number.MAX_SAFE_INTEGER);
    case "CHALLENGE_MILESTONE":
      return m.CompletedChallenges >= (rule.threshold ?? Number.MAX_SAFE_INTEGER);
    case "STREAK":
      return m.MaxStreak >= (rule.threshold ?? Number.MAX_SAFE_INTEGER);
    case "BREADTH":
      return m.Categories >= (rule.threshold ?? Number.MAX_SAFE_INTEGER);
    case "DEPTH":
      return m.CompletedPaths >= (rule.threshold ?? Number.MAX_SAFE_INTEGER);
  }
}

async function seedDefaultAchievements() {
  for (const rule of DEFAULT_ACHIEVEMENT_RULES) {
    await executeQuery(
      `IF NOT EXISTS (SELECT 1 FROM dbo.Achievements WHERE AchievementCode=@code) INSERT dbo.Achievements(AchievementCode,Name,Description,Category,Criteria,IsActive) VALUES(@code,@name,@description,@category,@criteria,1)`,
      {
        code: rule.code,
        name: rule.name,
        description: rule.description,
        category: rule.category,
        criteria: JSON.stringify(rule.criteria),
      }
    );
  }
  return executeQuery<{ AchievementId: string; AchievementCode: string; Criteria: string }>(
    `SELECT AchievementId,AchievementCode,Criteria FROM dbo.Achievements WHERE IsActive=1`,
    {}
  );
}
