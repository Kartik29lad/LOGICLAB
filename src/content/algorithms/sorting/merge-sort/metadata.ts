import type { ContentMetadata } from "../../../schema/content-types";

export const metadata: ContentMetadata = {
  id: "algorithm.merge-sort",
  type: "ALGORITHM",
  slug: "merge-sort",
  title: "Merge Sort",
  summary: "A divide-and-conquer sort that recursively sorts halves and merges them.",
  description: "A divide-and-conquer sort that recursively sorts halves and merges them.",
  category: "sorting",
  difficulty: "INTERMEDIATE",
  learningObjectives: [
    "Explain the main idea of Merge Sort.",
    "Predict important execution steps for Merge Sort.",
    "State the complexity and important edge cases.",
  ],
  prerequisites: ["array"],
  complexity: {
    timeBest: "O(n log n)",
    timeAverage: "O(n log n)",
    timeWorst: "O(n log n)",
    space: "O(n)",
  },
  examples: [
    {
      id: "merge-sort-basic",
      title: "Basic example",
      description: "A divide-and-conquer sort that recursively sorts halves and merges them.",
      input: "[7, 3, 9, 2, 5]",
      output: "See the final result in the explanation.",
      explanation: "Split the array until subarrays are trivial, then merge sorted halves.",
    },
  ],
  commonMistakes: [
    "Applying Merge Sort without checking its input assumptions.",
    "Confusing the current execution state with the final result.",
  ],
  relatedContent: [
    {
      slug: "array",
      relationship: "PREREQUISITE",
    },
    {
      slug: "quick-sort",
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
      href: "/algorithms/merge-sort",
      kind: "INTERNAL",
    },
  ],
  implementationSlug: "merge-sort",
  visualizationType: "array",
  tags: ["sorting", "intermediate", "algorithms"],
  mainIdea: "Split the array until subarrays are trivial, then merge sorted halves.",
  howItWorks: [
    "Split the current range into halves.",
    "Recursively sort each half.",
    "Compare the front values of both halves.",
    "Write the smaller value into the merged range.",
    "Continue until the full range is rebuilt.",
  ],
  whyItWorks:
    "Merging two sorted halves produces one sorted range, and recursion makes every half sorted before merging.",
  useCases: ["Large datasets", "Stable sorting", "Divide-and-conquer teaching"],
  supportedInputs: ["Finite comparable values", "Duplicates allowed", "Empty arrays valid"],
  properties: ["Stable", "Not in-place in this implementation", "Predictable O(n log n) time"],
  terminology: [
    {
      term: "merge",
      definition: "Combining two sorted ranges into one sorted range.",
      example: "[2,5] + [1,4]",
    },
  ],
  formulas: ["mid = floor((low + high) / 2).", "Merge chooses the smaller front value."],
  supportedLanguages: ["typescript"],
  practiceReferences: ["challenge.merge-sort.predict-next-step"],
  stepExplanations: [
    {
      event: "SPLIT",
      explanation: "The execution performs split as part of the current step.",
    },
    {
      event: "COMPARE",
      explanation: "The execution performs compare as part of the current step.",
    },
    {
      event: "WRITE",
      explanation: "The execution performs write as part of the current step.",
    },
    {
      event: "MERGE",
      explanation: "The execution performs merge as part of the current step.",
    },
  ],
  isActive: true,
  schemaVersion: 1,
};
