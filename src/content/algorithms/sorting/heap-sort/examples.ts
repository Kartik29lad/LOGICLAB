export const examples = [
  {
    id: "heap-sort-basic",
    title: "Basic example",
    description:
      "A comparison sort that uses a binary heap to repeatedly select the maximum value.",
    input: [7, 3, 9, 2, 5],
    output: "The input array sorted in ascending order.",
    explanation: "Build a max-heap, move its maximum to the end, and restore the heap property.",
  },
  {
    id: "heap-sort-edge",
    title: "Edge case",
    description:
      "An edge case that should produce a deterministic result without violating the input contract.",
    input: [],
    output: [],
    explanation: "Empty input is handled without attempting an invalid operation.",
  },
];
