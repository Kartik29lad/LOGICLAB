export const examples = [
  {
    id: "heap-basic",
    title: "Basic example",
    description:
      "A complete binary tree represented compactly with an array and ordered by a heap property.",
    input: [7, 3, 9, 2, 5],
    output: "The updated heap array.",
    explanation: "Maintain parent-child priority so the root is the minimum or maximum element.",
  },
  {
    id: "heap-edge",
    title: "Edge case",
    description:
      "An edge case that should produce a deterministic result without violating the input contract.",
    input: [],
    output: [],
    explanation: "Empty input is handled without attempting an invalid operation.",
  },
];
