import type { ContentMetadata } from "../../schema/content-types";

export const metadata: ContentMetadata = {
  id: "data_structure.array",
  type: "DATA_STRUCTURE",
  slug: "array",
  title: "Array",
  summary: "An indexed sequence with constant-time direct access by position.",
  description: "An indexed sequence with constant-time direct access by position.",
  category: "data-structures",
  difficulty: "BEGINNER",
  learningObjectives: [
    "Explain the main idea of Array.",
    "Predict important execution steps for Array.",
    "State the complexity and important edge cases.",
  ],
  prerequisites: [],
  complexity: {
    timeBest: "O(1)",
    timeAverage: "O(1)",
    timeWorst: "O(1)",
    space: "O(n)",
  },
  examples: [
    {
      id: "array-basic",
      title: "Basic example",
      description: "An indexed sequence with constant-time direct access by position.",
      input: "[7, 3, 9, 2, 5]",
      output: "See the final result in the explanation.",
      explanation: "Store values in indexed positions so a known index can be accessed directly.",
    },
  ],
  commonMistakes: [
    "Applying Array without checking its input assumptions.",
    "Confusing the current execution state with the final result.",
  ],
  relatedContent: [
    {
      slug: "bubble-sort",
      relationship: "NEXT",
    },
    {
      slug: "linear-search",
      relationship: "NEXT",
    },
  ],
  links: [
    {
      label: "Data structure catalog",
      href: "/data-structures/array",
      kind: "INTERNAL",
    },
  ],
  implementationSlug: "array",
  visualizationType: "array",
  tags: ["data-structures", "beginner", "data-structures"],
  mainIdea: "Store values in indexed positions so a known index can be accessed directly.",
  howItWorks: [
    "Allocate a sequence of positions.",
    "Read by index.",
    "Write by index.",
    "Append or remove at the end when supported efficiently.",
  ],
  whyItWorks: "The index identifies the storage position without scanning earlier elements.",
  useCases: ["General collections", "Algorithm inputs", "Tables and indexed data"],
  supportedInputs: ["Finite ordered values", "Zero-based integer indexes"],
  properties: ["Indexed", "Ordered", "Contiguous conceptual storage"],
  terminology: [
    {
      term: "index",
      definition: "The position used to access an element.",
      example: "a[2]",
    },
  ],
  formulas: ["Valid index: 0 <= i < length for direct access."],
  supportedLanguages: ["typescript"],
  practiceReferences: ["challenge.array.predict-next-step"],
  stepExplanations: [
    {
      event: "READ",
      explanation: "The execution performs read as part of the current step.",
    },
    {
      event: "WRITE",
      explanation: "The execution performs write as part of the current step.",
    },
    {
      event: "SET_CURRENT",
      explanation: "The execution performs set current as part of the current step.",
    },
  ],
  isActive: true,
  schemaVersion: 1,
};
