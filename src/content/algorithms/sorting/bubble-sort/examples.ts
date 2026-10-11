export const examples = [
  {
    id: "bubble-sort-basic",
    title: "Basic example",
    description: "A comparison sort that repeatedly swaps adjacent values that are out of order.",
    input: [7, 3, 9, 2, 5],
    output: "The input array sorted in ascending order.",
    explanation: "Repeated local swaps move larger values toward the end of the unsorted region.",
  },
  {
    id: "bubble-sort-edge",
    title: "Edge case",
    description:
      "An edge case that should produce a deterministic result without violating the input contract.",
    input: [],
    output: [],
    explanation: "Empty input is handled without attempting an invalid operation.",
  },
];
