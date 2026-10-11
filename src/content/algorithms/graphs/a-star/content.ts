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
    question: "What two values make up A*'s priority score?",
    answer: "g(n) and h(n).",
    explanation: "A* combines known path cost with estimated remaining cost.",
    hints: ["Recall f(n).", "g is known cost.", "h is estimated remaining cost."],
    expectedInteraction: "Predict the next correct operation or state.",
  },
  execution: {
    inputRules: [
      "Graph with non-negative weights",
      "Start and target nodes",
      "Admissible/consistent heuristic for optimality",
    ],
    metrics: ["nodesExpanded", "edgesRelaxed", "heuristicEvaluations"],
    finalResult: "A reconstructed path to the target when reachable, otherwise no path.",
    sampleTrace: ["SET_CURRENT", "RELAX", "UPDATE_DISTANCE", "VISIT"],
    edgeCases: [
      "invalid endpoints",
      "unreachable target",
      "negative weights are invalid",
      "inadmissible heuristic loses optimality guarantee",
    ],
  },
};
