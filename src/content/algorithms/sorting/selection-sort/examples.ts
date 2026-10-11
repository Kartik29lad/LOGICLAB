export const examples = [
  {
    id: "selection-sort-basic",
    title: "Basic example",
    description: "A comparison sort that repeatedly selects the smallest remaining value.",
    input: [7, 3, 9, 2, 5],
    output: "The input array sorted in ascending order.",
    explanation: "Find the minimum in the unsorted region and place it at the region boundary.",
  },
  {
    id: "selection-sort-edge",
    title: "Edge case",
    description:
      "An edge case that should produce a deterministic result without violating the input contract.",
    input: [],
    output: [],
    explanation: "Empty input is handled without attempting an invalid operation.",
  },
];
