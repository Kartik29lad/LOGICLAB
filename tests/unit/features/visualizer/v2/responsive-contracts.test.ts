import { describe, expect, it } from "vitest";

import {
  getResponsiveProfile,
  VISUALIZER_RESPONSIVE_BREAKPOINTS,
} from "@/features/visualizer/quality-gates";

describe("V2-65 responsive contracts", () => {
  it("keeps breakpoints ordered", () => {
    expect(VISUALIZER_RESPONSIVE_BREAKPOINTS.map((item) => item.minWidth)).toEqual([0, 768, 1200]);
  });

  it("selects compact, workspace and wide profiles deterministically", () => {
    expect(getResponsiveProfile(390).name).toBe("compact");
    expect(getResponsiveProfile(900).name).toBe("workspace");
    expect(getResponsiveProfile(1440).name).toBe("wide");
  });
});
