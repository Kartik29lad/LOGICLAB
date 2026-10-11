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
    question: "When does DFS backtrack?",
    answer: "When the current node has no unvisited neighbor left.",
    explanation: "The branch is exhausted and exploration returns to the previous decision point.",
    hints: [
      "Check neighbors.",
      "If none are unvisited, the branch is done.",
      "Return to the previous node.",
    ],
    expectedInteraction: "Predict the next correct operation or state.",
  },
  execution: {
    inputRules: ["Directed or undirected graph", "Valid start node"],
    metrics: ["nodesVisited", "edgesExamined", "depth"],
    finalResult: "Traversal order from the chosen start node.",
    sampleTrace: ["VISIT", "DISCOVER", "BACKTRACK", "COMPLETE"],
    edgeCases: ["empty graph", "invalid start", "disconnected graph", "single node"],
  },
};
