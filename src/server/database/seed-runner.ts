import fs from "fs";
import path from "path";

import { getPool } from "./connection";
import { splitSqlBatches } from "./migration-runner";

export type SeedEnvironment = "development" | "testing" | "demo";

export interface SeedResult {
  environment: SeedEnvironment;
  seededFiles: string[];
}

/**
 * Executes all SQL seed scripts for the specified target environment.
 */
export async function runSeeds(
  environment: SeedEnvironment = "development",
  seedsBaseDir = path.resolve(process.cwd(), "database/seeds")
): Promise<SeedResult> {
  const targetDir = path.join(seedsBaseDir, environment);
  if (!fs.existsSync(targetDir)) {
    throw new Error(`Seed directory not found for environment: ${environment} (${targetDir})`);
  }

  const pool = await getPool();
  const files = fs
    .readdirSync(targetDir)
    .filter((f) => f.endsWith(".sql"))
    .sort();

  const seededFiles: string[] = [];

  for (const file of files) {
    const filePath = path.join(targetDir, file);
    const content = fs.readFileSync(filePath, "utf-8");
    const batches = splitSqlBatches(content);

    const tx = pool.transaction();
    await tx.begin();

    try {
      for (const batch of batches) {
        await tx.request().batch(batch);
      }
      await tx.commit();
      seededFiles.push(file);
    } catch (err) {
      await tx.rollback();
      throw new Error(`Failed to execute seed ${file} (${environment}): ${(err as Error).message}`);
    }
  }

  return { environment, seededFiles };
}
