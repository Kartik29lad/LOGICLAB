import type { ContentMetadata } from "../../schema/content-types";

export const metadata: ContentMetadata = {
  id: "data_structure.queue",
  type: "DATA_STRUCTURE",
  slug: "queue",
  title: "Queue",
  summary: "A FIFO collection where the earliest enqueued item is removed first.",
  description: "A FIFO collection where the earliest enqueued item is removed first.",
  category: "data-structures",
  difficulty: "BEGINNER",
  learningObjectives: [
    "Explain the main idea of Queue.",
    "Predict important execution steps for Queue.",
    "State the complexity and important edge cases.",
  ],
  prerequisites: ["stack"],
  complexity: {
    timeBest: "O(1)",
    timeAverage: "O(n)",
    timeWorst: "O(n)",
    space: "O(n)",
  },
  examples: [
    {
      id: "queue-basic",
      title: "Basic example",
      description: "A FIFO collection where the earliest enqueued item is removed first.",
      input: "A small representative structure",
      output: "See the final result in the explanation.",
      explanation: "Add items at the back and remove items from the front.",
    },
  ],
  commonMistakes: [
    "Applying Queue without checking its input assumptions.",
    "Confusing the current execution state with the final result.",
  ],
  relatedContent: [
    {
      slug: "stack",
      relationship: "PREREQUISITE",
    },
    {
      slug: "bfs",
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
      href: "/data-structures/queue",
      kind: "INTERNAL",
    },
  ],
  implementationSlug: "queue",
  visualizationType: "queue",
  tags: ["data-structures", "beginner", "data-structures"],
  mainIdea: "Add items at the back and remove items from the front.",
  howItWorks: ["Enqueue at the back.", "Inspect the front.", "Dequeue from the front."],
  whyItWorks: "FIFO ordering preserves arrival order.",
  useCases: ["BFS", "Task scheduling", "Buffers"],
  supportedInputs: ["Any values", "Operations enqueue, dequeue, peek"],
  properties: ["FIFO", "Front and back ends"],
  terminology: [
    {
      term: "FIFO",
      definition: "First-in, first-out ordering.",
      example: "the earliest queued value leaves first",
    },
  ],
  formulas: ["front = earliest element still waiting."],
  supportedLanguages: ["typescript"],
  practiceReferences: ["challenge.queue.predict-next-step"],
  stepExplanations: [
    {
      event: "ENQUEUE",
      explanation: "The execution performs enqueue as part of the current step.",
    },
    {
      event: "DEQUEUE",
      explanation: "The execution performs dequeue as part of the current step.",
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
