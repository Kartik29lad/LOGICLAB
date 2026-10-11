import type { ContentMetadata } from "../../schema/content-types";

export const metadata: ContentMetadata = {
  id: "data_structure.trie",
  type: "DATA_STRUCTURE",
  slug: "trie",
  title: "Trie",
  summary: "A prefix tree that stores strings by sharing common character paths.",
  description: "A prefix tree that stores strings by sharing common character paths.",
  category: "data-structures",
  difficulty: "INTERMEDIATE",
  learningObjectives: [
    "Explain the main idea of Trie.",
    "Predict important execution steps for Trie.",
    "State the complexity and important edge cases.",
  ],
  prerequisites: ["tree"],
  complexity: {
    timeBest: "O(L)",
    timeAverage: "O(L)",
    timeWorst: "O(L)",
    space: "O(T)",
  },
  examples: [
    {
      id: "trie-basic",
      title: "Basic example",
      description: "A prefix tree that stores strings by sharing common character paths.",
      input: "A small representative structure",
      output: "See the final result in the explanation.",
      explanation: "Store one character per edge so prefixes become shared paths.",
    },
  ],
  commonMistakes: [
    "Applying Trie without checking its input assumptions.",
    "Confusing the current execution state with the final result.",
  ],
  relatedContent: [
    {
      slug: "tree",
      relationship: "PREREQUISITE",
    },
    {
      slug: "hash-table",
      relationship: "RELATED",
    },
    {
      slug: "binary-search-tree",
      relationship: "RELATED",
    },
  ],
  links: [
    {
      label: "Data structure catalog",
      href: "/data-structures/trie",
      kind: "INTERNAL",
    },
  ],
  implementationSlug: "trie",
  visualizationType: "tree",
  tags: ["data-structures", "intermediate", "data-structures"],
  mainIdea: "Store one character per edge so prefixes become shared paths.",
  howItWorks: [
    "Start at the root.",
    "Follow or create the child for each character.",
    "Mark the final node as a complete word.",
    "Search or prefix-check by following the same character path.",
  ],
  whyItWorks:
    "Searching a word follows one character per level, making cost depend on key length rather than the number of stored words.",
  useCases: ["Autocomplete", "Prefix search", "Dictionary structures"],
  supportedInputs: ["Strings", "Character-by-character traversal"],
  properties: ["Prefix sharing", "Lookup depends on key length"],
  terminology: [
    {
      term: "prefix",
      definition: "A starting substring shared by one or more words.",
      example: "app is a prefix of apple",
    },
  ],
  formulas: ["insert/search cost is O(L) for a word of length L."],
  supportedLanguages: ["typescript"],
  practiceReferences: ["challenge.trie.predict-next-step"],
  stepExplanations: [
    {
      event: "VISIT",
      explanation: "The execution performs visit as part of the current step.",
    },
    {
      event: "INSERT",
      explanation: "The execution performs insert as part of the current step.",
    },
    {
      event: "READ",
      explanation: "The execution performs read as part of the current step.",
    },
    {
      event: "FOUND",
      explanation: "The execution performs found as part of the current step.",
    },
  ],
  isActive: true,
  schemaVersion: 1,
};
