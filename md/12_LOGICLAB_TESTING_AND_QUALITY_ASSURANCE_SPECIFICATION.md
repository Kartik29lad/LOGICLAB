# LogicLab — Testing & Quality Assurance Specification

## Document Status

This document is the approved QA architecture baseline for LogicLab. It is designed to be used during development, code review, CI, release preparation, and production verification.

---

# 1. Document Purpose

This document is the single source of truth for testing and quality assurance in LogicLab. LogicLab is an interactive algorithm and data-structure learning laboratory, so quality includes software correctness, algorithm correctness, execution-trace correctness, visualization correctness, educational correctness, security, performance, accessibility, SEO, and reliability. A feature is not complete merely because a page renders or an API returns 200.

---

# 2. Testing & Quality Philosophy

LogicLab follows the principle: every visible result must be correct, explainable, reproducible, and consistent with the underlying execution state. Tests must validate both what the system computes and what the learner is shown.

---

# 3. Quality Goals

The test strategy must protect correct algorithms, valid traces, synchronized visual state, correct challenges, durable progress, secure ownership, safe input handling, database consistency, bounded resource use, accessible interaction, correct SEO, and regression-free releases.

---

# 4. Testing Pyramid

Use many fast unit/core tests, fewer integration tests, and a smaller set of high-value end-to-end journeys. The pyramid is a guidance model, not a rigid percentage target.

```text
                    E2E
                   /   \
                  /     \
             Integration
                /       \
               /         \
          Unit / Core Tests

Fast tests should dominate.
Integration tests verify boundaries.
E2E tests verify critical user journeys.
```

---

# 5. Complete Testing Strategy

Testing spans static analysis, unit, core algorithms, execution engine, visualization, components, features, APIs, database, security, accessibility, SEO, performance, E2E, regression, build/deployment, and manual exploratory QA.

---

# 6. Testing Levels

Each level owns a different question: unit asks whether one responsibility works; integration asks whether boundaries work; E2E asks whether a real user journey works; manual QA asks whether the product is understandable and usable.

```text
Static Analysis
      ↓
Unit / Core
      ↓
Execution / Visualization
      ↓
Integration
      ↓
API / Database
      ↓
Security / Accessibility / SEO / Performance
      ↓
E2E
      ↓
Release Verification
```

---

# 7. Static Analysis

Static analysis runs before runtime tests and checks TypeScript, lint, formatting, import boundaries, prohibited dependencies, buildability, and optional dead-code/circular-dependency rules.

---

# 8. TypeScript Type Checking

Use strict TypeScript validation. Zero unexpected type errors are required before merge. Type assertions must not be used as a substitute for correct modeling.

---

# 9. Linting & Formatting

Lint rules must enforce React correctness, hooks, safe imports, server/client separation, and architecture rules. Formatting is automated and deterministic.

---

# 10. Unit Testing Strategy

Unit tests isolate one responsibility and remain deterministic and fast. Examples include algorithms, validators, mappers, metric counters, score calculations, and achievement predicates.

---

# 11. Core Algorithm Testing

Every algorithm gets direct correctness tests for normal, empty, single-item, boundary, duplicate, sorted/reverse-sorted, invalid, and maximum supported inputs. Algorithm-specific edge cases extend this baseline.

---

# 12. Sorting Algorithm Testing

Verify sorted output and preservation of the input multiset. Test empty, singleton, duplicates, negative values where supported, sorted, reverse-sorted, adversarial, and boundary-size arrays. Stable algorithms must have stability tests.

---

# 13. Searching Algorithm Testing

Test targets at beginning, middle, end, absent values, duplicates, empty arrays, single items, boundary indices, and invalid input. Binary search must explicitly test low/high/mid boundary behavior and sorted-input requirements.

---

# 14. Graph Algorithm Testing

Test single-node, connected, disconnected, directed, undirected, weighted, unweighted, cyclic, unreachable, duplicate-edge, and boundary-size graphs. Verify paths, parents, distances, and visited states.

---

# 15. Tree Algorithm Testing

Test empty, single-node, balanced, skewed, duplicate-policy, search-miss, leaf deletion, one-child deletion, two-child deletion, traversal, and balancing cases.

---

# 16. Data Structure Testing

Every data structure must test each supported operation, empty behavior, boundary behavior, invalid operations, and maximum supported sizes.

---

# 17. Property-Based Testing

Use invariants where they are stronger than individual examples: sorting preserves elements and ordering; stacks are LIFO; queues are FIFO; BST in-order traversal is sorted; heaps satisfy their invariant.

---

# 18. Deterministic / Seeded Execution Testing

Randomized generators must support explicit seeds where practical. The same input, configuration, and seed should reproduce the same scenario when deterministic reproduction is intended.

---

# 19. Execution Trace Testing

Test state-before, action, state-after, metrics, and explanation references. The final trace state must equal the algorithm result.

A representative trace must be inspectable as:

```text
Step N
  State Before
      ↓
  Action/Event
      ↓
  State After
      ↓
  Metrics
      ↓
  Explanation
```

```text
Input: [3, 2, 1]

Step 1: COMPARE(0,1)
Step 2: SWAP(0,1)
Step 3: COMPARE(1,2)
...
```

---

# 20. Execution Event Testing

Every execution action such as COMPARE, SWAP, VISIT, RELAX, ENQUEUE, DEQUEUE, PUSH, POP, PARTITION, MERGE, ROTATE, FOUND, and COMPLETE must have required fields and valid semantics.

---

# 21. Execution Invariant Testing

For consecutive execution steps, state N output must equal state N+1 input unless the trace intentionally reconstructs state from an immutable baseline. Tests must catch impossible transitions and invalid operations.

---

# 22. Metrics Testing

Metrics must originate from the engine, not UI guesses. Verify comparisons, swaps, writes, visits, relaxations, queue/stack operations, rotations, and other counters against trace events.

---

# 23. Complexity Metadata Testing

Validate best, average, worst, and space complexity metadata. Keep theoretical complexity separate from observed runtime measurements.

---

# 24. Visualization Testing Strategy

Visualization is a first-class test domain. Verify the pipeline Execution State -> Visualization Model -> Renderer -> UI, not just whether a component mounts.

```text
Execution Engine
      ↓
Execution State
      ↓
Visualization Model
      ↓
Renderer
      ↓
React UI
```

A failure anywhere in this chain is a potential correctness defect.

---

# 25. Visualization State Testing

Test DEFAULT, CURRENT, SELECTED, COMPARING, SWAPPING, ACTIVE, VISITED, DISCOVERED, SORTED, TARGET, PATH, PIVOT, BOUNDARY, DISABLED, ERROR, and SUCCESS states where applicable.

---

# 26. Array Visualization Testing

Verify values, ordering, indices, active indices, comparison pairs, swaps, sorted regions, pivots, and boundaries. Visual state must change only when the execution state changes.

---

# 27. Graph Visualization Testing

Verify nodes, edges, directions, weights, source/target, discovered/visited states, queue, current node, path, distance, and parent relationships.

---

# 28. Tree Visualization Testing

Verify root, parent-child relationships, traversal/search path, current node, deletion, rotations, and final tree shape.

---

# 29. Stack Visualization Testing

Verify top, push/pop order, current item, empty state, and capacity/overflow behavior where configured.

---

# 30. Queue Visualization Testing

Verify front, rear, enqueue/dequeue order, current item, empty state, and capacity behavior where applicable.

---

# 31. Linked List Visualization Testing

Verify node order, next links, insertion, deletion, search path, and terminal null state.

---

# 32. Grid / Matrix Visualization Testing

Verify rows, columns, start, target, blocked cells, visited cells, current cell, frontier, path, distance, and A* g/h/f values where applicable.

---

# 33. Visualization Accessibility Testing

Important states must not depend only on color or animation. Use semantic labels, outlines, icons, text, shape, or other cues where appropriate.

---

# 34. Component Testing

Reusable UI components should test rendering, props, interaction, disabled/loading/error states, keyboard support, semantics, and accessibility.

---

# 35. Feature Component Testing

Test feature behavior in larger components such as visualizers, challenges, experiments, compare, progress, history, learning paths, and settings without duplicating low-level component tests.

---

# 36. Playback Testing

Test play, pause, resume, step forward/backward, reset, speed changes, seeking, boundaries, and combinations such as reset while playing.

---

# 37. Animation Testing

Validate sequence, state timing, interruption, cancellation, cleanup, and reduced-motion behavior. Prefer stable semantic milestones over frame-by-frame snapshots.

---

# 38. Streaming / Async UI Testing

Test partial responses, completion, cancellation, disconnects, reconnects, duplicate events, out-of-order events, and error termination. The UI must converge to a valid state.

---

# 39. Form Testing

Test required fields, empty values, whitespace, types, ranges, maximum lengths, server errors, loading, success, duplicate submission, and keyboard submission.

---

# 40. Integration Testing Strategy

Integration tests verify real boundaries such as Use Case↔Repository, Repository↔SQL Server, API↔Use Case, Execution Engine↔Visualization Model, and Challenge↔Evaluator.

Important boundaries:

```text
API ↔ Use Case
Use Case ↔ Service
Service ↔ Repository
Repository ↔ SQL Server
Core Engine ↔ Visualization Model
Challenge ↔ Evaluator
Progress ↔ Activity
Experiment ↔ Execution
```

---

# 41. API Integration Testing

Each important endpoint needs success, invalid-input, auth, authorization, ownership, not-found, conflict, and appropriate rate-limit/database-error tests.

---

# 42. Database Integration Testing

Use a real SQL Server-compatible environment to test tables, constraints, indexes, transactions, concurrency, JSON validation, and migration behavior.

---

# 43. Migration Testing

Every migration must be tested from the prior schema with populated data. Verify migration success, data preservation, new constraints, and application compatibility.

---

# 44. Transaction Testing

Force failures during multi-write operations and verify rollback behavior for challenge submission, experiment creation, learning completion, achievement updates, and account changes.

---

# 45. Concurrency Testing

Test simultaneous edits, duplicate submissions, parallel progress updates, and concurrent favorites/bookmarks. Verify no silent lost updates and correct conflict behavior.

---

# 46. Idempotency Testing

For idempotent commands, replay the same request and verify one logical state transition. Test network-style duplicate delivery.

---

# 47. Authentication Testing

Test register, login, logout, session retrieval, expiration, revocation, invalid credentials, locked accounts, deleted accounts, verification/reset flows when implemented.

---

# 48. Authorization Testing

Test anonymous, owner, non-owner, and admin access for every protected resource family.

---

# 49. IDOR / BOLA Testing

Attempt to access another user's experiments, comparisons, bookmarks, progress, history, and other identifiers directly. Every ownership boundary must be enforced server-side.

---

# 50. Input Validation Testing

Test missing, wrong-type, empty, oversized, negative, malformed, unsupported-enum, unexpected-field, deeply nested, and boundary inputs before expensive processing begins.

---

# 51. Algorithm Resource-Limit Testing

Verify configured limits for arrays, graph nodes/edges, tree depth, matrix dimensions, trace length, response size, and execution time.

---

# 52. Recursion Safety Testing

Test recursive algorithms at normal and pathological depths. Maximum supported depth must produce controlled behavior rather than a process crash.

---

# 53. Algorithmic DoS Testing

Use dense graphs, deep trees, large matrices, adversarial sorting inputs, and long traces to verify resource limits and safe failure.

---

# 54. Security Testing

Security testing covers authentication, authorization, IDOR/BOLA, SQL injection, XSS, CSRF, mass assignment, session security, rate-limit bypass, input abuse, algorithmic DoS, and future SSRF/path-traversal risks.

---

# 55. SQL Injection Testing

Attempt injection strings against all user-controlled query paths and verify parameterization treats them as data.

---

# 56. XSS Testing

Test all user-controlled names, descriptions, notes, labels, answers, and other displayable values. They must not execute as HTML/JavaScript.

---

# 57. CSRF Testing

For cookie-authenticated state-changing requests, verify the selected CSRF defense rejects missing and invalid protections.

---

# 58. Rate-Limit Testing

Test threshold, 429 response, recovery, and scope for sensitive routes such as login, challenge submission, execution, and account-security operations.

---

# 59. Session Security Testing

Test expiry, rotation, logout, revocation, invalid tokens, and deleted-account session invalidation. Raw session tokens must never be logged.

---

# 60. Accessibility Testing

Accessibility is a functional quality requirement covering keyboard, focus, semantics, labels, contrast, reduced motion, and screen-reader discoverability.

---

# 61. Keyboard Accessibility

Verify all critical controls work without a mouse. Test Tab, Shift+Tab, Enter, Space, Escape, and relevant arrow/navigation keys.

---

# 62. Focus & Screen Reader Testing

Verify modal focus, route focus, error discoverability, accessible names, roles, states, and relationships. Visualization state needs a useful textual interpretation.

---

# 63. Reduced Motion Testing

When reduced motion is enabled, animations must shorten/disable without removing the underlying execution state or user feedback.

---

# 64. Responsive Testing

Test desktop, tablet, and mobile layouts with special attention to visualizers, playback, code, metrics, graph/tree editors, challenges, and compare workspaces.

---

# 65. Browser Compatibility Testing

Test supported current stable browser configurations for Chrome, Edge, Firefox, and Safari where supported, plus supported mobile configurations.

---

# 66. Visual Regression Testing

Use stable visual snapshots for initial, active, success, error, empty, and loading states. Review snapshot changes rather than blindly updating them.

---

# 67. SEO Testing

Validate public titles, descriptions, canonicals, robots directives, headings, structured data where applicable, Open Graph, crawlable links, and sitemap behavior.

---

# 68. Canonical URL Testing

Every public canonical page must have one preferred URL and consistent self-referencing canonical behavior. Parameterized and duplicate URLs must not produce conflicts.

---

# 69. Sitemap Testing

Only intended public canonical URLs belong in the sitemap. Private, temporary, duplicate, or non-indexable states must be excluded.

---

# 70. robots.txt Testing

Verify private/internal areas are appropriately controlled while public educational pages remain crawlable. robots.txt is never treated as an auth boundary.

---

# 71. Performance Testing Strategy

Measure rather than guess. Track API latency, database latency, execution time, visualization responsiveness, memory, CPU, bundle size, and important page metrics.

Performance is evaluated as a system:

```text
Browser
  ↓
Network
  ↓
API
  ↓
Use Case
  ↓
Core/Service
  ↓
Repository
  ↓
SQL Server
```

---

# 72. API Performance Testing

Load public reads, progress, history, challenge submissions, experiment execution, and comparisons with realistic concurrency. Measure p50/p95/p99 and error rate.

---

# 73. Database Performance Testing

Benchmark progress, history, attempts, experiments, executions, activity, learning paths, favorites, and bookmarks. Review query plans, indexes, rows read, locks, and pool pressure.

---

# 74. Algorithm Performance Testing

Benchmark representative small/medium/large datasets and best/average-like/worst cases for regression detection, without confusing benchmarks with formal complexity proof.

---

# 75. Visualization Performance Testing

Stress large arrays, graphs, trees, matrices, and long traces. Measure render time, step latency, memory, and input responsiveness.

---

# 76. Trace Size / Memory Testing

Test short, medium, long, and maximum traces. Verify response size and memory stay within configured limits and playback remains responsive.

---

# 77. Load Testing

Use realistic traffic mixes for public reads, user-state reads/writes, challenges, experiments, and comparisons. Record throughput, latency, errors, and database pressure.

---

# 78. Performance Regression Testing

Investigate changes that materially increase p95 latency, memory growth, query cost, bundle size, or execution time.

---

# 79. Memory Leak Testing

Repeat playback, reset, execution, navigation, and worker use while observing timers, listeners, animation frames, retained traces, and worker lifecycle.

---

# 80. Cleanup / Unmount Testing

Verify timers, subscriptions, workers, streams, abort controllers, and animation frames are cleaned up when components unmount or executions end.

---

# 81. Navigation During Execution Testing

Start an execution, navigate away, and verify the selected cancellation/background policy is respected with no stale component updates.

---

# 82. Multi-Tab Testing

Test two tabs updating the same experiment/progress/bookmark and verify the concurrency policy prevents silent data loss.

---

# 83. Network Failure Testing

Simulate timeouts, dropped connections, partial responses, reconnects, and server outages. Never show false persistence success.

---

# 84. Loading State Testing

Every async feature must cover initial loading, slow loading, success, failure, and retry behavior.

---

# 85. Empty State Testing

Verify no-history, no-favorites, no-experiments, no-attempts, no-progress, and similar states are informative and actionable.

---

# 86. Error State Testing

Verify invalid input, permission denial, missing resources, database outage, execution errors, timeouts, conflicts, and rate limits render the intended state.

---

# 87. Educational Correctness Testing

Validate that explanations, pseudocode, code, complexity, examples, traces, visualizations, and challenges describe the same algorithmic behavior.

---

# 88. Content QA

Every algorithm/data structure content package must contain required educational sections and valid references. Missing content must fail validation before release.

---

# 89. Trace-to-Explanation Consistency

The explanation associated with a step must accurately describe the actual trace event. Automated consistency is preferred wherever explanation references are structured.

---

# 90. Challenge Correctness Testing

Each challenge needs an unambiguous task, valid expected behavior, correct evaluator, correct scoring, correct feedback, and bounded inputs.

---

# 91. Randomized Challenge Testing

Seeded generation must reproduce the same challenge when reproducibility is intended. Generated challenges must pass schema and semantic validation.

---

# 92. Data Integrity Testing

Verify that progress, attempts, favorites, experiments, executions, achievements, and versions reference valid parents and cannot enter impossible states.

---

# 93. Database Integrity Checks

Automated checks should detect orphan rows, duplicate logical records, invalid content versions, impossible statuses, and counter drift.

---

# 94. Test Data Strategy

Test data must be deterministic, minimal, representative, isolated, readable, and easy to reset.

---

# 95. Fixtures and Mocks

Use focused fixtures for algorithms, graphs, trees, users, challenges, and experiments. Mock external systems where necessary, but do not mock away database constraints or core algorithm behavior.

---

# 96. Test Database Isolation

Use a dedicated test database or equivalent isolated SQL environment. Tests must not depend on shared developer data.

---

# 97. Test Cleanup Strategy

Clean up test state through transaction rollback or deterministic database reset. Shared environments must never accumulate test accounts and experiments indefinitely.

---

# 98. Regression Testing

Every important defect should result in a permanent regression test where practical.

---

# 99. Bug-to-Regression-Test Process

Reproduce the bug, write the failing test, implement the fix, keep the regression test, and include it in the relevant CI suite.

---

# 100. Bug Severity / Priority Levels

P0: critical data/security/outage issue. P1: high-impact functional or core correctness issue. P2: medium product defect. P3: low-impact polish or enhancement.

---

# 101. Flaky Test Management

Flaky tests are defects in the test system. Do not normalize rerunning until green. Quarantine only temporarily with ownership and a fix plan.

---

# 102. Dependency Security Testing

Scan dependencies for known vulnerabilities, evaluate severity and exploitability, patch responsibly, and rerun the test suite after updates.

---

# 103. Supply-Chain Testing

Review meaningful dependency additions and lockfile changes for unexpected packages, install scripts, abandoned libraries, and unnecessary privileges.

---

# 104. CI Testing Pipeline

Recommended flow: install -> audit -> typecheck -> lint -> unit -> core -> visualization -> integration -> build -> E2E -> security/reporting.

```text
Checkout
   ↓
Install
   ↓
Dependency Audit
   ↓
Typecheck
   ↓
Lint
   ↓
Unit
   ↓
Core Algorithms
   ↓
Execution / Visualization
   ↓
Integration
   ↓
Build
   ↓
E2E
   ↓
Security / Reports
```

---

# 105. CI Failure Rules

Required CI gates block protected-branch merge. Tests must not be skipped simply to obtain a green pipeline.

---

# 106. Pull Request Quality Gates

Before merge, verify code correctness, tests, API contracts, migrations, security, accessibility, performance impact, and architecture boundaries.

---

# 107. Definition of Done

A feature is complete only when implementation, validation, loading/empty/error states, security, tests, documentation, migrations/contracts, accessibility review, performance review, and CI are complete.

---

# 108. Manual QA Strategy

Manual QA is required for educational clarity, animation quality, visualization understanding, touch interactions, assistive-technology behavior, and responsive layout.

---

# 109. Release QA Process

Release candidate -> regression -> security -> performance smoke -> accessibility/SEO smoke -> migration validation -> production deployment -> production verification.

---

# 110. Production Readiness Testing

Before production, verify build, health, database readiness, authentication, public content, algorithm execution, challenges, progress, experiments, monitoring, and error reporting.

---

# 111. Testing Responsibility by Layer

Core engineering owns algorithm/engine correctness; frontend owns component/visualization behavior; backend owns API/database behavior; security and QA provide cross-cutting verification; no team owns only one test layer.

---

# 112. Test Folder / File Organization

Tests must mirror architecture: unit/core/features/server; integration/api/database/repositories/use-cases; visualization by renderer type; E2E by user journey; fixtures, mocks, and helpers separate.

---

# 113. Test Naming Conventions

Test names must describe behavior, such as “should preserve duplicate elements during sorting” or “should reject experiment update from non-owner.” Avoid vague names such as test1 or works.

---

# 114. Test Coverage Strategy

Coverage is a signal, not the only quality metric. Prioritize high coverage for core algorithms, execution engine, challenge evaluation, authorization, repositories, critical APIs, and transactional paths.

---

# 115. Coverage Rules and Exceptions

Set numerical baselines after establishing a stable test suite. Exceptions must be explicit; coverage must not be inflated with low-value tests.

---

# 116. Quality Metrics

Track test pass rate, flaky count, regression count, critical defects, security findings, accessibility findings, API error rate, p95 latency, database errors, and release failure rate.

---

# 117. Performance Baselines

Store representative baselines for API, database, algorithm execution, visualizer interaction, critical E2E flows, and bundle size. Investigate material regressions before release.

---

# 118. Security Regression Process

Every confirmed security defect should create a permanent security regression test and trigger documentation/root-cause review.

---

# 119. Migration Validation Process

Before production migration: backup -> staging migration -> schema checks -> data checks -> integration tests -> E2E checks -> production migration -> production verification.

---

# 120. Complete Testing Matrix

Maintain a matrix mapping each feature and endpoint to unit, integration, E2E, security, accessibility, performance, and manual QA responsibilities.

---

# 121. Complete QA Checklist

Use a release-wide checklist covering static analysis, core correctness, execution/visualization, API, database, security, accessibility, SEO, performance, and E2E.

```text
CORE
[ ] Algorithm correctness
[ ] Data-structure correctness
[ ] Trace correctness
[ ] Metrics correctness

VISUALIZATION
[ ] Initial state
[ ] Step state
[ ] Playback
[ ] Large input
[ ] Reduced motion

BACKEND
[ ] API contract
[ ] Authentication
[ ] Authorization
[ ] Validation
[ ] Errors

DATABASE
[ ] Constraints
[ ] Transactions
[ ] Concurrency
[ ] Migrations

SECURITY
[ ] Injection
[ ] XSS
[ ] CSRF
[ ] IDOR/BOLA
[ ] Rate limits

ACCESSIBILITY
[ ] Keyboard
[ ] Focus
[ ] Semantics
[ ] Screen reader

SEO
[ ] Metadata
[ ] Canonical
[ ] Sitemap
[ ] Robots

PERFORMANCE
[ ] API
[ ] Database
[ ] Algorithm execution
[ ] Visualization

RELEASE
[ ] Build
[ ] E2E
[ ] Monitoring
[ ] Backup
[ ] Rollback
```

---

# 122. Pre-Merge Checklist

Typecheck, lint, tests, migration review, API contract review, security review, accessibility review, performance consideration, and architecture-boundary validation must pass.

---

# 123. Pre-Release Checklist

Release candidate must have green CI, tested migrations, production build, critical E2E, security checks, performance smoke, accessibility smoke, SEO smoke, verified backup, and rollback planning.

---

# 124. Production Verification Checklist

After deployment verify application start, health, database readiness, public pages, login, protected APIs, algorithm execution, challenge retrieval, progress, experiment reads, logs, and monitoring.

---

# 125. Final Definition of Quality for LogicLab

LogicLab quality means correct result + correct state + correct explanation + correct persistence + correct security + acceptable performance. A feature that computes correctly but visualizes incorrectly, stores incorrect progress, leaks data, or teaches the wrong concept is not considered correct.

## Final Quality Equation

```text
               CORRECTNESS
                    +
                 SECURITY
                    +
              RELIABILITY
                    +
               PERFORMANCE
                    +
             ACCESSIBILITY
                    +
       EDUCATIONAL ACCURACY
                    =
              LOGICLAB QUALITY
```

## Final Principle

> LogicLab is correct only when the computation, execution trace, visualization, explanation, persistence, security model, and user experience all agree about what happened.


---

# Cross-Cutting Quality Policies

## A. Core Correctness Contract

Every algorithm implementation should expose enough deterministic behavior to test:

```text
input
→ execution
→ output
→ trace
→ metrics
```

The UI must never be the authority for algorithm correctness.

## B. Single Source of Algorithm Truth

There must be one canonical algorithm implementation in `src/core/algorithms/implementations/`.

Visualizer, challenge, experiment, and comparison systems must call the same implementation or the same core execution contract.

Duplicate copies of algorithm logic are prohibited.

## C. Test Every Supported Algorithm Before Exposure

An algorithm should not become visible in the public registry until:

```text
implementation exists
content exists
execution trace works
metrics work
visualization works
unit tests pass
content validation passes
```

## D. Test Content and Engine Together

Content references such as:

```text
algorithm slug
visualization type
action names
complexity labels
code-step references
```

must match actual engine capabilities.

## E. Test Data Ownership

Every dynamic record must be attributable to a user where appropriate.

A read path must answer:

```text
Who owns this record?
Can this caller see it?
Can this caller modify it?
```

## F. Test Server Trust Boundaries

Never trust:

```text
client score
client role
client userId
client completion flag
client achievement claim
client ownership
client execution limits
```

The server recalculates or validates all security-sensitive values.

## G. Test Failure, Not Only Success

Every critical feature must intentionally exercise:

```text
invalid input
missing resource
permission failure
database failure
timeout
cancellation
concurrency conflict
```

## H. Test Recovery

For recoverable failures, verify the user can retry without creating duplicate or inconsistent state.

## I. Test Boundaries Before Optimizing Internals

When a failure occurs, inspect the boundary first:

```text
request → validation
validation → use case
use case → repository
repository → database
execution → visualization
```

Many production defects happen at boundaries rather than inside isolated functions.

## J. Keep Tests Atomic

Tests should follow the same principle as production code:

```text
one responsibility
clear fixture
clear expectation
small failure surface
```

Avoid giant test files containing unrelated behaviors.

## K. 400-Line Rule Applies to Test Code

The LogicLab file-size rule from MD-09 applies to test code as well.

```text
≤ 400 lines absolute maximum
```

Preferred test files should remain substantially smaller by organizing tests by feature/responsibility.

## L. Test Review Checklist for New Algorithms

```text
[ ] implementation
[ ] deterministic behavior
[ ] edge cases
[ ] property/invariant tests if useful
[ ] trace tests
[ ] metric tests
[ ] visualization mapping
[ ] educational content validation
[ ] challenge compatibility
[ ] performance smoke
[ ] resource-limit test
[ ] regression coverage
```

## M. Test Review Checklist for New APIs

```text
[ ] endpoint defined
[ ] request schema
[ ] response schema
[ ] auth
[ ] ownership
[ ] validation
[ ] errors
[ ] rate limit
[ ] idempotency
[ ] transaction boundary
[ ] concurrency
[ ] unit/integration tests
[ ] E2E if user-critical
```

## N. Test Review Checklist for New Database Features

```text
[ ] migration
[ ] PK
[ ] FK
[ ] unique constraints
[ ] check constraints
[ ] indexes
[ ] transaction behavior
[ ] concurrency behavior
[ ] cleanup/retention
[ ] repository tests
[ ] migration tests
```

## O. Test Review Checklist for New Visualizers

```text
[ ] model contract
[ ] renderer
[ ] states
[ ] transition correctness
[ ] initial state
[ ] success state
[ ] error state
[ ] empty state
[ ] large input
[ ] keyboard
[ ] reduced motion
[ ] visual regression
[ ] accessibility
```

## P. Regression Test Policy

A regression test must be written at the lowest level that reliably reproduces the defect.

Example:

```text
pure algorithm bug
→ unit/core regression

API authorization bug
→ API integration regression

end-to-end navigation bug
→ E2E regression

visual state bug
→ visualization regression
```

Avoid using a slow E2E test to cover a bug that can be proven with a fast unit test.

## Q. Release Quality Gate

No release should be considered ready while a known P0/P1 correctness or security defect remains unresolved unless an explicit release decision accepts the risk.

## R. Quality Is a Continuous Process

Quality is maintained through:

```text
Design
→ implementation
→ tests
→ review
→ CI
→ staging
→ release
→ monitoring
→ regression tests
```

It is not a phase performed only before production.
