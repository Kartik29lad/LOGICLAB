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
    question: "What happens when two keys map to one bucket?",
    answer:
      "The implementation stores them in the same bucket chain and distinguishes them by key.",
    explanation: "Separate chaining resolves collisions without overwriting a different key.",
    hints: ["A collision is not equality.", "Inspect the bucket chain.", "Compare keys."],
    expectedInteraction: "Predict the next correct operation or state.",
  },
  execution: {
    inputRules: ["Keys and values", "Hashable keys supported by the implementation"],
    metrics: ["hashes", "bucketProbes", "collisions", "operations"],
    finalResult: "The updated key-value mapping.",
    sampleTrace: ["HASH", "READ", "WRITE", "INSERT"],
    edgeCases: ["empty table", "colliding keys", "missing key", "duplicate key update"],
  },
};
