import fs from "fs";
import path from "path";
import { describe, expect, it } from "vitest";

const FORBIDDEN_SQL_DRIVERS = [
  /from\s+['"]mssql['"]/,
  /from\s+['"]tedious['"]/,
  /from\s+['"]pg['"]/,
  /from\s+['"]mysql['"]/,
  /from\s+['"]sqlite3['"]/,
];

const scanDirectory = (
  dir: string,
  predicate: (filePath: string, content: string) => void
): void => {
  if (!fs.existsSync(dir)) return;
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name !== "node_modules" && entry.name !== ".next") {
        scanDirectory(fullPath, predicate);
      }
    } else if (entry.isFile() && (entry.name.endsWith(".ts") || entry.name.endsWith(".tsx"))) {
      const content = fs.readFileSync(fullPath, "utf-8");
      predicate(fullPath, content);
    }
  }
};

describe("Phase 2 — Architecture Boundary Invariants", () => {
  it("prohibits src/core from importing React, Next.js, or SQL drivers", () => {
    const coreDir = path.resolve(__dirname, "../../src/core");
    const forbiddenPatterns = [
      /from\s+['"]react['"]/,
      /from\s+['"]next(\/.*)?['"]/,
      ...FORBIDDEN_SQL_DRIVERS,
    ];

    scanDirectory(coreDir, (file, content) => {
      for (const pattern of forbiddenPatterns) {
        expect(content, `Violation in ${file}`).not.toMatch(pattern);
      }
    });
  });

  it("prohibits UI components & features from directly accessing SQL drivers", () => {
    const uiDirs = [
      path.resolve(__dirname, "../../src/components"),
      path.resolve(__dirname, "../../src/features"),
    ];

    for (const dir of uiDirs) {
      scanDirectory(dir, (file, content) => {
        for (const pattern of FORBIDDEN_SQL_DRIVERS) {
          expect(content, `Direct SQL driver access in UI: ${file}`).not.toMatch(pattern);
        }
      });
    }
  });

  it("prohibits API routes from directly accessing SQL drivers", () => {
    const apiDir = path.resolve(__dirname, "../../src/app/api");

    scanDirectory(apiDir, (file, content) => {
      for (const pattern of FORBIDDEN_SQL_DRIVERS) {
        expect(content, `Direct SQL driver access in route: ${file}`).not.toMatch(pattern);
      }
    });
  });

  it("prohibits src/content from importing UI components or React", () => {
    const contentDir = path.resolve(__dirname, "../../src/content");
    const forbiddenPatterns = [/from\s+['"]react['"]/, /from\s+['"]@\/components(\/.*)?['"]/];

    scanDirectory(contentDir, (file, content) => {
      for (const pattern of forbiddenPatterns) {
        expect(content, `UI import violation in content: ${file}`).not.toMatch(pattern);
      }
    });
  });

  it("prohibits src/contracts from importing React or database drivers", () => {
    const contractsDir = path.resolve(__dirname, "../../src/contracts");
    const forbiddenPatterns = [/from\s+['"]react['"]/, ...FORBIDDEN_SQL_DRIVERS];

    scanDirectory(contractsDir, (file, content) => {
      for (const pattern of forbiddenPatterns) {
        expect(content, `Violation in contract: ${file}`).not.toMatch(pattern);
      }
    });
  });

  it("enforces the 400-physical-lines maximum limit across all source files", () => {
    const maxLines = 400;
    const targetDirs = [
      path.resolve(__dirname, "../../src"),
      path.resolve(__dirname, "../../tests"),
      path.resolve(__dirname, "../../scripts"),
    ];

    for (const dir of targetDirs) {
      scanDirectory(dir, (file, content) => {
        const lineCount = content.split(/\r?\n/).length;
        expect(
          lineCount,
          `File ${file} exceeds ${maxLines} lines (current: ${lineCount})`
        ).toBeLessThanOrEqual(maxLines);
      });
    }
  });
});
