import type { ContentMetadata } from "../../schema/content-types";

export const metadata: ContentMetadata = {
  id: "data_structure.hash-table",
  type: "DATA_STRUCTURE",
  slug: "hash-table",
  title: "Hash Table",
  summary: "A key-value structure that uses hashing to select a bucket.",
  description: "A key-value structure that uses hashing to select a bucket.",
  category: "data-structures",
  difficulty: "INTERMEDIATE",
  learningObjectives: [
    "Explain the main idea of Hash Table.",
    "Predict important execution steps for Hash Table.",
    "State the complexity and important edge cases.",
  ],
  prerequisites: ["array"],
  complexity: {
    timeBest: "O(1)",
    timeAverage: "O(1)",
    timeWorst: "O(n)",
    space: "O(n)",
  },
  examples: [
    {
      id: "hash-table-basic",
      title: "Basic example",
      description: "A key-value structure that uses hashing to select a bucket.",
      input: "A small representative structure",
      output: "See the final result in the explanation.",
      explanation: "Hash a key to a bucket and store or find the key within that bucket.",
    },
  ],
  commonMistakes: [
    "Applying Hash Table without checking its input assumptions.",
    "Confusing the current execution state with the final result.",
  ],
  relatedContent: [
    {
      slug: "array",
      relationship: "PREREQUISITE",
    },
    {
      slug: "trie",
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
      href: "/data-structures/hash-table",
      kind: "INTERNAL",
    },
  ],
  implementationSlug: "hash-table",
  visualizationType: "hash-table",
  tags: ["data-structures", "intermediate", "data-structures"],
  mainIdea: "Hash a key to a bucket and store or find the key within that bucket.",
  howItWorks: [
    "Hash the key.",
    "Map the hash to a bucket.",
    "Search the bucket for the key.",
    "Insert, update, retrieve, or delete the matching entry.",
  ],
  whyItWorks:
    "A good hash distribution makes average lookup independent of the number of stored keys.",
  useCases: ["Maps and dictionaries", "Caching", "Indexing"],
  supportedInputs: ["Keys and values", "Hashable keys supported by the implementation"],
  properties: ["Average O(1) lookup", "Collision handling by chaining"],
  terminology: [
    {
      term: "collision",
      definition: "Two keys map to the same bucket.",
      example: "same bucket index",
    },
  ],
  formulas: ["bucket = hash(key) mod capacity."],
  supportedLanguages: ["typescript"],
  practiceReferences: ["challenge.hash-table.predict-next-step"],
  stepExplanations: [
    {
      event: "HASH",
      explanation: "The execution performs hash as part of the current step.",
    },
    {
      event: "READ",
      explanation: "The execution performs read as part of the current step.",
    },
    {
      event: "WRITE",
      explanation: "The execution performs write as part of the current step.",
    },
    {
      event: "INSERT",
      explanation: "The execution performs insert as part of the current step.",
    },
  ],
  isActive: true,
  schemaVersion: 1,
};
