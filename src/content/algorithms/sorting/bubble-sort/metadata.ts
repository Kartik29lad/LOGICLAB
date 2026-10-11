import type { ContentMetadata } from "../../../schema/content-types";

export const metadata: ContentMetadata = {
  id: "algorithm.bubble-sort",
  type: "ALGORITHM",
  slug: "bubble-sort",
  title: "Bubble Sort",
  summary: "A comparison sort that repeatedly swaps adjacent values that are out of order.",
  description: "A comparison sort that repeatedly swaps adjacent values that are out of order.",
  category: "sorting",
  difficulty: "BEGINNER",
  learningObjectives: [
    "Explain the main idea of Bubble Sort.",
    "Predict important execution steps for Bubble Sort.",
    "State the complexity and important edge cases.",
  ],
  prerequisites: ["array"],
  complexity: {
    timeBest: "O(n)",
    timeAverage: "O(n^2)",
    timeWorst: "O(n^2)",
    space: "O(1)",
  },
  examples: [
    {
      id: "bubble-sort-basic",
      title: "Basic example",
      description: "A comparison sort that repeatedly swaps adjacent values that are out of order.",
      input: "[7, 3, 9, 2, 5]",
      output: "See the final result in the explanation.",
      explanation: "Repeated local swaps move larger values toward the end of the unsorted region.",
    },
  ],
  commonMistakes: [
    "Applying Bubble Sort without checking its input assumptions.",
    "Confusing the current execution state with the final result.",
  ],
  relatedContent: [
    {
      slug: "array",
      relationship: "PREREQUISITE",
    },
    {
      slug: "insertion-sort",
      relationship: "RELATED",
    },
    {
      slug: "selection-sort",
      relationship: "RELATED",
    },
    {
      slug: "merge-sort",
      relationship: "RELATED",
    },
  ],
  links: [
    {
      label: "Algorithm catalog",
      href: "/algorithms/bubble-sort",
      kind: "INTERNAL",
    },
  ],
  implementationSlug: "bubble-sort",
  visualizationType: "array",
  tags: ["sorting", "beginner", "algorithms"],
  mainIdea: "Repeated local swaps move larger values toward the end of the unsorted region.",
  howItWorks: [
    "Scan adjacent pairs from left to right.",
    "Compare the two values.",
    "Swap them when the left value is greater.",
    "Shrink the active region after a pass.",
    "Stop early when a pass performs no swaps.",
  ],
  whyItWorks:
    "After each full pass, the largest remaining value is placed at the end of the active region.",
  useCases: [
    "Teaching comparison sorting",
    "Small or nearly sorted arrays",
    "Situations where stability matters",
  ],
  supportedInputs: [
    "Finite array of comparable numbers",
    "Duplicate values are allowed",
    "Empty arrays are valid",
  ],
  properties: ["Stable", "In-place", "Early termination"],
  terminology: [
    {
      term: "adjacent",
      definition: "Two neighboring array elements.",
      example: "indexes 2 and 3",
    },
  ],
  formulas: ["Compare a[j] with a[j + 1].", "Swap when a[j] > a[j + 1]."],
  supportedLanguages: ["typescript"],
  practiceReferences: ["challenge.bubble-sort.predict-next-step"],
  stepExplanations: [
    {
      event: "COMPARE",
      explanation: "The execution performs compare as part of the current step.",
    },
    {
      event: "SWAP",
      explanation: "The execution performs swap as part of the current step.",
    },
    {
      event: "SET_CURRENT",
      explanation: "The execution performs set current as part of the current step.",
    },
    {
      event: "COMPLETE",
      explanation: "The execution performs complete as part of the current step.",
    },
  ],
  isActive: true,
  schemaVersion: 1,
};
