import fs from "fs";
import path from "path";

import { closePool, getPool } from "../../src/server/database/connection";
import { splitSqlBatches } from "../../src/server/database/migration-runner";

async function main(): Promise<void> {
  const resetScriptPath = path.resolve(process.cwd(), "database/scripts/reset-database.sql");
  console.log("⚠️  Executing database reset (dropping all dbo constraints & tables)...");

  try {
    const sqlContent = fs.readFileSync(resetScriptPath, "utf-8");
    const batches = splitSqlBatches(sqlContent);
    const pool = await getPool();

    for (const batch of batches) {
      await pool.request().batch(batch);
    }

    console.log("✓ Database reset complete. All dbo tables and constraints have been removed.");
  } catch (err) {
    console.error("❌ Reset failed:", err);
    process.exitCode = 1;
  } finally {
    await closePool();
  }
}

void main();
