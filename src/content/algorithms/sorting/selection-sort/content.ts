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
    question: "What does selection sort search for during each outer iteration?",
    answer: "The smallest value in the unsorted region.",
    explanation: "It selects the next value that belongs at the sorted boundary.",
    hints: ["Find the unsorted region.", "Look for its minimum.", "That minimum is selected."],
    expectedInteraction: "Predict the next correct operation or state.",
  },
  execution: {
    inputRules: ["Finite comparable values", "Duplicates allowed", "Empty arrays valid"],
    metrics: ["comparisons", "swaps", "minimumUpdates", "steps"],
    finalResult: "The input array sorted in ascending order.",
    sampleTrace: ["COMPARE", "SET_CURRENT", "SWAP", "COMPLETE"],
    edgeCases: ["empty array", "one element", "duplicates", "already sorted"],
  },
};
