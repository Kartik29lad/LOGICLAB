import type { ContentPackage } from "../../schema/content-types";
import { metadata } from "./metadata";

export const content: ContentPackage = {
  metadata,
  explanation:
    "Follow the path in order. Earlier concepts remain useful as prerequisites for later algorithm work.",
  learningPath: {
    order: 1,
    itemSlugs: [
      "array",
      "linear-search",
      "binary-search",
      "bubble-sort",
      "insertion-sort",
      "selection-sort",
    ],
  },
};
