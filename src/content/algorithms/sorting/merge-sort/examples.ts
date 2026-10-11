export const examples = [
  {
    id: "merge-sort-basic",
    title: "Basic example",
    description: "A divide-and-conquer sort that recursively sorts halves and merges them.",
    input: [7, 3, 9, 2, 5],
    output: "A sorted copy of the input values.",
    explanation: "Split the array until subarrays are trivial, then merge sorted halves.",
  },
  {
    id: "merge-sort-edge",
    title: "Edge case",
    description:
      "An edge case that should produce a deterministic result without violating the input contract.",
    input: [],
    output: [],
    explanation: "Empty input is handled without attempting an invalid operation.",
  },
];
