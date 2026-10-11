export const explanation =
  "Repeated local swaps move larger values toward the end of the unsorted region.\\n\\nScan adjacent pairs from left to right. Compare the two values. Swap them when the left value is greater. Shrink the active region after a pass. Stop early when a pass performs no swaps. After each full pass, the largest remaining value is placed at the end of the active region.";
