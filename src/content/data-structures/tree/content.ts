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
    question: "What distinguishes a tree from a general graph?",
    answer:
      "A rooted tree models a hierarchy without cycles and gives each non-root node one parent.",
    explanation: "The parent-child structure is hierarchical.",
    hints: ["Think about cycles.", "Think about parent count.", "A tree is hierarchical."],
    expectedInteraction: "Predict the next correct operation or state.",
  },
  execution: {
    inputRules: ["Rooted nodes", "Parent-child relationships"],
    metrics: ["nodesVisited", "depth", "childrenVisited"],
    finalResult: "The updated hierarchy.",
    sampleTrace: ["INSERT", "VISIT", "SET_CURRENT"],
    edgeCases: ["empty tree", "single root", "leaf node", "deep chain"],
  },
};
