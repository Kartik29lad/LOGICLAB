import type { ContentPackage } from "../../../schema/content-types";
import { code } from "./code";
import { explanation } from "./explanation";
import { metadata } from "./metadata";
import { pseudocode } from "./pseudocode";
import { visualization } from "./visualization";

export const content: ContentPackage = {
  metadata,
  explanation,
  pseudocode,
  code,
  visualization,
  challenge: {
    question: "If the target is at index 0, how many comparisons are needed?",
    answer: "One comparison.",
    explanation: "The first element is checked immediately.",
    hints: ["Start from index zero.", "Compare once.", "A match ends the search."],
    expectedInteraction: "Predict the next correct operation or state.",
  },
  execution: {
    inputRules: ["Finite array", "Target value", "Array may be unsorted"],
    metrics: ["comparisons", "steps"],
    finalResult: "The first matching index, or -1 when no match exists.",
    sampleTrace: ["SET_CURRENT", "COMPARE", "FOUND", "NOT_FOUND"],
    edgeCases: [
      "empty array",
      "target at first index",
      "target at last index",
      "target absent",
      "duplicates",
    ],
  },
};
