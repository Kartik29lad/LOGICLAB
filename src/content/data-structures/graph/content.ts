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
    question: "What is the difference between a directed and an undirected edge?",
    answer:
      "A directed edge has a source and destination; an undirected edge represents a two-way relationship.",
    explanation: "Direction changes which traversal transitions are allowed.",
    hints: [
      "Look at the arrow.",
      "No arrow means symmetric relation in the model.",
      "Arrow means direction matters.",
    ],
    expectedInteraction: "Predict the next correct operation or state.",
  },
  execution: {
    inputRules: ["Node identifiers", "Edges", "Optional non-negative weights"],
    metrics: ["nodes", "edges", "neighborLookups"],
    finalResult: "The updated graph topology.",
    sampleTrace: ["INSERT", "READ", "SET_CURRENT"],
    edgeCases: ["empty graph", "isolated node", "duplicate edge", "self-loop"],
  },
};
