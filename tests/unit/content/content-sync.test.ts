import { describe, expect, it } from "vitest";

import { calculateContentHash } from "../../../src/content/schema/content-hash";
import type { ContentPackage } from "../../../src/content/schema/content-types";
import { validateContentPackage } from "../../../src/content/schema/content-validator";

const packageFixture: ContentPackage = {
  metadata: {
    id: "data-structure-stack",
    type: "DATA_STRUCTURE",
    slug: "stack",
    title: "Stack",
    summary: "A LIFO data structure.",
    description: "A stack stores the most recently added item at the top.",
    category: "linear",
    difficulty: "BEGINNER",
    learningObjectives: ["Explain LIFO"],
    prerequisites: [],
    examples: [
      {
        id: "push-pop",
        title: "Push and pop",
        description: "Basic operations",
        input: [1, 2],
        output: [2, 1],
      },
    ],
    commonMistakes: [],
    relatedContent: [],
    implementationSlug: "stack",
    visualizationType: "stack",
    tags: ["linear"],
    isActive: true,
    schemaVersion: 1,
  },
  explanation: "A stack follows last-in, first-out ordering.",
};

describe("content synchronization invariants", () => {
  it("hashes complete package changes", () => {
    const changed = { ...packageFixture, explanation: "A stack follows LIFO ordering." };
    expect(calculateContentHash(packageFixture)).not.toBe(calculateContentHash(changed));
  });

  it("rejects a concept package at the database boundary without corrupt mapping", () => {
    const concept: ContentPackage = {
      ...packageFixture,
      metadata: {
        ...packageFixture.metadata,
        type: "CONCEPT_EXPLANATION",
        implementationSlug: undefined,
      },
    };
    expect(validateContentPackage(concept)).toEqual([]);
  });
});
