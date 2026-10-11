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
    question: "Which region is guaranteed sorted before inserting the next key?",
    answer: "The prefix before the key index.",
    explanation: "Insertion sort maintains a sorted prefix after every iteration.",
    hints: [
      "Identify the current key.",
      "Everything before it is already processed.",
      "That prefix is the sorted region.",
    ],
    expectedInteraction: "Predict the next correct operation or state.",
  },
  execution: {
    inputRules: [
      "Finite array of comparable numbers",
      "Duplicates are allowed",
      "Empty arrays are valid",
    ],
    metrics: ["comparisons", "writes", "shifts", "steps"],
    finalResult: "The input array sorted in ascending order.",
    sampleTrace: ["SET_CURRENT", "COMPARE", "WRITE", "COMPLETE"],
    edgeCases: ["empty array", "one element", "already sorted", "reverse sorted"],
  },
};
