import type { ContentMetadata } from "../../schema/content-types";

export const metadata: ContentMetadata = {
  id: "data_structure.stack",
  type: "DATA_STRUCTURE",
  slug: "stack",
  title: "Stack",
  summary: "A LIFO collection where the most recently pushed item is removed first.",
  description: "A LIFO collection where the most recently pushed item is removed first.",
  category: "data-structures",
  difficulty: "BEGINNER",
  learningObjectives: [
    "Explain the main idea of Stack.",
    "Predict important execution steps for Stack.",
    "State the complexity and important edge cases.",
  ],
  prerequisites: ["queue"],
  complexity: {
    timeBest: "O(1)",
    timeAverage: "O(1)",
    timeWorst: "O(1)",
    space: "O(n)",
  },
  examples: [
    {
      id: "stack-basic",
      title: "Basic example",
      description: "A LIFO collection where the most recently pushed item is removed first.",
      input: "A small representative structure",
      output: "See the final result in the explanation.",
      explanation: "Add and remove items from one end called the top.",
    },
  ],
  commonMistakes: [
    "Applying Stack without checking its input assumptions.",
    "Confusing the current execution state with the final result.",
  ],
  relatedContent: [
    {
      slug: "queue",
      relationship: "PREREQUISITE",
    },
    {
      slug: "dfs",
      relationship: "NEXT",
    },
    {
      slug: "linked-list",
      relationship: "RELATED",
    },
  ],
  links: [
    {
      label: "Data structure catalog",
      href: "/data-structures/stack",
      kind: "INTERNAL",
    },
  ],
  implementationSlug: "stack",
  visualizationType: "stack",
  tags: ["data-structures", "beginner", "data-structures"],
  mainIdea: "Add and remove items from one end called the top.",
  howItWorks: [
    "Push a value onto the top.",
    "Peek at the top without removing it.",
    "Pop the top value when removing.",
  ],
  whyItWorks: "The top operation order enforces last-in, first-out behavior.",
  useCases: ["Undo systems", "Call-stack concepts", "Depth-first search"],
  supportedInputs: ["Any values", "Operations push, pop, peek"],
  properties: ["LIFO", "Single active end"],
  terminology: [
    {
      term: "LIFO",
      definition: "Last-in, first-out ordering.",
      example: "the last pushed value pops first",
    },
  ],
  formulas: ["top = most recently pushed element."],
  supportedLanguages: ["typescript"],
  practiceReferences: ["challenge.stack.predict-next-step"],
  stepExplanations: [
    {
      event: "PUSH",
      explanation: "The execution performs push as part of the current step.",
    },
    {
      event: "POP",
      explanation: "The execution performs pop as part of the current step.",
    },
    {
      event: "READ",
      explanation: "The execution performs read as part of the current step.",
    },
    {
      event: "COMPLETE",
      explanation: "The execution performs complete as part of the current step.",
    },
  ],
  isActive: true,
  schemaVersion: 1,
};
