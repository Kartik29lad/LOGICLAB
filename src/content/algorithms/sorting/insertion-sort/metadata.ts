import type { ContentMetadata } from "../../../schema/content-types";

export const metadata: ContentMetadata = {
  id: "algorithm.insertion-sort",
  type: "ALGORITHM",
  slug: "insertion-sort",
  title: "Insertion Sort",
  summary: "A comparison sort that grows a sorted prefix one value at a time.",
  description: "A comparison sort that grows a sorted prefix one value at a time.",
  category: "sorting",
  difficulty: "BEGINNER",
  learningObjectives: [
    "Explain the main idea of Insertion Sort.",
    "Predict important execution steps for Insertion Sort.",
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
      id: "insertion-sort-basic",
      title: "Basic example",
      description: "A comparison sort that grows a sorted prefix one value at a time.",
      input: "[7, 3, 9, 2, 5]",
      output: "See the final result in the explanation.",
      explanation:
        "Take the next value and insert it into the correct position in the sorted prefix.",
    },
  ],
  commonMistakes: [
    "Applying Insertion Sort without checking its input assumptions.",
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
      slug: "selection-sort",
      relationship: "RELATED",
    },
    {
      slug: "binary-search",
      relationship: "RELATED",
    },
  ],
  links: [
    {
      label: "Algorithm catalog",
      href: "/algorithms/insertion-sort",
      kind: "INTERNAL",
    },
  ],
  implementationSlug: "insertion-sort",
  visualizationType: "array",
  tags: ["sorting", "beginner", "algorithms"],
  mainIdea: "Take the next value and insert it into the correct position in the sorted prefix.",
  howItWorks: [
    "Start with the first value as a sorted prefix.",
    "Select the next value as the key.",
    "Shift larger prefix values one position right.",
    "Insert the key into the open position.",
    "Repeat until the array is consumed.",
  ],
  whyItWorks:
    "At each iteration the prefix before the current index is sorted, so shifting larger values creates the correct insertion position.",
  useCases: ["Small arrays", "Nearly sorted data", "Teaching incremental sorting"],
  supportedInputs: [
    "Finite array of comparable numbers",
    "Duplicates are allowed",
    "Empty arrays are valid",
  ],
  properties: ["Stable", "In-place", "Adaptive for nearly sorted input"],
  terminology: [
    {
      term: "key",
      definition: "The value currently being inserted.",
      example: "the next unsorted value",
    },
  ],
  formulas: ["Shift while a[j] > key.", "Insert key at j + 1."],
  supportedLanguages: ["typescript"],
  practiceReferences: ["challenge.insertion-sort.predict-next-step"],
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
      event: "WRITE",
      explanation: "The execution performs write as part of the current step.",
    },
    {
      event: "COMPLETE",
      explanation: "The execution performs complete as part of the current step.",
    },
  ],
  isActive: true,
  schemaVersion: 1,
};
