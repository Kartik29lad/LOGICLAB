import type { ContentPackage } from "../../schema/content-types";
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
    question: "Where is the highest-priority item stored?",
    answer: "At the root.",
    explanation: "The heap property guarantees the root has highest priority.",
    hints: ["Recall the heap property.", "Look at index zero.", "That is the root."],
    expectedInteraction: "Predict the next correct operation or state.",
  },
  execution: {
    inputRules: ["Comparable values", "Min-heap or max-heap semantics"],
    metrics: ["comparisons", "swaps", "siftSteps", "size"],
    finalResult: "The updated heap array.",
    sampleTrace: ["PUSH", "POP", "COMPARE", "SWAP"],
    edgeCases: ["empty heap", "single item", "duplicate priorities"],
  },
};
