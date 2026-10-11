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
    question: "What is the purpose of partitioning?",
    answer: "To place values on the appropriate side of the pivot and establish a pivot boundary.",
    explanation: "Partitioning creates smaller independent subproblems.",
    hints: [
      "Find the pivot.",
      "Separate smaller and larger values.",
      "The pivot ends between those regions.",
    ],
    expectedInteraction: "Predict the next correct operation or state.",
  },
  execution: {
    inputRules: [
      "Finite comparable values",
      "Duplicates allowed",
      "Worst-case inputs may cause deep recursion",
    ],
    metrics: ["comparisons", "swaps", "partitions", "recursiveCalls"],
    finalResult: "The input array sorted in ascending order.",
    sampleTrace: ["SET_CURRENT", "PARTITION", "COMPARE", "SWAP"],
    edgeCases: ["empty array", "one element", "already sorted", "repeated values"],
  },
};
