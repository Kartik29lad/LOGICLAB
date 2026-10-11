export const examples = [
  {
    id: "quick-sort-basic",
    title: "Basic example",
    description: "A divide-and-conquer sort that partitions values around a pivot.",
    input: [7, 3, 9, 2, 5],
    output: "The input array sorted in ascending order.",
    explanation:
      "Partition a range around a pivot so smaller values go left and larger values go right.",
  },
  {
    id: "quick-sort-edge",
    title: "Edge case",
    description:
      "An edge case that should produce a deterministic result without violating the input contract.",
    input: [],
    output: [],
    explanation: "Empty input is handled without attempting an invalid operation.",
  },
];
