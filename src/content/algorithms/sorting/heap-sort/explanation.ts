export const explanation =
  "Build a max-heap, move its maximum to the end, and restore the heap property.\\n\\nBuild a max-heap from the array. Swap the root with the last unsorted position. Shrink the heap boundary. Restore the heap property. Repeat until one element remains. The heap exposes the largest remaining value at its root, so repeated extraction fixes the array from right to left.";
