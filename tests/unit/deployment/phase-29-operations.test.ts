import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const root = process.cwd();

const requiredFiles = [
  "scripts/deployment/post-release-verify.ts",
  "scripts/deployment/monitor-release.ts",
  "scripts/deployment/check-feature-flags.ts",
  "scripts/operations/production-status.ts",
  "database/scripts/operations/integrity-check.sql",
  "database/scripts/operations/retention-maintenance.sql",
  "docs/operations/PHASE-29-OPERATIONS.md",
  "docs/runbooks/INCIDENT-RESPONSE.md",
  "docs/runbooks/ROLLBACK.md",
  "docs/runbooks/DATABASE-OUTAGE.md",
  "docs/runbooks/EXECUTION-DEGRADATION.md",
  "docs/operations/ACCESS-AUDIT.md",
  "docs/operations/MAINTENANCE.md",
];

describe("Phase 29 operational controls", () => {
  it("keeps required operational artifacts in the repository", () => {
    for (const file of requiredFiles) {
      expect(fs.existsSync(path.join(root, file)), file).toBe(true);
    }
  });

  it("exposes bounded monitoring controls", () => {
    const script = fs.readFileSync(
      path.join(root, "scripts/deployment/monitor-release.ts"),
      "utf8"
    );
    expect(script).toContain("MONITOR_DURATION_SECONDS");
    expect(script).toContain("MONITOR_INTERVAL_SECONDS");
    expect(script).toContain("MONITOR_MAX_FAILURES");
  });

  it("keeps retention diagnostics non-destructive", () => {
    const sql = fs.readFileSync(
      path.join(root, "database/scripts/operations/retention-maintenance.sql"),
      "utf8"
    );
    expect(sql).not.toMatch(/\bDELETE\b/i);
    expect(sql).toContain("No deletion is performed");
  });
});
