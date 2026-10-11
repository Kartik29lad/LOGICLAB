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
    question: "When is an edge relaxed?",
    answer: "When the route through the current node gives a shorter distance to the neighbor.",
    explanation: "Relaxation improves the tentative shortest-path estimate.",
    hints: [
      "Compute the alternate distance.",
      "Compare it with the current distance.",
      "Update only if smaller.",
    ],
    expectedInteraction: "Predict the next correct operation or state.",
  },
  execution: {
    inputRules: ["Graph with non-negative weights", "Valid start node"],
    metrics: ["nodesFinalized", "edgesRelaxed", "distanceUpdates"],
    finalResult:
      "Shortest-distance and predecessor maps; paths can be reconstructed from predecessors.",
    sampleTrace: ["SET_CURRENT", "RELAX", "VISIT", "UPDATE_DISTANCE"],
    edgeCases: [
      "empty graph",
      "invalid start",
      "unreachable nodes",
      "negative weights are invalid",
    ],
  },
};
