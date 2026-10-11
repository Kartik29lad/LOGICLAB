import { describe, expect, it } from "vitest";

import {
  ALGORITHM_VISUAL_RULES,
  getAlgorithmVisualRule,
} from "@/features/visualizer/algorithm-visual-rules";
import { VISUAL_LANGUAGE } from "@/features/visualizer/visual-language";
import { validateVisualLanguageConsistency } from "@/features/visualizer/visualizer-polish";

describe("cross-algorithm visual consistency", () => {
  it("contains no visual-rule states outside the shared language", () => {
    const states = new Set(Object.keys(VISUAL_LANGUAGE));
    expect(ALGORITHM_VISUAL_RULES.every((rule) => states.has(rule.emphasis))).toBe(true);
  });

  it("uses shared semantics for sorting and graph families", () => {
    expect(getAlgorithmVisualRule("quick-sort", "SWAP")?.emphasis).toBe("swapping");
    expect(getAlgorithmVisualRule("bfs", "VISIT")?.emphasis).toBe("visited");
    expect(getAlgorithmVisualRule("dijkstra", "RELAX")?.emphasis).toBe("active");
  });

  it("passes the complete semantic consistency audit", () => {
    expect(validateVisualLanguageConsistency()).toEqual([]);
  });
});
