import type { ContentMetadata } from "../../../schema/content-types";

export const metadata: ContentMetadata = {
  id: "algorithm.linear-search",
  type: "ALGORITHM",
  slug: "linear-search",
  title: "Linear Search",
  summary: "A sequential search that checks values from left to right.",
  description: "A sequential search that checks values from left to right.",
  category: "searching",
  difficulty: "BEGINNER",
  learningObjectives: [
    "Explain the main idea of Linear Search.",
    "Predict important execution steps for Linear Search.",
    "State the complexity and important edge cases.",
  ],
  prerequisites: ["array"],
  complexity: {
    timeBest: "O(1)",
    timeAverage: "O(n)",
    timeWorst: "O(n)",
    space: "O(1)",
  },
  examples: [
    {
      id: "linear-search-basic",
      title: "Basic example",
      description: "A sequential search that checks values from left to right.",
      input: "[7, 3, 9, 2, 5]",
      output: "See the final result in the explanation.",
      explanation: "Inspect each element until the target is found or the input ends.",
    },
  ],
  commonMistakes: [
    "Applying Linear Search without checking its input assumptions.",
    "Confusing the current execution state with the final result.",
  ],
  relatedContent: [
    {
      slug: "array",
      relationship: "PREREQUISITE",
    },
    {
      slug: "binary-search",
      relationship: "RELATED",
    },
  ],
  links: [
    {
      label: "Algorithm catalog",
      href: "/algorithms/linear-search",
      kind: "INTERNAL",
    },
  ],
  implementationSlug: "linear-search",
  visualizationType: "array",
  tags: ["searching", "beginner", "algorithms"],
  mainIdea: "Inspect each element until the target is found or the input ends.",
  howItWorks: [
    "Start at index zero.",
    "Compare the current value with the target.",
    "Return the index when they match.",
    "Otherwise advance to the next index.",
    "Return not-found after the final comparison.",
  ],
  whyItWorks: "Every position is considered in order, so a match cannot be skipped.",
  useCases: ["Unsorted data", "Small collections", "Baseline search comparison"],
  supportedInputs: ["Finite array", "Target value", "Array may be unsorted"],
  properties: ["Simple", "Works without sorting"],
  terminology: [
    {
      term: "target",
      definition: "The value being searched for.",
      example: "7",
    },
  ],
  formulas: ["Check a[i] === target for i from 0 to n - 1."],
  supportedLanguages: ["typescript"],
  practiceReferences: ["challenge.linear-search.predict-next-step"],
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
      event: "FOUND",
      explanation: "The execution performs found as part of the current step.",
    },
    {
      event: "NOT_FOUND",
      explanation: "The execution performs not found as part of the current step.",
    },
  ],
  isActive: true,
  schemaVersion: 1,
};
