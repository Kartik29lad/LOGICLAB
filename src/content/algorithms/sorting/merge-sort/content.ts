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
    question: "Why can two sorted halves be merged in linear time?",
    answer: "Because each front value is examined once as one of the two fronts advances.",
    explanation: "The smallest remaining value must be at one of the two fronts.",
    hints: [
      "Only compare the two front values.",
      "Advance the side you choose.",
      "Each value is consumed once.",
    ],
    expectedInteraction: "Predict the next correct operation or state.",
  },
  execution: {
    inputRules: ["Finite comparable values", "Duplicates allowed", "Empty arrays valid"],
    metrics: ["comparisons", "writes", "merges", "steps"],
    finalResult: "A sorted copy of the input values.",
    sampleTrace: ["SPLIT", "COMPARE", "WRITE", "MERGE"],
    edgeCases: ["empty array", "single element", "duplicate values", "already sorted"],
  },
};
