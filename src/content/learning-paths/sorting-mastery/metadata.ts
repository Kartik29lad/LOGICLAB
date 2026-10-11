import type { ContentMetadata } from "../../schema/content-types";

export const metadata: ContentMetadata = {
  id: "learning-path-sorting-mastery",
  type: "LEARNING_PATH",
  slug: "sorting-mastery",
  title: "Sorting Mastery",
  summary:
    "Move from elementary sorting algorithms to divide-and-conquer and heap-based approaches.",
  description:
    "A focused progression through comparison sorting with increasing algorithmic sophistication.",
  category: "SORTING",
  difficulty: "INTERMEDIATE",
  learningObjectives: [
    "Compare elementary sorting",
    "Understand divide and conquer",
    "Understand partitioning",
    "Understand heap-based sorting",
  ],
  prerequisites: ["foundations"],
  examples: [
    {
      id: "sorting-mastery-example",
      title: "Compare strategies",
      description: "Use the same input to compare sorting behavior.",
      input: [9, 1, 7, 2],
      output: [1, 2, 7, 9],
    },
  ],
  commonMistakes: [
    "Treating all O(n log n) algorithms as operationally identical",
    "Ignoring worst-case behavior",
  ],
  relatedContent: [
    { slug: "foundations", relationship: "PREREQUISITE" },
    { slug: "graph-algorithms", relationship: "RELATED" },
  ],
  tags: ["learning-path", "sorting", "intermediate"],
  mainIdea: "Understand why different sorting strategies behave differently on the same input.",
  howItWorks: [
    "Review elementary sorts",
    "Study merge sort",
    "Study quick sort",
    "Study heap sort",
    "Compare them experimentally",
  ],
  whyItWorks:
    "The progression exposes recurring ideas such as divide-and-conquer, partitioning, and heap invariants.",
  useCases: ["Sorting revision", "Algorithm comparison practice"],
  supportedInputs: ["Numeric arrays"],
  properties: ["Ordered progression", "Prerequisite-aware"],
  terminology: [{ term: "Partition", definition: "Rearranging values around a chosen pivot." }],
  formulas: ["completion = completed items / total items × 100"],
  supportedLanguages: ["typescript"],
  practiceReferences: ["Use Compare after completing the path"],
  stepExplanations: [
    { event: "ITEM_COMPLETED", explanation: "The next sorting concept becomes available." },
  ],
  isActive: true,
  schemaVersion: 1,
};
