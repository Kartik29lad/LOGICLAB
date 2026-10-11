import { describe, expect, it } from "vitest";

import { ALGORITHM_VISUAL_RULES } from "@/features/visualizer/algorithm-visual-rules";
import { getAlgorithmVisualRule, VISUAL_LANGUAGE } from "@/features/visualizer/visual-language";

describe("visual language", () => {
  it("defines stable semantic meanings", () => {
    expect(VISUAL_LANGUAGE.current.label).toBe("Current");
    expect(VISUAL_LANGUAGE.path.priority).toBeGreaterThan(VISUAL_LANGUAGE.visited.priority);
  });
  it("provides algorithm-specific visual rules", () => {
    expect(getAlgorithmVisualRule("bubble-sort", "COMPARE")?.emphasis).toBe("comparing");
    expect(getAlgorithmVisualRule("dijkstra", "RELAX")?.emphasis).toBe("active");
    expect(ALGORITHM_VISUAL_RULES.length).toBeGreaterThan(5);
  });
});
