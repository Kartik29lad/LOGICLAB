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
    question: "Why can binary search discard half the range after one comparison?",
    answer: "Because the array is sorted.",
    explanation: "The ordering tells us which half cannot contain the target.",
    hints: ["Use the middle value.", "Compare it to the target.", "Discard the impossible side."],
    expectedInteraction: "Predict the next correct operation or state.",
  },
  execution: {
    inputRules: ["Sorted finite array", "Target value", "Ascending order in this implementation"],
    metrics: ["comparisons", "steps"],
    finalResult: "The target index, or -1 when absent.",
    sampleTrace: ["SET_CURRENT", "COMPARE", "NARROW_RANGE", "FOUND"],
    edgeCases: [
      "empty array",
      "one element",
      "target absent",
      "duplicate values",
      "unsorted input is invalid",
    ],
  },
};
