import type { ContentPackage } from "../../schema/content-types";
import { metadata } from "./metadata";

export const content: ContentPackage = {
  metadata,
  explanation:
    "Work through the sorting family in order, then use the experiment and comparison systems to validate your mental model.",
  learningPath: {
    order: 2,
    itemSlugs: [
      "bubble-sort",
      "insertion-sort",
      "selection-sort",
      "merge-sort",
      "quick-sort",
      "heap-sort",
    ],
  },
};
