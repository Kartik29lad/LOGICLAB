import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

function hexToRgb(hex: string): [number, number, number] {
  const clean = hex.replace("#", "").trim();
  const full =
    clean.length === 3
      ? clean
          .split("")
          .map((c) => c + c)
          .join("")
      : clean;
  const num = parseInt(full, 16);
  return [(num >> 16) & 255, (num >> 8) & 255, num & 255];
}

function relativeLuminance(r: number, g: number, b: number): number {
  const [rs, gs, bs] = [r, g, b].map((val) => {
    const s = val / 255;
    return s <= 0.04045 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs! + 0.7152 * gs! + 0.0722 * bs!;
}

function contrastRatio(hex1: string, hex2: string): number {
  const [r1, g1, b1] = hexToRgb(hex1);
  const [r2, g2, b2] = hexToRgb(hex2);
  const l1 = relativeLuminance(r1, g1, b1);
  const l2 = relativeLuminance(r2, g2, b2);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

function parseTokens(cssContent: string): Record<string, string> {
  const tokens: Record<string, string> = {};
  const regex = /--([a-zA-Z0-9_-]+)\s*:\s*([^;]+);/g;
  let match: RegExpExecArray | null;
  while ((match = regex.exec(cssContent)) !== null) {
    tokens[`--${match[1]}`] = match[2]!.trim();
  }
  return tokens;
}

describe("Phase 1 Design Tokens & WCAG Contrast Auditing", () => {
  const tokenPath = resolve(process.cwd(), "src/styles/tokens.css");
  const tokenContent = readFileSync(tokenPath, "utf8");
  const tokens = parseTokens(tokenContent);

  it("declares the canonical dark laboratory tokens", () => {
    expect(tokens["--color-bg"]).toBe("#0a0f1c");
    expect(tokens["--color-surface"]).toBe("#121b27");
    expect(tokens["--color-surface-subtle"]).toBe("#162232");
    expect(tokens["--color-surface-raised"]).toBe("#1a2636");
    expect(tokens["--color-border"]).toBe("#223249");
    expect(tokens["--color-border-subtle"]).toBe("#1e293b");
    expect(tokens["--color-border-strong"]).toBe("#2e3e55");
    expect(tokens["--color-text"]).toBe("#f8fafc");
    expect(tokens["--color-text-muted"]).toBe("#cbd5e1");
    expect(tokens["--color-text-subtle"]).toBe("#8096b0");
    expect(tokens["--color-primary"]).toBe("#00e5ff");
    expect(tokens["--color-success"]).toBe("#22c55e");
    expect(tokens["--color-warning"]).toBe("#f59e0b");
    expect(tokens["--color-danger"]).toBe("#f87171");
    expect(tokens["--color-info"]).toBe("#60a5fa");
    expect(tokens["--color-violet"]).toBe("#c084fc");
  });

  it("verifies WCAG 2.1 AA text contrast (>= 4.5:1) against canvas background", () => {
    const canvas = tokens["--color-bg"]!;
    const primary = contrastRatio(tokens["--color-text"]!, canvas);
    const secondary = contrastRatio(tokens["--color-text-muted"]!, canvas);
    const subtle = contrastRatio(tokens["--color-text-subtle"]!, canvas);
    const coral = contrastRatio(tokens["--color-danger"]!, canvas);

    expect(primary).toBeGreaterThanOrEqual(4.5);
    expect(secondary).toBeGreaterThanOrEqual(4.5);
    expect(subtle).toBeGreaterThanOrEqual(4.5);
    expect(coral).toBeGreaterThanOrEqual(4.5);
  });

  it("verifies WCAG 2.1 AA text contrast (>= 4.5:1) against surface and raised panels", () => {
    const surface = tokens["--color-surface"]!;
    const raised = tokens["--color-surface-raised"]!;

    expect(contrastRatio(tokens["--color-text"]!, surface)).toBeGreaterThanOrEqual(4.5);
    expect(contrastRatio(tokens["--color-text-muted"]!, surface)).toBeGreaterThanOrEqual(4.5);
    expect(contrastRatio(tokens["--color-text-subtle"]!, surface)).toBeGreaterThanOrEqual(4.5);
    expect(contrastRatio(tokens["--color-danger"]!, surface)).toBeGreaterThanOrEqual(4.5);

    expect(contrastRatio(tokens["--color-text"]!, raised)).toBeGreaterThanOrEqual(4.5);
    expect(contrastRatio(tokens["--color-text-muted"]!, raised)).toBeGreaterThanOrEqual(4.5);
    expect(contrastRatio(tokens["--color-text-subtle"]!, raised)).toBeGreaterThanOrEqual(4.5);
    expect(contrastRatio(tokens["--color-danger"]!, raised)).toBeGreaterThanOrEqual(4.5);
  });

  it("verifies non-text UI component contrast (>= 3.0:1) for semantic accents", () => {
    const canvas = tokens["--color-bg"]!;
    const surface = tokens["--color-surface"]!;

    expect(contrastRatio(tokens["--color-primary"]!, canvas)).toBeGreaterThanOrEqual(3.0);
    expect(contrastRatio(tokens["--color-success"]!, canvas)).toBeGreaterThanOrEqual(3.0);
    expect(contrastRatio(tokens["--color-warning"]!, canvas)).toBeGreaterThanOrEqual(3.0);

    expect(contrastRatio(tokens["--color-primary"]!, surface)).toBeGreaterThanOrEqual(3.0);
    expect(contrastRatio(tokens["--color-success"]!, surface)).toBeGreaterThanOrEqual(3.0);
    expect(contrastRatio(tokens["--color-warning"]!, surface)).toBeGreaterThanOrEqual(3.0);
  });

  it("enforces non-network font fallback stacks without network dependencies", () => {
    const fontSans = tokens["--font-sans"]!;
    const fontMono = tokens["--font-mono"]!;

    expect(fontSans).toContain("system-ui");
    expect(fontSans).toContain("sans-serif");
    expect(fontMono).toContain("monospace");
    expect(fontMono).toContain("ui-monospace");
  });

  it("contains reduced-motion media query dampening all motion to 0ms", () => {
    expect(tokenContent).toContain("@media (prefers-reduced-motion: reduce)");
    expect(tokenContent).toContain("--motion-micro: 0ms;");
    expect(tokenContent).toContain("--motion-normal: 0ms;");
    expect(tokenContent).toContain("--motion-structural: 0ms;");
  });
});
