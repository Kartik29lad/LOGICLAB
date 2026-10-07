import { describe, expect, it } from "vitest";

import {
  ArrayParser,
  ArrayValidator,
  GraphParser,
  GraphValidator,
  SortingScenarios,
} from "../../../src/core/input";

describe("Phase 6: Input Parsers & Validators", () => {
  describe("ArrayParser", () => {
    it("parses comma-separated numeric strings", () => {
      const res = ArrayParser.parse("10, 20, 30, 40");
      expect(res.success).toBe(true);
      expect(res.data).toEqual([10, 20, 30, 40]);
    });

    it("parses space and newline separated strings", () => {
      const res = ArrayParser.parse("5  12\n99 \t 3");
      expect(res.success).toBe(true);
      expect(res.data).toEqual([5, 12, 99, 3]);
    });

    it("parses JSON array format", () => {
      const res = ArrayParser.parse("[1, 2, 3, 4]");
      expect(res.success).toBe(true);
      expect(res.data).toEqual([1, 2, 3, 4]);
    });

    it("accepts existing number arrays", () => {
      const res = ArrayParser.parse([7, 8, 9]);
      expect(res.success).toBe(true);
      expect(res.data).toEqual([7, 8, 9]);
    });

    it("returns error on invalid numeric tokens", () => {
      const res = ArrayParser.parse("1, 2, abc, 4");
      expect(res.success).toBe(false);
      expect(res.error).toContain("Invalid numeric token");
    });
  });

  describe("ArrayValidator", () => {
    it("validates size limits correctly", () => {
      expect(ArrayValidator.validate([1]).isValid).toBe(false); // below min size 2
      expect(ArrayValidator.validate([1, 2, 3]).isValid).toBe(true);
      expect(ArrayValidator.validate([], { allowEmpty: true }).isValid).toBe(true);
    });

    it("rejects non-finite numbers", () => {
      expect(ArrayValidator.validate([1, Infinity, 3]).isValid).toBe(false);
      expect(ArrayValidator.validate([1, NaN, 3]).isValid).toBe(false);
    });
  });

  describe("GraphParser & GraphValidator", () => {
    it("parses edge-list strings with weights", () => {
      const res = GraphParser.parse("A-B:5, B-C:3, C-D:10", false);
      expect(res.success).toBe(true);
      expect(res.graph).toBeDefined();
      expect(res.graph!.nodeCount()).toBe(4);
      expect(res.graph!.getNeighbors("A")).toEqual([{ nodeId: "B", weight: 5 }]);
    });

    it("parses directed edges", () => {
      const res = GraphParser.parse("A->B:5, B->C:3", true);
      expect(res.success).toBe(true);
      expect(res.graph!.getNeighbors("A")).toEqual([{ nodeId: "B", weight: 5 }]);
      expect(res.graph!.getNeighbors("B")).toEqual([{ nodeId: "C", weight: 3 }]);
    });

    it("rejects malformed edge tokens", () => {
      const res = GraphParser.parse("A??B");
      expect(res.success).toBe(false);
    });

    it("validates graph node boundaries", () => {
      const graph = GraphParser.parse("A-B:1").graph!;
      expect(GraphValidator.validate(graph).isValid).toBe(true);
    });
  });

  describe("SortingScenarios", () => {
    it("provides valid non-empty preset scenarios", () => {
      const scenarios = SortingScenarios.getAll();
      expect(scenarios.length).toBeGreaterThanOrEqual(4);

      for (const scenario of scenarios) {
        expect(scenario.id).toBeDefined();
        expect(scenario.data.length).toBeGreaterThan(0);
      }
    });
  });
});
