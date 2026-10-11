import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

import { validateSecurityText } from "@/features/visualizer/quality-gates";

describe("V2-68 visualizer security regression", () => {
  it("rejects executable content in user-facing visualizer text", () => {
    expect(validateSecurityText("<script>alert(1)</script>").valid).toBe(false);
    expect(validateSecurityText("javascript:alert(1)").valid).toBe(false);
    expect(validateSecurityText("Normal algorithm explanation").valid).toBe(true);
  });

  it("does not introduce direct DOM HTML injection into visualizer sources", () => {
    const root = path.resolve(process.cwd(), "src/features/visualizer");
    const files = fs
      .readdirSync(root, { recursive: true })
      .filter((entry) => String(entry).endsWith(".tsx")) as string[];
    const offenders = files.filter((entry) =>
      /dangerouslySetInnerHTML|\.innerHTML\s*=/.test(
        fs.readFileSync(path.join(root, entry), "utf8")
      )
    );
    expect(offenders).toEqual([]);
  });
});
