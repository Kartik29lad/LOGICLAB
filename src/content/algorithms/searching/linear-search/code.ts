import type { CodeReference } from "../../../schema/content-types";

export const code: CodeReference[] = [
  {
    language: "typescript",
    entryPoint: "linear-search",
    source:
      'import type { AlgorithmMetadata, SearchResult } from "../../../contracts/algorithm.types";\n\nexport const LINEAR_SEARCH_METADATA: AlgorithmMetadata = {\n  id: "searching-linear-search",\n  slug: "linear-search",\n  name: "Linear Search",\n  category: "searching",\n  description:\n    "Sequentially checks each element of the list until a match is found or the whole list has been searched.",\n  complexity: {\n    time: {\n      best: "O(1)",\n      average: "O(n)",\n      worst: "O(n)",\n    },\n    space: "O(1)",\n  },\n};\n\n/**\n * Pure Linear Search.\n */\nexport function linearSearch(array: readonly number[], target: number): SearchResult {\n  let comparisons = 0;\n\n  for (let i = 0; i < array.length; i++) {\n    comparisons++;\n    if (array[i] === target) {\n      return {\n        foundIndex: i,\n        metrics: { comparisons, steps: i + 1 },\n      };\n    }\n  }\n\n  return {\n    foundIndex: -1,\n    metrics: { comparisons, steps: array.length },\n  };\n}\n',
    stepMappings: [{ action: "MAIN", startLine: 1, endLine: 41 }],
  },
];
