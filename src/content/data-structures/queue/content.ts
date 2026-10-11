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
    question: "If A, B, C are enqueued in that order, what leaves first?",
    answer: "A.",
    explanation: "Queues are FIFO.",
    hints: ["Find the front.", "A arrived first.", "A is dequeued first."],
    expectedInteraction: "Predict the next correct operation or state.",
  },
  execution: {
    inputRules: ["Any values", "Operations enqueue, dequeue, peek"],
    metrics: ["enqueues", "dequeues", "peeks", "size"],
    finalResult: "The current queue contents and optional dequeued value.",
    sampleTrace: ["ENQUEUE", "DEQUEUE", "READ", "COMPLETE"],
    edgeCases: ["empty dequeue", "empty peek", "single item"],
  },
};
