export const examples = [
  {
    id: "insertion-sort-basic",
    title: "Basic example",
    description: "A comparison sort that grows a sorted prefix one value at a time.",
    input: [7, 3, 9, 2, 5],
    output: "The input array sorted in ascending order.",
    explanation:
      "Take the next value and insert it into the correct position in the sorted prefix.",
  },
  {
    id: "insertion-sort-edge",
    title: "Edge case",
    description:
      "An edge case that should produce a deterministic result without violating the input contract.",
    input: [],
    output: [],
    explanation: "Empty input is handled without attempting an invalid operation.",
  },
];
