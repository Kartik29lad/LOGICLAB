import { closePool } from "../../src/server/database/connection";
import { runSeeds, type SeedEnvironment } from "../../src/server/database/seed-runner";

async function main(): Promise<void> {
  const envArg = (process.argv[2] || "development") as SeedEnvironment;
  console.log(`🌱 Running LogicLab database seeds for environment: [${envArg}]...`);

  try {
    const result = await runSeeds(envArg);
    console.log(`✓ Seed completed. Successfully executed ${result.seededFiles.length} file(s):`);
    for (const name of result.seededFiles) {
      console.log(`   - ${name}`);
    }
  } catch (err) {
    console.error(`❌ Seeding failed for [${envArg}]:`, err);
    process.exitCode = 1;
  } finally {
    await closePool();
  }
}

void main();
