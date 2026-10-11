export const examples = [
  {
    id: "binary-search-basic",
    title: "Basic example",
    description: "A search that repeatedly halves a sorted search interval.",
    input: [7, 3, 9, 2, 5],
    output: "The target index, or -1 when absent.",
    explanation:
      "Compare the target with the middle value and discard the half that cannot contain it.",
  },
  {
    id: "binary-search-edge",
    title: "Edge case",
    description:
      "An edge case that should produce a deterministic result without violating the input contract.",
    input: [],
    output: [],
    explanation: "Empty input is handled without attempting an invalid operation.",
  },
];
