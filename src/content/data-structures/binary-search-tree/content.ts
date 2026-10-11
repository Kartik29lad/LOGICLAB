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
    question: "Which branch is searched when the target is smaller than the current node?",
    answer: "The left subtree.",
    explanation: "The BST ordering places smaller values on the left.",
    hints: ["Compare target and node.", "Target is smaller.", "Choose left."],
    expectedInteraction: "Predict the next correct operation or state.",
  },
  execution: {
    inputRules: [
      "Comparable unique values in this implementation",
      "Insert/search/min/max operations",
    ],
    metrics: ["comparisons", "nodesVisited", "depth", "operations"],
    finalResult: "The updated tree or requested search/min/max result.",
    sampleTrace: ["COMPARE", "VISIT", "INSERT", "FOUND"],
    edgeCases: ["empty tree", "single node", "missing value", "skewed tree"],
  },
};
