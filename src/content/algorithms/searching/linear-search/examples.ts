export const examples = [
  {
    id: "linear-search-basic",
    title: "Basic example",
    description: "A sequential search that checks values from left to right.",
    input: [7, 3, 9, 2, 5],
    output: "The first matching index, or -1 when no match exists.",
    explanation: "Inspect each element until the target is found or the input ends.",
  },
  {
    id: "linear-search-edge",
    title: "Edge case",
    description:
      "An edge case that should produce a deterministic result without violating the input contract.",
    input: [],
    output: [],
    explanation: "Empty input is handled without attempting an invalid operation.",
  },
];
