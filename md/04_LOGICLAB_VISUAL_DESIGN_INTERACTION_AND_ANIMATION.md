# LogicLab — Visual Design, Interaction & Animation Specification

## 1. Purpose of This Document

This document defines the complete **visual design, interaction behavior, typography, animation language, visualization styling, and motion rules** for LogicLab.

The previous LogicLab documents define:

- What information the product contains.
- How the system is architected.
- How the website is structured and how users navigate it.

This document defines:

> **How LogicLab should look, feel, move, react, and visually communicate algorithmic logic.**

This document intentionally does not define the underlying application architecture or algorithm implementation.

It defines the visual and interaction contract that the implementation should follow.

---

# 2. Core Visual Philosophy

LogicLab should feel like an **interactive laboratory for understanding logic**.

The interface should communicate three things continuously:

```text
1. WHAT is happening?
2. WHY is it happening?
3. WHAT will happen next?
```

The visual design should therefore prioritize:

```text
Clarity
   ↓
Hierarchy
   ↓
State visibility
   ↓
Interaction
   ↓
Motion
   ↓
Decoration
```

Decoration should never compete with the educational information.

The user should immediately understand:

```text
Where am I?
What am I looking at?
What is currently happening?
What can I click?
Why did the state change?
What should I do next?
```

---

# 3. Visual Identity Direction

LogicLab should communicate:

- Technical precision.
- Curiosity.
- Experimentation.
- Structured thinking.
- Learning through interaction.
- Controlled complexity.

The website should not feel like:

- A traditional school textbook.
- A generic dashboard.
- A gaming website.
- A developer IDE copied into a browser.
- A simple animation gallery.

It should feel like:

```text
Learning Platform
      +
Interactive Laboratory
      +
Developer Playground
```

---

# 4. Visual Hierarchy

Every page should have a clear visual hierarchy.

Recommended priority:

```text
1. Current task / current algorithm
2. Current visualization state
3. Primary action
4. Current explanation
5. Supporting information
6. Metrics / complexity
7. Secondary actions
8. Decorative content
```

For a visualizer:

```text
CURRENT ALGORITHM
       ↓
VISUALIZATION
       ↓
CURRENT ACTION
       ↓
EXPLANATION
       ↓
CODE
       ↓
METRICS / COMPLEXITY
```

The current operation should visually receive more attention than historical or secondary information.

---

# 5. Design Principle: State Before Decoration

A user should always be able to identify state changes.

For example:

```text
Before:

[ 7 ] [ 3 ] [ 9 ] [ 2 ]

Current action:

[ 7 ] <-> [ 3 ]

After:

[ 3 ] [ 7 ] [ 9 ] [ 2 ]
```

The interface should communicate the transition itself.

Do not depend on decorative animation that looks attractive but does not explain the operation.

---

# 6. Color System

The color system should be semantic rather than arbitrary.

Colors should represent meaning consistently throughout the application.

## 6.1 Base Roles

The visual system should define roles for:

```text
Background
Primary Surface
Secondary Surface
Elevated Surface
Border
Primary Text
Secondary Text
Muted Text
Primary Accent
Secondary Accent
Success
Warning
Error
Info
```

The exact color values can be finalized during visual implementation, but every role must have a clearly defined purpose.

---

# 7. Visualization State Colors

The algorithm visualizer requires a separate semantic state system.

Recommended conceptual states:

```text
DEFAULT
CURRENT
SELECTED
COMPARING
SWAPPING
ACTIVE
VISITED
DISCOVERED
SORTED
TARGET
PATH
PIVOT
BOUNDARY
DISABLED
ERROR
SUCCESS
```

These states must be visually distinguishable.

Example:

```text
Normal:
[ 7 ] [ 3 ] [ 9 ]

Comparing:
[ 7*] [ 3*] [ 9 ]

Swap:
[ 7⇄3 ]

Sorted:
[ 3✓] [ 7✓] [ 9 ]

Target:
[ 9★ ]
```

The actual UI should use semantic visual treatment rather than arbitrary colors for every algorithm.

---

# 8. Color Must Not Be the Only State Indicator

Important states should never depend only on color.

For example:

```text
Comparing
```

should use a combination of:

- Color/state treatment.
- Outline or border.
- Position.
- Label where useful.
- Motion.
- Semantic text.

For accessibility and clarity:

```text
"Current node"
"Visited node"
"Shortest path"
```

should remain understandable even if color perception is limited.

---

# 9. Typography System

Typography should be consistent throughout LogicLab.

The primary UI typeface should be:

## Inter

Inter should be used as the main interface font for:

- Page titles.
- Section headings.
- Navigation.
- Body text.
- Buttons.
- Labels.
- Cards.
- Metrics.
- Explanations.
- Tooltips.
- Form labels.
- Status messages.

Official Google Fonts reference:

https://fonts.google.com/specimen/Inter

The project should use one primary family consistently rather than switching between many decorative fonts.

---

# 10. Code Typography

For code and technical execution content, use:

## JetBrains Mono

JetBrains Mono should be reserved for:

- Source code.
- Pseudocode where a monospaced presentation improves clarity.
- Variables.
- Algorithm states presented as text.
- Input arrays when shown in technical form.
- Debug-like execution information.
- Code line references.

Official Google Fonts reference:

https://fonts.google.com/specimen/JetBrains+Mono

This gives LogicLab a clear typographic distinction:

```text
INTER
= Product / Learning Interface

JETBRAINS MONO
= Code / Technical Execution
```

---

# 11. Typography Hierarchy

The same font family should be used in different sizes and weights to create hierarchy.

Conceptually:

```text
Display Title
        ↓
Page Heading
        ↓
Section Heading
        ↓
Card Heading
        ↓
Body
        ↓
Supporting Text
        ↓
Caption
```

Recommended semantic roles:

```text
Display
H1
H2
H3
H4
Body Large
Body
Body Small
Caption
Label
Button
Metric
Code
Code Comment
```

The exact sizes should be defined in the implementation design tokens.

---

# 12. Typography Weight Rules

Use a limited and intentional set of weights.

Suggested roles:

```text
Regular
→ Body and explanations

Medium
→ Labels, controls, navigation

SemiBold
→ Headings, card titles, important metrics

Bold
→ Major results and emphasis
```

Avoid using extremely heavy weights everywhere.

The most important information should be heavier, not everything.

---

# 13. Typography Fallbacks

The application should define proper fallback stacks.

Conceptually:

```text
Inter,
system-ui,
sans-serif
```

and:

```text
JetBrains Mono,
monospace
```

The interface should remain readable if the web fonts fail to load.

---

# 14. Spacing System

LogicLab should use a consistent spacing scale.

Spacing should be used consistently for:

- Page sections.
- Cards.
- Panels.
- Inputs.
- Navigation items.
- Visualization elements.
- Controls.
- Code blocks.
- Explanations.

A conceptual spacing scale:

```text
XS
SM
MD
LG
XL
2XL
3XL
```

The exact pixel values should be implemented as reusable design tokens.

Do not manually invent a different spacing value for every component.

---

# 15. Component Sizing

Common component sizes should be standardized.

Examples:

```text
Small control
Medium control
Primary action
Icon button
Input
Card
Panel
Modal
Navigation item
```

The exact dimensions should be chosen during implementation, but the same component should retain the same structural size throughout the application.

---

# 16. Border Radius System

Use a small set of radius levels rather than random values.

Conceptually:

```text
Small Radius
→ Inputs, small controls

Medium Radius
→ Cards, panels

Large Radius
→ Major containers, large educational areas
```

The radius should support the product's technical/educational character without making every component look like a floating pill.

---

# 17. Elevation and Shadows

Elevation should communicate hierarchy, not decoration.

Conceptual levels:

```text
Level 0
Flat content

Level 1
Card

Level 2
Elevated panel

Level 3
Modal / overlay
```

Avoid excessive floating layers.

The main visualization should remain the visual center.

---

# 18. Iconography

Icons should communicate actions quickly.

Common actions:

```text
Play
Pause
Previous
Next
Restart
Search
Filter
Favorite
Back
Settings
Expand
Collapse
Zoom In
Zoom Out
Add Node
Delete
Edit
Reset
Help
```

Icon behavior should be consistent.

A familiar icon should not represent a different action on different pages.

Important actions should use both icon and accessible text where ambiguity exists.

---

# 19. Global Component States

Every interactive component should account for:

```text
DEFAULT
HOVER
FOCUS
ACTIVE
PRESSED
DISABLED
LOADING
SUCCESS
ERROR
```

Example:

```text
Button

Default
   ↓
Hover
   ↓
Pressed
   ↓
Action
   ↓
Success / Error
```

The visual response should clearly communicate whether the user's action was accepted.

---

# 20. Focus State

Keyboard focus should always be visible.

The focus indicator should clearly identify:

```text
Which control has focus?
```

This is particularly important for:

- Playback controls.
- Navigation.
- Inputs.
- Challenge answers.
- Graph tools.
- Tree controls.

---

# 21. Disabled State

A disabled control should make its inactive state clear.

Examples:

```text
Previous disabled at Step 0
Next disabled at final step
Run disabled while input is invalid
Submit disabled before an answer is selected
```

Disabled should not be confused with loading.

---

# 22. Loading State

Loading should communicate what is actually loading.

Examples:

```text
Loading algorithm
Loading challenge
Generating example
Generating visualization
```

Avoid showing one generic loading indicator for the entire page when only one panel is loading.

---

# 23. Success State

Success should be clear but not excessively disruptive.

Examples:

```text
Correct answer
Challenge completed
Algorithm completed
Favorite added
Graph saved
```

Use:

```text
State change
Short feedback
Optional next action
```

rather than blocking the user with unnecessary dialogs.

---

# 24. Error State

Errors should explain:

```text
What went wrong
Why it matters
What the user can do next
```

Example:

```text
Unable to run BFS.

Start node is missing.

[Select Start Node]
```

The error should appear near the relevant action.

---

# 25. Main Layout Visual Language

The website should use a consistent content structure:

```text
┌───────────────────────────────────────────────────────────────┐
│ HEADER                                                        │
├───────────────┬───────────────────────────────────────────────┤
│               │                                               │
│   SIDEBAR     │                 CONTENT                       │
│               │                                               │
│               │                                               │
└───────────────┴───────────────────────────────────────────────┘
```

Within content:

```text
Page Header
     ↓
Primary Content
     ↓
Supporting Panels
     ↓
Secondary Information
```

---

# 26. Cards

Cards should be used for:

- Algorithms.
- Data structures.
- Challenges.
- Learning paths.
- Progress summaries.
- Related topics.

Cards should have clear hierarchy:

```text
Title
Category / Metadata
Short explanation
Primary action
Secondary action
```

The card itself can be clickable where appropriate, but if it contains multiple actions, those actions should remain distinguishable.

---

# 27. Panels

Panels should group information with a shared purpose.

Examples:

```text
Explanation Panel
Code Panel
Metrics Panel
Input Panel
Complexity Panel
Challenge Panel
```

Panels should not contain unrelated information merely to fill space.

---

# 28. Buttons

Buttons should communicate action priority.

Conceptual hierarchy:

```text
Primary
→ Run
→ Start Challenge
→ Visualize

Secondary
→ Compare
→ Try Again
→ Details

Tertiary
→ Related / optional actions
```

Avoid making every action visually equivalent.

---

# 29. Inputs

Inputs should have:

- Label.
- Current value.
- Clear action if needed.
- Validation feedback.
- Appropriate interaction state.

Example:

```text
Array Input

Values
[ 7, 3, 9, 2, 5 ]

[Apply]
```

Error:

```text
Invalid input.
Only numbers are allowed.
```

---

# 30. Visualization Canvas

The visualization canvas is the most important interactive surface.

It should:

- Keep the current state visible.
- Provide enough space for the structure.
- Allow direct interaction where supported.
- Keep controls separate from the visualization.
- Avoid unnecessary clipping.
- Support large structures through zoom/pan when necessary.

Conceptual:

```text
┌─────────────────────────────────────────────┐
│               VISUALIZATION                 │
│                                             │
│              [ 7 ] [ 3 ]                   │
│                  ⇄                          │
│                                             │
│           Current operation                 │
│                                             │
└─────────────────────────────────────────────┘
```

---

# 31. Array Visualization

Arrays should use consistent cells.

Conceptually:

```text
Index
  0     1     2     3     4

┌────┬────┬────┬────┬────┐
│  7 │  3 │  9 │  2 │  5 │
└────┴────┴────┴────┴────┘
```

Possible visual states:

```text
Normal
Selected
Comparing
Swapping
Sorted
Pivot
Target
Disabled
```

---

# 32. Array Index Visibility

Indexes should be available when they help the explanation.

Example:

```text
  0    1    2    3    4
┌───┬───┬───┬───┬───┐
│ 7 │ 3 │ 9 │ 2 │ 5 │
└───┴───┴───┴───┴───┘
```

For beginner mode, indexes can be visible by default.

For advanced mode, the interface may reduce secondary information.

---

# 33. Sorting Animation Language

Sorting animations should communicate:

```text
Compare
      ↓
Decision
      ↓
Move / Swap
      ↓
Updated state
```

Do not jump directly from one array state to another without showing what caused the change.

---

# 34. Bubble Sort Animation

Bubble Sort should visually communicate neighbor comparison.

Example:

```text
Step 1

[ 7 ] [ 3 ] [ 9 ] [ 2 ] [ 5 ]
  ↑      ↑

COMPARE
7 > 3
```

Then:

```text
SWAP

[ 3 ] [ 7 ] [ 9 ] [ 2 ] [ 5 ]
       ──────→
```

The movement should feel like the two values exchanged positions.

After multiple comparisons, the final item in a pass should become visually recognized as sorted.

Conceptually:

```text
[ 3 ] [ 2 ] [ 5 ] [ 7 ] [ 9✓]
```

---

# 35. Selection Sort Animation

Selection Sort should show:

```text
Current unsorted region
        ↓
Find minimum
        ↓
Highlight minimum
        ↓
Swap with boundary
```

Example:

```text
[ 7 ] [ 3 ] [ 9 ] [ 2 ] [ 5 ]
  ↑
boundary

        [ 2 ] ← minimum
```

Then:

```text
[ 2✓] [ 3 ] [ 9 ] [ 7 ] [ 5 ]
```

The distinction between:

```text
current minimum
current boundary
sorted region
```

should remain visible.

---

# 36. Insertion Sort Animation

Insertion Sort should visually communicate:

```text
Sorted region
        +
Next value
        ↓
Shift larger values
        ↓
Insert value
```

Example:

```text
Sorted:

[ 3 ] [ 7 ] | [ 2 ] [ 9 ] [ 5 ]
             ↑
           current
```

Then:

```text
[ 3 ] [ 7 ] | [ 2 ]
       ← shift
```

Finally:

```text
[ 2 ] [ 3 ] [ 7 ] [ 9 ] [ 5 ]
```

The animation should emphasize the shifting behavior rather than representing it as a simple swap.

---

# 37. Merge Sort Animation

Merge Sort should communicate:

```text
DIVIDE
   ↓
DIVIDE
   ↓
SMALLER ARRAYS
   ↓
MERGE
   ↓
FINAL ARRAY
```

Conceptually:

```text
[ 7  3  9  2 ]
       ↓
[ 7  3 ] [ 9  2 ]
       ↓
[ 7 ][3] [9][2]
       ↓
[ 3  7 ] [ 2  9 ]
       ↓
[ 2  3  7  9 ]
```

Important states:

```text
Current sub-array
Left side
Right side
Selected values
Merged result
```

The animation should make the recursive divide-and-merge behavior visually obvious.

---

# 38. Quick Sort Animation

Quick Sort should communicate:

```text
Choose Pivot
     ↓
Partition
     ↓
Items smaller than pivot
Items larger than pivot
     ↓
Recursive partitions
```

Example:

```text
[ 7 ] [ 3 ] [ 9 ] [ 2 ] [ 5 ]
                      ↑
                    PIVOT
```

Then:

```text
SMALLER        PIVOT       LARGER

[ 3 ][ 2 ]      [ 5 ]      [ 7 ][ 9 ]
```

The pivot should remain visually identifiable throughout the partition step.

---

# 39. Heap Sort Animation

Heap Sort should visually connect:

```text
Array
  +
Heap Tree Representation
```

When useful:

```text
          9
        /   \
       7     8
```

and:

```text
[ 9 ][ 7 ][ 8 ][ ... ]
```

The relationship between heap structure and array representation should be visible.

---

# 40. Binary Search Animation

Binary Search should visually show the active range.

Example:

```text
[2][5][8][12][16][23][38]
 ↑               ↑      ↑
LOW             MID    HIGH
```

After comparing:

```text
Search target = 23

Left range removed
[2][5][8][12] | [16][23][38]
```

Then:

```text
          [16][23][38]
              ↑
             MID
```

The shrinking search interval is the key visual concept.

---

# 41. Linear Search Animation

Linear Search should emphasize sequential inspection.

```text
[7] [3] [9] [2] [5]
 ↑
CHECK
```

Then:

```text
[7] [3] [9] [2] [5]
      ↑
     CHECK
```

Visited positions should remain distinguishable from the current position.

---

# 42. Graph Visualization

Graph nodes should support semantic states:

```text
NORMAL
CURRENT
DISCOVERED
VISITED
QUEUED
TARGET
PATH
BLOCKED
```

Edges should support:

```text
NORMAL
CURRENT
TRAVERSED
PATH
WEIGHT
DISABLED
```

---

# 43. Graph Node Structure

A node should conceptually look like:

```text
   ┌─────┐
   │  A  │
   └─────┘
```

For an active node:

```text
   ┌─────┐
   │  A  │ ← CURRENT
   └─────┘
```

The visual state should be easy to identify without reading the explanation panel.

---

# 44. Graph Edge Structure

Directed:

```text
A ─────────→ B
```

Undirected:

```text
A ────────── B
```

Weighted:

```text
A ─── 4 ───→ B
```

The edge weight should remain readable without interfering with the connection itself.

---

# 45. BFS Animation

BFS should emphasize queue-based exploration.

Conceptually:

```text
Graph:

       A
      / \
     B   C
     |
     D
```

Current state:

```text
Current:
A

Queue:
[B, C]
```

Next:

```text
Visit B

Queue:
[C, D]
```

The animation should show:

```text
Discover
   ↓
Enqueue
   ↓
Dequeue
   ↓
Visit
```

The queue should update in a visible side panel or inline inspector.

---

# 46. DFS Animation

DFS should emphasize depth and backtracking.

Conceptually:

```text
A
|
B
|
D
```

The current path should be visually stronger than previously visited nodes.

When DFS backtracks:

```text
A → B → D
        ↑
     BACKTRACK
```

The visual language should communicate:

```text
Go deeper
      ↓
Dead end
      ↓
Backtrack
      ↓
Continue
```

---

# 47. Dijkstra Animation

Dijkstra should visually communicate distance updates.

Example:

```text
A ── 4 ── B
│         │
2         1
│         │
C ── 5 ── D
```

Distance labels:

```text
A = 0
B = ∞
C = ∞
D = ∞
```

After processing:

```text
A = 0
B = 4
C = 2
D = 5
```

When an edge is relaxed:

```text
A → C

old distance:
∞

new distance:
2
```

The update should be visibly connected to the edge being processed.

---

# 48. Shortest Path Animation

When the final path is known:

```text
A → C → D
```

The final path should be visually distinguished from:

```text
Visited
Discovered
Rejected
```

The user's attention should shift from the exploration process to the final route.

---

# 49. A* Animation

A* should visualize:

```text
G = current cost
H = heuristic
F = total score
```

For example:

```text
Node A

g = 3
h = 5
f = 8
```

The selected next node should be visibly identifiable.

For grid-based A*:

```text
┌───┬───┬───┬───┐
│ S │ . │ . │ . │
├───┼───┼───┼───┤
│ # │ # │ . │ . │
├───┼───┼───┼───┤
│ . │ . │ . │ G │
└───┴───┴───┴───┘
```

The discovered route should emerge incrementally.

---

# 50. Tree Visualization

Trees should make hierarchy immediately clear.

Example:

```text
             50
           /    \
         30      70
        /  \    /  \
      20   40  60   80
```

Parent-child relationships should remain visually readable.

---

# 51. BST Search Animation

When searching for a value:

```text
Search 60

            50 ← compare
           /  \
         30    70 ← compare
              /
             60 ← FOUND
```

The current search path should be visually distinguished.

---

# 52. BST Insert Animation

Insert:

```text
65
```

The animation should communicate:

```text
Compare with 50
      ↓
Go right

Compare with 70
      ↓
Go left

Compare with 60
      ↓
Go right

Insert 65
```

The path should be visible.

---

# 53. BST Delete Animation

Deletion should visually explain the structural change.

For example:

```text
Delete 50

Cases:
1. No child
2. One child
3. Two children
```

For two children:

```text
Find replacement
      ↓
Move replacement
      ↓
Reconnect affected nodes
```

The structural transition should be shown rather than instantly changing the entire tree.

---

# 54. Tree Rotation Animation

For AVL or other balanced trees:

```text
Before:

      30
     /
   20
   /
 10
```

Rotation:

```text
10 ↑
20 ↑
30
```

After:

```text
      20
     /  \
   10    30
```

The rotation should be clearly visible as a structural transformation.

---

# 55. Stack Animation

Push:

```text
Before:

┌───┐
│ 7 │
├───┤
│ 4 │
└───┘

Push 9
   ↓

┌───┐
│ 9 │ ← TOP
├───┤
│ 7 │
├───┤
│ 4 │
└───┘
```

Pop should visibly remove from the top.

---

# 56. Queue Animation

Queue should show:

```text
FRONT → [2] [4] [7] ← REAR
```

Enqueue:

```text
FRONT → [2] [4] [7] [9] ← REAR
```

Dequeue:

```text
FRONT → [4] [7] [9] ← REAR
```

The movement should reinforce FIFO behavior.

---

# 57. Linked List Animation

Nodes should visibly show pointers.

Example:

```text
HEAD
 ↓
[10] → [20] → [30] → NULL
```

Insertion:

```text
Insert 15

[10] → [15] → [20] → [30]
```

The pointer changes should be visually understandable.

Do not simply replace the entire diagram instantly.

---

# 58. Hash Table Animation

Show:

```text
Key
 ↓
Hash Function
 ↓
Bucket
```

Example:

```text
Key: 42

hash(42)
   ↓
Bucket 3
   ↓

[0] 
[1]
[2]
[3] → 42
[4]
```

For collisions:

```text
42 → Bucket 3
52 → Bucket 3
```

the collision resolution strategy should be visually visible.

---

# 59. Grid / Matrix Visualization

Grid cells should support:

```text
EMPTY
START
TARGET
VISITED
CURRENT
OBSTACLE
PATH
VALUE
```

For algorithms such as A* or Dynamic Programming, each cell can also show a value.

The grid should support zoom/pan when large.

---

# 60. Interactive Features — General Rule

Interaction should always have a visible consequence.

Examples:

```text
Hover
→ Reveal useful context.

Click
→ Select or activate.

Drag
→ Move or connect.

Keyboard
→ Control playback / navigation.

Zoom
→ Inspect large visualizations.

Edit
→ Change input.

Run
→ Start execution.
```

Avoid adding interactions that do not contribute to understanding.

---

# 61. Hover Interaction

Hover can reveal:

- Node details.
- Array index.
- Edge weight.
- Complexity explanation.
- Definition.
- Metric explanation.
- Code metadata.

Example:

```text
Hover node B

┌──────────────────┐
│ Node B           │
│ Distance: 4      │
│ Visited: Yes     │
│ Parent: A        │
└──────────────────┘
```

Tooltips should not be the only way to understand essential information.

---

# 62. Click Interaction

Click should have predictable semantics.

Examples:

```text
Click algorithm card
→ Open topic.

Click array cell
→ Select element if supported.

Click graph node
→ Select node.

Click edge
→ Edit / inspect edge.

Click challenge answer
→ Select answer.

Click code line
→ Optional explanation / step association.
```

---

# 63. Drag Interaction

Drag should be used where spatial manipulation is important.

Examples:

```text
Drag graph node
→ Move node.

Drag edge endpoint
→ Reconnect edge if supported.

Drag timeline
→ Change step.

Drag challenge item
→ Reorder.
```

Dragging should not accidentally trigger unrelated actions.

---

# 64. Selection Behavior

Selected items should remain clearly visible.

For example:

```text
Graph:
Selected Node A
Current Node B
Target Node D
```

These states should be distinct.

A user should not wonder whether a node is selected, currently processed, or simply hovered.

---

# 65. Zoom and Pan

Zoom/pan should be available for:

- Large graphs.
- Large trees.
- Large grids.
- Complex visualizations.

Conceptually:

```text
[+]
[-]
[Reset View]
```

Mouse / touch interactions:

```text
Wheel → Zoom
Drag canvas → Pan
Pinch → Zoom
Two-finger drag → Pan on touch devices
```

The controls should not change the underlying algorithm state.

---

# 66. Keyboard Controls

Recommended shortcuts:

```text
Space
→ Play / Pause

Arrow Right
→ Next step

Arrow Left
→ Previous step

R
→ Restart

+
→ Increase speed / zoom where context allows

-
→ Decrease speed / zoom where context allows

Esc
→ Close modal / exit focused overlay
```

Shortcuts should not interfere with text inputs.

---

# 67. Playback Timeline

Timeline should show position:

```text
Step 1 ────●──────────────── Step 20
           ↑
        Step 5
```

The current step should be obvious.

Dragging the timeline should jump to a step.

---

# 68. Timeline Semantics

Important events can optionally be marked:

```text
● Compare
● Swap
● Pivot
● Found
● Complete
```

This allows users to understand the execution history quickly.

---

# 69. Animation Principles

Animations should be:

- Purposeful.
- Predictable.
- Reversible where required.
- Interruptible.
- Consistent.
- Fast enough for normal use.
- Slow enough to understand during learning.

Animation should answer:

> What changed?

and ideally:

> Why did it change?

---

# 70. Animation Timing

Use a small motion scale.

Conceptually:

```text
Micro interaction
→ short

State transition
→ medium

Structural movement
→ longer

Major visualization change
→ longer but still controlled
```

Exact durations should be implemented as design tokens.

Do not create a different duration for every animation.

---

# 71. Animation Easing

Use consistent motion curves.

Conceptually:

```text
Entering
→ controlled ease-out

Moving between stable states
→ smooth standard transition

Leaving
→ controlled ease-in

Continuous playback
→ predictable linear progression where appropriate
```

Avoid exaggerated bounce or elastic motion for algorithm steps because it distracts from logic.

---

# 72. Animation Sequencing

For an operation with multiple conceptual stages:

```text
COMPARE
   ↓
DECISION
   ↓
ACTION
   ↓
NEW STATE
```

the animation should preserve that order.

Example:

```text
Highlight A + B
       ↓
Show comparison
       ↓
Show decision
       ↓
Move / swap
       ↓
Settle
       ↓
Update explanation
```

---

# 73. Animation Interruption

If the user clicks:

```text
Next
```

while an animation is playing, the interface should not become inconsistent.

Recommended behavior:

```text
Current animation
      ↓
Cancel current transition
      ↓
Resolve to requested state
      ↓
Render target step
```

The user should never see a half-swapped or half-moved state.

---

# 74. Previous-Step Animation

Going backward should communicate reversal where useful.

For example:

```text
Current:
[3][7][9]

Previous:
[7][3][9]
```

The movement can reverse naturally, but the final state must always be deterministic.

---

# 75. Reduced Motion

If reduced-motion preference is active:

```text
Complex movement
→ replaced by shorter state transition

Large travel animations
→ minimized

Essential state changes
→ communicated through instant transitions + semantic state
```

The user must still understand the algorithm.

---

# 76. Large Dataset Animation

Large inputs should not attempt hundreds or thousands of simultaneous moving objects.

For large inputs:

```text
Detailed mode
→ small / medium datasets

Compressed mode
→ larger datasets
```

Possible strategies:

- Reduce animation complexity.
- Show only relevant elements in detail.
- Aggregate metrics.
- Reduce simultaneous movement.
- Allow zooming.
- Offer step mode.

The educational message should remain intact.

---

# 77. Interactive Step Explanation

Every major visual operation should update:

```text
Current action
Explanation
Code reference
Metrics
```

At the same time.

Example:

```text
VISUAL:
7 and 3 highlighted

CURRENT ACTION:
COMPARE

EXPLANATION:
7 > 3, so they are out of order.

CODE:
if (a[j] > a[j+1])

METRICS:
Comparisons = 4
```

This synchronization is critical.

---

# 78. Code Highlight Interaction

The current algorithm operation should highlight the relevant code.

Example:

```text
1  for (...)
2      if (a[j] > a[j + 1]) ← CURRENT
3          swap(...)
```

When Swap executes:

```text
1  for (...)
2      if (...)
3          swap(...)        ← CURRENT
```

The highlight should move with the execution trace.

---

# 79. Pseudocode Interaction

Pseudocode can remain visible or be toggled.

Conceptually:

```text
[Code] [Pseudocode]
```

The current logical step should be highlighted in either representation.

---

# 80. Explanation Expansion

Long explanations should be expandable.

Example:

```text
WHY?

Short explanation...

[Read more]
```

Click:

```text
Full explanation
```

This prevents the main visualizer from becoming text-heavy.

---

# 81. Metrics Interaction

Metrics can provide additional explanation.

Example:

```text
Comparisons: 8
```

Hover / click:

```text
8 comparisons have occurred so far
in the current execution.
```

The UI should explain unfamiliar metrics.

---

# 82. Complexity Interaction

Complexity information can expand into a learning explanation.

Example:

```text
O(n²)
[Why?]
```

Click:

```text
For each pass, the algorithm may inspect
many remaining elements, causing the amount
of work to grow quadratically.
```

---

# 83. Challenge Visual Interaction

The challenge environment should reuse the same visual language.

If the challenge is:

```text
Predict next Bubble Sort step
```

the array visualization should look like the normal visualizer.

Only the interaction changes:

```text
Normal:
Watch the next step.

Challenge:
Predict the next step.
```

---

# 84. Wrong Answer Animation

Wrong answers should not cause aggressive or distracting effects.

Recommended:

```text
User choice
   ↓
Show incorrect state
   ↓
Highlight correct reasoning
   ↓
Explain
   ↓
Allow retry / continue
```

The goal is learning, not punishment.

---

# 85. Correct Answer Animation

Correct answer can provide:

```text
Immediate confirmation
Relevant state progression
Short feedback
```

Then:

```text
Continue
```

The user should not be forced into a long celebratory animation.

---

# 86. Graph Editing Interaction

Graph tools should have clear modes.

Example:

```text
SELECT
ADD NODE
ADD EDGE
DELETE
PAN
```

When a tool is active, the user should know what the next click does.

Example:

```text
ADD EDGE active

Step 1:
Select source node

Step 2:
Select target node
```

The interface should guide the operation.

---

# 87. Tree Editing Interaction

Tree controls should not require hidden logic.

Example:

```text
Value [50]

[Insert]
```

After Insert:

```text
Show search path
Show comparison
Show placement
```

The user should understand how the structure changed.

---

# 88. Tooltips

Tooltips should be used for:

- Less obvious controls.
- Metrics.
- Icon-only buttons.
- Advanced concepts.

Tooltips should remain short.

Example:

```text
Previous Step
Move to the previous execution state.
```

---

# 89. Modals

Use modals for:

```text
Confirm reset
Edit edge weight
Select visualization settings
Confirm deletion
```

Do not put the main explanation or algorithm itself into a modal.

---

# 90. Side Panels

Side panels can be used for:

```text
Explanation
Input
Metrics
Algorithm details
```

For desktop, they can remain visible.

For smaller screens, they can collapse.

---

# 91. Expandable Panels

Potential expandable sections:

```text
Code
Pseudocode
Complexity
Metrics
Algorithm details
```

The visualization should remain the primary focus when panels are collapsed.

---

# 92. Visual Completion State

When an algorithm completes:

```text
VISUALIZATION
      ↓
Final State
      ↓
Completion Summary
```

The final state should remain visible.

Do not immediately navigate away.

---

# 93. Completion Actions

After completion:

```text
[Replay]
[Try Challenge]
[Compare]
[Back to Topic]
```

These actions should lead directly to related destinations.

---

# 94. Empty Visualization State

Before execution, the visualizer should show:

```text
Input
Ready state

[PLAY]

Current:
Ready to begin
```

For graph editor:

```text
No graph yet

[Add Node]
[Generate Graph]
```

---

# 95. Error Visualization State

If execution cannot continue:

```text
Visualization paused

Reason:
Invalid graph

Action:
[Fix Graph]
```

The user should retain access to the problematic data.

---

# 96. Fullscreen Mode

Large visualizations should optionally support:

```text
[Fullscreen]
```

Fullscreen should expand the visualization while retaining:

```text
Algorithm name
Playback controls
Current state
Exit fullscreen
```

The user should not lose control.

---

# 97. Focus Mode

A future focus mode may hide secondary information:

```text
Visualization
+
Minimal controls
```

This is useful for:

- Presentations.
- Teaching.
- Small displays.
- Deep concentration.

The underlying state does not change.

---

# 98. Presentation Mode

A future presentation mode may show:

```text
Algorithm name
Visualization
Current step
Short explanation
```

without:

```text
Search
Sidebar
Extra metadata
```

This allows LogicLab to be used for teaching.

---

# 99. Responsive Structure

Responsive design should preserve the hierarchy.

Desktop:

```text
Sidebar
+
Visualization
+
Side panels
```

Tablet:

```text
Collapsed navigation
+
Large visualization
+
Stacked support panels
```

Mobile:

```text
Navigation
↓
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

---

# 100. Responsive Visualization Rules

Do not simply shrink a large visualization until it becomes unusable.

Instead:

```text
Large graph
→ allow zoom/pan

Large tree
→ allow zoom/pan

Large code
→ horizontal scrolling

Large metric table
→ responsive stacking
```

---

# 101. Touch Interaction

Touch interactions should support:

```text
Tap
Long press where necessary
Drag
Pinch zoom
Pan
```

For graph editing:

```text
Tap node
→ Select

Drag node
→ Move
```

Controls must have enough touch area to operate reliably.

---

# 102. Mobile Playback

Playback controls should remain easy to operate.

Core controls:

```text
Previous
Play/Pause
Next
Restart
```

Speed can open a compact menu.

---

# 103. Mobile Challenge Interaction

Challenge options should be easy to select.

For drag-based challenges, provide an alternative control when drag is impractical.

The challenge should never depend on a single interaction method if that method is unavailable on the device.

---

# 104. Large Graph Navigation

For very large graphs:

```text
Zoom
Pan
Fit to view
Center on current node
Center on target
```

The user should have a quick way to recover the full graph after panning.

---

# 105. Layering Rules

The interface should have a predictable layer hierarchy.

Conceptually:

```text
Base Content
     ↓
Visualization
     ↓
Floating Controls
     ↓
Tooltips
     ↓
Menus
     ↓
Modal
```

Tooltips should not disappear behind the visualization.

Modals should clearly sit above the rest of the application.

---

# 106. Interaction Feedback

Every user action should receive feedback when appropriate.

Examples:

```text
Favorite
→ icon/state changes

Save
→ confirmation

Invalid input
→ inline message

Node selected
→ state changes

Edge created
→ edge appears

Challenge answer
→ answer state changes
```

No action should appear to do nothing unless it intentionally has no immediate visible effect.

---

# 107. Sound and Haptics

For the initial LogicLab version:

```text
Sound:
Optional / off by default.

Haptics:
Only relevant for supported mobile devices
and should remain optional.
```

Neither should be required to understand the algorithm.

The project should work fully without audio feedback.

---

# 108. Motion Consistency

The same type of action should look similar across algorithms.

For example:

```text
COMPARE
→ highlight / focus

SWAP
→ exchange positions

VISIT
→ transition into visited state

INSERT
→ appear at destination

DELETE
→ leave structure

SELECT
→ persistent selection state
```

This creates a reusable motion language.

---

# 109. Semantic Motion

Motion should represent meaning.

Examples:

```text
Swap
→ object changes position.

Traversal
→ current focus moves along an edge.

Queue
→ item enters at one side and exits at the other.

Stack
→ item enters/exits from top.

Insertion
→ item becomes part of structure.

Deletion
→ item leaves and remaining structure reconnects.
```

Do not use random movement simply because movement looks impressive.

---

# 110. Transition Between Algorithm Steps

When moving from one step to another:

```text
Current State
     ↓
Identify changed elements
     ↓
Animate changed elements
     ↓
Settle into new state
     ↓
Update explanation
```

Unchanged elements should remain visually stable.

This helps users focus on what actually changed.

---

# 111. Animation of Unchanged Elements

Unchanged values/nodes should not move unnecessarily.

For example:

```text
[7][3][9][2][5]
      ↓
swap 7 and 3
```

Only the affected values should move.

The rest remain stable.

This increases comprehension.

---

# 112. Focus Preservation

The interface should maintain attention on:

```text
Current element
Current node
Current edge
Current code line
Current explanation
```

These should be synchronized.

Example:

```text
Array:
[7] [3]
 ↑   ↑

Code:
if (a[j] > a[j+1])
             ↑

Explanation:
Comparing 7 and 3.
```

All three representations refer to the same action.

---

# 113. Visual Relationship Between Panels

Panels should visually support one another.

Example:

```text
Visualization
     ↕
Explanation

Visualization
     ↕
Code

Visualization
     ↕
Metrics
```

When the current step changes, all dependent panels should update together.

---

# 114. Data-to-Visual Mapping

Each semantic state must map consistently to a visual state.

Example:

```text
Algorithm State:
currentNode = B

      ↓

Graph Visual:
Node B = CURRENT
```

Example:

```text
Algorithm State:
compareIndexes = [2,3]

      ↓

Array Visual:
Cells 2 and 3 = COMPARING
```

---

# 115. Visual State Priority

Some states may overlap.

A priority system is required.

Example conceptual priority:

```text
ERROR
   ↓
CURRENT / ACTIVE
   ↓
TARGET / PATH
   ↓
COMPARING
   ↓
VISITED / SORTED
   ↓
DEFAULT
```

The exact priority can vary by visualization, but one state must not accidentally hide a more important state.

---

# 116. Example — BFS State Priority

A node can be:

```text
visited
+
target
```

The visual system should make the target meaning remain identifiable.

If it is:

```text
current
+
target
```

the current state should be visible while preserving target semantics.

---

# 117. Example — Sorting State Priority

An element may be:

```text
sorted
+
currently selected
```

The selection state should be visually visible while the system still communicates that the element belongs to the sorted region.

---

# 118. Design for Beginner Mode

Beginner mode should show more context:

```text
Indexes
Labels
Current operation
Explanation
Code
Metrics
```

The interface should emphasize understanding rather than information density.

---

# 119. Advanced Mode

Advanced users may hide some supporting information.

Possible:

```text
Compact explanation
Reduced metadata
More visualization space
Faster controls
```

The core visualization remains unchanged.

---

# 120. Interactive Learning Principle

A user should be able to:

```text
WATCH
     ↓
PAUSE
     ↓
INSPECT
     ↓
PREDICT
     ↓
ACT
     ↓
UNDERSTAND
```

The visual design should support this loop.

---

# 121. Algorithm Animation Summary Table

| Algorithm / Topic | Main Visual Motion | Main User Attention |
|---|---|---|
| Bubble Sort | Neighbor movement / swap | Comparison + swap |
| Selection Sort | Minimum selection + swap | Minimum + sorted boundary |
| Insertion Sort | Shifting + insertion | Sorted region + current value |
| Merge Sort | Divide + merge | Sub-arrays + merge process |
| Quick Sort | Pivot + partition | Pivot + partition boundaries |
| Heap Sort | Heap ↔ array movement | Heap structure + extraction |
| Linear Search | Sequential focus | Current element |
| Binary Search | Range narrowing | Low / mid / high |
| BFS | Queue-driven traversal | Current node + queue |
| DFS | Depth + backtracking | Current path + stack |
| Dijkstra | Distance updates | Current node + shortest distances |
| A* | Grid exploration | Current node + f/g/h scores |
| BST Search | Path traversal | Comparison path |
| BST Insert | Path + insertion | Correct placement |
| BST Delete | Structural replacement | Removed/reconnected nodes |
| Stack | Push / pop at top | TOP |
| Queue | Enqueue / dequeue | FRONT / REAR |
| Linked List | Pointer movement | Links / connections |
| Hash Table | Hash → bucket | Key + bucket |
| DP | Cell-by-cell computation | Current state + dependency |
| Tree Traversal | Node focus movement | Traversal order |

---

# 122. Visual Design for Algorithm Properties

Properties should have consistent placement.

Example:

```text
Bubble Sort

Stable
In-place
Beginner

Best: O(n)
Average: O(n²)
Worst: O(n²)
Space: O(1)
```

The user should not need to search through the page for these basic facts.

---

# 123. Complexity Visualization

Complexity should be visually understandable.

Example:

```text
Operations
│
│                         O(n²)
│                      /
│                   /
│                /
│             /
│          /
│       /
│    /
│___/________________________ Input
```

When comparing algorithms:

```text
O(n)
O(log n)
O(n log n)
O(n²)
```

The visual should focus on relative growth.

---

# 124. Algorithm Comparison Animation

When comparing algorithms, each algorithm can execute side by side.

Example:

```text
┌──────────────┬──────────────┬──────────────┐
│ Bubble Sort  │ Merge Sort   │ Quick Sort   │
│              │              │              │
│ [7][3][9]    │ [7][3|9]    │ [pivot=5]   │
│              │              │              │
│ Step 4       │ Step 4       │ Step 4       │
└──────────────┴──────────────┴──────────────┘
```

All visualizations should use the same input.

---

# 125. Animation Speed Controls

Speed should affect playback, not algorithm correctness.

Conceptually:

```text
0.25x
0.5x
1x
2x
4x
```

At very high speed, intermediate details can be condensed if necessary.

At slower speeds, the system can emphasize individual operations.

---

# 126. Manual Step Mode

When the user selects manual step mode:

```text
Auto playback OFF

[Previous] [Next]
```

The interface becomes a controlled teaching tool.

This is especially useful for:

- Beginners.
- Presentations.
- Interviews.
- Deep inspection.

---

# 127. Continuous Play Mode

Play mode should automatically progress through steps.

During play:

```text
Current Step
    ↓
Wait animation duration
    ↓
Next Step
    ↓
Repeat
```

Pause should stop future progression cleanly.

---

# 128. Completion Animation

Completion should be subtle and meaningful.

Recommended:

```text
Final state
   ↓
Stable completion state
   ↓
Short success confirmation
```

Avoid distracting celebration effects that make it difficult to inspect the result.

---

# 129. Challenge Completion Animation

Similar:

```text
Result
 ↓
Score
 ↓
Short confirmation
 ↓
Next action
```

The score and learning feedback should remain the focus.

---

# 130. Error Animation

Errors should use restrained feedback.

Example:

```text
Invalid input
```

Possible:

```text
Input area receives short attention movement
      +
Error message appears
```

Avoid violent shaking or excessive motion.

---

# 131. Hover Motion

Hover effects should be subtle.

Examples:

```text
Card
→ slight visual elevation / state change

Button
→ state transition

Node
→ contextual information
```

Hover should not cause the page to jump or change layout unexpectedly.

---

# 132. Click Motion

Click should produce immediate feedback.

Examples:

```text
Button pressed
Node selected
Filter activated
Panel opened
```

The user should immediately know the action was registered.

---

# 133. Expand / Collapse Motion

Expandable panels should have short controlled transitions.

Example:

```text
EXPLANATION
[collapsed]
    ↓
click
    ↓
[expanded]
```

The content should not suddenly appear in a way that displaces the user unexpectedly.

---

# 134. Menu Motion

Dropdowns / menus should open near the initiating control.

They should not move the surrounding layout unnecessarily.

---

# 135. Tooltip Motion

Tooltips should appear quickly but not instantly enough to flicker from accidental pointer movement.

They should disappear when the triggering element is no longer relevant.

---

# 136. Focus / Selection Persistence

The selected item should remain identifiable until:

```text
New selection
Reset
Step changes state
Operation completes
```

The interface should not randomly remove focus.

---

# 137. Visual State Legend

Complex visualizers should provide a compact legend.

Example:

```text
● Current
● Visited
● Target
● Path
● Unvisited
```

This can be collapsed when the meaning is already obvious.

---

# 138. Educational Labels

Labels should use simple words.

Prefer:

```text
Compare
Swap
Current
Visited
Target
Path
Queue
Stack
Pivot
```

Avoid unnecessary technical jargon.

When technical terms are necessary, add explanation.

---

# 139. Visual Text Density

The interface should avoid putting too much text beside a visualization.

Preferred:

```text
Short current explanation
+
Expandable deeper explanation
```

The visualizer should remain visually dominant.

---

# 140. Code Density

Code should show only what is relevant.

The current line should be prominent.

The user should be able to:

```text
Scroll
Change language
Expand
Collapse
```

The full source should remain accessible without overpowering the visualization.

---

# 141. Input Visualization

When users create data manually, the input itself should feel connected to the visualization.

Example:

```text
Input:
[7, 3, 9, 2, 5]

      ↓

Visualization:
[7][3][9][2][5]
```

After editing:

```text
Input:
[7, 3, 1, 2, 5]

      ↓

Visualization immediately reflects
the new input after Apply.
```

---

# 142. Graph Editor Visual Language

Graph editing should clearly distinguish:

```text
Tool mode
Selected node
Selected edge
Start node
Target node
Newly created item
```

Example:

```text
Mode:
ADD EDGE

A ●────────● B
  ↑        ↑
source    target
```

The UI should tell the user what to do next.

---

# 143. Tree Editor Visual Language

For an insert operation:

```text
INSERT 65

50
 ↓ compare
70
 ↓ compare
60
 ↓ insert

Result:
       50
         \
          70
         /
        60
          \
           65
```

The path and result should remain clear.

---

# 144. Visualizing Recursive Algorithms

Recursive algorithms need extra care.

The UI should be able to show:

```text
Call
  ↓
Subproblem
  ↓
Return
```

For Merge Sort:

```text
sort([7,3,9,2])
    ↓
sort([7,3]) + sort([9,2])
    ↓
...
```

A future recursion panel can show active call depth.

---

# 145. Recursive Call Stack

For recursive visualizations, optionally show:

```text
Call Stack

sort([7,3,9,2])
sort([7,3])
sort([7])
```

When returning:

```text
return [7]
```

This can significantly improve understanding of recursion.

---

# 146. Dynamic Programming Visualization

DP should emphasize the table and dependency relationship.

Example:

```text
      0  1  2  3
   ┌──────────────┐
 0 │ 0  0  0  0   │
 1 │ 0  1  1  1   │
 2 │ 0  1  2  2   │
   └──────────────┘
```

Current cell:

```text
      ↓
     [2]
```

Dependencies can be highlighted.

---

# 147. Formula Animation

When a cell is calculated:

```text
Current cell = previous value + current contribution
```

The relevant input cells can be highlighted before the result appears.

This allows users to see:

```text
Inputs
  ↓
Formula
  ↓
Output
```

---

# 148. Interactive Experiment Mode

A future mode can allow users to alter parameters while learning.

Examples:

```text
Graph density
Array size
Target value
Edge weight
Tree input
```

Changing the parameter should regenerate execution deterministically where possible.

---

# 149. Visual Comparison of Complexity

Users should be able to switch:

```text
Steps
Comparisons
Swaps
Theoretical Complexity
Runtime
```

The comparison view should explain which measurement is being viewed.

---

# 150. Consistency Across All Algorithms

The same operations should use the same visual vocabulary.

For example:

```text
Compare
→ same semantic state across sorting/searching

Visit
→ same semantic state across graph/tree traversal

Insert
→ same semantic concept across data structures
```

The exact shape can differ by structure, but the meaning remains consistent.

---

# 151. Design Tokens

The visual implementation should centralize:

```text
Colors
Typography
Spacing
Radius
Elevation
Motion
Breakpoints
Control sizes
```

This allows global adjustments without rewriting individual components.

---

# 152. Component-Level Visual Rules

Reusable components should define their own internal states.

Example:

```text
Button
├── default
├── hover
├── active
├── focus
├── disabled
├── loading
└── success/error variants
```

Example:

```text
Card
├── default
├── hover
├── selected
└── disabled
```

---

# 153. Design Consistency Rule

A component should look and behave the same wherever it appears unless there is a documented reason for a variation.

For example:

```text
Primary Run button
```

should not behave one way on Bubble Sort and another way on BFS.

---

# 154. Animation Consistency Rule

A similar action should have a similar motion.

```text
Node visit
→ focus + state change

Array comparison
→ focus + state change

Tree comparison
→ focus + state change
```

The exact geometry changes by visualization, but the motion language remains recognizable.

---

# 155. Accessibility Rules

The visual specification should ensure:

- State is not communicated through color alone.
- Focus is visible.
- Controls have clear labels.
- Text remains readable.
- Interactive areas are large enough.
- Motion can be reduced.
- Important explanations do not depend on animation.
- Keyboard controls can operate major interactions.
- Graph/tree state has semantic representation.

---

# 156. Contrast

Text and essential state indicators must have sufficient contrast against their background.

Particular attention should be given to:

```text
Muted text
Disabled states
Visualization labels
Code comments
Graph edge labels
Small metrics
```

Do not sacrifice readability for subtle visual styling.

---

# 157. Motion Accessibility

When reduced motion is requested:

```text
Swap animation
→ instant state change or very short transition

Graph traversal
→ state changes without long movement

Tree rotation
→ simplified transition

Page transitions
→ minimal movement
```

The conceptual sequence should remain understandable.

---

# 158. Performance Guidelines

Visualization performance should remain smooth.

Avoid:

```text
Unnecessary DOM movement
Large numbers of simultaneous animations
Repeated full-page rendering
Rendering every historical state at once
```

Prefer:

```text
Only current state rendered in detail
Only changed elements animated
Reusable visualization components
Efficient state updates
```

---

# 159. Performance for Large Arrays

For very large arrays:

```text
Normal:
100 elements → detailed

Large:
1000+ elements → compressed

Very large:
10,000+ elements → statistical / simplified mode
```

The exact thresholds can be decided during testing.

---

# 160. Performance for Large Graphs

For large graphs:

```text
Reduce label density
Allow zoom/pan
Focus on current neighborhood
Use progressive rendering
```

The user's current operation should remain clearly visible.

---

# 161. Performance for Large Trees

For large trees:

```text
Allow zoom
Allow pan
Center on current node
Collapse unrelated branches where appropriate
```

The underlying tree structure remains intact.

---

# 162. Visual Debug Mode

A future developer/debug mode can optionally show:

```text
Current Step ID
Action
State ID
Algorithm ID
Execution timing
```

This mode should not be required for normal users.

---

# 163. Developer Visualization Mode

For development, a temporary overlay can show:

```text
Event:
SWAP

Indexes:
1 → 2

Step:
8 / 24

Renderer:
ArrayVisualizer
```

This can help verify that the visualizer matches the execution engine.

---

# 164. Visual QA Requirements

Before declaring a visualization complete, verify:

```text
Initial state correct
Current state correct
Every major operation visible
Animation ends in correct state
Previous step works
Next step works
Play works
Pause works
Restart works
Code highlight matches
Explanation matches
Metrics match
Final result correct
```

---

# 165. Algorithm-Specific Visual QA

For every algorithm:

```text
Normal input
Edge case
Custom input
Random input
Fast playback
Slow playback
Manual step mode
Previous-step navigation
Completion
Reset
```

must be tested.

---

# 166. Visual Consistency Checklist

Every new feature should be checked against:

```text
Typography
Spacing
Color semantics
Component states
Interaction semantics
Motion
Accessibility
Responsive behavior
```

---

# 167. What the User Should Feel

The intended experience is:

```text
"I can see what is happening."

"I know why it is happening."

"I can control the execution."

"I can inspect the code."

"I can experiment with my own input."

"I can predict what comes next."

"I can compare another algorithm."

"I understand the concept better after interacting with it."
```

That is the target experience.

---

# 168. Example — Complete Bubble Sort Visual State

```text
┌────────────────────────────────────────────────────────────┐
│ BUBBLE SORT                                                 │
│ Step 4 / 18                                                 │
├────────────────────────────────────────────────────────────┤
│                                                            │
│  ARRAY                                                     │
│                                                            │
│   0     1     2     3     4                               │
│ ┌────┬────┬────┬────┬────┐                                │
│ │  3 │  7 │  9 │  2 │  5 │                                │
│ └────┴────┴────┴────┴────┘                                │
│        ↑     ↑                                             │
│      COMPARE                                               │
│                                                            │
├────────────────────────────────────────────────────────────┤
│ ACTION: COMPARE                                            │
│                                                            │
│ We are comparing 7 and 9.                                  │
│ They are already in the correct order.                     │
│                                                            │
├────────────────────────────────────────────────────────────┤
│ CODE                                                       │
│                                                            │
│ if (a[j] > a[j + 1])                                       │
│     ↑ current condition                                    │
│                                                            │
├────────────────────────────────────────────────────────────┤
│ Comparisons: 4     Swaps: 1     Steps: 4                   │
├────────────────────────────────────────────────────────────┤
│ [Previous] [Pause] [Next] [Restart]        1x              │
└────────────────────────────────────────────────────────────┘
```

This demonstrates the desired relationship between:

```text
Visualization
Action
Explanation
Code
Metrics
Playback
```

---

# 169. Example — BFS Visual State

```text
┌────────────────────────────────────────────────────────────┐
│ BFS                                                        │
├────────────────────────────────────────────────────────────┤
│                                                            │
│              A                                             │
│             / \                                            │
│            B   C                                           │
│            |    \                                          │
│            D     E                                         │
│                                                            │
│ Current: B                                                 │
│ Visited: A, B                                              │
│ Queue: C, D                                                │
│                                                            │
├────────────────────────────────────────────────────────────┤
│ WHY?                                                       │
│                                                            │
│ BFS processes nodes in queue order.                        │
│ C was discovered from A and remains in the queue.          │
│ D was then added while processing B.                       │
│                                                            │
├────────────────────────────────────────────────────────────┤
│ [Previous] [Pause] [Next] [Restart]                        │
└────────────────────────────────────────────────────────────┘
```

The graph state and queue state should tell the same story.

---

# 170. Example — Tree Rotation Visual State

```text
BEFORE

       30
      /
    20
    /
   10


ROTATE

10
 ↑
20
 ↑
30


AFTER

       20
      /  \
    10    30
```

The user should see the structural transformation rather than only the final tree.

---

# 171. Example — User Interaction Loop

```text
User selects algorithm
        ↓
Input appears
        ↓
User edits input
        ↓
User presses RUN
        ↓
Execution starts at Step 0
        ↓
User presses NEXT
        ↓
Current operation highlighted
        ↓
Explanation updates
        ↓
Code line updates
        ↓
Metrics update
        ↓
User presses NEXT again
        ↓
Repeat
```

---

# 172. Example — Challenge Interaction Loop

```text
Question appears
       ↓
Visualization paused
       ↓
User predicts next step
       ↓
User submits
       ↓
Validation
   ┌───┴────┐
   ↓        ↓
Correct   Incorrect
   ↓        ↓
Feedback  Explanation
   └───┬────┘
       ↓
Continue
```

---

# 173. Final Visual Design Rules

The following rules are mandatory design principles for LogicLab:

```text
1. Visualization is the primary focus during algorithm execution.

2. Current state must always be obvious.

3. Current action must always be explainable.

4. Code, pseudocode, explanation, metrics, and visualization
   must refer to the same execution step.

5. Motion must communicate algorithmic meaning.

6. Similar operations should use similar visual language.

7. Color should never be the only indicator of important state.

8. User actions must receive clear feedback.

9. Animations must never leave the interface in an inconsistent state.

10. Previous and Next must always resolve to deterministic states.

11. Large visualizations must support appropriate navigation.

12. Mobile users must retain the core functionality.

13. Reduced-motion users must receive the same information without
    depending on long animations.

14. Typography must remain consistent.

15. Inter is the primary product/UI font.

16. JetBrains Mono is reserved for code and technical content.

17. Visual decoration must never compete with the algorithm.

18. New algorithms must follow the same visual and motion language.

19. Visualization must explain the algorithm rather than merely
    making the interface look dynamic.

20. Every interaction should help the user understand something.
```

---

# 174. Final Visual Model

LogicLab should visually communicate:

```text
                 USER
                  │
                  ▼
             CHOOSE TOPIC
                  │
                  ▼
             PROVIDE INPUT
                  │
                  ▼
              RUN LOGIC
                  │
                  ▼
             ┌───────────┐
             │ CURRENT   │
             │   STATE   │
             └─────┬─────┘
                   │
        ┌──────────┼──────────┐
        ▼          ▼          ▼
   VISUAL        CODE      EXPLANATION
        │          │          │
        └──────────┼──────────┘
                   ▼
                METRICS
                   │
                   ▼
                RESULT
                   │
          ┌────────┴────────┐
          ▼                 ▼
       PRACTICE          COMPARE
          │                 │
          └────────┬────────┘
                   ▼
                 LEARN
```

The visual design exists to make this loop intuitive.

---

# 175. Final Principle

LogicLab should not simply **animate algorithms**.

It should **visualize reasoning**.

A good animation shows:

```text
Something moved.
```

A LogicLab animation should show:

```text
Something moved
because of this decision,
which came from this logic,
which changed this state,
and produced this result.
```

That is the visual and interaction identity of LogicLab.
