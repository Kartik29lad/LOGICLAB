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
    question: "Where is the next maximum found in a max-heap?",
    answer: "At the heap root.",
    explanation: "The heap property keeps the largest value at the root.",
    hints: ["Recall the max-heap property.", "Look at the root.", "The root is the maximum."],
    expectedInteraction: "Predict the next correct operation or state.",
  },
  execution: {
    inputRules: ["Finite comparable values", "Duplicates allowed", "Empty arrays valid"],
    metrics: ["comparisons", "swaps", "heapifyCalls", "steps"],
    finalResult: "The input array sorted in ascending order.",
    sampleTrace: ["HEAPIFY", "SWAP", "COMPARE", "SET_CURRENT"],
    edgeCases: ["empty array", "single element", "duplicates", "already sorted"],
  },
};
