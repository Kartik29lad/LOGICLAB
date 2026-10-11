import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const root = process.cwd();
const read = (path: string) => readFileSync(join(root, path), "utf8");

describe("Phase 21 accessibility contract", () => {
  it("provides a skip link and accessible main landmark", () => {
    const shell = read("src/components/layout/app-shell.tsx");
    expect(shell).toContain('href="#main-content"');
    expect(shell).toContain('id="main-content"');
  });

  it("provides mobile navigation state and focus restoration", () => {
    const header = read("src/components/navigation/header.tsx");
    const sidebar = read("src/components/navigation/sidebar.tsx");
    expect(header).toContain("aria-expanded={menuOpen}");
    expect(header).toContain('aria-controls="primary-navigation"');
    expect(sidebar).toContain('id="primary-navigation"');
    expect(sidebar).toContain('id="mobile-menu-button"');
  });

  it("implements dialog and tab accessibility primitives", () => {
    const modal = read("src/components/ui/modal.tsx");
    const tabs = read("src/components/ui/tabs.tsx");
    expect(modal).toContain('role="dialog"');
    expect(modal).toContain('aria-modal="true"');
    expect(modal).toContain('event.key === "Tab"');
    expect(tabs).toContain('role="tablist"');
    expect(tabs).toContain("aria-controls=");
    expect(tabs).toContain("ArrowRight");
    expect(tabs).toContain("Home");
    expect(tabs).toContain("End");
  });

  it("supports reduced motion from OS and user preference", () => {
    const css = read("src/styles/globals.css");
    const shell = read("src/components/layout/app-shell.tsx");
    expect(css).toContain("prefers-reduced-motion: reduce");
    expect(css).toContain('html[data-reduced-motion="true"]');
    expect(shell).toContain("dataset.reducedMotion");
  });

  it("documents supported browser and responsive QA targets", () => {
    expect(
      existsSync(join(root, "docs/testing/phase-21-accessibility-responsive-browser-qa.md"))
    ).toBe(true);
    const doc = read("docs/testing/phase-21-accessibility-responsive-browser-qa.md");
    for (const browser of ["Chrome", "Edge", "Firefox", "Safari"]) expect(doc).toContain(browser);
    expect(doc).toContain("<=600px");
  });
});
