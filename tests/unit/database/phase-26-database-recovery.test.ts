import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const root = process.cwd();

describe("Phase 26 database recovery controls", () => {
  it("ships the production preflight and backup verification scripts", () => {
    expect(fs.existsSync(path.join(root, "database/scripts/production-preflight.sql"))).toBe(true);
    expect(fs.existsSync(path.join(root, "database/scripts/backup-database.sql"))).toBe(true);
    expect(fs.existsSync(path.join(root, "database/scripts/verify-backup.sql"))).toBe(true);
    expect(fs.existsSync(path.join(root, "database/scripts/restore-database.sql"))).toBe(true);
  });

  it("keeps the recovery verification boundary server-side", () => {
    const source = fs.readFileSync(path.join(root, "scripts/database/verify-recovery.ts"), "utf8");
    expect(source).toContain("executeQuery");
    expect(source).toContain("_Migrations");
  });
});
