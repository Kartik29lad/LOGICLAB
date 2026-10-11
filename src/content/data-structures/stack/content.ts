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
    question: "If A, then B, then C are pushed, what does pop return first?",
    answer: "C.",
    explanation: "Stacks are LIFO.",
    hints: ["Look at the top.", "C was pushed last.", "Therefore C is removed first."],
    expectedInteraction: "Predict the next correct operation or state.",
  },
  execution: {
    inputRules: ["Any values", "Operations push, pop, peek"],
    metrics: ["pushes", "pops", "peeks", "size"],
    finalResult: "The current stack contents and optional popped/peeked value.",
    sampleTrace: ["PUSH", "POP", "READ", "COMPLETE"],
    edgeCases: ["empty pop", "empty peek", "single item"],
  },
};
