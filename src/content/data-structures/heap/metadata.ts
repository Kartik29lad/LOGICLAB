import type { ContentMetadata } from "../../schema/content-types";

export const metadata: ContentMetadata = {
  id: "data_structure.heap",
  type: "DATA_STRUCTURE",
  slug: "heap",
  title: "Heap",
  summary:
    "A complete binary tree represented compactly with an array and ordered by a heap property.",
  description:
    "A complete binary tree represented compactly with an array and ordered by a heap property.",
  category: "data-structures",
  difficulty: "INTERMEDIATE",
  learningObjectives: [
    "Explain the main idea of Heap.",
    "Predict important execution steps for Heap.",
    "State the complexity and important edge cases.",
  ],
  prerequisites: ["array"],
  complexity: {
    timeBest: "O(1)",
    timeAverage: "O(log n)",
    timeWorst: "O(log n)",
    space: "O(n)",
  },
  examples: [
    {
      id: "heap-basic",
      title: "Basic example",
      description:
        "A complete binary tree represented compactly with an array and ordered by a heap property.",
      input: "[7, 3, 9, 2, 5]",
      output: "See the final result in the explanation.",
      explanation: "Maintain parent-child priority so the root is the minimum or maximum element.",
    },
  ],
  commonMistakes: [
    "Applying Heap without checking its input assumptions.",
    "Confusing the current execution state with the final result.",
  ],
  relatedContent: [
    {
      slug: "heap-sort",
      relationship: "RELATED",
    },
    {
      slug: "array",
      relationship: "PREREQUISITE",
    },
    {
      slug: "binary-search-tree",
      relationship: "RELATED",
    },
  ],
  links: [
    {
      label: "Data structure catalog",
      href: "/data-structures/heap",
      kind: "INTERNAL",
    },
  ],
  implementationSlug: "binary-heap",
  visualizationType: "heap",
  tags: ["data-structures", "intermediate", "data-structures"],
  mainIdea: "Maintain parent-child priority so the root is the minimum or maximum element.",
  howItWorks: [
    "Represent the complete tree in an array.",
    "Insert at the end.",
    "Bubble the value upward when needed.",
    "Remove the root by replacing it with the last value.",
    "Sift the replacement downward.",
  ],
  whyItWorks:
    "The heap property lets root access be constant time while insert/remove restore order in logarithmic time.",
  useCases: ["Priority queues", "Heap sort", "Scheduling"],
  supportedInputs: ["Comparable values", "Min-heap or max-heap semantics"],
  properties: ["Complete tree", "Priority at root"],
  terminology: [
    {
      term: "heap property",
      definition: "Each parent satisfies the chosen priority relation with its children.",
      example: "parent <= children for min-heap",
    },
  ],
  formulas: ["left(i)=2i+1; right(i)=2i+2; parent(i)=floor((i-1)/2)."],
  supportedLanguages: ["typescript"],
  practiceReferences: ["challenge.heap.predict-next-step"],
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
      event: "COMPARE",
      explanation: "The execution performs compare as part of the current step.",
    },
    {
      event: "SWAP",
      explanation: "The execution performs swap as part of the current step.",
    },
  ],
  isActive: true,
  schemaVersion: 1,
};
