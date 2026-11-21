export interface CodeChallengeTestCase {
  id: string;
  label: string;
  args: unknown[];
  expected: unknown;
}

export interface CodeChallengeExample {
  title: string;
  input: string;
  output: string;
  explanation: string;
}

export interface CodeChallenge {
  id: string;
  title: string;
  category: "ALGORITHMS" | "DATA_STRUCTURES" | "SYSTEM_DESIGN";
  difficulty: "BEGINNER" | "INTERMEDIATE" | "ADVANCED";
  summary: string;
  description: string;
  functionName: string;
  starterCode: string;
  examples: CodeChallengeExample[];
  constraints: string[];
  hints: string[];
  testCases: CodeChallengeTestCase[];
  relatedLearning: { title: string; description: string; href: string }[];
}

/**
 * The first five coding exercises mirror the challenge list in the approved UI.
 * The editor accepts JavaScript-compatible TypeScript (the examples deliberately
 * avoid TypeScript-only syntax so they can execute in the isolated browser worker).
 */
export const CODE_CHALLENGES: readonly CodeChallenge[] = [
  {
    id: "two-sum",
    title: "Two Sum",
    category: "ALGORITHMS",
    difficulty: "BEGINNER",
    summary: "Find two numbers that add up to a target.",
    description:
      "Given an array of integers nums and an integer target, return the indices of the two numbers such that they add up to target.",
    functionName: "twoSum",
    starterCode: `function twoSum(nums: number[], target: number): number[] {
  for (let i = 0; i < nums.length; i++) {
    for (let j = i + 1; j < nums.length; j++) {
      if (nums[i] + nums[j] === target) {
        return [i, j];
      }
    }
  }

  return [];
}`,
    examples: [
      {
        title: "Example 1",
        input: "nums = [2, 7, 11, 15], target = 9",
        output: "[0, 1]",
        explanation: "nums[0] + nums[1] = 2 + 7 = 9.",
      },
      {
        title: "Example 2",
        input: "nums = [3, 2, 4], target = 6",
        output: "[1, 2]",
        explanation: "nums[1] + nums[2] = 2 + 4 = 6.",
      },
    ],
    constraints: [
      "2 ≤ nums.length ≤ 10,000",
      "-1,000,000,000 ≤ nums[i], target ≤ 1,000,000,000",
      "Exactly one valid answer exists, and the same element cannot be used twice.",
    ],
    hints: [
      "Try using a hash map to store the numbers you have seen.",
      "For each number, look for target - number before storing the current index.",
      "When the complement is found, return its saved index and the current index.",
    ],
    testCases: [
      { id: "two-sum-1", label: "Example 1", args: [[2, 7, 11, 15], 9], expected: [0, 1] },
      { id: "two-sum-2", label: "Example 2", args: [[3, 2, 4], 6], expected: [1, 2] },
    ],
    relatedLearning: [
      {
        title: "Hash Map fundamentals",
        description: "Understand key-value lookups",
        href: "/data-structures",
      },
      {
        title: "Explore algorithms",
        description: "Browse related algorithm topics",
        href: "/algorithms",
      },
    ],
  },
  {
    id: "valid-parentheses",
    title: "Valid Parentheses",
    category: "DATA_STRUCTURES",
    difficulty: "BEGINNER",
    summary: "Check whether brackets are correctly balanced.",
    description:
      "Given a string containing only '(', ')', '{', '}', '[' and ']', determine whether the input string is valid. Every opening bracket must be closed by the same type in the correct order.",
    functionName: "isValid",
    starterCode: `function isValid(s) {
  const pairs = { ")": "(", "}": "{", "]": "[" };
  const stack = [];

  for (const char of s) {
    if (char === "(" || char === "{" || char === "[") {
      stack.push(char);
    } else {
      if (stack.pop() !== pairs[char]) return false;
    }
  }

  return stack.length === 0;
}`,
    examples: [
      {
        title: "Example 1",
        input: 's = "()[]{}"',
        output: "true",
        explanation: "Every opening bracket is closed in the correct order.",
      },
      {
        title: "Example 2",
        input: 's = "([)]"',
        output: "false",
        explanation: "The closing parenthesis does not match the most recent opening bracket.",
      },
    ],
    constraints: ["1 ≤ s.length ≤ 10,000", "s contains only bracket characters: ()[]{}."],
    hints: [
      "The most recently opened bracket must be the first one closed.",
      "A last-in-first-out data structure fits this rule.",
    ],
    testCases: [
      { id: "parentheses-1", label: "Balanced pairs", args: ["()[]{}"], expected: true },
      { id: "parentheses-2", label: "Wrong order", args: ["([)]"], expected: false },
      { id: "parentheses-3", label: "Nested brackets", args: ["{[]}"], expected: true },
    ],
    relatedLearning: [
      {
        title: "Stack data structure",
        description: "Review push and pop operations",
        href: "/data-structures",
      },
      {
        title: "Open Interactive Lab",
        description: "Visualize stack operations",
        href: "/visualizer",
      },
    ],
  },
  {
    id: "binary-search",
    title: "Binary Search",
    category: "ALGORITHMS",
    difficulty: "INTERMEDIATE",
    summary: "Find a target in a sorted array in logarithmic time.",
    description:
      "Given a sorted array of distinct integers and a target value, return the index of the target. If the target does not exist, return -1.",
    functionName: "search",
    starterCode: `function search(nums, target) {
  let low = 0;
  let high = nums.length - 1;

  while (low <= high) {
    const mid = Math.floor((low + high) / 2);
    if (nums[mid] === target) return mid;
    if (nums[mid] < target) low = mid + 1;
    else high = mid - 1;
  }

  return -1;
}`,
    examples: [
      {
        title: "Example 1",
        input: "nums = [-1, 0, 3, 5, 9, 12], target = 9",
        output: "4",
        explanation: "The target 9 is at index 4.",
      },
      {
        title: "Example 2",
        input: "nums = [-1, 0, 3, 5, 9, 12], target = 2",
        output: "-1",
        explanation: "The target is not present in the array.",
      },
    ],
    constraints: [
      "1 ≤ nums.length ≤ 100,000",
      "All values in nums are unique.",
      "nums is sorted in ascending order.",
    ],
    hints: [
      "Keep a search interval using low and high indices.",
      "Compare the middle value and discard the half that cannot contain the target.",
    ],
    testCases: [
      { id: "binary-1", label: "Target in middle", args: [[-1, 0, 3, 5, 9, 12], 9], expected: 4 },
      { id: "binary-2", label: "Target absent", args: [[-1, 0, 3, 5, 9, 12], 2], expected: -1 },
      { id: "binary-3", label: "Single element", args: [[5], 5], expected: 0 },
    ],
    relatedLearning: [
      {
        title: "Binary Search visualizer",
        description: "Watch low, mid and high move",
        href: "/visualizer/binary-search",
      },
      {
        title: "Searching algorithms",
        description: "Explore search techniques",
        href: "/algorithms",
      },
    ],
  },
  {
    id: "merge-intervals",
    title: "Merge Intervals",
    category: "ALGORITHMS",
    difficulty: "INTERMEDIATE",
    summary: "Merge all overlapping intervals.",
    description:
      "Given an array of intervals where intervals[i] = [start, end], merge all overlapping intervals and return an array of the non-overlapping intervals.",
    functionName: "merge",
    starterCode: `function merge(intervals) {
  if (intervals.length === 0) return [];

  const sorted = intervals.map((item) => [...item]).sort((a, b) => a[0] - b[0]);
  const merged = [sorted[0]];

  for (let i = 1; i < sorted.length; i++) {
    const current = sorted[i];
    const last = merged[merged.length - 1];
    if (current[0] <= last[1]) {
      last[1] = Math.max(last[1], current[1]);
    } else {
      merged.push(current);
    }
  }

  return merged;
}`,
    examples: [
      {
        title: "Example 1",
        input: "intervals = [[1,3],[2,6],[8,10],[15,18]]",
        output: "[[1,6],[8,10],[15,18]]",
        explanation: "[1,3] and [2,6] overlap and become [1,6].",
      },
      {
        title: "Example 2",
        input: "intervals = [[1,4],[4,5]]",
        output: "[[1,5]]",
        explanation: "Touching endpoints are considered overlapping.",
      },
    ],
    constraints: [
      "1 ≤ intervals.length ≤ 10,000",
      "intervals[i].length = 2",
      "Intervals are represented by [start, end].",
    ],
    hints: [
      "Sort intervals by their start value first.",
      "Compare each next interval with the end of the last merged interval.",
    ],
    testCases: [
      {
        id: "merge-1",
        label: "Overlapping intervals",
        args: [
          [
            [1, 3],
            [2, 6],
            [8, 10],
            [15, 18],
          ],
        ],
        expected: [
          [1, 6],
          [8, 10],
          [15, 18],
        ],
      },
      {
        id: "merge-2",
        label: "Touching endpoints",
        args: [
          [
            [1, 4],
            [4, 5],
          ],
        ],
        expected: [[1, 5]],
      },
      {
        id: "merge-3",
        label: "Already separate",
        args: [
          [
            [1, 2],
            [4, 5],
          ],
        ],
        expected: [
          [1, 2],
          [4, 5],
        ],
      },
    ],
    relatedLearning: [
      {
        title: "Sorting algorithms",
        description: "Review ordering strategies",
        href: "/algorithms",
      },
      {
        title: "Explore algorithm topics",
        description: "Browse algorithm explanations",
        href: "/algorithms",
      },
    ],
  },
  {
    id: "lru-cache",
    title: "LRU Cache",
    category: "SYSTEM_DESIGN",
    difficulty: "ADVANCED",
    summary: "Design a cache that evicts the least recently used key.",
    description:
      "Design an LRU cache. Implement a function that receives a capacity and a list of operations. Return the output for every get operation; return null for put operations. A successful get or update makes the key most recently used.",
    functionName: "lruCache",
    starterCode: `function lruCache(capacity, operations) {
  const cache = new Map();
  const output = [];

  for (const [type, key, value] of operations) {
    if (type === "put") {
      if (cache.has(key)) cache.delete(key);
      cache.set(key, value);
      if (cache.size > capacity) {
        cache.delete(cache.keys().next().value);
      }
      output.push(null);
    } else if (cache.has(key)) {
      const current = cache.get(key);
      cache.delete(key);
      cache.set(key, current);
      output.push(current);
    } else {
      output.push(-1);
    }
  }

  return output;
}`,
    examples: [
      {
        title: "Example 1",
        input: "capacity = 2; operations = put(1,1), put(2,2), get(1), put(3,3), get(2)",
        output: "[null, null, 1, null, -1]",
        explanation:
          "Key 2 is evicted when key 3 is inserted because key 1 was used more recently.",
      },
    ],
    constraints: [
      "1 ≤ capacity ≤ 3,000",
      "Keys and values are integers.",
      "Supported operations are put(key, value) and get(key).",
    ],
    hints: [
      "A Map preserves insertion order, which can help track recent use.",
      "When a key is accessed, remove and reinsert it to mark it most recently used.",
    ],
    testCases: [
      {
        id: "lru-1",
        label: "Evict least recently used",
        args: [
          2,
          [
            ["put", 1, 1],
            ["put", 2, 2],
            ["get", 1],
            ["put", 3, 3],
            ["get", 2],
            ["put", 4, 4],
            ["get", 1],
            ["get", 3],
            ["get", 4],
          ],
        ],
        expected: [null, null, 1, null, -1, null, -1, 3, 4],
      },
      {
        id: "lru-2",
        label: "Update existing key",
        args: [
          2,
          [
            ["put", 1, 1],
            ["put", 1, 10],
            ["get", 1],
          ],
        ],
        expected: [null, null, 10],
      },
    ],
    relatedLearning: [
      {
        title: "Hash Map fundamentals",
        description: "Review ordered key-value lookup",
        href: "/data-structures",
      },
      {
        title: "Data structures library",
        description: "Explore cache building blocks",
        href: "/data-structures",
      },
    ],
  },
];
