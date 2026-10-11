import fs from "fs";
import path from "path";
import { describe, expect, it } from "vitest";

const FORBIDDEN_SQL_DRIVERS = [
  /from\s+["']mssql["']/,
  /from\s+["']tedious["']/,
  /from\s+["']pg["']/,
  /from\s+["']mysql["']/,
  /from\s+["']sqlite3["']/,
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

const assertNoImports = (dir: string, forbiddenPatterns: RegExp[], description: string): void => {
  scanDirectory(dir, (file, content) => {
    for (const pattern of forbiddenPatterns) {
      expect(content, `${description}: ${file}`).not.toMatch(pattern);
    }
  });
};

describe("Phase 2 — Architecture Boundary Invariants", () => {
  it("prohibits core from importing presentation, application, framework, or SQL code", () => {
    const coreDir = path.resolve(__dirname, "../../src/core");
    assertNoImports(
      coreDir,
      [
        /from\s+["']react["']/,
        /from\s+["']next(\/.*)?["']/,
        /from\s+["']@\/app(\/.*)?["']/,
        /from\s+["']@\/features(\/.*)?["']/,
        /from\s+["']@\/components(\/.*)?["']/,
        /from\s+["']@\/server(\/.*)?["']/,
        ...FORBIDDEN_SQL_DRIVERS,
      ],
      "Core dependency violation"
    );
  });

  it("prohibits server application code from importing presentation or app code", () => {
    const serverDir = path.resolve(__dirname, "../../src/server");
    assertNoImports(
      serverDir,
      [
        /from\s+["']@\/app(\/.*)?["']/,
        /from\s+["']@\/features(\/.*)?["']/,
        /from\s+["']@\/components(\/.*)?["']/,
      ],
      "Server dependency violation"
    );
  });

  it("prohibits presentation code from importing server implementations, core implementations, or SQL drivers", () => {
    const presentationDirs = [
      path.resolve(__dirname, "../../src/components"),
      path.resolve(__dirname, "../../src/features"),
    ];

    for (const dir of presentationDirs) {
      assertNoImports(
        dir,
        [
          /from\s+["']@\/server(\/.*)?["']/,
          /from\s+["']@\/core(\/.*)?["']/,
          ...FORBIDDEN_SQL_DRIVERS,
        ],
        "Presentation dependency violation"
      );
    }
  });

  it("prohibits API routes from importing SQL drivers or core implementations directly", () => {
    const apiDir = path.resolve(__dirname, "../../src/app/api");
    assertNoImports(
      apiDir,
      [...FORBIDDEN_SQL_DRIVERS, /from\s+["']@\/core(\/.*)?["']/],
      "API route dependency violation"
    );
  });

  it("prohibits content from importing UI, server, or framework code", () => {
    const contentDir = path.resolve(__dirname, "../../src/content");
    assertNoImports(
      contentDir,
      [
        /from\s+["']react["']/,
        /from\s+["']next(\/.*)?["']/,
        /from\s+["']@\/components(\/.*)?["']/,
        /from\s+["']@\/features(\/.*)?["']/,
        /from\s+["']@\/server(\/.*)?["']/,
      ],
      "Content dependency violation"
    );
  });

  it("prohibits contracts from importing framework, presentation, server, or database code", () => {
    const contractsDir = path.resolve(__dirname, "../../src/contracts");
    assertNoImports(
      contractsDir,
      [
        /from\s+["']react["']/,
        /from\s+["']next(\/.*)?["']/,
        /from\s+["']@\/app(\/.*)?["']/,
        /from\s+["']@\/features(\/.*)?["']/,
        /from\s+["']@\/components(\/.*)?["']/,
        /from\s+["']@\/server(\/.*)?["']/,
        ...FORBIDDEN_SQL_DRIVERS,
      ],
      "Contract dependency violation"
    );
  });

  it("enforces the 400-physical-lines maximum limit across source, tests, and scripts", () => {
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
