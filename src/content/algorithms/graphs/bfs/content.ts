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
    question: "Which structure determines the next BFS node?",
    answer: "The queue.",
    explanation: "BFS processes discovered nodes in FIFO order.",
    hints: ["Recall FIFO.", "BFS uses a queue.", "Take the front item."],
    expectedInteraction: "Predict the next correct operation or state.",
  },
  execution: {
    inputRules: [
      "Directed or undirected graph",
      "Valid start node",
      "Unweighted traversal semantics",
    ],
    metrics: ["nodesVisited", "edgesExamined", "queueOperations"],
    finalResult: "Traversal order plus predecessor and unweighted distance maps.",
    sampleTrace: ["ENQUEUE", "DEQUEUE", "VISIT", "DISCOVER"],
    edgeCases: ["empty graph", "invalid start", "disconnected graph", "single node"],
  },
};
