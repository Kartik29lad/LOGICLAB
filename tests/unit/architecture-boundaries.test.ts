import fs from "fs";
import path from "path";
import { describe, expect, it } from "vitest";

describe("Architecture Boundary Invariants", () => {
  it("prohibits core directory files from importing React or Next.js", () => {
    const coreDir = path.resolve(__dirname, "../../src/core");
    const forbiddenPatterns = [
      /from\s+['"]react['"]/,
      /from\s+['"]next(\/.*)?['"]/,
      /from\s+['"]mssql['"]/,
    ];

    const scanDirectory = (dir: string) => {
      if (!fs.existsSync(dir)) return;
      const entries = fs.readdirSync(dir, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          scanDirectory(fullPath);
        } else if (entry.isFile() && (entry.name.endsWith(".ts") || entry.name.endsWith(".tsx"))) {
          const content = fs.readFileSync(fullPath, "utf-8");
          for (const pattern of forbiddenPatterns) {
            expect(content).not.toMatch(pattern);
          }
        }
      }
    };

    scanDirectory(coreDir);
  });
});
