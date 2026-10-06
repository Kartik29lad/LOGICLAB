# LogicLab — System Architecture & Technical Structure

## 1. Purpose of This Document

This document defines the complete internal architecture of **LogicLab**.

The first project document defines **what data and content LogicLab contains**.

This document defines **how all of those pieces work together**.

It should be possible for a developer to read this document and understand:

- How the application is divided into layers.
- What responsibility belongs to each layer.
- How an algorithm is represented internally.
- How an algorithm executes.
- How execution becomes step-by-step visualization data.
- How visualization state reaches the UI.
- How user input enters the system.
- How challenges reuse algorithm execution.
- How algorithm comparisons work.
- How learning progress is stored.
- How new algorithms and data structures are added.
- Which parts must remain independent.
- Which parts can be reused.
- Which parts must never be tightly coupled.

This document is an architectural blueprint, not an implementation of the application.

---

# 2. Core Architectural Philosophy

LogicLab should be built around one central rule:

> **The algorithm should know how to solve a problem, while the UI should know how to display what the algorithm is doing.**

The algorithm must not directly manipulate UI elements.

The visualization must not contain algorithm-specific business logic.

The challenge system must not implement a second copy of the algorithm.

The content system must not be tightly connected to visual components.

The project should follow this general flow:

```text
User
  ↓
UI
  ↓
Application State
  ↓
Controller / Orchestrator
  ↓
Algorithm Engine
  ↓
Execution Steps
  ↓
Visualization State
  ↓
Visualization Renderer
  ↓
UI
```

For educational explanations, the flow also connects:

```text
Execution Step
   ↓
Step Metadata
   ├── Explanation
   ├── Code Reference
   ├── Pseudocode Reference
   ├── Metrics
   └── Action
```

---

# 3. High-Level Architecture

The application should conceptually be divided into the following layers:

```text
┌──────────────────────────────────────────────────────────────┐
│                         PRESENTATION                         │
│                                                              │
│ Home / Explorer / Visualizer / Challenges / Progress         │
│ Visualization Components / Controls / Panels                 │
└──────────────────────────────┬───────────────────────────────┘
                               │
                               ↓
┌──────────────────────────────────────────────────────────────┐
│                     APPLICATION STATE                        │
│                                                              │
│ Selected Topic / Input / Playback / Challenge / Progress     │
└──────────────────────────────┬───────────────────────────────┘
                               │
                               ↓
┌──────────────────────────────────────────────────────────────┐
│                     APPLICATION SERVICES                     │
│                                                              │
│ Visualization Controller                                     │
│ Playback Controller                                          │
│ Challenge Controller                                         │
│ Comparison Controller                                        │
│ Input Controller                                             │
│ Progress Controller                                          │
└──────────────────────────────┬───────────────────────────────┘
                               │
                               ↓
┌──────────────────────────────────────────────────────────────┐
│                       ALGORITHM ENGINE                        │
│                                                              │
│ Sorting / Searching / Graph / Tree / Data Structure / DP     │
│ Execution / State Transition / Metrics / Events             │
└──────────────────────────────┬───────────────────────────────┘
                               │
              ┌────────────────┴────────────────┐
              ↓                                 ↓
┌──────────────────────────────┐   ┌───────────────────────────┐
│        CONTENT LAYER         │   │      INPUT GENERATORS      │
│                              │   │                           │
│ Metadata                     │   │ Random Inputs              │
│ Explanations                 │   │ Example Inputs             │
│ Code                         │   │ User Inputs                │
│ Pseudocode                   │   │ Graph Generators            │
│ Complexity                   │   │ Tree Generators             │
│ Challenges                   │   │ Array Generators            │
└──────────────────────────────┘   └───────────────────────────┘

                               ↓
┌──────────────────────────────────────────────────────────────┐
│                    PERSISTENCE / STORAGE                      │
│                                                              │
│ Local Progress / History / Favorites / Settings              │
└──────────────────────────────────────────────────────────────┘
```

This is a logical architecture. The exact framework or library implementation can change later without changing the underlying responsibilities.

---

# 4. Main Architectural Layers

## 4.1 Presentation Layer

The presentation layer is responsible for displaying the application.

It should contain:

- Pages.
- Layouts.
- Navigation.
- Algorithm cards.
- Category cards.
- Visualization areas.
- Data structure visualizers.
- Control bars.
- Code panels.
- Explanation panels.
- Complexity panels.
- Metrics panels.
- Challenge interfaces.
- Comparison interfaces.
- Progress views.
- History views.
- User input controls.

The presentation layer should not contain the actual algorithm implementation.

For example, a Bubble Sort visualizer should not contain:

```text
for (...)
    if (...)
        swap(...)
```

The visualizer should receive execution state and display it.

---

# 5. Frontend Application Structure

The frontend should conceptually contain these major areas:

```text
Application Shell
│
├── Home
│
├── Explorer
│   ├── Categories
│   ├── Algorithms
│   ├── Data Structures
│   └── Search
│
├── Visualizer
│   ├── Visualization Canvas
│   ├── Playback Controls
│   ├── Input Controls
│   ├── Explanation Panel
│   ├── Code Panel
│   ├── Metrics Panel
│   └── Complexity Panel
│
├── Challenges
│   ├── Challenge List
│   ├── Challenge Player
│   └── Results
│
├── Compare
│
├── Progress
│
└── Settings
```

These areas should consume services and state rather than implement algorithm logic themselves.

---

# 6. Visualization Architecture

Visualization should be treated as its own system.

The visualization engine receives a normalized execution state and renders it appropriately.

Conceptually:

```text
Algorithm Step
      ↓
Normalized Visualization State
      ↓
Visualization Type
      ↓
Renderer
      ↓
Screen
```

For example:

```text
Sorting State
      ↓
Array Renderer
```

```text
Graph State
      ↓
Graph Renderer
```

```text
Tree State
      ↓
Tree Renderer
```

The renderer should not need to understand the complete algorithm.

It should only understand the current visual state.

---

# 7. Visualization Types

The architecture should support reusable visualization types.

Possible visualization types:

```text
ARRAY
GRAPH
TREE
STACK
QUEUE
LINKED_LIST
HASH_TABLE
GRID
MATRIX
TEXT
CODE
CHART
COMPARISON
```

Each visualization type should have a common interface or expected state contract.

For example:

```text
Array Renderer
Input:
  values
  activeIndexes
  sortedIndexes
  highlightedIndexes
  labels
```

The exact visual appearance can change without changing the algorithm.

---

# 8. Algorithm Engine

The algorithm engine is the core computational layer.

It contains the actual logic for:

- Sorting algorithms.
- Searching algorithms.
- Graph algorithms.
- Tree algorithms.
- Data structure operations.
- Dynamic programming algorithms.
- Future algorithm categories.

The algorithm engine should produce data rather than render UI.

---

# 9. Algorithm Interface

Every algorithm should conceptually follow a common contract.

Example:

```text
Algorithm
├── metadata
├── validateInput()
├── initialize()
├── execute()
├── getSteps()
├── getResult()
└── getMetrics()
```

The exact implementation can differ, but the application should treat algorithms consistently.

A generic interface might conceptually be:

```text
AlgorithmDefinition
    id
    metadata
    inputSchema
    execute(input)
    result
    steps
    metrics
```

The purpose is to make the visualizer independent from individual algorithms.

---

# 10. Algorithm Execution Model

LogicLab should not rely only on a final algorithm result.

The engine should produce an **execution trace**.

For example:

```text
Input
[7, 3, 9]

Execution
    ↓
Step 1
COMPARE 7, 3
    ↓
Step 2
SWAP 7, 3
    ↓
Step 3
COMPARE 7, 9
    ↓
Step 4
NO_SWAP
    ↓
Final State
[3, 7, 9]
```

The execution trace is the foundation of the visualization.

---

# 11. Execution Step Model

Each step should conceptually contain:

```text
stepId
stepIndex
action
state
explanation
codeReference
pseudocodeReference
metrics
```

A conceptual example:

```text
{
    stepIndex: 4,
    action: "COMPARE",
    state: {
        values: [3, 7, 9],
        activeIndexes: [1, 2]
    },
    explanation: "Compare 7 and 9.",
    codeReference: "bubble-sort.compare",
    pseudocodeReference: "compare-neighbours",
    metrics: {
        comparisons: 3,
        swaps: 1
    }
}
```

This should be considered a logical model, not a mandatory code structure.

---

# 12. State-Transition Architecture

The algorithm execution should be viewed as a sequence of state transitions.

```text
State 0
   │
   │ action
   ↓
State 1
   │
   │ action
   ↓
State 2
   │
   │ action
   ↓
State 3
```

Each transition should describe:

```text
Previous State
+
Action
+
New State
```

This is important because:

- Previous Step can be shown.
- Next Step can be shown.
- Playback can pause.
- Playback can resume.
- The user can move backward.
- Challenges can ask what happens next.
- Explanations can be tied to a specific operation.
- Metrics can be updated at each step.

---

# 13. Snapshot vs Event Architecture

The architecture should support a clear distinction between:

## Event

What happened?

Examples:

```text
COMPARE
SWAP
VISIT
INSERT
DELETE
RELAX
PUSH
POP
```

## State

What does the data look like now?

Examples:

```text
Current array
Current graph state
Current tree
Current queue
Current stack
Visited nodes
Distances
```

The preferred model is:

```text
Event
  +
New State
  +
Explanation
```

This keeps visualization deterministic.

The project may optimize storage later by storing smaller event deltas instead of full snapshots, but the public execution contract should remain predictable.

---

# 14. Playback Architecture

The playback controller manages:

```text
Play
Pause
Next
Previous
Restart
Speed
Complete
```

The playback controller should not calculate the algorithm.

It should consume the execution trace.

Conceptually:

```text
Execution Trace
      ↓
Playback Controller
      ↓
Current Step Index
      ↓
Current Step
      ↓
Visualization
```

---

# 15. Playback State

Playback state should include:

```text
status
currentStep
totalSteps
speed
direction
```

Possible status values:

```text
IDLE
READY
PLAYING
PAUSED
COMPLETED
ERROR
```

The playback controller is responsible for moving through the execution trace.

---

# 16. Previous-Step Requirement

Previous-step support should not require rerunning the algorithm every time.

The system should have enough execution information to reconstruct the previous state.

Preferred approach:

```text
Execution Trace
    ↓
Step 0
Step 1
Step 2
Step 3
...
```

Moving backward changes the current step index.

The same execution data is reused.

---

# 17. Input Architecture

Input is a separate concern from algorithm execution.

LogicLab should support:

```text
Predefined Input
Random Input
Custom User Input
Generated Graph
Generated Tree
Challenge Input
```

All input sources should eventually produce a normalized input structure accepted by the algorithm.

---

# 18. Input Normalization

Different UI sources should be converted into a predictable format.

Example:

```text
User enters:
"7, 3, 9, 2, 5"

        ↓

Input Parser

        ↓

Normalized:
[7, 3, 9, 2, 5]

        ↓

Algorithm Engine
```

This prevents individual algorithms from needing to understand UI input formats.

---

# 19. Input Validation

Input validation belongs outside the core algorithm whenever possible.

It should verify:

- Required values exist.
- Values have valid types.
- Values are within allowed ranges.
- Graph relationships are valid.
- Tree input is valid.
- Required start node exists.
- Required target node exists.
- Algorithm-specific constraints are satisfied.

The algorithm engine should receive validated data.

---

# 20. Random Input Generator Architecture

Random generation should be independent from the algorithms.

For example:

```text
Array Generator
Graph Generator
Tree Generator
Matrix Generator
String Generator
```

A generator should support parameters such as:

```text
size
minimum
maximum
duplicates
distribution
sorted
reverseSorted
density
weighted
directed
```

The algorithm should only receive the resulting input.

---

# 21. Content Architecture

The content layer contains educational information.

It should include:

```text
Algorithm Metadata
Descriptions
Examples
Pseudocode
Code
Complexity
Properties
Explanations
Challenges
Hints
Related Topics
Learning Paths
```

The content layer should not control visualization rendering.

---

# 22. Content vs Execution

This distinction is important.

## Content says:

```text
Bubble Sort compares neighboring values.
```

## Execution says:

```text
Step 8:
Compare indexes 2 and 3.
```

## Visualization says:

```text
Highlight array cells 2 and 3.
```

These three concerns should remain separate.

---

# 23. Algorithm Registry

LogicLab should have a central registry that tells the application what algorithms exist.

Conceptually:

```text
Algorithm Registry
│
├── sorting.bubble-sort
├── sorting.selection-sort
├── sorting.insertion-sort
├── searching.binary-search
├── graph.bfs
├── graph.dfs
├── graph.dijkstra
└── tree.bst
```

The registry should provide access to:

- Metadata.
- Algorithm implementation.
- Visualization type.
- Content.
- Input requirements.
- Challenge support.
- Complexity information.

The registry prevents the application from hardcoding algorithm lists throughout many different UI components.

---

# 24. Category Registry

Categories should also be centrally defined.

Example:

```text
Sorting
Searching
Graphs
Trees
Data Structures
Dynamic Programming
```

A category should contain:

```text
id
name
description
icon / visual identifier
algorithm IDs
data structure IDs
learning order
```

---

# 25. Visualization Registry

Visualizers should also be reusable.

Example:

```text
ARRAY → ArrayVisualizer
GRAPH → GraphVisualizer
TREE → TreeVisualizer
STACK → StackVisualizer
QUEUE → QueueVisualizer
LINKED_LIST → LinkedListVisualizer
```

The selected algorithm determines which renderer should be used.

Conceptually:

```text
Algorithm Metadata
      ↓
visualizationType
      ↓
Visualization Registry
      ↓
Correct Renderer
```

---

# 26. Relationship Between Algorithm and Visualizer

There should be no direct dependency like:

```text
BubbleSort → BubbleSortComponent
```

Prefer:

```text
BubbleSort
    ↓
execution state
    ↓
visualizationType = ARRAY
    ↓
ArrayVisualizer
```

This means another sorting algorithm can reuse the same array visualizer.

---

# 27. Explanation Architecture

Explanations should be connected to execution steps.

The explanation system should support:

```text
Concept Explanation
Algorithm Explanation
Step Explanation
Result Explanation
Error Explanation
Challenge Feedback
```

Step explanations should preferably be data-driven.

Example:

```text
Action:
SWAP

Explanation Template:
"Swap {leftValue} and {rightValue} because they are in the wrong order."
```

At runtime:

```text
"Swap 7 and 3 because they are in the wrong order."
```

---

# 28. Code Mapping Architecture

Code should have a stable relationship to execution actions.

Conceptually:

```text
Algorithm
   ↓
Code Definition
   ↓
Code Blocks / Lines
   ↓
Execution Action
```

A visualization step may reference:

```text
codeBlockId = "compare"
```

or:

```text
lineRange = 8-9
```

The UI then highlights the correct code.

This keeps code rendering independent from algorithm execution.

---

# 29. Pseudocode Mapping

Pseudocode should use the same concept.

Example:

```text
Step:
COMPARE

Pseudocode block:
"Compare neighboring elements."
```

The current step can highlight:

```text
COMPARE A[i] WITH A[i+1]
```

This creates the educational connection:

```text
Logic
 ↓
Pseudocode
 ↓
Code
 ↓
Visualization
```

---

# 30. Metrics Architecture

Metrics should be generated by the execution engine or a dedicated metrics layer.

Examples:

```text
Comparisons
Swaps
Reads
Writes
Visited Nodes
Edges Examined
Queue Operations
Stack Operations
Rotations
Relaxations
```

Metrics should be updated as execution progresses.

The UI should only display the metrics.

---

# 31. Metrics Responsibility

Algorithm logic should emit enough information for metrics to be calculated.

The visualization should not count UI animations to determine algorithm complexity.

For example:

```text
Wrong:
UI sees two blocks move → assumes swap count +1

Correct:
Algorithm emits SWAP event → metrics count +1
```

This ensures metrics remain accurate even if the animation style changes.

---

# 32. Result Architecture

Every execution should produce a final result.

The result should be separate from the execution trace.

Conceptually:

```text
Execution
├── steps
├── metrics
└── result
```

Example:

```text
steps:
[...]

metrics:
{
    comparisons: 10,
    swaps: 6
}

result:
{
    sortedValues: [...]
}
```

The final result can then be displayed in:

- Completion summary.
- Challenge validation.
- Comparison reports.
- Learning history.

---

# 33. Challenge Architecture

Challenges must reuse the existing algorithm engine.

The challenge system should not implement another version of BFS, DFS, Bubble Sort, etc.

Instead:

```text
Algorithm Definition
       ↓
Execution Engine
       ↓
Execution Trace
       ↓
Challenge Controller
```

A challenge can choose a particular point in the execution and ask the user to predict or reproduce what happens.

---

# 34. Challenge Types

The architecture should support multiple challenge types:

```text
Multiple Choice
Next Step Prediction
Output Prediction
Traversal Construction
Path Finding
Complexity Selection
Code Completion
Operation Identification
Ordering Challenge
Interactive Graph Challenge
Tree Construction
```

---

# 35. Challenge Validation

Challenge answers should be validated against deterministic algorithm information whenever possible.

For example:

```text
Expected next event:
SWAP

User answer:
SWAP

Result:
Correct
```

The challenge should then retrieve an explanation associated with the expected event.

---

# 36. Challenge Feedback Flow

Conceptually:

```text
User Answer
    ↓
Challenge Validator
    ↓
Correct / Incorrect
    ↓
Feedback Generator
    ↓
Explanation
```

For incorrect answers:

```text
Your answer
Correct answer
Why
Relevant concept
Optional hint
```

---

# 37. Comparison Architecture

Comparison should use the same execution engine for every algorithm.

Example:

```text
Input
 ↓
Bubble Sort Engine
 ↓
Metrics

Input
 ↓
Merge Sort Engine
 ↓
Metrics

Input
 ↓
Quick Sort Engine
 ↓
Metrics
```

Then:

```text
Comparison Controller
        ↓
Comparison Result
        ↓
Charts / Table / Summary
```

---

# 38. Fair Comparison Rules

Comparisons should use controlled inputs.

A comparison should specify:

```text
Same Input
Same Input Size
Same Measurement Rules
Same Environment
```

The project should distinguish between:

### Theoretical Complexity

```text
O(n²)
O(n log n)
```

and:

### Observed Execution Metrics

```text
Comparisons
Swaps
Execution Steps
```

They should not be treated as interchangeable.

---

# 39. Runtime Benchmarking

If real runtime is displayed, it should be clearly separated from algorithmic complexity.

Example:

```text
Measured Runtime:
3.42 ms

Complexity:
O(n log n)
```

Runtime can vary due to:

- Device.
- Browser.
- JavaScript engine.
- Input size.
- Background processes.

Therefore runtime should be presented as an observed measurement, not proof of complexity.

---

# 40. Progress Architecture

Progress tracking should be separate from algorithm execution.

Possible progress:

```text
Algorithm Viewed
Algorithm Completed
Challenge Completed
Challenge Score
Attempts
Favorites
Recent Topics
Learning Path Completion
```

Progress should reference stable IDs rather than component names.

Example:

```text
algorithmId:
sorting.bubble-sort
```

---

# 41. History Architecture

History should record user activity at a high level.

Examples:

```text
Viewed Bubble Sort
Ran BFS
Completed Binary Search Challenge
Viewed BST
```

History should not store every visualization frame unless there is a specific future requirement.

---

# 42. Favorites Architecture

Favorites should be stored independently.

Example:

```text
favorites:
[
    "sorting.merge-sort",
    "graph.dijkstra",
    "tree.bst"
]
```

This allows users to organize content without modifying the algorithm itself.

---

# 43. Local Persistence

For the initial version, user-specific information can be stored locally.

Potential locally persisted data:

```text
Progress
History
Favorites
Preferences
Last Selected Algorithm
Playback Preferences
Challenge Statistics
```

The architecture should keep persistence behind a small abstraction so it can later be replaced by a backend.

---

# 44. Persistence Abstraction

Instead of UI code directly using browser storage everywhere, use a storage service conceptually:

```text
ProgressService
HistoryService
FavoritesService
SettingsService
```

These services can internally use:

```text
Local Storage
IndexedDB
Backend API
```

without changing the rest of the application.

---

# 45. Global Application State

The application should maintain a small, predictable state structure.

Possible global state groups:

```text
Navigation State
Selected Content State
Visualization State
Input State
Challenge State
Comparison State
Progress State
Settings State
```

Not every value should be global.

Only state that needs to be shared across components should be elevated.

---

# 46. Visualization State

Visualization state may contain:

```text
selectedAlgorithm
input
executionTrace
currentStep
playbackStatus
speed
result
metrics
error
```

The visualization UI derives its display from this state.

---

# 47. Input State

Input state should contain things such as:

```text
source
values
graph
tree
generatorOptions
validationStatus
validationErrors
```

It should not contain rendered UI state.

---

# 48. Challenge State

Challenge state can contain:

```text
challengeId
currentQuestion
userAnswer
attempts
score
isCorrect
feedback
hintLevel
completed
```

Challenge state should not duplicate algorithm execution logic.

---

# 49. Comparison State

Comparison state can contain:

```text
selectedAlgorithms
sharedInput
executionResults
metrics
comparisonMode
```

The comparison engine can generate data for:

```text
Table
Chart
Summary
```

---

# 50. Error Architecture

The application should separate:

## Input Errors

Examples:

```text
Invalid array
Missing graph start node
Invalid edge
```

## Algorithm Errors

Examples:

```text
Unsupported operation
Invalid algorithm input
```

## Application Errors

Examples:

```text
Content unavailable
Unexpected state
Persistence failure
```

## User Feedback

Errors should be understandable.

Technical errors should not be exposed unnecessarily.

---

# 51. Error Boundary Between Layers

A lower-level module should return or throw meaningful errors that the upper layer can interpret.

For example:

```text
Input Parser
   ↓
Validation Error
   ↓
Input Controller
   ↓
User-facing message
```

The algorithm visualizer should not need to understand parser internals.

---

# 52. Application Flow — Selecting an Algorithm

The complete flow should be:

```text
User opens LogicLab
        ↓
Explorer
        ↓
Selects "Bubble Sort"
        ↓
Application loads algorithm definition
        ↓
Loads educational content
        ↓
Loads visualization type
        ↓
Shows default example input
        ↓
User presses Run
        ↓
Input validation
        ↓
Algorithm execution
        ↓
Execution trace generated
        ↓
Visualization state initialized
        ↓
Visualizer renders first step
```

---

# 53. Application Flow — Running an Algorithm

Detailed execution flow:

```text
User presses PLAY
       ↓
Playback Controller
       ↓
Current Step + 1
       ↓
Execution State
       ↓
Visualization Renderer
       ↓
Animation
       ↓
Metrics Update
       ↓
Explanation Update
       ↓
Code Highlight Update
       ↓
Next Step
```

The cycle continues until the final step.

---

# 54. Application Flow — Pause

```text
User presses PAUSE
        ↓
Playback Controller
        ↓
Playback Status = PAUSED
        ↓
Current Step remains unchanged
        ↓
UI remains at current state
```

The algorithm should not be re-executed.

---

# 55. Application Flow — Next Step

```text
User presses NEXT
        ↓
Playback Controller
        ↓
Increment step index
        ↓
Load next execution state
        ↓
Update visualization
        ↓
Update explanation
        ↓
Update code highlight
        ↓
Update metrics
```

---

# 56. Application Flow — Previous Step

```text
User presses PREVIOUS
        ↓
Playback Controller
        ↓
Decrement step index
        ↓
Load previous execution state
        ↓
Update visualization
        ↓
Update explanation
        ↓
Update code highlight
        ↓
Update metrics
```

---

# 57. Application Flow — Custom Input

```text
User enters input
        ↓
Input Parser
        ↓
Input Validation
        ↓
Normalized Input
        ↓
Algorithm Engine
        ↓
Execution Trace
        ↓
Visualization
```

The custom input should use the same execution pipeline as predefined input.

---

# 58. Application Flow — Random Input

```text
User selects Random
        ↓
Generator Options
        ↓
Input Generator
        ↓
Normalized Input
        ↓
Algorithm Engine
        ↓
Execution Trace
        ↓
Visualization
```

This avoids having a separate visualization pipeline.

---

# 59. Application Flow — Graph Editing

```text
User creates node
        ↓
Graph Editor State

User creates edge
        ↓
Graph Editor State

User selects start node
        ↓
Graph Validation

User selects BFS
        ↓
Algorithm Engine
        ↓
Execution Trace
        ↓
Graph Visualizer
```

Graph editing is independent from graph algorithm execution.

---

# 60. Application Flow — Challenge

```text
User opens challenge
        ↓
Challenge Definition
        ↓
Algorithm Definition
        ↓
Challenge Input
        ↓
Execution / Expected Trace
        ↓
Challenge Interface
        ↓
User Answer
        ↓
Validator
        ↓
Feedback
        ↓
Score / Progress
```

---

# 61. Application Flow — Algorithm Comparison

```text
User selects algorithms
        ↓
Comparison Controller
        ↓
Shared Input
        ↓
Algorithm A Execution
Algorithm B Execution
Algorithm C Execution
        ↓
Metrics Collection
        ↓
Comparison Result
        ↓
Table / Chart / Explanation
```

---

# 62. Data Flow Diagram

The overall system flow should conceptually look like:

```text
                       USER
                         │
                         ▼
                  ┌─────────────┐
                  │     UI      │
                  └──────┬──────┘
                         │
                         ▼
                ┌─────────────────┐
                │ Application     │
                │ State            │
                └────────┬────────┘
                         │
                         ▼
                ┌─────────────────┐
                │ Controllers /   │
                │ Services         │
                └────────┬────────┘
                         │
             ┌───────────┼────────────┐
             │           │            │
             ▼           ▼            ▼
        Input System  Content     Progress
             │        System       System
             │           │            │
             └──────┬────┴────────────┘
                    │
                    ▼
             Algorithm Engine
                    │
                    ▼
             Execution Trace
                    │
                    ▼
              Playback Engine
                    │
                    ▼
           Visualization State
                    │
        ┌───────────┼────────────┐
        ▼           ▼            ▼
   Visualizer    Explanation   Code Panel
        │           │            │
        └───────────┴────────────┘
                    │
                    ▼
                   USER
```

---

# 63. Module Boundaries

Each major module should have a clear responsibility.

## Algorithm Module

Owns:

- Algorithm logic.
- Input rules.
- Execution.
- Result.
- Execution events.
- Algorithm-specific metrics.

Does not own:

- UI.
- Buttons.
- Layout.
- Animation.
- Browser storage.

---

## Visualization Module

Owns:

- Rendering.
- Highlighting.
- Animation.
- Visual state representation.
- User interaction specific to visualization.

Does not own:

- Algorithm logic.
- Complexity calculations.
- Challenge scoring.

---

## Content Module

Owns:

- Descriptions.
- Explanations.
- Code.
- Pseudocode.
- Complexity.
- Metadata.
- Educational examples.

Does not own:

- Playback.
- UI state.
- Algorithm execution.

---

## Input Module

Owns:

- Parsing.
- Validation.
- Generation.
- Normalization.

Does not own:

- Algorithm execution.
- Rendering.

---

## Challenge Module

Owns:

- Challenge definitions.
- User answers.
- Validation.
- Scoring.
- Feedback.

Does not own:

- A second algorithm implementation.

---

## Progress Module

Owns:

- Completion.
- Scores.
- History.
- Favorites.
- Learning state.

Does not own:

- Algorithm implementation.

---

# 64. Reusable Components

The architecture should encourage reusable components.

Examples:

```text
AlgorithmCard
CategoryCard
CodeViewer
PseudocodeViewer
ComplexityCard
MetricsPanel
PlaybackControls
InputEditor
RandomInputControls
ExplanationPanel
ChallengeCard
ResultSummary
GraphEditor
TreeEditor
ComparisonTable
ProgressCard
```

These components should work with data rather than hardcoded algorithm-specific content.

---

# 65. Reusable Services

Possible reusable services:

```text
AlgorithmRegistry
ContentRegistry
VisualizationRegistry
InputService
ExecutionService
PlaybackService
ChallengeService
ComparisonService
ProgressService
HistoryService
FavoritesService
StorageService
```

The exact naming can change.

The responsibility boundaries should remain.

---

# 66. Avoiding Hardcoded Algorithm UI

The project should avoid code such as:

```text
if algorithm === "bubble-sort"
    show this component

if algorithm === "bfs"
    show another component
```

everywhere in the application.

Instead, use metadata:

```text
visualizationType = "ARRAY"
```

Then:

```text
Visualization Registry
    ARRAY → ArrayVisualizer
```

Algorithm-specific behavior belongs inside the algorithm definition, not scattered across UI components.

---

# 67. Adding a New Algorithm

Adding a new algorithm should be a predictable process.

Conceptually:

```text
1. Create algorithm definition.
2. Add metadata.
3. Add input rules.
4. Add execution logic.
5. Add execution events / states.
6. Add result logic.
7. Add metrics.
8. Add explanation content.
9. Add pseudocode.
10. Add code implementations.
11. Add complexity information.
12. Add examples.
13. Add edge cases.
14. Add challenges.
15. Register algorithm.
16. Verify existing visualizer can render it.
```

A new algorithm should not require rewriting unrelated components.

---

# 68. Adding a New Data Structure

The process should be similar:

```text
1. Define structure model.
2. Define operations.
3. Define state transitions.
4. Define visualization state.
5. Create or reuse renderer.
6. Add explanations.
7. Add examples.
8. Add challenges.
9. Register the data structure.
```

---

# 69. Adding a New Visualization Type

If a future topic cannot use an existing renderer:

```text
1. Define visual state contract.
2. Define visualization type.
3. Create renderer.
4. Register renderer.
5. Connect compatible algorithms.
6. Add controls if necessary.
7. Add educational interaction.
```

The new renderer should still consume normalized state.

---

# 70. Architecture for Future Categories

The project should not be designed only for today's algorithms.

The architecture should allow:

```text
Sorting
Searching
Graphs
Trees
Data Structures
Dynamic Programming
Greedy
Backtracking
String Algorithms
Mathematical Algorithms
Geometry
```

The application should treat these as registered content rather than hardcoded page structures.

---

# 71. Dynamic Programming Architecture

Dynamic Programming may require different visualization concepts.

Potential states:

```text
Input
DP Table
Current Cell
Previous Cells
Transition Formula
Optimal Value
Reconstructed Solution
```

The architecture should allow these states without changing the entire application.

A possible visualization type:

```text
MATRIX / GRID
```

---

# 72. Grid-Based Algorithm Architecture

Algorithms such as:

- A*
- Maze solving
- Flood Fill
- Dynamic Programming on grids

may need a grid state:

```text
cell
row
column
status
value
visited
cost
parent
```

The same grid renderer can support multiple algorithms.

---

# 73. Animation Architecture

Animation should be a presentation concern.

The algorithm engine should emit:

```text
COMPARE
MOVE
SWAP
VISIT
```

The visualizer decides:

```text
How should this look?
How long should it animate?
What should be highlighted?
```

This separation allows animation styles to change without changing algorithm logic.

---

# 74. Accessibility of Algorithm State

Although accessibility belongs primarily to the UI layer, algorithm state should remain semantic enough to be described.

For example:

```text
Current action:
Compare values 7 and 3

Result:
Swap values
```

This allows the interface to provide meaningful non-visual feedback later.

The algorithm engine should therefore not depend on purely graphical concepts.

---

# 75. Determinism

For educational visualization, execution should be deterministic for a given input and configuration whenever possible.

Example:

```text
Input:
[5, 2, 8]

Same algorithm
Same configuration

→ Same execution trace
```

This makes:

- Previous / Next reliable.
- Challenges predictable.
- Tests reproducible.
- Comparisons fair.
- Bugs easier to reproduce.

---

# 76. Randomness Handling

When randomness is intentional, it should be controlled.

Random input generation can optionally use a seed.

Conceptually:

```text
seed = 12345
```

Then the same seed can produce the same generated input.

This is useful for:

- Debugging.
- Reproducing examples.
- Comparing runs.
- Testing.

---

# 77. Testing Architecture

The architecture should support independent testing.

## Algorithm Tests

Test:

- Correct result.
- Correct edge-case behavior.
- Correct execution events.
- Correct metrics.

## Input Tests

Test:

- Parsing.
- Validation.
- Generation.

## Visualization Tests

Test:

- State rendering.
- Correct highlighted elements.
- Correct transitions.

## Challenge Tests

Test:

- Validation.
- Scoring.
- Feedback.

## Progress Tests

Test:

- Completion.
- History.
- Favorites.
- Persistence.

---

# 78. Testable Design Rule

The most important testability rule:

> An algorithm should be runnable without rendering the UI.

For example:

```text
runBubbleSort(input)
```

should be able to produce:

```text
result
steps
metrics
```

in isolation.

This allows the algorithm to be tested independently from the browser.

---

# 79. Validation of Visualization

The UI should be testable against known execution states.

Example:

```text
Expected step:
COMPARE indexes [2,3]

Expected visual state:
Cells 2 and 3 highlighted.
```

The algorithm engine provides the expected state.

The renderer displays it.

This allows separate responsibility testing.

---

# 80. Performance Architecture

The project should keep the algorithm engine independent from expensive rendering operations.

For large inputs:

```text
Algorithm Execution
        ↓
Execution Trace
        ↓
Selected / Current Step
        ↓
Renderer
```

The UI should not render every historical step simultaneously.

The architecture should allow future optimization such as:

- Lazy step generation.
- Step windowing.
- Event compression.
- Snapshot checkpoints.
- On-demand trace generation.
- Large-input mode.

---

# 81. Large Execution Traces

Some algorithms can create very large execution traces.

The architecture should not assume every trace is tiny.

Possible strategy for future optimization:

```text
Small input:
Generate full trace.

Large input:
Generate / cache steps progressively.
```

The public playback model should remain the same.

---

# 82. Rendering vs Execution Time

Algorithm execution speed and animation speed are separate concepts.

For example:

```text
Algorithm execution:
Generate trace quickly.

Visualization:
Play trace at 0.5x / 1x / 2x.
```

This is important because the user should be able to slow down visualization without slowing down the algorithm's actual computation unnecessarily.

---

# 83. Caching Strategy

Potential future caching areas:

```text
Algorithm Metadata
Content
Generated Example Inputs
Execution Traces
Comparison Results
```

Caching should not change correctness.

If a cache is invalid or unavailable, the system should be able to regenerate the necessary data.

---

# 84. Error Isolation

A failure in one module should not unnecessarily break unrelated functionality.

Examples:

```text
Progress storage fails
    ↓
Visualizer should still run.

One challenge has malformed content
    ↓
Other algorithms should still work.

One visualization renderer fails
    ↓
Other visualization types should remain available.
```

---

# 85. Security and Trust Boundaries

Although security is not the core purpose of this project, the architecture should still avoid unsafe execution.

Especially:

- User-provided code should not automatically execute in the main application context.
- Arbitrary code execution should not be assumed safe.
- If a future feature executes user code, it should be isolated.
- Imported content should be validated.
- Persistent data should be treated as untrusted input.

The initial project can avoid executing arbitrary user code entirely.

---

# 86. Offline-First Capability

LogicLab can be designed so the core learning experience works without a backend.

The core content can be bundled with the application.

This makes it possible to use:

```text
Algorithm Explorer
Visualizers
Challenges
Progress
Favorites
History
```

without requiring a server.

A backend can be added later if collaborative or account-based functionality becomes necessary.

---

# 87. Optional Backend Architecture

A future backend could support:

```text
User Accounts
Cloud Progress
Cross-Device History
Leaderboard
Challenge Statistics
Content Management
Community Challenges
```

The frontend architecture should not depend on these capabilities for the core product.

---

# 88. Optional Content Management System

If the project becomes large, content can eventually be maintained through a content management system or structured data repository.

Possible content categories:

```text
Algorithms
Examples
Challenges
Hints
Translations
Code
Explanations
Learning Paths
```

The application should consume normalized content regardless of where it is stored.

---

# 89. Search Architecture

Search should use centralized metadata.

Search should be able to find:

- Algorithms.
- Data structures.
- Concepts.
- Tags.
- Complexity.
- Categories.

Example:

```text
Query:
"queue"

Results:
BFS
Queue
Tree Level Order Traversal
```

This can be generated through relationships in the content registry.

---

# 90. Recommended Dependency Direction

Dependencies should generally flow inward:

```text
UI
 ↓
Application Services
 ↓
Domain / Algorithm Engine
 ↓
Pure Data / Content
```

Lower-level domain logic should not import UI components.

The algorithm engine should not know about browser-specific concepts.

---

# 91. Dependency Rule

Avoid:

```text
Algorithm → React Component
Algorithm → Browser Storage
Algorithm → DOM
Algorithm → CSS
```

Prefer:

```text
Algorithm → Pure State
Algorithm → Events
Algorithm → Result
```

Then:

```text
UI → State
UI → Events
UI → Result
```

---

# 92. Single Source of Truth

The same piece of information should not be maintained in multiple unrelated places.

Examples:

Algorithm metadata should exist in one authoritative definition.

Complexity data should exist in one content definition.

Algorithm IDs should be stable.

Challenge definitions should reference algorithm IDs rather than duplicating metadata.

This reduces inconsistencies.

---

# 93. Avoiding Duplicate Logic

Do not create:

```text
Bubble Sort Logic
in algorithm engine

AND

Bubble Sort Logic
inside challenge

AND

Bubble Sort Logic
inside visualization
```

There must be one authoritative algorithm implementation.

Everything else consumes its output.

---

# 94. Avoiding UI-Specific Algorithm Logic

Avoid:

```text
if currentColor === "red"
    swap values
```

The UI color should represent the operation.

The operation itself should come from the algorithm engine.

Correct concept:

```text
Algorithm:
SWAP indexes 1 and 2

Visualizer:
Highlight indexes 1 and 2
Animate movement
```

---

# 95. Avoiding Content Duplication

The same explanation should not be manually copied into:

- Algorithm page.
- Visualizer.
- Challenge.
- Result page.

Instead, these interfaces should reference shared content.

---

# 96. Architecture for Theming

Visual design should remain independent from the algorithm engine.

The same algorithm can later have:

```text
Light Theme
Dark Theme
High Contrast
Presentation Mode
```

without changing the execution engine.

---

# 97. Architecture for Responsive Layout

The visualization engine should provide state.

The UI decides how to arrange that state for:

```text
Desktop
Tablet
Mobile
```

Algorithm logic should remain unchanged.

---

# 98. Desktop Visualization Layout

A desktop layout can expose multiple simultaneous panels:

```text
┌───────────────┬───────────────────────────────┬───────────────┐
│ Algorithm     │ Visualization                │ Explanation   │
│ Navigation    │                              │               │
│               │                              │               │
│               │                              │               │
├───────────────┴───────────────────────────────┴───────────────┤
│ Controls / Metrics / Code                                    │
└──────────────────────────────────────────────────────────────┘
```

This is a presentation concern.

The architecture underneath remains the same.

---

# 99. Mobile Visualization Layout

On smaller screens, the same information can be reorganized:

```text
Algorithm
↓
Visualization
↓
Controls
↓
Explanation
↓
Code
↓
Metrics
```

No algorithm changes are required.

---

# 100. Data Contracts

The architecture should define stable contracts between layers.

Important contracts include:

```text
Algorithm Input
Algorithm Result
Execution Step
Execution State
Visualization State
Content Definition
Challenge Definition
Progress Record
Comparison Result
```

The exact TypeScript interfaces or schemas can be defined later.

The important requirement is that these boundaries are stable.

---

# 101. Example — Bubble Sort Through the Architecture

Complete flow:

```text
User selects Bubble Sort
        ↓
Algorithm Registry
        ↓
Bubble Sort Definition
        ↓
Content Loader
        ↓
Bubble Sort Metadata
        ↓
Default Input
        ↓
Input Validation
        ↓
Algorithm Engine
        ↓
Execution Trace
        ↓
Playback Controller
        ↓
Current Step
        ↓
Array Visualization
        ↓
Explanation Panel
        ↓
Code Panel
        ↓
Metrics Panel
```

Nothing in the visual layer needs to know how Bubble Sort calculates its result.

---

# 102. Example — BFS Through the Architecture

```text
User selects BFS
        ↓
Algorithm Registry
        ↓
BFS Definition
        ↓
Graph Input
        ↓
Graph Validation
        ↓
BFS Engine
        ↓
Execution Trace
        ↓
Playback Controller
        ↓
Current Graph State
        ↓
Graph Visualizer
        ├── Visited Nodes
        ├── Current Node
        ├── Queue
        ├── Current Edge
        └── Traversal Path
```

The same graph visualizer can later be used for DFS, Dijkstra, and other graph algorithms.

---

# 103. Example — BST Through the Architecture

```text
User enters:
50, 30, 70, 20, 40
        ↓
Input Generator / Parser
        ↓
BST Engine
        ↓
Insert Events
        ↓
Tree Execution Trace
        ↓
Playback Controller
        ↓
Tree Visualizer
```

The Tree Visualizer does not need to know the rules of a Binary Search Tree.

It only receives the current tree state.

---

# 104. Architecture for "Why?" Explanations

When the user asks why something happened:

```text
Current Step
      ↓
Step Metadata
      ↓
Explanation Resolver
      ↓
Contextual Explanation
      ↓
UI
```

The explanation should be based on the actual current state.

Example:

```text
7 > 3
```

The explanation can use actual values:

> "7 is greater than 3, so they are swapped for ascending order."

The explanation layer should not invent a different state from what the algorithm produced.

---

# 105. Architecture for Educational Consistency

The same execution step should drive:

```text
Visualization
Explanation
Code Highlight
Pseudocode Highlight
Metrics
Challenge Validation
```

This is one of the most important architectural ideas.

One source of truth:

```text
Execution Step
      ↓
 ┌────┼────┬────┬────┐
 ↓    ↓    ↓    ↓    ↓
UI  Text Code Pseudo Metrics
```

This prevents the situation where the animation shows one operation while the explanation describes another.

---

# 106. Architecture for New Content

New content should generally follow:

```text
Definition
    ↓
Registration
    ↓
Automatic Discovery
    ↓
Existing UI
```

For example, after registering:

```text
sorting.heap-sort
```

the Explorer should be able to discover it automatically.

The developer should not need to manually modify every screen.

---

# 107. Configuration vs Code

The architecture should prefer data/configuration for:

```text
Algorithm names
Descriptions
Difficulty
Tags
Complexity
Languages
Related topics
Challenge metadata
```

Actual algorithm behavior should remain code.

This gives the project a balance:

```text
Content → Data-driven
Algorithm logic → Code
Visualization → Reusable components
```

---

# 108. Recommended Project-Level Separation

The project should conceptually separate:

```text
Algorithms
Content
Visualizers
Application State
Services
Input Generators
Challenges
Comparison
Persistence
Shared Utilities
```

A possible conceptual folder structure:

```text
src/
│
├── app/
│
├── algorithms/
│   ├── sorting/
│   ├── searching/
│   ├── graphs/
│   ├── trees/
│   └── data-structures/
│
├── content/
│   ├── algorithms/
│   ├── examples/
│   ├── challenges/
│   └── learning-paths/
│
├── visualization/
│   ├── array/
│   ├── graph/
│   ├── tree/
│   ├── stack/
│   └── queue/
│
├── state/
│
├── services/
│
├── generators/
│
├── challenges/
│
├── comparison/
│
├── persistence/
│
├── shared/
│
└── types/
```

This is a conceptual organization. The actual framework-specific structure can be decided later.

---

# 109. Shared Types

Shared contracts should be centralized enough to prevent inconsistent definitions.

Examples:

```text
AlgorithmId
CategoryId
VisualizationType
ExecutionStep
ExecutionStatus
AlgorithmResult
Metrics
ChallengeDefinition
ProgressRecord
```

The goal is that all layers agree on the same concepts.

---

# 110. Naming Consistency

The architecture should use stable names.

For example:

```text
algorithmId
categoryId
challengeId
stepId
visualizationType
```

Avoid multiple names for the same concept:

```text
algorithmKey
algoName
algorithmSlug
algorithmIdentifier
```

unless they serve genuinely different purposes.

Consistency is especially important for registries and references.

---

# 111. Versioning of Content

If educational content changes later, the architecture should be able to identify content versions.

Potential metadata:

```text
contentVersion
updatedAt
```

This becomes useful if:

- A challenge changes.
- Explanation changes.
- Code changes.
- Complexity notes change.

For the first version, this can remain simple.

---

# 112. Import / Export Capability

A future version may allow users to save custom examples.

Architecture should make it possible to serialize:

```text
Custom Array
Custom Graph
Custom Tree
Challenge Configuration
```

and later import them.

This is another reason to keep input and visualization state structured.

---

# 113. Analytics Architecture

If the project later records anonymous usage analytics, it should be separated from core application logic.

Possible events:

```text
algorithm_opened
algorithm_started
algorithm_completed
challenge_started
challenge_completed
comparison_created
```

Analytics should never be required for the algorithm to run.

---

# 114. Offline Progress and Sync

Initial:

```text
Local Progress
```

Future:

```text
Local Progress
      ↓
Sync Service
      ↓
Cloud Account
```

The core progress model should remain the same.

---

# 115. Accessibility and Non-Visual Representation

The architecture should permit a future alternate representation of an algorithm's current state.

For example:

```text
Visual:
Cells 2 and 3 highlighted

Semantic:
Comparing element 2 with element 3
```

This means algorithm states must contain meaningful semantic information rather than only visual coordinates.

---

# 116. Internationalization

Content should eventually support multiple languages.

Architectural principle:

```text
Algorithm Logic
      ↓
Language-independent
```

while:

```text
Explanations
Labels
Descriptions
Hints
UI text
      ↓
Translatable content
```

This should not require changing the algorithm engine.

---

# 117. Performance Boundaries

Heavy computation should remain separated from rendering.

Potential future strategies:

```text
Web Worker
Incremental execution
Trace streaming
Lazy generation
Memoized calculations
```

These should be possible without changing the public algorithm contract.

---

# 118. Worker-Friendly Algorithm Architecture

If large algorithms are moved to a worker later, the ideal flow remains:

```text
Main Thread
   ↓
Execution Request
   ↓
Worker
   ↓
Algorithm Engine
   ↓
Execution Result
   ↓
Main Thread
   ↓
Visualization
```

This is another reason why algorithm logic should remain independent from browser UI APIs.

---

# 119. Architectural Rules

The project should follow these rules.

## Rule 1

Algorithm logic must not depend on UI.

## Rule 2

Visualization must not reimplement algorithms.

## Rule 3

Challenges must reuse algorithm logic.

## Rule 4

Content must be centralized.

## Rule 5

Metrics must come from algorithm execution, not visual assumptions.

## Rule 6

Playback must control an execution trace rather than rerun logic unpredictably.

## Rule 7

Input generation and validation must remain independent from algorithms.

## Rule 8

New algorithms should be registered rather than manually wired into many screens.

## Rule 9

Shared data contracts must remain stable.

## Rule 10

One piece of information should have one authoritative source.

---

# 120. Things the Architecture Should Avoid

Avoid:

```text
One giant component containing the entire visualizer.
```

Avoid:

```text
One giant algorithm file containing every algorithm.
```

Avoid:

```text
Hardcoded algorithm-specific UI conditions everywhere.
```

Avoid:

```text
Duplicating algorithm logic for challenges.
```

Avoid:

```text
Putting educational explanations directly inside rendering logic.
```

Avoid:

```text
Direct browser storage calls scattered throughout the application.
```

Avoid:

```text
Making visual colors or animation state part of algorithm logic.
```

Avoid:

```text
Forcing every algorithm into the same visualization if the representation does not make sense.
```

---

# 121. Definition of a Healthy Architecture

LogicLab architecture is healthy when:

```text
Adding Bubble Sort
    ↓
Does not require changing BFS.

Adding BFS
    ↓
Does not require changing the Array Visualizer.

Changing the Array Visualizer
    ↓
Does not change Bubble Sort logic.

Changing the explanation text
    ↓
Does not change algorithm execution.

Changing local persistence
    ↓
Does not change visualization.

Adding a new challenge
    ↓
Does not require implementing the algorithm again.
```

This is the standard the architecture should maintain.

---

# 122. Recommended Core Pipeline

The complete application pipeline should be:

```text
CONTENT
  ↓
REGISTRY
  ↓
SELECTION
  ↓
INPUT
  ↓
VALIDATION
  ↓
ALGORITHM ENGINE
  ↓
EXECUTION TRACE
  ↓
PLAYBACK
  ↓
VISUALIZATION STATE
  ↓
VISUALIZATION
  ↓
EXPLANATION / CODE / METRICS
  ↓
RESULT
  ↓
PROGRESS / HISTORY
```

This is the core architecture of LogicLab.

---

# 123. Final Architectural Model

The project can be understood as six major systems:

```text
1. CONTENT SYSTEM
   What should be taught?

2. ALGORITHM SYSTEM
   How is the problem solved?

3. EXECUTION SYSTEM
   What exactly happened at each step?

4. VISUALIZATION SYSTEM
   How is that state displayed?

5. LEARNING SYSTEM
   How does the user practice and understand it?

6. PERSISTENCE SYSTEM
   What should the application remember?
```

Together:

```text
                    LOGICLAB
                       │
       ┌───────────────┼────────────────┐
       │               │                │
   CONTENT         ALGORITHM        LEARNING
       │               │                │
       └──────────┬────┴───────┬────────┘
                  │            │
              EXECUTION    CHALLENGES
                  │            │
                  ▼            ▼
             VISUALIZATION  PROGRESS
                  │            │
                  └──────┬─────┘
                         ▼
                    USER EXPERIENCE
```

---

# 124. Final Principle

LogicLab should be built so that the user sees a simple experience:

```text
Choose an algorithm
        ↓
Give it data
        ↓
Run it
        ↓
See every step
        ↓
Understand why
        ↓
See the code
        ↓
See the complexity
        ↓
Try it yourself
        ↓
Compare it
        ↓
Learn from it
```

Behind that simple experience should be a clean separation:

```text
Content
   +
Algorithm Logic
   +
Execution State
   +
Visualization
   +
Learning
   +
Persistence
```

The architecture should make these systems independent enough to evolve individually, but connected enough to provide **one consistent source of truth from algorithm logic all the way to the user's screen**.

That separation is the foundation that allows LogicLab to grow from a small algorithm visualizer into a complete interactive computer-science learning platform.
