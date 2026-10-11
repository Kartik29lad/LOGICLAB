import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const root = process.cwd();
const file = (relativePath: string) => resolve(root, relativePath);

describe("Phase 10 application shell", () => {
  it("contains the required shell layers and boundaries", () => {
    expect(existsSync(file("src/components/layout/app-shell.tsx"))).toBe(true);
    expect(existsSync(file("src/components/navigation/header.tsx"))).toBe(true);
    expect(existsSync(file("src/components/navigation/sidebar.tsx"))).toBe(true);
    expect(existsSync(file("src/components/layout/footer.tsx"))).toBe(true);
    expect(existsSync(file("src/app/loading.tsx"))).toBe(true);
    expect(existsSync(file("src/app/error.tsx"))).toBe(true);
  });

  it("defines centralized visual tokens", () => {
    const tokens = readFileSync(file("src/styles/tokens.css"), "utf8");
    for (const token of [
      "--font-ui",
      "--font-code",
      "--space-4",
      "--radius-md",
      "--shadow-1",
      "--motion-normal",
      "--control-md",
      "--color-state-current",
    ]) {
      expect(tokens).toContain(token);
    }
  });

  it("provides the documented reusable primitive set", () => {
    for (const name of [
      "button.tsx",
      "form.tsx",
      "tabs.tsx",
      "modal.tsx",
      "tooltip.tsx",
      "badge",
      "card.tsx",
      "table.tsx",
      "status.tsx",
    ]) {
      const target =
        name === "badge" ? "src/components/ui/status.tsx" : `src/components/ui/${name}`;
      expect(existsSync(file(target))).toBe(true);
    }
  });
});
