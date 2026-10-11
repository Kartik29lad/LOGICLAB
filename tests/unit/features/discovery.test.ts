import { describe, expect, it } from "vitest";

import { DISCOVERY_CONTENT, getDiscoveryContent, getDiscoveryItem } from "@/content/discovery";
import { filterDiscovery } from "@/features/algorithms/discovery-utils";

describe("Phase 11 discovery catalog", () => {
  it("exposes the complete initial discovery catalog", () => {
    expect(getDiscoveryContent("ALGORITHM")).toHaveLength(12);
    expect(getDiscoveryContent("DATA_STRUCTURE")).toHaveLength(10);
    expect(DISCOVERY_CONTENT).toHaveLength(25);
  });

  it("resolves stable slugs", () => {
    expect(getDiscoveryItem("bubble-sort")?.metadata.title).toBe("Bubble Sort");
    expect(getDiscoveryItem("stack", "DATA_STRUCTURE")?.metadata.title).toBe("Stack");
    expect(getDiscoveryItem("stack", "ALGORITHM")).toBeUndefined();
  });

  it("filters by query, category, and difficulty", () => {
    const algorithms = getDiscoveryContent("ALGORITHM");
    expect(
      filterDiscovery(algorithms, {
        query: "bubble",
        category: "ALL",
        difficulty: "ALL",
        tag: "ALL",
      }).map((item) => item.metadata.slug)
    ).toEqual(["bubble-sort"]);
    expect(
      filterDiscovery(algorithms, {
        query: "",
        category: "graphs",
        difficulty: "ALL",
        tag: "ALL",
      }).every((item) => item.metadata.category === "graphs")
    ).toBe(true);
    expect(
      filterDiscovery(algorithms, {
        query: "",
        category: "ALL",
        difficulty: "BEGINNER",
        tag: "ALL",
      }).every((item) => item.metadata.difficulty === "BEGINNER")
    ).toBe(true);
    expect(
      filterDiscovery(algorithms, {
        query: "O(n^2)",
        category: "ALL",
        difficulty: "ALL",
        tag: "ALL",
      }).length
    ).toBeGreaterThan(0);
  });
});
