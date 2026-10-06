# LogicLab — Website Structure, Pages & User Flow Specification

## 1. Purpose of This Document

This document defines **how the LogicLab website should be structured and behave from the user's point of view**.

It focuses only on:

- Pages
- Layout
- Navigation
- Sidebar
- Sections
- Panels
- Buttons
- Click behavior
- Page transitions
- User flows
- Visualization interaction
- Graph / tree interaction
- Challenge interaction
- Search behavior
- History behavior
- Progress behavior
- Empty states
- Error states
- Responsive structural behavior

This document does **not** define:

- Colors
- Fonts
- Branding style
- Visual theme
- Shadows
- Border styles
- Animation styling
- Exact spacing values
- Decorative graphics

The goal is that a developer or designer can read this document and understand:

> **What pages exist, what each page contains, where each element is located, what is clickable, and exactly what should happen after the user interacts with it.**

---

# 2. Overall Website Concept

LogicLab should behave like an interactive learning platform rather than a collection of disconnected pages.

The overall experience should be:

```text
                    ┌───────────────────┐
                    │       HOME        │
                    └─────────┬─────────┘
                              │
              ┌───────────────┼────────────────┐
              │               │                │
              ▼               ▼                ▼
        ┌───────────┐   ┌───────────┐    ┌───────────┐
        │ ALGORITHMS│   │DATA STRUCT │    │ CHALLENGES│
        └─────┬─────┘   └─────┬─────┘    └─────┬─────┘
              │               │                │
              └───────────────┼────────────────┘
                              ▼
                     ┌─────────────────┐
                     │ VISUALIZER      │
                     └────────┬────────┘
                              │
              ┌───────────────┼────────────────┐
              ▼               ▼                ▼
        ┌───────────┐   ┌───────────┐    ┌───────────┐
        │ EXPLANATION│  │ CODE/LOGIC │    │ CHALLENGE │
        └───────────┘   └───────────┘    └───────────┘
                              │
                              ▼
                       ┌─────────────┐
                       │  PROGRESS   │
                       └─────────────┘
```

The user should always be able to move from learning material to actual interaction without feeling that they are entering a completely separate product.

---

# 3. Main Website Areas

The website should have the following primary areas:

```text
1. Home
2. Explore Algorithms
3. Explore Data Structures
4. Algorithm Visualizer
5. Data Structure Playground
6. Challenges
7. Compare
8. Progress
9. History
10. Favorites
```

Not every item has to be represented as a completely separate browser-level route. Some can be views inside the same application shell.

The important requirement is that each responsibility has a clear destination.

---

# 4. Global Application Layout

The main application should use a consistent structure.

Conceptually:

```text
┌─────────────────────────────────────────────────────────────────────┐
│                           TOP HEADER                                │
│  Logo / Home     Search                    History / Progress       │
├────────────────┬────────────────────────────────────────────────────┤
│                │                                                    │
│                │                                                    │
│    SIDEBAR     │                  MAIN CONTENT                      │
│                │                                                    │
│  Home          │                                                    │
│  Algorithms    │                                                    │
│  Data Struct.  │                                                    │
│  Challenges    │                                                    │
│  Compare       │                                                    │
│  Progress      │                                                    │
│  History       │                                                    │
│  Favorites     │                                                    │
│                │                                                    │
│                │                                                    │
├────────────────┴────────────────────────────────────────────────────┤
│                         OPTIONAL FOOTER                             │
└─────────────────────────────────────────────────────────────────────┘
```

The sidebar and header should provide global navigation.

The main content area should change depending on the selected section.

---

# 5. Global Header

The header should contain only navigation and global actions.

Conceptually:

```text
┌─────────────────────────────────────────────────────────────────┐
│ LogicLab    Home   Search algorithms...       History  Progress  │
└─────────────────────────────────────────────────────────────────┘
```

Possible header responsibilities:

- Logo / product name.
- Home navigation.
- Global search.
- Quick access to History.
- Quick access to Progress.
- Optional settings access.

The header should remain consistent across the main learning experience.

---

# 6. Global Sidebar

The sidebar is the primary navigation structure.

Recommended structure:

```text
┌─────────────────────┐
│ LOGICLAB             │
├─────────────────────┤
│ Home                │
│                     │
│ EXPLORE             │
│ Algorithms          │
│ Data Structures     │
│                     │
│ PRACTICE            │
│ Challenges          │
│ Compare             │
│                     │
│ MY LEARNING         │
│ Progress            │
│ History             │
│ Favorites           │
│                     │
│ SETTINGS             │
└─────────────────────┘
```

The sidebar should group related navigation items rather than showing one long unordered list.

---

# 7. Sidebar Navigation Behavior

Click behavior:

```text
Home
  ↓
Home Page

Algorithms
  ↓
Algorithm Explorer

Data Structures
  ↓
Data Structure Explorer

Challenges
  ↓
Challenge Home

Compare
  ↓
Algorithm Comparison

Progress
  ↓
Progress Dashboard

History
  ↓
History Page

Favorites
  ↓
Favorites Page

Settings
  ↓
Settings Page
```

The current section should remain identifiable.

---

# 8. Home Page

The Home Page is the starting point for LogicLab.

The page should give users several direct ways to begin learning.

Conceptually:

```text
┌──────────────────────────────────────────────────────────────┐
│                         HOME                                 │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│                  Welcome / Introduction                      │
│                                                              │
│      [Explore Algorithms]   [Start Learning]                │
│                                                              │
├──────────────────────────────────────────────────────────────┤
│ QUICK ACCESS                                                 │
│                                                              │
│ [Sorting] [Searching] [Graphs] [Trees] [Data Structures]     │
│                                                              │
├──────────────────────────────────────────────────────────────┤
│ CONTINUE LEARNING                                            │
│                                                              │
│ Recently opened / unfinished topics                           │
│                                                              │
├──────────────────────────────────────────────────────────────┤
│ POPULAR / RECOMMENDED                                        │
│                                                              │
│ [Bubble Sort] [Binary Search] [BFS] [DFS] [BST]             │
│                                                              │
├──────────────────────────────────────────────────────────────┤
│ PRACTICE                                                      │
│                                                              │
│ [Start a Challenge]        [Compare Algorithms]              │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

---

# 9. Home Page — Section Behavior

## Explore Algorithms

Click:

```text
[Explore Algorithms]
        ↓
Algorithm Explorer
```

## Start Learning

Click:

```text
[Start Learning]
        ↓
Recommended Learning Path
```

## Category Card

Example:

```text
[Graphs]
```

Click:

```text
Home
  ↓
Graphs Category
  ↓
Algorithm list filtered to graph algorithms
```

## Continue Learning Item

Click:

```text
BFS
 ↓
BFS Visualizer
```

The user should return directly to the relevant topic rather than being taken through unnecessary intermediary pages.

---

# 10. Algorithm Explorer Page

This page is the main place for discovering algorithms.

Conceptually:

```text
┌──────────────────────────────────────────────────────────────┐
│ ALGORITHM EXPLORER                                          │
├──────────────────────────────────────────────────────────────┤
│ Search algorithms...                                         │
├────────────────┬─────────────────────────────────────────────┤
│ CATEGORIES     │ ALGORITHMS                                  │
│                │                                             │
│ Sorting        │ [Bubble Sort] [Selection Sort]             │
│ Searching      │ [Insertion Sort] [Merge Sort]              │
│ Graphs         │ [Quick Sort] [Heap Sort]                   │
│ Trees          │                                             │
│ DP             │                                             │
│                │                                             │
│ Difficulty     │                                             │
│ Beginner       │                                             │
│ Intermediate   │                                             │
│ Advanced       │                                             │
└────────────────┴─────────────────────────────────────────────┘
```

---

# 11. Algorithm Explorer — Left Section

The left side should contain discovery controls:

```text
Categories
Difficulty
Topics
Tags
```

Examples:

```text
SORTING
SEARCHING
GRAPH
TREE
DYNAMIC PROGRAMMING
```

Difficulty:

```text
BEGINNER
INTERMEDIATE
ADVANCED
EXPERT
```

Selecting a category should filter the main content without requiring a full page reload.

---

# 12. Algorithm Explorer — Main Section

Each algorithm should appear as a selectable item.

Conceptually:

```text
┌───────────────────────────────────┐
│ Bubble Sort                        │
│ Sorting • Beginner                │
│ Compare and swap neighboring      │
│ values.                           │
│                                   │
│ [Learn] [Visualize]               │
└───────────────────────────────────┘
```

Possible actions:

```text
Click card
   ↓
Algorithm Detail / Visualizer

Click Visualize
   ↓
Open Visualizer immediately

Click Learn
   ↓
Open algorithm information first
```

---

# 13. Algorithm Search Behavior

The global search and Explorer search should understand:

```text
Algorithm name
Category
Tag
Concept
Data structure
Complexity
```

Example:

```text
Search:
"shortest path"

Results:
Dijkstra
A*
Bellman-Ford
Floyd-Warshall
```

Search result click:

```text
Search Result
    ↓
Selected Topic
    ↓
Topic Page / Visualizer
```

---

# 14. Algorithm Detail / Learning Page

Before entering the full visualization, the user can see a concept overview.

Conceptually:

```text
┌──────────────────────────────────────────────────────────────┐
│ ← Back       BUBBLE SORT                                    │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│ What is Bubble Sort?                                         │
│ Main Idea                                                    │
│ How It Works                                                 │
│ Why It Works                                                 │
│ When to Use It                                               │
│                                                              │
├──────────────────────────────┬───────────────────────────────┤
│ COMPLEXITY                   │ PROPERTIES                    │
│ Best: O(n)                   │ Stable                         │
│ Avg:  O(n²)                  │ In-place                      │
│ Worst: O(n²)                 │ Beginner                      │
│ Space: O(1)                  │                               │
├──────────────────────────────┴───────────────────────────────┤
│ EXAMPLE                                                      │
│ [7][3][9][2][5]                                              │
│                                                              │
│                    [VISUALIZE]                               │
└──────────────────────────────────────────────────────────────┘
```

The main purpose of this page is orientation and understanding before execution.

---

# 15. Algorithm Detail Page — Actions

Main actions:

```text
[Visualize]
[Try Challenge]
[Add to Favorites]
```

### Visualize

```text
Algorithm Detail
       ↓
Visualizer
```

### Try Challenge

```text
Algorithm Detail
       ↓
Challenge for that algorithm
```

### Add to Favorites

```text
Favorite added
```

The user should remain on the same page unless the action explicitly opens another view.

---

# 16. Main Algorithm Visualizer Page

This is the most important page in LogicLab.

It should be designed around the relationship:

```text
Visualization
      +
Controls
      +
Current Logic
      +
Explanation
      +
Code
      +
Metrics
```

Conceptually:

```text
┌──────────────┬───────────────────────────────────────────────┐
│              │                                               │
│  ALGORITHM   │              VISUALIZATION                     │
│  INFO        │                                               │
│              │          [7] [3] [9] [2] [5]                 │
│ Complexity   │                ↑   ↑                           │
│ Properties   │              Compare                          │
│              │                                               │
├──────────────┴───────────────────────────────────────────────┤
│ PLAYBACK                                                     │
│                                                              │
│ [Previous] [Play/Pause] [Next] [Restart]    Speed            │
├──────────────────────────────┬────────────────────────────────┤
│ CURRENT STEP                 │ EXPLANATION                    │
│ Step 4 / 18                  │ Comparing 7 and 3...           │
│ Comparisons: 4              │                                │
│ Swaps: 2                    │ Why?                            │
├──────────────────────────────┴────────────────────────────────┤
│ CODE / PSEUDOCODE                                           │
│                                                              │
│ if (a[j] > a[j + 1])                                        │
│      swap(...)                                               │
├──────────────────────────────────────────────────────────────┤
│ RESULT / COMPLEXITY / METRICS                               │
└──────────────────────────────────────────────────────────────┘
```

This is a conceptual layout, not a styling specification.

---

# 17. Visualizer — Algorithm Header

The top of the visualizer should identify:

```text
Algorithm Name
Category
Difficulty
```

Possible actions:

```text
Back
Favorite
Reset
```

The user should always know which algorithm is currently being visualized.

---

# 18. Visualizer — Input Section

The user should be able to define or change input.

Conceptually:

```text
INPUT

Preset:
[Example ▼]

Custom:
[ 7, 3, 9, 2, 5 ]

[Apply]

Random:
Size [10]
Range [1 - 100]

[Generate]
```

Changing the input should create a new execution trace.

The current visualization should reset when the input changes.

---

# 19. Visualizer — Playback Controls

Required controls:

```text
[Previous]
[Play]
[Pause]
[Next]
[Restart]
```

Additional:

```text
Speed
Progress
Step number
```

Example:

```text
Step 8 / 24
━━━━━━━━━━━━━━●────────
```

Click behavior:

```text
Play
 ↓
Automatic step progression

Pause
 ↓
Freeze current state

Next
 ↓
Move one step forward

Previous
 ↓
Move one step backward

Restart
 ↓
Return to initial state
```

---

# 20. Visualizer — Current State Section

The user should be able to understand exactly what is happening now.

Example:

```text
CURRENT STEP

Step:
8 / 24

Action:
COMPARE

Current elements:
7 and 3

Indexes:
2 and 3

Result:
SWAP
```

This section should update whenever the current step changes.

---

# 21. Visualizer — Explanation Section

The explanation should describe the current step.

Example:

```text
WHY?

We are comparing 7 and 3.

Because 7 is greater than 3,
the values are in the wrong order.

The algorithm swaps them.
```

The explanation must correspond to the actual current execution state.

---

# 22. Visualizer — Code Section

The code section should show:

```text
Language
Code
Current highlighted line/block
```

Example:

```text
Language:
[JavaScript ▼]

1  for (...)
2      if (a[j] > a[j + 1])  ← current
3          swap(...)
```

Changing the language should change only the displayed code, not the visualization.

---

# 23. Visualizer — Metrics Section

Metrics should display relevant values.

Example:

```text
Comparisons     8
Swaps           4
Steps           12
```

Different algorithms can have different metric sets.

---

# 24. Visualizer — Complexity Section

The complexity information can be visible beside or below the main visualization.

Example:

```text
TIME COMPLEXITY

Best      O(n)
Average   O(n²)
Worst     O(n²)

SPACE

O(1)
```

This information should remain available during exploration.

---

# 25. Visualizer — Result Section

When execution finishes:

```text
┌─────────────────────────────────────────┐
│ COMPLETE                                │
│                                         │
│ Input:  [7,3,9,2,5]                     │
│ Output: [2,3,5,7,9]                     │
│                                         │
│ Comparisons: 10                         │
│ Swaps: 6                                │
│                                         │
│ [Replay] [Try Challenge] [Compare]      │
└─────────────────────────────────────────┘
```

The user should still be able to inspect the execution after completion.

---

# 26. Visualizer — "Why?" Interaction

A step may contain a `Why?` action.

Click:

```text
[Why?]
   ↓
Expanded explanation
```

Example:

```text
Why are these nodes being visited?

Because BFS processes nodes in
queue order and this node was
discovered first.
```

The explanation should refer to the current state.

---

# 27. Visualizer — Step Scrubbing

If a user clicks on the timeline:

```text
Step 1 ─── Step 2 ─── Step 3 ─── Step 4 ─── Step 5
                           ↑
```

The application should jump directly to that execution step.

This should behave the same way as pressing Next / Previous repeatedly.

---

# 28. Data Structure Explorer Page

The Data Structure Explorer should be similar to Algorithm Explorer but focused on structures.

Conceptually:

```text
┌──────────────────────────────────────────────────────────────┐
│ DATA STRUCTURES                                             │
├────────────────┬─────────────────────────────────────────────┤
│ TYPES          │ DATA STRUCTURES                             │
│                │                                             │
│ Linear         │ [Stack] [Queue] [Linked List]              │
│ Trees          │ [Binary Tree] [BST] [Heap]                 │
│ Hashing        │ [Hash Table]                               │
│                │                                             │
│                │                                             │
└────────────────┴─────────────────────────────────────────────┘
```

---

# 29. Data Structure Detail Page

The page should explain:

```text
What it is
How it works
Main operations
Common uses
Complexity of operations
```

Then:

```text
[Open Playground]
[Try Challenge]
```

Example:

```text
Stack
│
├── Push
├── Pop
├── Peek
└── Is Empty

[Open Playground]
```

---

# 30. Data Structure Playground

This page is interactive.

Example for Stack:

```text
┌──────────────────────────────────────────────────────────────┐
│ STACK PLAYGROUND                                             │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│                ┌───────┐                                     │
│                │   7   │ ← TOP                              │
│                ├───────┤                                     │
│                │   4   │                                     │
│                ├───────┤                                     │
│                │   2   │                                     │
│                └───────┘                                     │
│                                                              │
├──────────────────────────────────────────────────────────────┤
│ Value: [ 9 ]                                                 │
│                                                              │
│ [PUSH] [POP] [PEEK] [CLEAR]                                 │
├──────────────────────────────────────────────────────────────┤
│ Operation History                                            │
│ PUSH 9                                                        │
│ POP 9                                                         │
└──────────────────────────────────────────────────────────────┘
```

---

# 31. Data Structure Operation Flow

For Stack:

```text
User enters value
      ↓
Click PUSH
      ↓
Validate operation
      ↓
Update data structure state
      ↓
Create operation event
      ↓
Update visualization
      ↓
Update operation history
```

The same structure should work for Queue, Linked List, BST, Heap, etc.

---

# 32. Graph Playground Page

Graph algorithms need a dedicated interactive graph editing experience.

Conceptually:

```text
┌──────────────────────────────────────────────────────────────┐
│ GRAPH PLAYGROUND                                             │
├───────────────────────┬──────────────────────────────────────┤
│                       │                                      │
│ TOOLS                 │             GRAPH CANVAS             │
│                       │                                      │
│ [Add Node]            │         A -------- B                │
│ [Add Edge]            │          \          \               │
│ [Delete]              │           C -------- D              │
│ [Move]                │                                      │
│                       │                                      │
│ Start: [ A ]          │                                      │
│ Target: [ D ]         │                                      │
│                       │                                      │
├───────────────────────┴──────────────────────────────────────┤
│ Algorithm: [BFS ▼]      [RUN] [RESET]                       │
└──────────────────────────────────────────────────────────────┘
```

---

# 33. Graph Editing Behavior

## Add Node

```text
Click Add Node
      ↓
Click empty canvas area
      ↓
Node created
      ↓
Node receives ID
```

## Add Edge

```text
Click Add Edge
      ↓
Select Node A
      ↓
Select Node B
      ↓
Edge created
```

## Delete

```text
Click Delete
      ↓
Select node or edge
      ↓
Item removed
```

## Move

```text
Click / drag node
      ↓
Node position changes
```

Moving a node should not change graph connectivity.

---

# 34. Graph Weight Interaction

For weighted graph algorithms:

```text
Select edge
      ↓
Edit weight
      ↓
Save weight
```

Example:

```text
A ── 5 ── B
```

Changing it:

```text
A ── 2 ── B
```

The graph should immediately reflect the new weight.

---

# 35. Graph Algorithm Execution

After graph creation:

```text
Select algorithm
      ↓
Select start
      ↓
Optional target
      ↓
Click RUN
      ↓
Graph validation
      ↓
Execution
      ↓
Step-by-step visualization
```

Controls should then behave like the standard visualizer:

```text
Previous
Play
Pause
Next
Restart
```

---

# 36. Tree Playground Page

Tree playground should allow direct manipulation.

Conceptually:

```text
┌──────────────────────────────────────────────────────────────┐
│ TREE PLAYGROUND                                              │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│                     50                                       │
│                    /  \                                      │
│                  30    70                                    │
│                 / \    / \                                   │
│               20  40  60  80                                 │
│                                                              │
├──────────────────────────────────────────────────────────────┤
│ Value: [ 35 ]                                                │
│                                                              │
│ [INSERT] [DELETE] [SEARCH] [RESET]                          │
│                                                              │
│ Traversal: [Inorder] [Preorder] [Postorder] [BFS]           │
└──────────────────────────────────────────────────────────────┘
```

---

# 37. Tree Interaction Flow

Insert:

```text
Value
 ↓
INSERT
 ↓
Search correct location
 ↓
Update tree
 ↓
Show path
 ↓
Place node
```

Delete:

```text
Value
 ↓
DELETE
 ↓
Find node
 ↓
Show relevant operation
 ↓
Update tree
```

Search:

```text
Value
 ↓
SEARCH
 ↓
Highlight visited path
 ↓
FOUND / NOT FOUND
```

Traversal:

```text
Select traversal
 ↓
RUN
 ↓
Highlight nodes in order
 ↓
Show traversal sequence
```

---

# 38. Challenge Home Page

The Challenge area should begin with discovery rather than immediately starting a question.

Conceptually:

```text
┌──────────────────────────────────────────────────────────────┐
│ CHALLENGES                                                   │
├──────────────────────────────────────────────────────────────┤
│ Search challenges...                                         │
├──────────────────────────────────────────────────────────────┤
│ FILTER                                                       │
│ Algorithm / Category / Difficulty / Completed                │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│ [Predict Bubble Sort]                                        │
│ [Find BFS Traversal]                                         │
│ [Binary Search Next Step]                                   │
│ [Dijkstra Shortest Path]                                    │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

---

# 39. Challenge Page

A challenge should be presented one step at a time.

Conceptually:

```text
┌──────────────────────────────────────────────────────────────┐
│ CHALLENGE  4 / 10                                            │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│ What happens next?                                           │
│                                                              │
│ [ 7 ][ 3 ][ 9 ][ 2 ]                                         │
│          ↑    ↑                                              │
│                                                              │
│ A. Swap 7 and 3                                              │
│ B. Compare 9 and 2                                           │
│ C. Finish                                                     │
│ D. Move to previous step                                     │
│                                                              │
│ [SUBMIT]                                                      │
│                                                              │
│ [HINT]                                                        │
└──────────────────────────────────────────────────────────────┘
```

---

# 40. Challenge Answer Flow

```text
User chooses answer
      ↓
Click SUBMIT
      ↓
Validate answer
      ↓
Correct?
 ┌────┴────┐
 │         │
YES        NO
 │         │
 ▼         ▼
Success    Explanation
 │         │
 └────┬────┘
      ↓
[CONTINUE]
```

The user should see feedback before continuing.

---

# 41. Challenge Completion Page

At the end:

```text
┌──────────────────────────────────────────────┐
│              CHALLENGE COMPLETE              │
├──────────────────────────────────────────────┤
│                                              │
│ Score: 8 / 10                               │
│ Accuracy: 80%                               │
│ Attempts: 10                                │
│                                              │
│ Strong areas:                               │
│ Comparisons                                  │
│                                              │
│ Review needed:                              │
│ Complexity                                   │
│                                              │
│ [RETRY] [NEXT CHALLENGE] [BACK]              │
└──────────────────────────────────────────────┘
```

---

# 42. Compare Page

The comparison page allows users to choose several algorithms solving a similar problem.

Conceptually:

```text
┌──────────────────────────────────────────────────────────────┐
│ COMPARE ALGORITHMS                                           │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│ Problem Type: [Sorting ▼]                                   │
│                                                              │
│ Select Algorithms:                                           │
│ ☑ Bubble Sort                                                 │
│ ☑ Merge Sort                                                  │
│ ☑ Quick Sort                                                  │
│ ☐ Insertion Sort                                              │
│                                                              │
│ Input:                                                        │
│ [ 7, 3, 9, 2, 5 ]                                            │
│                                                              │
│ [RUN COMPARISON]                                              │
└──────────────────────────────────────────────────────────────┘
```

---

# 43. Comparison Result Page

After running:

```text
┌──────────────────────────────────────────────────────────────┐
│ COMPARISON RESULT                                            │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│              Bubble   Merge   Quick                          │
│ Steps          20      12      10                            │
│ Comparisons    14       8       7                            │
│ Swaps           8       --       3                            │
│                                                              │
├──────────────────────────────────────────────────────────────┤
│ COMPLEXITY                                                    │
│ Bubble: O(n²)                                                 │
│ Merge:  O(n log n)                                            │
│ Quick:  O(n log n) average                                   │
├──────────────────────────────────────────────────────────────┤
│ [RUN AGAIN] [OPEN BUBBLE] [OPEN MERGE] [OPEN QUICK]           │
└──────────────────────────────────────────────────────────────┘
```

---

# 44. Progress Page

The Progress page should summarize learning activity.

Conceptually:

```text
┌──────────────────────────────────────────────────────────────┐
│ PROGRESS                                                     │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│ Algorithms Completed      12 / 40                             │
│ Challenges Completed      18                                  │
│ Average Challenge Score   84%                                 │
│                                                              │
├──────────────────────────────────────────────────────────────┤
│ CATEGORIES                                                   │
│                                                              │
│ Sorting        █████████░  80%                               │
│ Searching      ███████░░░  60%                               │
│ Graphs         ████░░░░░░  40%                               │
│ Trees          ███░░░░░░░  30%                               │
│                                                              │
├──────────────────────────────────────────────────────────────┤
│ RECENT ACHIEVEMENTS                                           │
│                                                              │
│ Bubble Sort completed                                         │
│ BFS challenge completed                                       │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

The exact visual representation can change. The layout should preserve the information hierarchy.

---

# 45. Progress Page — Click Behavior

Click completed algorithm:

```text
Progress
 ↓
Algorithm
 ↓
Visualizer / Detail Page
```

Click category:

```text
Progress
 ↓
Category Explorer
```

Click challenge:

```text
Progress
 ↓
Challenge result / retry
```

---

# 46. History Page

History should show previously opened topics.

Conceptually:

```text
┌──────────────────────────────────────────────────────────────┐
│ HISTORY                                                      │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│ TODAY                                                        │
│                                                              │
│ BFS                       Open                               │
│ Bubble Sort               Open                               │
│ BST                       Open                               │
│                                                              │
│ YESTERDAY                                                    │
│                                                              │
│ Binary Search             Open                               │
│ Dijkstra                  Open                               │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

Clicking an item should reopen the relevant topic.

---

# 47. History Item Behavior

The history item should remember enough information to determine where to return.

Example:

```text
History item:
BFS
```

Click:

```text
BFS
 ↓
BFS Topic Page
```

If the product later supports restoring custom inputs, a history entry may also contain:

```text
Algorithm
Input
Mode
Last Viewed Step
```

But the initial product does not need to persist every execution frame.

---

# 48. Favorites Page

Conceptually:

```text
┌──────────────────────────────────────────────────────────────┐
│ FAVORITES                                                    │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│ SORTING                                                      │
│ [Merge Sort] [Quick Sort]                                    │
│                                                              │
│ GRAPHS                                                       │
│ [BFS] [Dijkstra]                                             │
│                                                              │
│ TREES                                                        │
│ [BST]                                                        │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

Clicking a favorite opens its detail / visualizer page.

Removing a favorite:

```text
Click remove
 ↓
Immediately remove from Favorites
 ↓
Remain on Favorites page
```

---

# 49. Settings Page

Settings should contain application-level preferences only.

Possible sections:

```text
Playback Preferences
Default Language
Default Input Behavior
Accessibility Preferences
Data / Storage Controls
```

Settings should not contain algorithm content.

---

# 50. Back Navigation

Back behavior should be predictable.

Example:

```text
Home
 ↓
Algorithms
 ↓
Sorting
 ↓
Bubble Sort
 ↓
Visualizer
```

Press Back:

```text
Visualizer
 ↓
Bubble Sort
```

Press Back again:

```text
Bubble Sort
 ↓
Sorting
```

The user should not unexpectedly return to Home unless that is the actual navigation history.

---

# 51. Sidebar vs Browser Back

Sidebar clicks are direct navigation.

Browser / application Back should respect navigation history.

For example:

```text
BFS
 ↓
Visualizer
 ↓
Challenge
```

Back from Challenge:

```text
Visualizer
```

not automatically:

```text
Home
```

unless the user's actual navigation history leads there.

---

# 52. Opening a Topic From Different Places

An algorithm may be opened from:

```text
Home
Explorer
Search
History
Favorites
Progress
Challenge Result
Comparison Result
```

Regardless of source, the destination should use the same canonical topic representation.

Example:

```text
BFS clicked from Home
BFS clicked from History
BFS clicked from Search
```

All should open:

```text
BFS Topic
```

rather than creating multiple versions of the same page.

---

# 53. Direct Visualizer Access

The user should also be able to enter visualization directly.

For example:

```text
Explorer
 ↓
Bubble Sort
 ↓
[Visualize]
 ↓
Visualizer
```

The visualizer should load a valid default example immediately.

---

# 54. Switching Algorithms From the Visualizer

The visualizer may provide a way to change the algorithm.

Conceptually:

```text
Current:
Bubble Sort

[Change Algorithm ▼]
    ↓
Merge Sort
Quick Sort
Insertion Sort
...
```

Selecting another algorithm should:

```text
Save / discard current state as appropriate
 ↓
Load new algorithm
 ↓
Load compatible example input
 ↓
Reset visualization
```

The old execution should not remain visually active.

---

# 55. Related Algorithms

At the bottom or side of an algorithm page:

```text
RELATED ALGORITHMS

Bubble Sort
Insertion Sort
Selection Sort
Merge Sort
```

Clicking one:

```text
Related Algorithm
 ↓
Selected Algorithm Topic
```

---

# 56. Related Concepts

Examples:

```text
BFS
Related:
Queue
Graph Traversal
Shortest Path
DFS
```

Clicking a concept can open its relevant topic.

This allows the site to behave like an interconnected learning platform rather than isolated pages.

---

# 57. Learning Path Page

A Learning Path page should show recommended progression.

Conceptually:

```text
BEGINNER PATH

1. Arrays
      ↓
2. Linear Search
      ↓
3. Binary Search
      ↓
4. Stack
      ↓
5. Queue
      ↓
6. Linked List
      ↓
7. Sorting
      ↓
8. Graph Traversal
```

Each topic should show:

```text
Completed
In Progress
Locked / Not Started
```

If prerequisites are later enforced, a topic can remain accessible but marked as recommended after previous material.

---

# 58. Continue Learning Flow

When the user returns to LogicLab:

```text
Home
 ↓
Continue Learning
 ↓
Last unfinished topic
```

Example:

```text
Continue:
Dijkstra
Step 14 / 32
```

Clicking it can open the Dijkstra topic.

The initial implementation may restore only the topic, while a future version can restore a saved custom state.

---

# 59. Empty States

Every content-driven page should have an intentional empty state.

Examples:

### Favorites Empty

```text
No favorites yet.

Explore algorithms and save the ones
you want to revisit.

[Explore Algorithms]
```

### History Empty

```text
No history yet.

Open an algorithm to begin learning.

[Explore Algorithms]
```

### Search Empty

```text
No results found.

Try:
"BFS"
"sorting"
"shortest path"
```

### Challenge Empty

```text
No challenges match this filter.

[Clear Filters]
```

---

# 60. Error States

Errors should appear in the relevant section without breaking the entire page.

Example:

```text
Unable to load this topic.

[Retry]
[Back]
```

For graph validation:

```text
Cannot run algorithm.

Start node is required.

[Select Start Node]
```

For invalid custom array:

```text
Invalid input.

Please enter numeric values separated by commas.

[Edit Input]
```

---

# 61. Loading States

The layout should reserve the correct place for content while data is loading.

For example:

```text
Explorer
 ↓
Loading algorithms
 ↓
Algorithm cards appear
```

The user should not see unrelated blank navigation areas.

---

# 62. Modal / Overlay Usage

Modals should be used only for short, focused interactions such as:

```text
Confirm reset
Edit edge weight
Choose language
Delete saved item
```

Large educational content should generally remain in the main page rather than being hidden inside a modal.

---

# 63. Reset Behavior

Reset should always have clear scope.

### Visualizer Reset

```text
Current execution
 ↓
Return to Step 0
```

### Input Reset

```text
Current custom input
 ↓
Return to default input
```

### Graph Reset

```text
Custom graph
 ↓
Clear graph / return to starting state
```

### Challenge Reset

```text
Current challenge
 ↓
Restart challenge
```

The user should not accidentally reset unrelated application data.

---

# 64. Leaving a Running Visualization

If the user navigates away while an algorithm is playing:

```text
Visualizer playing
      ↓
User clicks another page
```

The application should stop playback for the abandoned visualizer.

When the user returns, the system may:

```text
Start from initial state
```

or optionally:

```text
Restore previous visualizer state
```

The initial version should prioritize simplicity and predictable behavior.

---

# 65. Navigation While Editing Graphs or Trees

If the user has unsaved custom graph/tree data and navigates away, the system should have a predictable rule.

Initial recommended behavior:

```text
User changes graph
       ↓
Leaves page
       ↓
Custom graph is discarded unless explicitly saved
```

A future version may allow:

```text
Save Custom Graph
```

The same rule applies to custom trees.

---

# 66. Save Custom Example — Future Feature

A future save flow could be:

```text
Custom Graph
     ↓
[SAVE]
     ↓
Name:
"My BFS Practice Graph"
     ↓
Saved
     ↓
Appears in My Examples
```

This is optional for the first release but should fit the architecture.

---

# 67. Mobile Structural Behavior

The page structure should adapt without changing the information hierarchy.

Desktop:

```text
Sidebar + Main Content
```

Mobile:

```text
Top Navigation
      ↓
Main Content
      ↓
Collapsible Navigation
```

The sidebar can become a drawer or collapsible navigation.

It should still contain the same navigation destinations.

---

# 68. Mobile Visualizer Structure

Desktop:

```text
Visualization
+ Explanation
+ Code
+ Metrics
```

Mobile:

```text
Visualization
↓
Playback
↓
Current Step
↓
Explanation
↓
Code
↓
Metrics
```

Nothing should disappear merely because the screen is smaller.

Information can be reordered or collapsible.

---

# 69. Mobile Graph Playground

On smaller screens:

```text
Graph Canvas
   ↓
Tools
   ↓
Start / Target
   ↓
Algorithm
   ↓
Run
```

The graph editor controls should not prevent access to the graph canvas.

---

# 70. Desktop vs Mobile Principle

Responsive behavior should change:

```text
Position
Grouping
Stacking
Collapsing
```

It should not change:

```text
Available core functionality
Navigation destinations
Algorithm behavior
Challenge logic
```

---

# 71. Global Interaction Rules

Important clickable items should follow consistent behavior.

```text
Card
→ Open corresponding topic.

Arrow / Back
→ Navigate to previous logical location.

Filter
→ Update visible results.

Search
→ Update results.

Favorite
→ Add / remove favorite.

Play
→ Start playback.

Pause
→ Freeze current step.

Next
→ Move forward one step.

Previous
→ Move backward one step.

Reset
→ Return current activity to initial state.

Run
→ Execute current configuration.
```

---

# 72. Page Relationship Map

The overall navigation can be represented as:

```text
                           HOME
                            │
           ┌────────────────┼───────────────────┐
           │                │                   │
           ▼                ▼                   ▼
      ALGORITHMS      DATA STRUCTURES       CHALLENGES
           │                │                   │
           ▼                ▼                   ▼
     TOPIC DETAIL       DS DETAIL          CHALLENGE
           │                │                   │
           ▼                ▼                   │
      VISUALIZER       PLAYGROUND             │
           │                │                   │
           ├───────┬────────┘                   │
           │       │                            │
           ▼       ▼                            ▼
       PRACTICE  COMPARE                    RESULT
           │
           ▼
        PROGRESS
```

---

# 73. Full User Journey — New User

```text
HOME
  ↓
Explore Algorithms
  ↓
Choose Sorting
  ↓
Choose Bubble Sort
  ↓
Read Explanation
  ↓
Click Visualize
  ↓
See Default Input
  ↓
Play
  ↓
Pause / Next / Previous
  ↓
Read Explanation
  ↓
See Code
  ↓
See Metrics
  ↓
Complete
  ↓
Try Challenge
  ↓
Submit Answers
  ↓
See Result
  ↓
Progress Updated
```

---

# 74. Full User Journey — Experienced User

```text
HOME
  ↓
Search "Dijkstra"
  ↓
Open Visualizer
  ↓
Create Custom Graph
  ↓
Set Start / Target
  ↓
Run
  ↓
Step Through
  ↓
Compare With A*
  ↓
Open Challenge
  ↓
Complete
```

The site should support both short and deep learning journeys.

---

# 75. Full User Journey — Returning User

```text
HOME
  ↓
Continue Learning
  ↓
Last Viewed Topic
  ↓
Visualizer / Topic
  ↓
Continue Practice
```

Alternative:

```text
HOME
  ↓
History
  ↓
Previously Viewed Topic
```

---

# 76. Canonical Topic Structure

Every algorithm topic should follow the same conceptual structure:

```text
Topic
│
├── Overview
├── Explanation
├── Example
├── Complexity
├── Visualization
├── Code
├── Pseudocode
├── Challenge
├── Related Topics
└── Favorite
```

This consistency makes navigation easier.

---

# 77. Canonical Visualizer Structure

Every algorithm visualizer should conceptually contain:

```text
Visualizer
│
├── Input
├── Visualization
├── Playback Controls
├── Current Step
├── Explanation
├── Code / Pseudocode
├── Metrics
├── Complexity
└── Result
```

Algorithms can omit irrelevant sections, but the structural model should remain consistent.

---

# 78. Page Reuse Principle

Do not create separate completely different page structures for:

```text
Bubble Sort
Merge Sort
Quick Sort
```

They should use the same visualizer shell with different data.

Likewise:

```text
BFS
DFS
Dijkstra
A*
```

should share the Graph Visualizer structure.

---

# 79. Visualization Shell vs Algorithm Content

This distinction is critical.

```text
VISUALIZER SHELL
├── Header
├── Input controls
├── Playback
├── Explanation panel
├── Code panel
├── Metrics
└── Result

ALGORITHM CONTENT
└── Bubble Sort / BFS / Dijkstra / etc.
```

The shell remains reusable.

---

# 80. Data Structure Playground Shell

Likewise:

```text
PLAYGROUND SHELL
├── Header
├── Data structure display
├── Operation controls
├── Input
├── Operation history
└── Explanation
```

Different structures plug into this shell.

---

# 81. Challenge Shell

Challenges should also share a common shell:

```text
CHALLENGE SHELL
├── Progress
├── Question
├── Interactive area
├── Answer controls
├── Hint
├── Submit
├── Feedback
└── Next
```

The actual question type changes.

---

# 82. Search Result Navigation

Search result behavior should be predictable.

Example:

```text
Search:
"binary"

Results:
Binary Search
Binary Tree
Binary Search Tree
```

Selecting:

```text
Binary Search
   ↓
Algorithm Topic

Binary Tree
   ↓
Data Structure Topic

Binary Search Tree
   ↓
Data Structure Topic
```

The search system should route to the correct canonical content type.

---

# 83. Breadcrumb Structure

Where navigation becomes deep, breadcrumbs can show the path.

Example:

```text
Algorithms
 / Sorting
 / Bubble Sort
 / Visualizer
```

Clicking:

```text
Sorting
 ↓
Sorting Explorer

Bubble Sort
 ↓
Bubble Sort Topic
```

---

# 84. Search From Visualizer

Global search should still be available from the visualizer.

If the user searches another algorithm:

```text
Visualizer
 ↓
Search "Merge Sort"
 ↓
Merge Sort
```

The current visualizer should stop.

The new topic should load cleanly.

---

# 85. Favorite From Visualizer

The favorite control should work from:

```text
Topic
Visualizer
```

After clicking:

```text
Favorite ON
```

The user remains where they are.

---

# 86. Challenge From Visualizer

The visualizer should offer:

```text
[Try Challenge]
```

Click:

```text
Visualizer
 ↓
Challenge
```

The challenge should reference the current algorithm.

After completion:

```text
Challenge Result
 ↓
[Return to Visualizer]
```

---

# 87. Compare From Visualizer

The visualizer should offer:

```text
[Compare]
```

Click:

```text
Current Algorithm
 ↓
Comparison Page
```

The current algorithm should already be selected there.

Example:

```text
Current:
Merge Sort

Comparison:
☑ Merge Sort
☐ Quick Sort
☐ Heap Sort
☐ Bubble Sort
```

---

# 88. Related Challenge Navigation

From an algorithm page:

```text
Try Challenge
```

should open challenges specifically associated with that algorithm.

From the Challenge home:

```text
Filter by Algorithm
```

should show all challenges for the selected topic.

---

# 89. Completion Behavior

When an algorithm is considered completed, progress should update.

Suggested rule:

```text
User reaches final visualization step
       ↓
Algorithm marked as viewed/completed
```

For a stronger learning completion:

```text
Visualized
+
Challenge Completed
```

could later be used.

The exact rule can be refined, but it should be consistent.

---

# 90. Page Refresh Behavior

Refreshing a topic page should load the topic normally.

A refresh should not lose the canonical content.

For the first version:

```text
Refresh Visualizer
 ↓
Load topic
 ↓
Load default input
 ↓
Step 0
```

A future version may restore custom state.

---

# 91. Deep Linking

Each important topic should ideally have a direct URL/path conceptually like:

```text
/algorithms/bubble-sort
/algorithms/bfs
/data-structures/stack
/data-structures/bst
/challenges
/compare
/progress
/history
/favorites
```

The exact framework routing can be decided during implementation.

The important requirement is that topics are independently addressable.

---

# 92. URL / Navigation Principle

The URL should identify the current major content where practical.

Examples:

```text
/algorithms/bubble-sort
/algorithms/bubble-sort/visualize
/data-structures/stack
/data-structures/stack/playground
```

This supports:

- Direct access.
- Browser navigation.
- Sharing.
- Refreshing.
- Bookmarking.

---

# 93. Future Content Expansion

Future categories should fit into the same layout model.

For example:

```text
Math Algorithms
String Algorithms
Greedy
Backtracking
Dynamic Programming
```

Each category should appear through the existing Explorer pattern.

New content should not require redesigning the entire site navigation.

---

# 94. Future Feature Expansion

The architecture should leave clear space for:

```text
Saved Custom Examples
Learning Paths
Achievements
Leaderboards
Community Challenges
Multiple Languages
Explanatory Notes
Practice Mode
Interview Mode
Exam Mode
```

These should be added as separate capabilities rather than disrupting the core visualizer.

---

# 95. What Should Never Be Part of This Layout Specification

This document intentionally does not define:

```text
Color palette
Typography
Font sizes
Border colors
Shadow styles
Exact animation style
Icon style
Brand graphics
Background artwork
Decorative illustrations
```

Those belong to the visual design specification, not the information architecture.

---

# 96. Final Website Structure

The final conceptual website can be summarized as:

```text
LOGICLAB
│
├── HOME
│   ├── Quick Access
│   ├── Continue Learning
│   ├── Recommended Topics
│   └── Practice
│
├── ALGORITHMS
│   ├── Categories
│   ├── Search
│   ├── Filters
│   └── Algorithm Topics
│       ├── Overview
│       ├── Visualizer
│       ├── Code
│       ├── Complexity
│       └── Challenges
│
├── DATA STRUCTURES
│   ├── Categories
│   ├── Search
│   └── Structure Topics
│       ├── Overview
│       ├── Playground
│       ├── Operations
│       └── Challenges
│
├── CHALLENGES
│   ├── Browse
│   ├── Filter
│   ├── Challenge
│   └── Result
│
├── COMPARE
│   ├── Select
│   ├── Configure
│   └── Results
│
├── PROGRESS
│   ├── Completion
│   ├── Categories
│   ├── Scores
│   └── Learning Activity
│
├── HISTORY
│   └── Previously Viewed Topics
│
├── FAVORITES
│   └── Saved Topics
│
└── SETTINGS
    └── Application Preferences
```

---

# 97. Final User-Flow Map

The entire product experience can be represented as:

```text
                              ┌───────────┐
                              │   HOME    │
                              └─────┬─────┘
                                    │
             ┌──────────────────────┼────────────────────────┐
             │                      │                        │
             ▼                      ▼                        ▼
      ┌─────────────┐       ┌──────────────┐         ┌──────────────┐
      │ ALGORITHMS  │       │DATA STRUCTURE│         │ CHALLENGES   │
      └──────┬──────┘       └──────┬───────┘         └──────┬───────┘
             │                     │                        │
             ▼                     ▼                        ▼
      ┌─────────────┐       ┌──────────────┐         ┌──────────────┐
      │ TOPIC PAGE  │       │ STRUCTURE    │         │ CHALLENGE    │
      │             │       │ PAGE         │         │ PLAYER       │
      └──────┬──────┘       └──────┬───────┘         └──────┬───────┘
             │                     │                        │
             ▼                     ▼                        ▼
      ┌─────────────┐       ┌──────────────┐         ┌──────────────┐
      │ VISUALIZER  │       │ PLAYGROUND   │         │ RESULT       │
      └──────┬──────┘       └──────┬───────┘         └──────┬───────┘
             │                     │                        │
       ┌─────┼─────┐               │                        │
       │     │     │               │                        │
       ▼     ▼     ▼               ▼                        ▼
     CODE  WHY?  METRICS       OPERATIONS               PROGRESS
       │     │     │               │                        │
       └─────┼─────┘               └────────────┬───────────┘
             │                                  │
             └────────────────┬─────────────────┘
                              ▼
                         USER LEARNING
```

---

# 98. Final Principle

The website should feel simple to use even though the system behind it is extensive.

The user's mental model should be:

```text
FIND
  ↓
UNDERSTAND
  ↓
VISUALIZE
  ↓
INTERACT
  ↓
PRACTICE
  ↓
COMPARE
  ↓
IMPROVE
```

The website structure should support that journey without unnecessary page changes or duplicated experiences.

The most important layout rule is:

> **Every algorithm and data structure should have one clear home, one consistent learning experience, one reusable interactive environment, and clear paths to practice and comparison.**

That is the foundation of the LogicLab website structure.
