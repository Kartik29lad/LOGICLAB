import { hasAlgorithmImplementation } from "../../core/algorithms/catalog";
import { DATA_STRUCTURE_METADATA } from "../../core/data-structures/metadata";
import type { ContentRegistryReferenceProvider } from "../schema/content-types";

const DATA_STRUCTURE_SLUGS = new Set(DATA_STRUCTURE_METADATA.map((item) => item.id));
const VISUALIZATION_TYPES = [
  "array",
  "graph",
  "tree",
  "stack",
  "queue",
  "linked-list",
  "hash-table",
  "heap",
  "grid",
  "matrix",
  "text",
  "code",
  "chart",
  "comparison",
] as const;

export const DEFAULT_CONTENT_REFERENCES: ContentRegistryReferenceProvider = {
  hasAlgorithm: hasAlgorithmImplementation,
  hasDataStructure: (slug) => DATA_STRUCTURE_SLUGS.has(slug),
  hasChallenge: () => false,
  hasLearningPath: () => false,
  hasVisualization: (type) =>
    VISUALIZATION_TYPES.includes(type as (typeof VISUALIZATION_TYPES)[number]),
};
