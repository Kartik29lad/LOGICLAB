export const explanation =
  "Compare the target with the middle value and discard the half that cannot contain it.\\n\\nRequire sorted input. Compute the middle index. Compare the middle value with the target. Discard the impossible half. Repeat until found or the interval is empty. A sorted array tells us which half can still contain the target after each comparison.";
