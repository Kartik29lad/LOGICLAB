import { describe, expect, it } from "vitest";

import type { ContentPackage } from "@/content/schema/content-types";
import { resolveExecutionReferences } from "@/features/visualizer/code-synchronization";

import { makeStep } from "../../../../helpers/visualizer-fixtures";

const content = {
  metadata: {},
  code: [
    {
      language: "typescript",
      entryPoint: "bubbleSort",
      source: "one\ntwo\nthree\nfour",
      stepMappings: [{ action: "COMPARE", startLine: 2, endLine: 3 }],
    },
  ],
  pseudocode: "compare\nswap\nfinish",
} as unknown as ContentPackage;

describe("V2 synchronization contracts", () => {
  it("prefers trace-owned code references over content mappings", () => {
    const step = makeStep(0, "COMPARE", [], [], undefined, {
      codeReference: { codeId: "bubbleSort", lineNumbers: [4] },
    });
    expect(resolveExecutionReferences(content, step).code?.activeLines).toEqual([4]);
  });

  it("does not guess an unmapped code line", () => {
    const step = makeStep(0, "SWAP", [], []);
    const result = resolveExecutionReferences(content, step);
    expect(result.code?.activeLines).toEqual([]);
    expect(result.code?.synchronized).toBe(false);
  });

  it("maps explicit pseudocode sections deterministically", () => {
    const step = makeStep(0, "COMPARE", [], [], undefined, {
      pseudocodeReference: { sectionId: "line-2" },
    });
    expect(resolveExecutionReferences(content, step).pseudocode?.activeLines).toEqual([2]);
  });
});
