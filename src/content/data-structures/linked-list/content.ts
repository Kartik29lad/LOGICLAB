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
    question: "Why does inserting at the head not require shifting existing values?",
    answer: "Only the head reference and one link need to change.",
    explanation: "Nodes are connected by references rather than fixed array positions.",
    hints: ["Look at the head.", "Create a new node.", "Point it to the old head."],
    expectedInteraction: "Predict the next correct operation or state.",
  },
  execution: {
    inputRules: ["Node values", "Reference-based links"],
    metrics: ["traversalSteps", "insertions", "deletions", "comparisons"],
    finalResult: "The updated node chain.",
    sampleTrace: ["INSERT", "REMOVE", "READ", "SET_CURRENT"],
    edgeCases: ["empty list", "one node", "delete head", "search missing value"],
  },
};
