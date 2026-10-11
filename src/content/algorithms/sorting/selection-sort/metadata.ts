import type { ContentMetadata } from "../../../schema/content-types";

export const metadata: ContentMetadata = {
  id: "algorithm.selection-sort",
  type: "ALGORITHM",
  slug: "selection-sort",
  title: "Selection Sort",
  summary: "A comparison sort that repeatedly selects the smallest remaining value.",
  description: "A comparison sort that repeatedly selects the smallest remaining value.",
  category: "sorting",
  difficulty: "BEGINNER",
  learningObjectives: [
    "Explain the main idea of Selection Sort.",
    "Predict important execution steps for Selection Sort.",
    "State the complexity and important edge cases.",
  ],
  prerequisites: ["array"],
  complexity: {
    timeBest: "O(n^2)",
    timeAverage: "O(n^2)",
    timeWorst: "O(n^2)",
    space: "O(1)",
  },
  examples: [
    {
      id: "selection-sort-basic",
      title: "Basic example",
      description: "A comparison sort that repeatedly selects the smallest remaining value.",
      input: "[7, 3, 9, 2, 5]",
      output: "See the final result in the explanation.",
      explanation: "Find the minimum in the unsorted region and place it at the region boundary.",
    },
  ],
  commonMistakes: [
    "Applying Selection Sort without checking its input assumptions.",
    "Confusing the current execution state with the final result.",
  ],
  relatedContent: [
    {
      slug: "array",
      relationship: "PREREQUISITE",
    },
    {
      slug: "bubble-sort",
      relationship: "RELATED",
    },
    {
      slug: "insertion-sort",
      relationship: "RELATED",
    },
  ],
  links: [
    {
      label: "Algorithm catalog",
      href: "/algorithms/selection-sort",
      kind: "INTERNAL",
    },
  ],
  implementationSlug: "selection-sort",
  visualizationType: "array",
  tags: ["sorting", "beginner", "algorithms"],
  mainIdea: "Find the minimum in the unsorted region and place it at the region boundary.",
  howItWorks: [
    "Choose the first unsorted position.",
    "Scan the remaining values for the minimum.",
    "Remember the minimum index.",
    "Swap the minimum into the boundary position.",
    "Advance the sorted boundary.",
  ],
  whyItWorks:
    "The selected minimum is no larger than any remaining unsorted value, so placing it next fixes the next sorted position.",
  useCases: ["Simple teaching examples", "Small arrays", "Cases where swaps should be limited"],
  supportedInputs: ["Finite comparable values", "Duplicates allowed", "Empty arrays valid"],
  properties: ["In-place", "Usually not stable"],
  terminology: [
    {
      term: "sorted boundary",
      definition: "The first position after the sorted prefix.",
      example: "index i",
    },
  ],
  formulas: ["minIndex = argmin(a[i..n-1]).", "Swap a[i] and a[minIndex]."],
  supportedLanguages: ["typescript"],
  practiceReferences: ["challenge.selection-sort.predict-next-step"],
  stepExplanations: [
    {
      event: "COMPARE",
      explanation: "The execution performs compare as part of the current step.",
    },
    {
      event: "SET_CURRENT",
      explanation: "The execution performs set current as part of the current step.",
    },
    {
      event: "SWAP",
      explanation: "The execution performs swap as part of the current step.",
    },
    {
      event: "COMPLETE",
      explanation: "The execution performs complete as part of the current step.",
    },
  ],
  isActive: true,
  schemaVersion: 1,
};
