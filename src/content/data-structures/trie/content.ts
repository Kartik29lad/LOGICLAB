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
    question: "Why can a trie search depend on word length instead of number of stored words?",
    answer: "It follows one character edge per level.",
    explanation: "The structure indexes characters directly along a path.",
    hints: [
      "Count characters.",
      "Each character is one level.",
      "The number of other words is not traversed.",
    ],
    expectedInteraction: "Predict the next correct operation or state.",
  },
  execution: {
    inputRules: ["Strings", "Character-by-character traversal"],
    metrics: ["charactersVisited", "nodesCreated", "lookups"],
    finalResult: "The updated prefix tree and lookup result.",
    sampleTrace: ["VISIT", "INSERT", "READ", "FOUND"],
    edgeCases: ["empty string", "missing word", "shared prefix", "single word"],
  },
};
