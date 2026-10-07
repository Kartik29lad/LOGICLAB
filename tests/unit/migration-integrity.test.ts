import fs from "fs";
import path from "path";
import { describe, expect, it } from "vitest";

import { splitSqlBatches } from "../../src/server/database/migration-runner";

describe("Database Migration Integrity", () => {
  const migrationsDir = path.resolve(process.cwd(), "database/migrations");

  it("splits SQL batches on GO directives correctly", () => {
    const rawSql = `
      SELECT 1;
      GO
      SELECT 2;
      GO
    `;
    const batches = splitSqlBatches(rawSql);
    expect(batches).toHaveLength(2);
    expect(batches[0]).toContain("SELECT 1;");
    expect(batches[1]).toContain("SELECT 2;");
  });

  it("contains all 10 sequential migration scripts", () => {
    const files = fs.readdirSync(migrationsDir).filter((f) => f.endsWith(".sql"));
    expect(files.length).toBe(10);

    const expectedPrefixes = [
      "001_",
      "002_",
      "003_",
      "004_",
      "005_",
      "006_",
      "007_",
      "008_",
      "009_",
      "010_",
    ];

    for (const prefix of expectedPrefixes) {
      expect(files.some((f) => f.startsWith(prefix))).toBe(true);
    }
  });

  it("ensures all migration files are idempotent with OBJECT_ID guards", () => {
    const files = fs.readdirSync(migrationsDir).filter((f) => f.endsWith(".sql"));

    for (const file of files) {
      const content = fs.readFileSync(path.join(migrationsDir, file), "utf-8");
      expect(content).toContain("IF OBJECT_ID(");
    }
  });

  it("covers all 23 core domain tables from the SSMS database schema", () => {
    const files = fs.readdirSync(migrationsDir).filter((f) => f.endsWith(".sql"));
    const combinedSql = files
      .map((f) => fs.readFileSync(path.join(migrationsDir, f), "utf-8"))
      .join("\n");

    const expectedTables = [
      "dbo.Users",
      "dbo.UserSessions",
      "dbo.UserSettings",
      "dbo.ContentItems",
      "dbo.ContentVersions",
      "dbo.AlgorithmProgress",
      "dbo.DataStructureProgress",
      "dbo.ChallengeProgress",
      "dbo.ChallengeAttempts",
      "dbo.LearningPathProgress",
      "dbo.LearningPathItemProgress",
      "dbo.Favorites",
      "dbo.Experiments",
      "dbo.ExperimentAlgorithms",
      "dbo.ExperimentExecutions",
      "dbo.Bookmarks",
      "dbo.Comparisons",
      "dbo.ComparisonAlgorithms",
      "dbo.History",
      "dbo.UserActivity",
      "dbo.UserDailyActivity",
      "dbo.Achievements",
      "dbo.UserAchievements",
    ];

    for (const table of expectedTables) {
      expect(combinedSql).toContain(`CREATE TABLE ${table}`);
    }
  });

  it("ensures seeds exist for development, testing, and demo environments", () => {
    const environments = ["development", "testing", "demo"];
    for (const env of environments) {
      const dir = path.resolve(process.cwd(), "database/seeds", env);
      expect(fs.existsSync(dir)).toBe(true);
      const sqlFiles = fs.readdirSync(dir).filter((f) => f.endsWith(".sql"));
      expect(sqlFiles.length).toBeGreaterThanOrEqual(1);
    }
  });
});
