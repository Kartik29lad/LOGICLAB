import { describe, expect, it } from "vitest";

import { DEFAULT_ACHIEVEMENT_RULES } from "@/core/learning/achievement-rules";

describe("achievement rules", () => {
  it("has unique deterministic codes and thresholds where required", () => {
    const codes = DEFAULT_ACHIEVEMENT_RULES.map((rule) => rule.code);
    expect(new Set(codes).size).toBe(codes.length);
    expect(
      DEFAULT_ACHIEVEMENT_RULES.filter((rule) => rule.criteria.type !== "FIRST_EXECUTION").every(
        (rule) => Number(rule.criteria.threshold) > 0
      )
    ).toBe(true);
  });
});
