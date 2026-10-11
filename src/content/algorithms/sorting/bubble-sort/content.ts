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
    question: "After comparing 7 and 3, what happens next?",
    answer: "Swap 7 and 3.",
    explanation: "The adjacent pair is out of ascending order.",
    hints: ["Look at the comparison rule.", "The left value is larger.", "Swap the pair."],
    expectedInteraction: "Predict the next correct operation or state.",
  },
  execution: {
    inputRules: [
      "Finite array of comparable numbers",
      "Duplicate values are allowed",
      "Empty arrays are valid",
    ],
    metrics: ["comparisons", "swaps", "passes", "steps"],
    finalResult: "The input array sorted in ascending order.",
    sampleTrace: ["COMPARE", "SWAP", "SET_CURRENT", "COMPLETE"],
    edgeCases: ["empty array", "one element", "already sorted", "all equal values"],
  },
};
