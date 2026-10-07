import { closePool } from "../../src/server/database/connection";
import { runMigrations } from "../../src/server/database/migration-runner";

async function main(): Promise<void> {
  console.log("🚀 Starting LogicLab database migration runner...");
  try {
    const result = await runMigrations();
    if (result.appliedCount === 0) {
      console.log("✓ Database schema is already up to date. No pending migrations.");
    } else {
      console.log(`✓ Successfully applied ${result.appliedCount} migration(s):`);
      for (const name of result.appliedNames) {
        console.log(`   - ${name}`);
      }
    }
  } catch (err) {
    console.error("❌ Migration failed with error:", err);
    process.exitCode = 1;
  } finally {
    await closePool();
  }
}

void main();
