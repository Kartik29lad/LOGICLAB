import type { ContentMetadata } from "../../../schema/content-types";

export const metadata: ContentMetadata = {
  id: "algorithm.quick-sort",
  type: "ALGORITHM",
  slug: "quick-sort",
  title: "Quick Sort",
  summary: "A divide-and-conquer sort that partitions values around a pivot.",
  description: "A divide-and-conquer sort that partitions values around a pivot.",
  category: "sorting",
  difficulty: "INTERMEDIATE",
  learningObjectives: [
    "Explain the main idea of Quick Sort.",
    "Predict important execution steps for Quick Sort.",
    "State the complexity and important edge cases.",
  ],
  prerequisites: ["array"],
  complexity: {
    timeBest: "O(n log n)",
    timeAverage: "O(n log n)",
    timeWorst: "O(n^2)",
    space: "O(log n) average; O(n) worst-case",
  },
  examples: [
    {
      id: "quick-sort-basic",
      title: "Basic example",
      description: "A divide-and-conquer sort that partitions values around a pivot.",
      input: "[7, 3, 9, 2, 5]",
      output: "See the final result in the explanation.",
      explanation:
        "Partition a range around a pivot so smaller values go left and larger values go right.",
    },
  ],
  commonMistakes: [
    "Applying Quick Sort without checking its input assumptions.",
    "Confusing the current execution state with the final result.",
  ],
  relatedContent: [
    {
      slug: "array",
      relationship: "PREREQUISITE",
    },
    {
      slug: "merge-sort",
      relationship: "RELATED",
    },
    {
      slug: "heap-sort",
      relationship: "RELATED",
    },
  ],
  links: [
    {
      label: "Algorithm catalog",
      href: "/algorithms/quick-sort",
      kind: "INTERNAL",
    },
  ],
  implementationSlug: "quick-sort",
  visualizationType: "array",
  tags: ["sorting", "intermediate", "algorithms"],
  mainIdea:
    "Partition a range around a pivot so smaller values go left and larger values go right.",
  howItWorks: [
    "Choose a pivot.",
    "Partition the active range around the pivot.",
    "Place the pivot at its partition boundary.",
    "Recursively sort the left range.",
    "Recursively sort the right range.",
  ],
  whyItWorks:
    "After partitioning, the pivot is in a valid final position and the two remaining ranges can be solved independently.",
  useCases: [
    "General-purpose in-memory sorting",
    "Partitioning demonstrations",
    "Average-case efficient sorting",
  ],
  supportedInputs: [
    "Finite comparable values",
    "Duplicates allowed",
    "Worst-case inputs may cause deep recursion",
  ],
  properties: ["In-place partitioning", "Not stable", "Average O(n log n)"],
  terminology: [
    {
      term: "pivot",
      definition: "The reference value used to partition a range.",
      example: "the chosen array element",
    },
  ],
  formulas: [
    "Partition places values relative to pivot.",
    "Recurse on ranges left and right of the pivot.",
  ],
  supportedLanguages: ["typescript"],
  practiceReferences: ["challenge.quick-sort.predict-next-step"],
  stepExplanations: [
    {
      event: "SET_CURRENT",
      explanation: "The execution performs set current as part of the current step.",
    },
    {
      event: "PARTITION",
      explanation: "The execution performs partition as part of the current step.",
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
