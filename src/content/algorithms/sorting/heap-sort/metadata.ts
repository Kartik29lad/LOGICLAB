import type { ContentMetadata } from "../../../schema/content-types";

export const metadata: ContentMetadata = {
  id: "algorithm.heap-sort",
  type: "ALGORITHM",
  slug: "heap-sort",
  title: "Heap Sort",
  summary: "A comparison sort that uses a binary heap to repeatedly select the maximum value.",
  description: "A comparison sort that uses a binary heap to repeatedly select the maximum value.",
  category: "sorting",
  difficulty: "INTERMEDIATE",
  learningObjectives: [
    "Explain the main idea of Heap Sort.",
    "Predict important execution steps for Heap Sort.",
    "State the complexity and important edge cases.",
  ],
  prerequisites: ["array", "heap"],
  complexity: {
    timeBest: "O(n log n)",
    timeAverage: "O(n log n)",
    timeWorst: "O(n log n)",
    space: "O(1)",
  },
  examples: [
    {
      id: "heap-sort-basic",
      title: "Basic example",
      description:
        "A comparison sort that uses a binary heap to repeatedly select the maximum value.",
      input: "[7, 3, 9, 2, 5]",
      output: "See the final result in the explanation.",
      explanation: "Build a max-heap, move its maximum to the end, and restore the heap property.",
    },
  ],
  commonMistakes: [
    "Applying Heap Sort without checking its input assumptions.",
    "Confusing the current execution state with the final result.",
  ],
  relatedContent: [
    {
      slug: "array",
      relationship: "PREREQUISITE",
    },
    {
      slug: "heap",
      relationship: "PREREQUISITE",
    },
    {
      slug: "merge-sort",
      relationship: "RELATED",
    },
  ],
  links: [
    {
      label: "Algorithm catalog",
      href: "/algorithms/heap-sort",
      kind: "INTERNAL",
    },
  ],
  implementationSlug: "heap-sort",
  visualizationType: "array",
  tags: ["sorting", "intermediate", "algorithms"],
  mainIdea: "Build a max-heap, move its maximum to the end, and restore the heap property.",
  howItWorks: [
    "Build a max-heap from the array.",
    "Swap the root with the last unsorted position.",
    "Shrink the heap boundary.",
    "Restore the heap property.",
    "Repeat until one element remains.",
  ],
  whyItWorks:
    "The heap exposes the largest remaining value at its root, so repeated extraction fixes the array from right to left.",
  useCases: ["Predictable O(n log n) sorting", "In-place sorting", "Heap demonstrations"],
  supportedInputs: ["Finite comparable values", "Duplicates allowed", "Empty arrays valid"],
  properties: ["In-place", "Not stable", "O(n log n) worst-case"],
  terminology: [
    {
      term: "heapify",
      definition: "Restore the heap property below a node.",
      example: "sift-down",
    },
  ],
  formulas: [
    "left = 2i + 1; right = 2i + 2 for zero-based indexing.",
    "The root is the maximum in a max-heap.",
  ],
  supportedLanguages: ["typescript"],
  practiceReferences: ["challenge.heap-sort.predict-next-step"],
  stepExplanations: [
    {
      event: "HEAPIFY",
      explanation: "The execution performs heapify as part of the current step.",
    },
    {
      event: "SWAP",
      explanation: "The execution performs swap as part of the current step.",
    },
    {
      event: "COMPARE",
      explanation: "The execution performs compare as part of the current step.",
    },
    {
      event: "SET_CURRENT",
      explanation: "The execution performs set current as part of the current step.",
    },
  ],
  isActive: true,
  schemaVersion: 1,
};
