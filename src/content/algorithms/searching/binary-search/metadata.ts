import type { ContentMetadata } from "../../../schema/content-types";

export const metadata: ContentMetadata = {
  id: "algorithm.binary-search",
  type: "ALGORITHM",
  slug: "binary-search",
  title: "Binary Search",
  summary: "A search that repeatedly halves a sorted search interval.",
  description: "A search that repeatedly halves a sorted search interval.",
  category: "searching",
  difficulty: "INTERMEDIATE",
  learningObjectives: [
    "Explain the main idea of Binary Search.",
    "Predict important execution steps for Binary Search.",
    "State the complexity and important edge cases.",
  ],
  prerequisites: ["array"],
  complexity: {
    timeBest: "O(1)",
    timeAverage: "O(log n)",
    timeWorst: "O(log n)",
    space: "O(1)",
  },
  examples: [
    {
      id: "binary-search-basic",
      title: "Basic example",
      description: "A search that repeatedly halves a sorted search interval.",
      input: "[7, 3, 9, 2, 5]",
      output: "See the final result in the explanation.",
      explanation:
        "Compare the target with the middle value and discard the half that cannot contain it.",
    },
  ],
  commonMistakes: [
    "Applying Binary Search without checking its input assumptions.",
    "Confusing the current execution state with the final result.",
  ],
  relatedContent: [
    {
      slug: "array",
      relationship: "PREREQUISITE",
    },
    {
      slug: "linear-search",
      relationship: "RELATED",
    },
  ],
  links: [
    {
      label: "Algorithm catalog",
      href: "/algorithms/binary-search",
      kind: "INTERNAL",
    },
  ],
  implementationSlug: "binary-search",
  visualizationType: "array",
  tags: ["searching", "intermediate", "algorithms"],
  mainIdea: "Compare the target with the middle value and discard the half that cannot contain it.",
  howItWorks: [
    "Require sorted input.",
    "Compute the middle index.",
    "Compare the middle value with the target.",
    "Discard the impossible half.",
    "Repeat until found or the interval is empty.",
  ],
  whyItWorks:
    "A sorted array tells us which half can still contain the target after each comparison.",
  useCases: [
    "Fast lookup in sorted arrays",
    "Teaching divide-and-conquer",
    "Index-based searching",
  ],
  supportedInputs: [
    "Sorted finite array",
    "Target value",
    "Ascending order in this implementation",
  ],
  properties: ["Requires sorted input", "Logarithmic search time"],
  terminology: [
    {
      term: "search interval",
      definition: "The remaining low-to-high index range.",
      example: "low=2, high=7",
    },
  ],
  formulas: [
    "mid = floor((low + high) / 2).",
    "If target < a[mid], set high = mid - 1; otherwise set low = mid + 1.",
  ],
  supportedLanguages: ["typescript"],
  practiceReferences: ["challenge.binary-search.predict-next-step"],
  stepExplanations: [
    {
      event: "SET_CURRENT",
      explanation: "The execution performs set current as part of the current step.",
    },
    {
      event: "COMPARE",
      explanation: "The execution performs compare as part of the current step.",
    },
    {
      event: "NARROW_RANGE",
      explanation: "The execution performs narrow range as part of the current step.",
    },
    {
      event: "FOUND",
      explanation: "The execution performs found as part of the current step.",
    },
  ],
  isActive: true,
  schemaVersion: 1,
};
