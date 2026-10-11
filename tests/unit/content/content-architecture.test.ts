import { describe, expect, it } from "vitest";

import { content as validContent } from "../../../src/content/algorithms/sorting/bubble-sort/content";
import { ContentRegistry } from "../../../src/content/registry/content-registry";
import { validateRegistry } from "../../../src/content/registry/validate-registry";
import { calculateContentHash } from "../../../src/content/schema/content-hash";
import { validateContentPackage } from "../../../src/content/schema/content-validator";

describe("Phase 8 content architecture", () => {
  it("validates the formal educational schema", () =>
    expect(validateContentPackage(validContent)).toEqual([]));
  it("produces a stable SHA-256 hash independent of object key order", () => {
    const reordered = {
      ...validContent,
      metadata: { ...validContent.metadata, tags: [...validContent.metadata.tags] },
    };
    expect(calculateContentHash(validContent)).toBe(calculateContentHash(reordered));
  });
  it("detects duplicate registry slugs and missing implementation references", () => {
    const registry = new ContentRegistry();
    registry.registerAlgorithm("sorting.bubble-sort");
    registry.registerVisualization("array");
    const result = validateRegistry([validContent, validContent], registry);
    expect(result.valid).toBe(false);
    expect(result.issues.some((issue) => issue.message === "duplicate slug")).toBe(true);
  });
});
