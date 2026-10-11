import type { ContentMetadata } from "../../schema/content-types";

export const metadata: ContentMetadata = {
  id: "learning-path-foundations",
  type: "LEARNING_PATH",
  slug: "foundations",
  title: "Algorithm Foundations",
  summary:
    "Build a strong mental model for arrays, searching, sorting, and basic execution traces.",
  description:
    "A beginner-friendly path that moves from simple data representation into fundamental searching and sorting techniques.",
  category: "FOUNDATIONS",
  difficulty: "BEGINNER",
  learningObjectives: [
    "Understand core array operations",
    "Compare linear and binary search",
    "Recognize common sorting strategies",
    "Read execution traces",
  ],
  prerequisites: [],
  examples: [
    {
      id: "foundations-example",
      title: "Learn by progression",
      description:
        "Complete the ordered items to unlock a coherent foundation in algorithmic thinking.",
      input: [5, 2, 4],
      output: [2, 4, 5],
    },
  ],
  commonMistakes: [
    "Skipping prerequisites",
    "Memorizing complexity without understanding the operation count",
  ],
  relatedContent: [
    { slug: "sorting-mastery", relationship: "NEXT" },
    { slug: "graph-algorithms", relationship: "RELATED" },
  ],
  tags: ["learning-path", "foundations", "beginner"],
  mainIdea: "Learn algorithms in an intentional order instead of isolated pages.",
  howItWorks: [
    "Start with array concepts",
    "Study searching",
    "Study introductory sorting",
    "Complete practice as concepts become available",
  ],
  whyItWorks: "Each item builds vocabulary and execution intuition needed by later topics.",
  useCases: ["First-time algorithm learners", "Structured revision"],
  supportedInputs: ["Arrays", "Search targets"],
  properties: ["Ordered progression", "Version-aware progress"],
  terminology: [{ term: "Learning path", definition: "An ordered set of learning items." }],
  formulas: ["completion = completed items / total items × 100"],
  supportedLanguages: ["typescript"],
  practiceReferences: ["Run the visualizer after each item"],
  stepExplanations: [
    { event: "ITEM_COMPLETED", explanation: "Completing an item advances the path." },
  ],
  isActive: true,
  schemaVersion: 1,
};
