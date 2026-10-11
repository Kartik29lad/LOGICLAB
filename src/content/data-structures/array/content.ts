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
    question: "What is the cost of reading a known array index?",
    answer: "O(1).",
    explanation: "The index directly identifies the requested position.",
    hints: ["No scan is required.", "Use the index.", "Access is constant time."],
    expectedInteraction: "Predict the next correct operation or state.",
  },
  execution: {
    inputRules: ["Finite ordered values", "Zero-based integer indexes"],
    metrics: ["reads", "writes", "length"],
    finalResult: "The updated array values.",
    sampleTrace: ["READ", "WRITE", "SET_CURRENT"],
    edgeCases: ["empty array", "out-of-range index", "single element"],
  },
};
