# LogicLab — Folder Structure & Code Organization Specification

**Document ID:** LL-ARCH-009  
**Project:** LogicLab  
**Document Type:** Architecture / Engineering Standard  
**Status:** Approved Foundation Specification  
**Primary Goal:** Define the exact location, ownership, naming, dependency, and growth rules for every major type of LogicLab source code, static content, server logic, database code, tests, configuration, and project infrastructure.

---

# 1. Document Purpose

This document is the single source of truth for LogicLab's repository structure and code organization.

Its purpose is to prevent the project from becoming a large collection of unrelated files where developers cannot answer basic questions such as:

- Where should a new algorithm implementation live?
- Where should the educational explanation for that algorithm live?
- Where should visualization-specific code live?
- Where should API business logic live?
- Where should SQL access live?
- Where should a feature's React state live?
- Where should shared types live?
- Where should tests for a particular feature live?
- Which layer is allowed to import another layer?
- What happens when a source file approaches 400 lines?
- How is a new feature added without breaking architectural boundaries?

The structure defined here is intentionally **atomic, modular, feature-aware, and scalable**.

LogicLab is expected to grow over time from a small educational application into a large interactive learning platform containing many algorithms, data structures, visualizations, challenges, experiments, user progress systems, and server-side features. The folder structure therefore has to support growth without repeatedly requiring architectural rewrites.

---

# 2. Folder Structure Philosophy

LogicLab follows these core principles:

1. **One responsibility per file.**
2. **One clear responsibility per folder.**
3. **Feature-specific code stays close to the feature.**
4. **Pure algorithm logic stays independent from UI.**
5. **Static educational content stays separate from executable logic.**
6. **Database access is isolated behind server-side abstractions.**
7. **API routes remain thin composition layers.**
8. **Shared code is shared only when it is genuinely cross-cutting.**
9. **Large generic utility folders are avoided.**
10. **A source file must never exceed 400 physical lines.**
11. **Domain types should live near the domain whenever practical.**
12. **Tests mirror the architecture they validate.**
13. **Workers only depend on code that is safe to execute away from the UI thread.**
14. **Content is validated before reaching production.**
15. **The repository should make the correct architectural choice obvious.**

The objective is not to create as many folders as possible. The objective is to make ownership and responsibility obvious.

---

# 3. Atomic Architecture Principles

## 3.1 Atomic means single responsibility

An atomic file should have one understandable reason to change.

Good examples:

```text
clamp.ts
slugify.ts
format-duration.ts
bubble-sort.ts
bubble-sort.steps.ts
comparison-counter.ts
login-user.ts
progress-repository.ts
```

Each file has a narrow role.

Bad examples:

```text
utils.ts
helpers.ts
common.ts
misc.ts
algorithm-service.ts
all-validations.ts
all-api.ts
all-types.ts
```

These files become dumping grounds.

## 3.2 Atomic does not mean microscopic

The rule is not "one function per file".

A file may contain several closely related declarations when they represent one coherent responsibility.

For example, a component file may contain:

- its component;
- tiny local helper types;
- tiny local rendering helpers.

It should not contain unrelated components, API logic, SQL queries, and state management.

## 3.3 Feature locality

When code only exists to support one feature, it should live inside that feature.

Example:

```text
src/features/visualizer/
```

should contain visualizer-specific UI, state, hooks, and feature logic.

It should not be promoted into a global folder merely because it is used in one visualizer.

## 3.4 Shared code requires proof of sharing

A piece of code should enter a global/shared location only when:

- it is genuinely reused;
- its responsibility is independent of one feature;
- moving it to shared space improves clarity;
- the move does not create a circular dependency.

Do not create shared abstractions merely because two files currently look similar.

---

# 4. 400-Line Maximum Rule

## 4.1 Absolute maximum

No source file may exceed **400 physical lines**.

The 400-line limit includes:

- executable code;
- declarations;
- comments;
- blank lines;
- imports;
- type definitions;
- configuration declarations.

A file at 401 lines is an architecture violation.

## 4.2 Preferred file size

```text
0–100 lines       Small / ideal for focused units
101–250 lines     Healthy
251–350 lines     Review recommended
351–399 lines     Refactor strongly recommended
400 lines         Absolute ceiling
401+ lines        Not allowed
```

The 400-line rule is a ceiling, not a target.

## 4.3 When a file grows too large

Split the file by responsibility rather than randomly moving blocks.

Example:

```text
❌ Bad

AlgorithmVisualizer.tsx
600 lines
```

Better:

```text
features/visualizer/
├── components/
│   ├── VisualizationCanvas.tsx
│   ├── VisualizationToolbar.tsx
│   ├── PlaybackControls.tsx
│   ├── Timeline.tsx
│   ├── ExplanationPanel.tsx
│   ├── MetricsPanel.tsx
│   └── ComplexityPanel.tsx
│
├── hooks/
│   ├── useVisualizer.ts
│   └── usePlayback.ts
│
└── state/
    ├── visualizer-state.ts
    ├── playback-state.ts
    └── visualization-state.ts
```

## 4.4 Automated enforcement

The final development environment should provide automated checks for file length. The exact implementation can be selected during setup, but the architectural rule itself is mandatory.

---

# 5. Preferred File Size Guidelines

LogicLab should favor small, readable files.

Typical guidance:

```text
UI component                 30–200 lines
Hook                         20–150 lines
Pure utility                 5–100 lines
Algorithm implementation     50–250 lines
Step builder                 20–250 lines
Use case                     30–200 lines
Repository                   30–250 lines
API route                    10–100 lines
Validation module            10–150 lines
Configuration module         10–150 lines
Content definition           10–250 lines
Test file                    30–300 lines
```

These are guidelines. The 400-line maximum remains mandatory.

---

# 6. Single Responsibility Rule

Each file and folder must answer one clear question.

Examples:

```text
What executes Bubble Sort?
→ core/algorithms/implementations/sorting/bubble-sort/

What explains Bubble Sort?
→ content/algorithms/sorting/bubble-sort/

What displays Bubble Sort?
→ features/visualizer/

What stores user progress?
→ server/database/repositories/

What defines API request/response contracts?
→ contracts/api/
```

When a developer has to inspect five unrelated folders to understand one responsibility, the abstraction should be reviewed.

---

# 7. Complete Project Folder Tree

The following structure is the approved baseline for LogicLab.

```text
logiclab/
│
├── .github/
│   ├── workflows/
│   │   ├── ci.yml
│   │   ├── test.yml
│   │   ├── e2e.yml
│   │   └── security.yml
│   │
│   ├── ISSUE_TEMPLATE/
│   │   ├── bug-report.md
│   │   ├── feature-request.md
│   │   └── algorithm-request.md
│   │
│   └── PULL_REQUEST_TEMPLATE.md
│
├── .husky/
│   ├── pre-commit
│   └── pre-push
│
├── database/
│   ├── schema/
│   │   ├── users.sql
│   │   ├── progress.sql
│   │   ├── history.sql
│   │   ├── favorites.sql
│   │   ├── challenges.sql
│   │   ├── challenge-attempts.sql
│   │   ├── experiments.sql
│   │   ├── bookmarks.sql
│   │   ├── achievements.sql
│   │   ├── learning-paths.sql
│   │   └── settings.sql
│   │
│   ├── migrations/
│   │   ├── 001_initial_schema.sql
│   │   ├── 002_progress.sql
│   │   ├── 003_history.sql
│   │   ├── 004_favorites.sql
│   │   ├── 005_challenges.sql
│   │   ├── 006_experiments.sql
│   │   ├── 007_bookmarks.sql
│   │   ├── 008_achievements.sql
│   │   ├── 009_learning_paths.sql
│   │   └── 010_settings.sql
│   │
│   ├── seeds/
│   │   ├── development/
│   │   │   ├── users.sql
│   │   │   ├── progress.sql
│   │   │   └── sample-data.sql
│   │   │
│   │   ├── testing/
│   │   │   ├── users.sql
│   │   │   └── sample-data.sql
│   │   │
│   │   └── demo/
│   │       ├── users.sql
│   │       └── sample-data.sql
│   │
│   ├── scripts/
│   │   ├── reset-database.sql
│   │   ├── verify-schema.sql
│   │   └── verify-migrations.sql
│   │
│   └── README.md
│
├── docs/
│   ├── architecture/
│   ├── algorithms/
│   ├── database/
│   ├── development/
│   ├── deployment/
│   ├── security/
│   └── testing/
│
├── public/
│   ├── icons/
│   ├── images/
│   ├── logos/
│   └── fonts/
│
├── scripts/
│   ├── database/
│   │   ├── migrate.ts
│   │   ├── seed.ts
│   │   └── reset.ts
│   │
│   ├── content/
│   │   ├── validate-content.ts
│   │   ├── validate-algorithms.ts
│   │   ├── validate-data-structures.ts
│   │   ├── validate-challenges.ts
│   │   └── validate-links.ts
│   │
│   └── build/
│       ├── validate-build.ts
│       └── generate-metadata.ts
│
├── tests/
│   ├── unit/
│   │   ├── core/
│   │   │   ├── algorithms/
│   │   │   ├── data-structures/
│   │   │   ├── graph/
│   │   │   ├── execution/
│   │   │   ├── challenges/
│   │   │   └── visualization/
│   │   │
│   │   ├── features/
│   │   │   ├── algorithms/
│   │   │   ├── data-structures/
│   │   │   ├── visualizer/
│   │   │   ├── challenges/
│   │   │   ├── compare/
│   │   │   ├── experiments/
│   │   │   ├── progress/
│   │   │   ├── history/
│   │   │   ├── favorites/
│   │   │   ├── learning/
│   │   │   └── settings/
│   │   │
│   │   ├── server/
│   │   │   ├── use-cases/
│   │   │   ├── services/
│   │   │   ├── security/
│   │   │   └── validation/
│   │   │
│   │   └── utilities/
│   │
│   ├── integration/
│   │   ├── api/
│   │   ├── database/
│   │   ├── repositories/
│   │   ├── services/
│   │   └── use-cases/
│   │
│   ├── visualization/
│   │   ├── array/
│   │   ├── graph/
│   │   ├── tree/
│   │   ├── stack/
│   │   ├── queue/
│   │   ├── linked-list/
│   │   ├── hash-table/
│   │   └── grid/
│   │
│   ├── e2e/
│   │   ├── navigation/
│   │   ├── algorithms/
│   │   ├── data-structures/
│   │   ├── visualizers/
│   │   ├── challenges/
│   │   ├── compare/
│   │   ├── experiments/
│   │   └── learning/
│   │
│   ├── fixtures/
│   │   ├── algorithms/
│   │   ├── arrays/
│   │   ├── graphs/
│   │   ├── trees/
│   │   ├── challenges/
│   │   ├── experiments/
│   │   └── users/
│   │
│   ├── mocks/
│   │   ├── api/
│   │   ├── database/
│   │   ├── content/
│   │   └── services/
│   │
│   └── helpers/
│       ├── render.tsx
│       ├── create-test-user.ts
│       ├── create-test-experiment.ts
│       ├── create-test-challenge.ts
│       └── reset-test-database.ts
│
├── src/
│   │
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── loading.tsx
│   │   ├── error.tsx
│   │   ├── not-found.tsx
│   │   │
│   │   ├── (public)/
│   │   │   ├── page.tsx
│   │   │   │
│   │   │   ├── algorithms/
│   │   │   │   ├── page.tsx
│   │   │   │   └── [algorithmSlug]/
│   │   │   │       ├── page.tsx
│   │   │   │       ├── loading.tsx
│   │   │   │       └── error.tsx
│   │   │   │
│   │   │   ├── data-structures/
│   │   │   │   ├── page.tsx
│   │   │   │   └── [structureSlug]/
│   │   │   │       ├── page.tsx
│   │   │   │       ├── loading.tsx
│   │   │   │       └── error.tsx
│   │   │   │
│   │   │   ├── visualizer/
│   │   │   │   └── [algorithmSlug]/
│   │   │   │       └── page.tsx
│   │   │   │
│   │   │   ├── playground/
│   │   │   │   ├── page.tsx
│   │   │   │   ├── graph/
│   │   │   │   │   └── page.tsx
│   │   │   │   └── tree/
│   │   │   │       └── page.tsx
│   │   │   │
│   │   │   ├── challenges/
│   │   │   │   ├── page.tsx
│   │   │   │   └── [challengeId]/
│   │   │   │       └── page.tsx
│   │   │   │
│   │   │   └── compare/
│   │   │       └── page.tsx
│   │   │
│   │   ├── (workspace)/
│   │   │   ├── progress/
│   │   │   │   └── page.tsx
│   │   │   ├── history/
│   │   │   │   └── page.tsx
│   │   │   ├── favorites/
│   │   │   │   └── page.tsx
│   │   │   ├── learning/
│   │   │   │   └── page.tsx
│   │   │   ├── experiments/
│   │   │   │   └── page.tsx
│   │   │   └── settings/
│   │   │       └── page.tsx
│   │   │
│   │   └── api/
│   │       ├── algorithms/
│   │       │   ├── route.ts
│   │       │   └── [algorithmSlug]/
│   │       │       └── route.ts
│   │       ├── data-structures/
│   │       │   ├── route.ts
│   │       │   └── [structureSlug]/
│   │       │       └── route.ts
│   │       ├── execution/
│   │       │   └── route.ts
│   │       ├── challenges/
│   │       │   ├── route.ts
│   │       │   └── [challengeId]/
│   │       │       ├── route.ts
│   │       │       └── submit/
│   │       │           └── route.ts
│   │       ├── progress/
│   │       │   └── route.ts
│   │       ├── history/
│   │       │   └── route.ts
│   │       ├── favorites/
│   │       │   └── route.ts
│   │       ├── experiments/
│   │       │   ├── route.ts
│   │       │   └── [experimentId]/
│   │       │       └── route.ts
│   │       ├── bookmarks/
│   │       │   └── route.ts
│   │       ├── learning-paths/
│   │       │   └── route.ts
│   │       ├── auth/
│   │       │   ├── login/
│   │       │   │   └── route.ts
│   │       │   ├── logout/
│   │       │   │   └── route.ts
│   │       │   ├── register/
│   │       │   │   └── route.ts
│   │       │   └── session/
│   │       │       └── route.ts
│   │       └── health/
│   │           └── route.ts
│   │
│   ├── components/
│   │   ├── ui/
│   │   │   ├── button/
│   │   │   │   ├── Button.tsx
│   │   │   │   ├── Button.types.ts
│   │   │   │   └── Button.test.tsx
│   │   │   ├── input/
│   │   │   │   ├── Input.tsx
│   │   │   │   ├── Input.types.ts
│   │   │   │   └── Input.test.tsx
│   │   │   ├── select/
│   │   │   │   ├── Select.tsx
│   │   │   │   ├── Select.types.ts
│   │   │   │   └── Select.test.tsx
│   │   │   ├── checkbox/
│   │   │   ├── radio/
│   │   │   ├── slider/
│   │   │   ├── tabs/
│   │   │   ├── modal/
│   │   │   ├── tooltip/
│   │   │   ├── dropdown/
│   │   │   ├── badge/
│   │   │   ├── card/
│   │   │   ├── progress/
│   │   │   ├── spinner/
│   │   │   ├── alert/
│   │   │   ├── divider/
│   │   │   └── pagination/
│   │   │
│   │   ├── layout/
│   │   │   ├── Header.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   ├── MainContent.tsx
│   │   │   ├── Footer.tsx
│   │   │   └── Breadcrumbs.tsx
│   │   │
│   │   ├── navigation/
│   │   │   ├── NavigationItem.tsx
│   │   │   ├── NavigationGroup.tsx
│   │   │   └── MobileNavigation.tsx
│   │   │
│   │   └── feedback/
│   │       ├── ErrorMessage.tsx
│   │       ├── SuccessMessage.tsx
│   │       ├── EmptyState.tsx
│   │       └── LoadingState.tsx
│   │
│   ├── features/
│   │   ├── algorithms/
│   │   │   ├── catalog/
│   │   │   │   ├── components/
│   │   │   │   ├── hooks/
│   │   │   │   ├── state/
│   │   │   │   └── types/
│   │   │   ├── detail/
│   │   │   │   ├── components/
│   │   │   │   ├── hooks/
│   │   │   │   ├── state/
│   │   │   │   └── types/
│   │   │   ├── favorites/
│   │   │   │   ├── components/
│   │   │   │   ├── hooks/
│   │   │   │   └── state/
│   │   │   └── search/
│   │   │       ├── components/
│   │   │       ├── hooks/
│   │   │       └── state/
│   │   │
│   │   ├── data-structures/
│   │   │   ├── catalog/
│   │   │   ├── detail/
│   │   │   ├── playground/
│   │   │   └── operations/
│   │   │       ├── components/
│   │   │       ├── hooks/
│   │   │       ├── state/
│   │   │       └── types/
│   │   │
│   │   ├── visualizer/
│   │   │   ├── components/
│   │   │   │   ├── VisualizationCanvas.tsx
│   │   │   │   ├── VisualizationToolbar.tsx
│   │   │   │   ├── VisualizationLegend.tsx
│   │   │   │   ├── VisualizationTooltip.tsx
│   │   │   │   ├── VisualizationOverlay.tsx
│   │   │   │   ├── PlaybackControls.tsx
│   │   │   │   ├── Timeline.tsx
│   │   │   │   ├── ExplanationPanel.tsx
│   │   │   │   ├── MetricsPanel.tsx
│   │   │   │   └── ComplexityPanel.tsx
│   │   │   ├── hooks/
│   │   │   │   ├── useVisualizer.ts
│   │   │   │   ├── usePlayback.ts
│   │   │   │   └── useVisualizationSelection.ts
│   │   │   ├── state/
│   │   │   │   ├── visualizer-state.ts
│   │   │   │   ├── playback-state.ts
│   │   │   │   └── visualization-state.ts
│   │   │   └── types/
│   │   │       ├── visualizer.types.ts
│   │   │       └── playback.types.ts
│   │   │
│   │   ├── challenges/
│   │   │   ├── catalog/
│   │   │   │   ├── components/
│   │   │   │   ├── hooks/
│   │   │   │   └── state/
│   │   │   ├── session/
│   │   │   │   ├── components/
│   │   │   │   ├── hooks/
│   │   │   │   └── state/
│   │   │   ├── submission/
│   │   │   │   ├── components/
│   │   │   │   ├── hooks/
│   │   │   │   └── state/
│   │   │   ├── evaluation/
│   │   │   ├── hints/
│   │   │   └── feedback/
│   │   │
│   │   ├── compare/
│   │   │   ├── components/
│   │   │   ├── selection/
│   │   │   ├── execution/
│   │   │   ├── metrics/
│   │   │   └── results/
│   │   │
│   │   ├── experiments/
│   │   │   ├── builder/
│   │   │   ├── execution/
│   │   │   ├── saving/
│   │   │   ├── history/
│   │   │   ├── components/
│   │   │   ├── hooks/
│   │   │   └── state/
│   │   │
│   │   ├── progress/
│   │   │   ├── dashboard/
│   │   │   ├── tracking/
│   │   │   ├── statistics/
│   │   │   ├── components/
│   │   │   └── state/
│   │   │
│   │   ├── history/
│   │   │   ├── list/
│   │   │   ├── filters/
│   │   │   ├── details/
│   │   │   ├── components/
│   │   │   └── state/
│   │   │
│   │   ├── favorites/
│   │   │   ├── list/
│   │   │   ├── actions/
│   │   │   ├── components/
│   │   │   └── state/
│   │   │
│   │   ├── learning/
│   │   │   ├── paths/
│   │   │   ├── recommendations/
│   │   │   ├── achievements/
│   │   │   ├── streaks/
│   │   │   ├── components/
│   │   │   └── state/
│   │   │
│   │   └── settings/
│   │       ├── preferences/
│   │       ├── appearance/
│   │       ├── playback/
│   │       ├── components/
│   │       └── state/
│   │
│   ├── core/
│   │   ├── algorithms/
│   │   │   ├── implementations/
│   │   │   │   ├── sorting/
│   │   │   │   │   ├── bubble-sort/
│   │   │   │   │   │   ├── bubble-sort.ts
│   │   │   │   │   │   └── bubble-sort.steps.ts
│   │   │   │   │   ├── selection-sort/
│   │   │   │   │   │   ├── selection-sort.ts
│   │   │   │   │   │   └── selection-sort.steps.ts
│   │   │   │   │   ├── insertion-sort/
│   │   │   │   │   │   ├── insertion-sort.ts
│   │   │   │   │   │   └── insertion-sort.steps.ts
│   │   │   │   │   ├── merge-sort/
│   │   │   │   │   │   ├── merge-sort.ts
│   │   │   │   │   │   └── merge-sort.steps.ts
│   │   │   │   │   ├── quick-sort/
│   │   │   │   │   │   ├── quick-sort.ts
│   │   │   │   │   │   └── quick-sort.steps.ts
│   │   │   │   │   ├── heap-sort/
│   │   │   │   │   │   ├── heap-sort.ts
│   │   │   │   │   │   └── heap-sort.steps.ts
│   │   │   │   │   ├── counting-sort/
│   │   │   │   │   │   ├── counting-sort.ts
│   │   │   │   │   │   └── counting-sort.steps.ts
│   │   │   │   │   ├── radix-sort/
│   │   │   │   │   │   ├── radix-sort.ts
│   │   │   │   │   │   └── radix-sort.steps.ts
│   │   │   │   │   └── shell-sort/
│   │   │   │   │       ├── shell-sort.ts
│   │   │   │   │       └── shell-sort.steps.ts
│   │   │   │   │
│   │   │   │   ├── searching/
│   │   │   │   │   ├── linear-search/
│   │   │   │   │   │   ├── linear-search.ts
│   │   │   │   │   │   └── linear-search.steps.ts
│   │   │   │   │   ├── binary-search/
│   │   │   │   │   │   ├── binary-search.ts
│   │   │   │   │   │   └── binary-search.steps.ts
│   │   │   │   │   ├── jump-search/
│   │   │   │   │   │   ├── jump-search.ts
│   │   │   │   │   │   └── jump-search.steps.ts
│   │   │   │   │   └── interpolation-search/
│   │   │   │   │       ├── interpolation-search.ts
│   │   │   │   │       └── interpolation-search.steps.ts
│   │   │   │   │
│   │   │   │   ├── graphs/
│   │   │   │   │   ├── bfs/
│   │   │   │   │   │   ├── bfs.ts
│   │   │   │   │   │   └── bfs.steps.ts
│   │   │   │   │   ├── dfs/
│   │   │   │   │   │   ├── dfs.ts
│   │   │   │   │   │   └── dfs.steps.ts
│   │   │   │   │   ├── dijkstra/
│   │   │   │   │   │   ├── dijkstra.ts
│   │   │   │   │   │   └── dijkstra.steps.ts
│   │   │   │   │   ├── a-star/
│   │   │   │   │   │   ├── a-star.ts
│   │   │   │   │   │   └── a-star.steps.ts
│   │   │   │   │   ├── bellman-ford/
│   │   │   │   │   │   ├── bellman-ford.ts
│   │   │   │   │   │   └── bellman-ford.steps.ts
│   │   │   │   │   ├── floyd-warshall/
│   │   │   │   │   │   ├── floyd-warshall.ts
│   │   │   │   │   │   └── floyd-warshall.steps.ts
│   │   │   │   │   ├── kruskal/
│   │   │   │   │   │   ├── kruskal.ts
│   │   │   │   │   │   └── kruskal.steps.ts
│   │   │   │   │   ├── prim/
│   │   │   │   │   │   ├── prim.ts
│   │   │   │   │   │   └── prim.steps.ts
│   │   │   │   │   └── topological-sort/
│   │   │   │   │       ├── topological-sort.ts
│   │   │   │   │       └── topological-sort.steps.ts
│   │   │   │   │
│   │   │   │   └── trees/
│   │   │   │       ├── bst-search/
│   │   │   │       │   ├── bst-search.ts
│   │   │   │       │   └── bst-search.steps.ts
│   │   │   │       ├── bst-insert/
│   │   │   │       │   ├── bst-insert.ts
│   │   │   │       │   └── bst-insert.steps.ts
│   │   │   │       ├── bst-delete/
│   │   │   │       │   ├── bst-delete.ts
│   │   │   │       │   └── bst-delete.steps.ts
│   │   │   │       ├── avl-rotation/
│   │   │   │       │   ├── avl-rotation.ts
│   │   │   │       │   └── avl-rotation.steps.ts
│   │   │   │       └── tree-traversal/
│   │   │   │           ├── tree-traversal.ts
│   │   │   │           └── tree-traversal.steps.ts
│   │   │   │
│   │   │   ├── contracts/
│   │   │   │   ├── algorithm.ts
│   │   │   │   ├── algorithm-input.ts
│   │   │   │   ├── algorithm-output.ts
│   │   │   │   └── algorithm-step.ts
│   │   │   │
│   │   │   ├── registry/
│   │   │   │   ├── algorithm-registry.ts
│   │   │   │   ├── algorithm-category-registry.ts
│   │   │   │   └── algorithm-loader.ts
│   │   │   │
│   │   │   ├── execution/
│   │   │   │   ├── run-algorithm.ts
│   │   │   │   ├── create-execution-context.ts
│   │   │   │   └── validate-algorithm-input.ts
│   │   │   │
│   │   │   ├── tracing/
│   │   │   │   ├── create-step.ts
│   │   │   │   ├── create-event.ts
│   │   │   │   └── trace-builder.ts
│   │   │   │
│   │   │   ├── metrics/
│   │   │   │   ├── comparison-counter.ts
│   │   │   │   ├── swap-counter.ts
│   │   │   │   ├── write-counter.ts
│   │   │   │   └── operation-metrics.ts
│   │   │   │
│   │   │   ├── complexity/
│   │   │   │   ├── complexity-model.ts
│   │   │   │   ├── complexity-calculator.ts
│   │   │   │   └── complexity-label.ts
│   │   │   │
│   │   │   └── comparison/
│   │   │       ├── comparison-runner.ts
│   │   │       ├── comparison-result.ts
│   │   │       └── comparison-metrics.ts
│   │   │
│   │   ├── data-structures/
│   │   │   ├── contracts/
│   │   │   ├── array/
│   │   │   ├── linked-list/
│   │   │   ├── stack/
│   │   │   ├── queue/
│   │   │   ├── tree/
│   │   │   ├── heap/
│   │   │   ├── hash-table/
│   │   │   └── trie/
│   │   │
│   │   ├── graph/
│   │   │   ├── contracts/
│   │   │   ├── graph-model/
│   │   │   ├── node/
│   │   │   ├── edge/
│   │   │   ├── traversal/
│   │   │   └── pathfinding/
│   │   │
│   │   ├── input/
│   │   │   ├── parsers/
│   │   │   │   ├── array-parser.ts
│   │   │   │   ├── graph-parser.ts
│   │   │   │   ├── tree-parser.ts
│   │   │   │   └── matrix-parser.ts
│   │   │   │
│   │   │   ├── validators/
│   │   │   │   ├── array-validator.ts
│   │   │   │   ├── graph-validator.ts
│   │   │   │   ├── tree-validator.ts
│   │   │   │   └── matrix-validator.ts
│   │   │   │
│   │   │   ├── generators/
│   │   │   │   ├── array-generator.ts
│   │   │   │   ├── graph-generator.ts
│   │   │   │   ├── tree-generator.ts
│   │   │   │   └── matrix-generator.ts
│   │   │   │
│   │   │   ├── random/
│   │   │   │   ├── random-number.ts
│   │   │   │   ├── random-seed.ts
│   │   │   │   └── random-choice.ts
│   │   │   │
│   │   │   └── scenarios/
│   │   │       ├── sorting-scenarios.ts
│   │   │       ├── graph-scenarios.ts
│   │   │       └── tree-scenarios.ts
│   │   │
│   │   ├── execution/
│   │   │   ├── execution-engine.ts
│   │   │   ├── execution-step.ts
│   │   │   ├── execution-state.ts
│   │   │   ├── execution-event.ts
│   │   │   ├── execution-result.ts
│   │   │   ├── execution-context.ts
│   │   │   ├── execution-controller.ts
│   │   │   └── execution-limits.ts
│   │   │
│   │   ├── challenges/
│   │   │   ├── contracts/
│   │   │   ├── evaluation/
│   │   │   ├── scoring/
│   │   │   ├── hints/
│   │   │   └── prediction/
│   │   │
│   │   └── visualization/
│   │       ├── contracts/
│   │       │   ├── visualization.ts
│   │       │   ├── visualization-state.ts
│   │       │   └── renderer.ts
│   │       ├── models/
│   │       │   ├── array-model.ts
│   │       │   ├── graph-model.ts
│   │       │   ├── tree-model.ts
│   │       │   └── grid-model.ts
│   │       ├── states/
│   │       │   ├── default-state.ts
│   │       │   ├── active-state.ts
│   │       │   ├── comparing-state.ts
│   │       │   ├── sorted-state.ts
│   │       │   ├── visited-state.ts
│   │       │   └── target-state.ts
│   │       ├── adapters/
│   │       │   ├── array-adapter.ts
│   │       │   ├── graph-adapter.ts
│   │       │   ├── tree-adapter.ts
│   │       │   └── grid-adapter.ts
│   │       ├── registries/
│   │       │   ├── renderer-registry.ts
│   │       │   └── visualization-registry.ts
│   │       └── renderers/
│   │           ├── array/
│   │           ├── graph/
│   │           ├── tree/
│   │           ├── stack/
│   │           ├── queue/
│   │           ├── linked-list/
│   │           ├── hash-table/
│   │           └── grid/
│   │
│   ├── content/
│   │   ├── registry/
│   │   │   ├── algorithm-registry.ts
│   │   │   ├── data-structure-registry.ts
│   │   │   ├── challenge-registry.ts
│   │   │   └── learning-path-registry.ts
│   │   │
│   │   ├── algorithms/
│   │   │   ├── sorting/
│   │   │   │   ├── bubble-sort/
│   │   │   │   │   ├── metadata.ts
│   │   │   │   │   ├── explanation.ts
│   │   │   │   │   ├── pseudocode.ts
│   │   │   │   │   ├── complexity.ts
│   │   │   │   │   ├── examples.ts
│   │   │   │   │   ├── code.ts
│   │   │   │   │   └── visualization.ts
│   │   │   │   ├── selection-sort/
│   │   │   │   ├── insertion-sort/
│   │   │   │   ├── merge-sort/
│   │   │   │   ├── quick-sort/
│   │   │   │   ├── heap-sort/
│   │   │   │   ├── counting-sort/
│   │   │   │   ├── radix-sort/
│   │   │   │   └── shell-sort/
│   │   │   ├── searching/
│   │   │   │   ├── linear-search/
│   │   │   │   ├── binary-search/
│   │   │   │   ├── jump-search/
│   │   │   │   └── interpolation-search/
│   │   │   ├── graphs/
│   │   │   │   ├── bfs/
│   │   │   │   ├── dfs/
│   │   │   │   ├── dijkstra/
│   │   │   │   ├── a-star/
│   │   │   │   ├── bellman-ford/
│   │   │   │   ├── floyd-warshall/
│   │   │   │   ├── kruskal/
│   │   │   │   ├── prim/
│   │   │   │   └── topological-sort/
│   │   │   └── trees/
│   │   │       ├── bst-search/
│   │   │       ├── bst-insert/
│   │   │       ├── bst-delete/
│   │   │       ├── avl-rotation/
│   │   │       └── tree-traversal/
│   │   ├── data-structures/
│   │   │   ├── arrays/
│   │   │   ├── linked-lists/
│   │   │   ├── stacks/
│   │   │   ├── queues/
│   │   │   ├── trees/
│   │   │   ├── heaps/
│   │   │   ├── hash-tables/
│   │   │   └── tries/
│   │   ├── challenges/
│   │   │   ├── sorting/
│   │   │   ├── searching/
│   │   │   ├── graphs/
│   │   │   ├── trees/
│   │   │   └── data-structures/
│   │   ├── learning-paths/
│   │   │   ├── beginner/
│   │   │   ├── intermediate/
│   │   │   └── advanced/
│   │   ├── examples/
│   │   ├── glossary/
│   │   └── related-topics/
│   │
│   ├── server/
│   │   ├── auth/
│   │   │   ├── authentication.ts
│   │   │   ├── session.ts
│   │   │   ├── password.ts
│   │   │   ├── authorization.ts
│   │   │   └── ownership.ts
│   │   ├── use-cases/
│   │   │   ├── auth/
│   │   │   │   ├── register-user.ts
│   │   │   │   ├── login-user.ts
│   │   │   │   ├── logout-user.ts
│   │   │   │   └── get-current-user.ts
│   │   │   ├── algorithms/
│   │   │   │   ├── get-algorithm.ts
│   │   │   │   └── list-algorithms.ts
│   │   │   ├── challenges/
│   │   │   │   ├── get-challenge.ts
│   │   │   │   ├── start-challenge.ts
│   │   │   │   └── submit-challenge.ts
│   │   │   ├── progress/
│   │   │   │   ├── get-progress.ts
│   │   │   │   └── update-progress.ts
│   │   │   ├── history/
│   │   │   │   ├── get-history.ts
│   │   │   │   └── save-history.ts
│   │   │   ├── favorites/
│   │   │   │   ├── add-favorite.ts
│   │   │   │   └── remove-favorite.ts
│   │   │   ├── experiments/
│   │   │   │   ├── save-experiment.ts
│   │   │   │   ├── get-experiment.ts
│   │   │   │   └── delete-experiment.ts
│   │   │   ├── bookmarks/
│   │   │   │   ├── add-bookmark.ts
│   │   │   │   └── remove-bookmark.ts
│   │   │   └── learning/
│   │   │       ├── get-learning-path.ts
│   │   │       └── update-learning-progress.ts
│   │   ├── services/
│   │   │   ├── user/
│   │   │   │   └── user-service.ts
│   │   │   ├── progress/
│   │   │   │   └── progress-service.ts
│   │   │   ├── history/
│   │   │   │   └── history-service.ts
│   │   │   ├── favorites/
│   │   │   │   └── favorite-service.ts
│   │   │   ├── challenges/
│   │   │   │   └── challenge-service.ts
│   │   │   ├── experiments/
│   │   │   │   └── experiment-service.ts
│   │   │   ├── bookmarks/
│   │   │   │   └── bookmark-service.ts
│   │   │   └── learning/
│   │   │       └── learning-path-service.ts
│   │   ├── database/
│   │   │   ├── connection/
│   │   │   │   ├── create-connection.ts
│   │   │   │   ├── close-connection.ts
│   │   │   │   └── connection-config.ts
│   │   │   ├── models/
│   │   │   │   ├── user-model.ts
│   │   │   │   ├── progress-model.ts
│   │   │   │   ├── history-model.ts
│   │   │   │   ├── favorite-model.ts
│   │   │   │   ├── challenge-model.ts
│   │   │   │   ├── experiment-model.ts
│   │   │   │   ├── bookmark-model.ts
│   │   │   │   ├── achievement-model.ts
│   │   │   │   └── learning-path-model.ts
│   │   │   ├── repositories/
│   │   │   │   ├── user-repository.ts
│   │   │   │   ├── progress-repository.ts
│   │   │   │   ├── history-repository.ts
│   │   │   │   ├── favorite-repository.ts
│   │   │   │   ├── challenge-repository.ts
│   │   │   │   ├── experiment-repository.ts
│   │   │   │   ├── bookmark-repository.ts
│   │   │   │   ├── achievement-repository.ts
│   │   │   │   └── learning-path-repository.ts
│   │   │   ├── queries/
│   │   │   │   ├── users/
│   │   │   │   ├── progress/
│   │   │   │   ├── history/
│   │   │   │   ├── favorites/
│   │   │   │   ├── challenges/
│   │   │   │   ├── experiments/
│   │   │   │   ├── bookmarks/
│   │   │   │   └── learning-paths/
│   │   │   ├── commands/
│   │   │   │   ├── users/
│   │   │   │   ├── progress/
│   │   │   │   ├── history/
│   │   │   │   ├── favorites/
│   │   │   │   ├── challenges/
│   │   │   │   ├── experiments/
│   │   │   │   ├── bookmarks/
│   │   │   │   └── learning-paths/
│   │   │   ├── mappers/
│   │   │   │   ├── user-mapper.ts
│   │   │   │   ├── progress-mapper.ts
│   │   │   │   ├── history-mapper.ts
│   │   │   │   └── challenge-mapper.ts
│   │   │   ├── transactions/
│   │   │   │   ├── transaction-manager.ts
│   │   │   │   └── transaction-context.ts
│   │   │   └── adapters/
│   │   │       ├── sql-server-adapter.ts
│   │   │       └── database-client.ts
│   │   ├── api/
│   │   │   ├── request-context.ts
│   │   │   ├── request-parser.ts
│   │   │   ├── response-builder.ts
│   │   │   ├── error-handler.ts
│   │   │   └── rate-limit.ts
│   │   ├── validation/
│   │   │   ├── auth/
│   │   │   ├── challenges/
│   │   │   ├── experiments/
│   │   │   ├── progress/
│   │   │   └── users/
│   │   └── security/
│   │       ├── csrf.ts
│   │       ├── headers.ts
│   │       ├── input-limits.ts
│   │       ├── session-security.ts
│   │       └── ownership.ts
│   │
│   ├── contracts/
│   │   ├── api/
│   │   │   ├── algorithms.ts
│   │   │   ├── data-structures.ts
│   │   │   ├── execution.ts
│   │   │   ├── challenges.ts
│   │   │   ├── progress.ts
│   │   │   ├── history.ts
│   │   │   ├── favorites.ts
│   │   │   ├── experiments.ts
│   │   │   ├── bookmarks.ts
│   │   │   ├── learning-paths.ts
│   │   │   └── auth.ts
│   │   └── events/
│   │       ├── execution-events.ts
│   │       ├── visualization-events.ts
│   │       └── challenge-events.ts
│   │
│   ├── config/
│   │   ├── env.ts
│   │   ├── application.ts
│   │   ├── database.ts
│   │   ├── security.ts
│   │   ├── feature-flags.ts
│   │   └── paths.ts
│   │
│   ├── errors/
│   │   ├── app-error.ts
│   │   ├── validation-error.ts
│   │   ├── not-found-error.ts
│   │   ├── authorization-error.ts
│   │   ├── authentication-error.ts
│   │   ├── execution-limit-error.ts
│   │   └── database-error.ts
│   │
│   ├── observability/
│   │   ├── logger/
│   │   │   ├── client-logger.ts
│   │   │   └── server-logger.ts
│   │   ├── metrics/
│   │   │   ├── api-metrics.ts
│   │   │   ├── execution-metrics.ts
│   │   │   └── database-metrics.ts
│   │   ├── tracing/
│   │   │   ├── request-tracer.ts
│   │   │   └── execution-tracer.ts
│   │   └── error-reporting/
│   │       └── error-reporter.ts
│   │
│   ├── hooks/
│   │   ├── use-debounce.ts
│   │   ├── use-keyboard-shortcuts.ts
│   │   ├── use-local-storage.ts
│   │   └── use-indexed-db.ts
│   │
│   ├── lib/
│   │   ├── constants/
│   │   │   ├── routes.ts
│   │   │   ├── algorithms.ts
│   │   │   ├── visualization.ts
│   │   │   ├── limits.ts
│   │   │   └── ui.ts
│   │   ├── utilities/
│   │   │   ├── clamp.ts
│   │   │   ├── slugify.ts
│   │   │   ├── format-duration.ts
│   │   │   ├── format-number.ts
│   │   │   └── deep-equal.ts
│   │   └── browser/
│   │       ├── local-storage.ts
│   │       ├── indexed-db.ts
│   │       └── browser-capabilities.ts
│   │
│   ├── types/
│   │   ├── common.ts
│   │   ├── api.ts
│   │   └── result.ts
│   │
│   ├── styles/
│   │   ├── globals.css
│   │   ├── tokens.css
│   │   ├── typography.css
│   │   └── animations.css
│   │
│   └── workers/
│       ├── algorithm/
│       │   ├── algorithm.worker.ts
│       │   ├── algorithm.messages.ts
│       │   └── algorithm.client.ts
│       ├── graph/
│       │   ├── graph.worker.ts
│       │   ├── graph.messages.ts
│       │   └── graph.client.ts
│       └── trace/
│           ├── trace.worker.ts
│           ├── trace.messages.ts
│           └── trace.client.ts
│
├── .env.example
├── .env.local
├── .gitignore
├── README.md
├── CHANGELOG.md
├── CONTRIBUTING.md
├── LICENSE
├── package.json
├── package-lock.json
├── next.config.ts
├── tsconfig.json
├── eslint.config.js
├── prettier.config.js
├── postcss.config.mjs
└── playwright.config.ts
```

---

# 8. Root-Level Folder Responsibilities

## `.github/`

Contains GitHub-specific project automation and contribution templates.

It must not contain application code.

## `.husky/`

Contains local Git hook entrypoints used to enforce checks before commits and pushes.

## `database/`

Contains SQL Server schema, migrations, seed data, and database-specific scripts.

This is the source-controlled database definition layer.

## `docs/`

Contains supporting technical documentation that is more detailed than the main architecture MD files.

The application must never import files from `docs/` at runtime.

## `public/`

Contains static browser-delivered assets such as logos, images, icons, and approved self-hosted font assets.

## `scripts/`

Contains developer and CI scripts that operate on the repository, database, content, or build process.

Scripts are not application runtime modules.

## `tests/`

Contains repository-level tests that intentionally live outside the implementation folders.

## `src/`

Contains application and runtime source code.

---

# 9. `.github/` Structure

```text
.github/
├── workflows/
│   ├── ci.yml
│   ├── test.yml
│   ├── e2e.yml
│   └── security.yml
│
├── ISSUE_TEMPLATE/
│   ├── bug-report.md
│   ├── feature-request.md
│   └── algorithm-request.md
│
└── PULL_REQUEST_TEMPLATE.md
```

## Workflow responsibilities

### `ci.yml`

General validation such as installation, type checking, linting, and build verification.

### `test.yml`

Unit and integration test execution.

### `e2e.yml`

Browser-level testing.

### `security.yml`

Dependency and security checks.

The exact CI provider implementation may evolve, but workflow responsibilities should remain separated rather than creating one enormous workflow file.

---

# 10. Database Folder Structure

```text
database/
├── schema/
├── migrations/
├── seeds/
├── scripts/
└── README.md
```

The `database/` folder represents SQL Server artifacts that should remain understandable even if the application code is temporarily unavailable.

## Schema files

Each important logical database area receives its own schema file.

This prevents a single 2,000-line schema file.

## Migrations

Migrations are append-only historical changes.

Do not rewrite an already-applied migration in a shared environment.

## Seeds

Development, testing, and demo data remain separated because they have different purposes and safety requirements.

---

# 11. Documentation Folder Structure

```text
docs/
├── architecture/
├── algorithms/
├── database/
├── development/
├── deployment/
├── security/
└── testing/
```

Documentation under `docs/` may explain implementation details, operational processes, examples, and contributor workflows.

The numbered foundation MD files remain the high-level project specifications. Implementation documents can live under `docs/` when appropriate.

---

# 12. Public Assets Structure

```text
public/
├── icons/
├── images/
├── logos/
└── fonts/
```

Assets should be organized by purpose, not by the page that happens to use them.

Do not place source TypeScript, SQL, or feature logic in `public/`.

---

# 13. Scripts Structure

```text
scripts/
├── database/
├── content/
└── build/
```

Scripts should be narrow and safe to run independently.

Avoid creating:

```text
scripts/all.ts
scripts/utils.ts
scripts/misc.ts
```

Prefer one operation per script or a logically bounded command family.

---

# 14. Testing Structure

LogicLab uses multiple testing layers because algorithmic correctness and UI correctness are different concerns.

```text
tests/
├── unit/
├── integration/
├── visualization/
├── e2e/
├── fixtures/
├── mocks/
└── helpers/
```

---

# 15. Unit Tests

Unit tests validate isolated logic.

Examples:

```text
tests/unit/core/algorithms/
tests/unit/core/execution/
tests/unit/server/use-cases/
tests/unit/features/visualizer/
```

Unit tests should avoid unnecessary network and real database dependencies.

---

# 16. Integration Tests

Integration tests validate multiple layers working together.

Examples:

```text
tests/integration/api/
tests/integration/database/
tests/integration/repositories/
tests/integration/services/
tests/integration/use-cases/
```

Use a controlled test database where database behavior is part of the scenario.

---

# 17. Visualization Tests

Visualization tests are first-class tests because LogicLab is an educational visualization platform.

They verify that an execution state becomes the correct visual state.

Example concept:

```text
Algorithm step:
COMPARE(5, 3)

Expected visual state:
5 → COMPARING
3 → COMPARING
```

This is not purely a standard unit test and therefore has its own test area.

---

# 18. E2E Tests

E2E tests validate user journeys.

Examples:

```text
open algorithm
→ provide input
→ run algorithm
→ step forward
→ inspect explanation
→ view metrics
→ complete execution
```

E2E tests should focus on important journeys rather than duplicating every unit test in a browser.

---

# 19. Fixtures, Mocks, and Helpers

## Fixtures

Stable reusable test data.

## Mocks

Fake implementations of external or isolated dependencies.

## Helpers

Test-only convenience functions.

Test helpers must never become production utilities.

---

# 20. `src/app/` Structure

The `app/` directory is the Next.js route composition layer.

Its responsibilities are:

- route mapping;
- page composition;
- metadata composition;
- loading/error boundaries;
- API route entrypoints.

It should not become the home of business logic.

---

# 21. Public Route Structure

Public educational pages live in:

```text
src/app/(public)/
```

Examples include:

- algorithms;
- data structures;
- visualizer entrypoints;
- playgrounds;
- challenges;
- comparison pages.

Route files should call feature-level functionality rather than directly implementing complex business rules.

---

# 22. Workspace Route Structure

Authenticated or personalized application views live in:

```text
src/app/(workspace)/
```

Examples:

- progress;
- history;
- favorites;
- learning;
- experiments;
- settings.

The route itself should remain thin.

---

# 23. API Route Structure

API routes live under:

```text
src/app/api/
```

The API route is an entrypoint, not the application layer.

A typical route flow is:

```text
route.ts
   ↓
request parsing
   ↓
request validation
   ↓
authentication / authorization
   ↓
use case
   ↓
service/domain logic
   ↓
repository
   ↓
database
```

The reverse flow returns a controlled response through the contract layer.

---

# 24. API Route Thinness Rule

A `route.ts` file must not contain large business rules.

Avoid:

```text
route.ts
├── SQL queries
├── scoring algorithm
├── progress logic
├── complex validation
└── response transformation
```

Prefer:

```text
route.ts
→ parse request
→ validate request
→ call use case
→ map response
```

This allows API entrypoints to remain easy to review and easy to test.

---

# 25. Reusable Components Structure

```text
src/components/
├── ui/
├── layout/
├── navigation/
└── feedback/
```

A component belongs here only when it is intentionally reusable across multiple independent features.

Examples:

- Button;
- Input;
- Modal;
- Badge;
- Breadcrumbs;
- Global feedback messages.

Feature-specific components do not belong here merely because they are React components.

---

# 26. UI vs Feature Component Rule

Use this distinction:

```text
Can another unrelated feature reasonably reuse it?
        │
        ├── YES → components/
        │
        └── NO  → features/<feature>/components/
```

For example:

```text
components/ui/button/
```

is globally reusable.

But:

```text
features/visualizer/components/Timeline.tsx
```

belongs to the visualizer because its purpose is feature-specific.

This prevents duplication between `components/` and `features/`.

---

# 27. Feature-Based Architecture

The feature layer groups code by what the user is trying to do.

```text
src/features/
├── algorithms/
├── data-structures/
├── visualizer/
├── challenges/
├── compare/
├── experiments/
├── progress/
├── history/
├── favorites/
├── learning/
└── settings/
```

Feature code can contain:

- feature components;
- feature hooks;
- feature-local state;
- feature-local types;
- feature orchestration.

It should call the core or server layers through defined boundaries rather than reaching randomly into implementation internals.

---

# 28. Feature Internal Structure

Feature subareas should use only the folders they actually need.

A mature feature may look like:

```text
features/example/
├── components/
├── hooks/
├── state/
├── types/
├── services/
└── utilities/
```

Do not create every possible folder just because the template contains them.

Empty architectural ceremony is discouraged.

---

# 29. Core Domain Architecture

The `core/` directory contains framework-independent algorithmic and domain logic.

```text
src/core/
├── algorithms/
├── data-structures/
├── graph/
├── input/
├── execution/
├── challenges/
└── visualization/
```

The core should be testable without rendering a browser interface.

Where practical, core code should not depend on:

- React;
- browser APIs;
- Next.js;
- SQL Server;
- HTTP request objects;
- DOM elements.

---

# 30. Algorithm Engine Structure

The algorithm engine has clear layers:

```text
core/algorithms/
├── implementations/
├── contracts/
├── registry/
├── execution/
├── tracing/
├── metrics/
├── complexity/
└── comparison/
```

Each layer has a distinct role.

---

# 31. Algorithm Implementation Structure

Each algorithm implementation is isolated in its own folder.

Example:

```text
core/algorithms/implementations/sorting/bubble-sort/
├── bubble-sort.ts
└── bubble-sort.steps.ts
```

The executable implementation answers:

> How does the algorithm solve the problem?

The step file answers:

> What execution events/states should be exposed for visualization?

These should remain related but separable.

---

# 32. Algorithm Registry Structure

The registry provides discoverability.

```text
core/algorithms/registry/
├── algorithm-registry.ts
├── algorithm-category-registry.ts
└── algorithm-loader.ts
```

The registry should be the controlled access point for mapping algorithm IDs/slugs to implementations.

Do not scatter direct imports of every algorithm throughout unrelated features.

---

# 33. Algorithm Contracts

Contracts define the shared expectations for algorithms.

```text
core/algorithms/contracts/
├── algorithm.ts
├── algorithm-input.ts
├── algorithm-output.ts
└── algorithm-step.ts
```

This allows different algorithms to produce compatible execution data without forcing their internal implementation to be identical.

---

# 34. Execution Structure

Execution is centralized because playback, visualization, challenge evaluation, and comparison all need the same underlying execution semantics.

```text
core/execution/
├── execution-engine.ts
├── execution-step.ts
├── execution-state.ts
├── execution-event.ts
├── execution-result.ts
├── execution-context.ts
├── execution-controller.ts
└── execution-limits.ts
```

The execution engine is the canonical source of truth for execution state.

The UI should not reconstruct algorithm state independently.

---

# 35. Execution Trace Structure

Algorithm tracing is separated from visual rendering.

```text
core/algorithms/tracing/
├── create-step.ts
├── create-event.ts
└── trace-builder.ts
```

This allows one execution trace to be used by:

- visualizer;
- step explanation;
- metrics;
- prediction challenges;
- replay;
- history;
- comparison.

---

# 36. Metrics Structure

Metrics are produced by execution rather than manually counted by UI components.

```text
core/algorithms/metrics/
├── comparison-counter.ts
├── swap-counter.ts
├── write-counter.ts
└── operation-metrics.ts
```

Examples include:

- comparisons;
- swaps;
- writes;
- visits;
- queue operations;
- stack operations;
- edge relaxations;
- tree rotations.

---

# 37. Complexity Structure

Complexity is represented as educational/domain data rather than hardcoded into display components.

```text
core/algorithms/complexity/
├── complexity-model.ts
├── complexity-calculator.ts
└── complexity-label.ts
```

This supports both textual explanations and future interactive complexity explorers.

---

# 38. Comparison Structure

Comparison runs multiple algorithms under controlled conditions.

```text
core/algorithms/comparison/
├── comparison-runner.ts
├── comparison-result.ts
└── comparison-metrics.ts
```

The comparison engine should reuse the canonical algorithm engine rather than implementing separate copies of algorithms.

---

# 39. Data Structure Engine Structure

Data structure implementations live under:

```text
core/data-structures/
├── contracts/
├── array/
├── linked-list/
├── stack/
├── queue/
├── tree/
├── heap/
├── hash-table/
└── trie/
```

The exact internal structure of each data structure may grow into subfolders as complexity increases.

For example, a tree subsystem can later contain:

```text
tree/
├── node/
├── binary-tree/
├── bst/
├── avl/
└── traversal/
```

The 400-line limit remains in force.

---

# 40. Graph Engine Structure

Graphs are treated as their own foundational domain because many LogicLab algorithms depend on graph models.

```text
core/graph/
├── contracts/
├── graph-model/
├── node/
├── edge/
├── traversal/
└── pathfinding/
```

Graph algorithms should not implement their own incompatible graph representations unless the algorithm fundamentally requires a specialized representation.

---

# 41. Input Architecture

```text
core/input/
├── parsers/
├── validators/
├── generators/
├── random/
└── scenarios/
```

This separates:

- parsing user input;
- validating input;
- generating data;
- randomness;
- known educational scenarios.

---

# 42. Parser Rules

Parsers turn external representations into domain structures.

Examples:

```text
array-parser.ts
graph-parser.ts
tree-parser.ts
matrix-parser.ts
```

They should not contain UI rendering or persistence logic.

---

# 43. Validator Rules

Validators answer:

> Is this input valid for this operation?

They should provide deterministic results and clear error information.

Do not hide validation inside React components when the validation belongs to the algorithm domain.

---

# 44. Generator Rules

Generators produce valid data sets for learning and experimentation.

Examples:

- random arrays;
- random graphs;
- random trees;
- random matrices.

Generators should support deterministic seeds when reproducible experiments are useful.

---

# 45. Scenario Structure

Scenarios describe intentional educational inputs such as:

```text
sorting best case
sorting worst case
a nearly sorted array
a graph with cycles
a disconnected graph
an unbalanced tree
```

Scenario definitions belong in:

```text
core/input/scenarios/
```

rather than inside UI components.

---

# 46. Challenge Engine Structure

```text
core/challenges/
├── contracts/
├── evaluation/
├── scoring/
├── hints/
└── prediction/
```

The challenge engine reuses algorithm execution and domain state rather than duplicating algorithm logic.

Challenge code must remain distinct from challenge content.

---

# 47. Visualization Architecture

Visualization is a transformation of domain execution state into something the renderer can display.

The intended flow is:

```text
Algorithm
   ↓
Execution State
   ↓
Visualization Model
   ↓
Visualization Adapter
   ↓
Renderer
   ↓
Feature UI
```

The algorithm must not directly manipulate SVG or DOM nodes.

---

# 48. Visualization Contracts

```text
core/visualization/contracts/
├── visualization.ts
├── visualization-state.ts
└── renderer.ts
```

These contracts establish a stable interface between visualization data and rendering implementations.

---

# 49. Visualization Models

Models transform domain state into render-oriented structures.

Examples:

```text
array-model.ts
graph-model.ts
tree-model.ts
grid-model.ts
```

A model may include:

- item positions;
- relationships;
- visual state;
- labels;
- dimensions;
- display metadata.

It must not own React component state.

---

# 50. Visualization States

Visual state is represented semantically.

Examples:

```text
default
active
comparing
sorted
visited
target
```

Color is only one visual consequence of a state. A visualization state should remain meaningful even if the color palette changes.

---

# 51. Visualization Adapters

Adapters convert execution/domain objects to renderer-ready models.

For example:

```text
array-adapter.ts
graph-adapter.ts
tree-adapter.ts
grid-adapter.ts
```

Adapters should prevent renderers from depending directly on complex algorithm internals.

---

# 52. Visualization Registry

The renderer registry maps visualization types to rendering capabilities.

The visualization registry maps supported visualization models/types to their corresponding rendering strategies.

This avoids large conditionals such as:

```text
if algorithm === 'bubble-sort' ...
else if algorithm === 'bfs' ...
else if algorithm === 'dijkstra' ...
```

inside one giant renderer.

---

# 53. Visualization Renderers

Renderers are organized by structure.

```text
renderers/
├── array/
├── graph/
├── tree/
├── stack/
├── queue/
├── linked-list/
├── hash-table/
└── grid/
```

This keeps rendering logic modular and allows one renderer to support several algorithms over the same structure.

---

# 54. Static Educational Content Structure

Static educational content lives under:

```text
src/content/
```

It is separate from the executable algorithm implementation.

This prevents educational text from being embedded directly in algorithm code or UI components.

---

# 55. Algorithm Content Structure

An algorithm content package can contain:

```text
metadata.ts
explanation.ts
pseudocode.ts
complexity.ts
examples.ts
code.ts
visualization.ts
```

Each file has one educational responsibility.

---

# 56. Content vs Algorithm Logic

The rule is:

```text
core/algorithms/...
→ executable behavior

content/algorithms/...
→ educational knowledge
```

For example:

```text
core/algorithms/implementations/sorting/bubble-sort/bubble-sort.ts
```

contains actual algorithm behavior.

While:

```text
content/algorithms/sorting/bubble-sort/explanation.ts
```

contains explanatory material.

Neither should become a hidden substitute for the other.

---

# 57. Content Registry

```text
content/registry/
├── algorithm-registry.ts
├── data-structure-registry.ts
├── challenge-registry.ts
└── learning-path-registry.ts
```

The registry makes static content discoverable and consistent.

It also provides a central place to enforce metadata requirements.

---

# 58. Content Validation

Static content must be validated before production.

Validation should check:

- required files exist;
- slugs are unique;
- required metadata exists;
- referenced algorithms exist;
- visualization references exist;
- challenge references resolve;
- related-topic references resolve;
- links are valid;
- complexity data is complete;
- content IDs are stable.

The goal is to catch missing or inconsistent educational data during development rather than at runtime.

---

# 59. Server Architecture

The server layer contains server-only behavior.

```text
server/
├── auth/
├── use-cases/
├── services/
├── database/
├── api/
├── validation/
└── security/
```

The browser must never connect directly to SQL Server.

---

# 60. Use-Case Layer

Use cases represent actions the system performs.

Examples:

```text
register-user.ts
login-user.ts
start-challenge.ts
submit-challenge.ts
save-experiment.ts
update-progress.ts
```

A use case should answer:

> What business/application operation is being performed?

It should coordinate domain logic, authorization, repositories, and services without becoming a giant service class.

---

# 61. Service Layer

Services coordinate recurring domain/application operations.

They should not become generic dumping grounds for every rule.

A service is appropriate when behavior needs a reusable abstraction beyond one use case.

If a service grows excessively, split it by responsibility or move specific operations into use cases.

---

# 62. Authentication Structure

```text
server/auth/
├── authentication.ts
├── session.ts
├── password.ts
├── authorization.ts
└── ownership.ts
```

The separation makes authentication and authorization concerns explicit.

Authentication answers:

> Who is the user?

Authorization answers:

> What is the user allowed to do?

Ownership answers:

> Does this user own this resource?

---

# 63. API Infrastructure

```text
server/api/
├── request-context.ts
├── request-parser.ts
├── response-builder.ts
├── error-handler.ts
└── rate-limit.ts
```

These modules implement cross-cutting API mechanics rather than feature-specific business logic.

---

# 64. Server Validation

HTTP/API validation lives under:

```text
server/validation/
```

Domain input validation remains under `core/input/` when it is part of algorithm/domain behavior.

This distinction is intentional.

```text
HTTP request validation
→ server/validation/

Algorithm/domain input validation
→ core/input/validators/
```

---

# 65. Server Security

```text
server/security/
├── csrf.ts
├── headers.ts
├── input-limits.ts
├── session-security.ts
└── ownership.ts
```

Security checks must happen server-side even when equivalent client-side checks exist.

---

# 66. Database Connection Structure

```text
server/database/connection/
├── create-connection.ts
├── close-connection.ts
└── connection-config.ts
```

The connection layer isolates SQL Server setup and configuration.

Application code should not create random database connections in feature files.

---

# 67. Database Models

Database models describe persistence-level records.

They are not automatically the same as UI types or domain types.

Separating these concepts prevents database representation from leaking through the entire application.

---

# 68. Repository Structure

Repositories represent data access operations.

Examples:

```text
user-repository.ts
progress-repository.ts
history-repository.ts
challenge-repository.ts
```

Repositories should own database interaction details.

UI components must never contain SQL queries.

---

# 69. Query and Command Separation

```text
queries/
commands/
```

Queries retrieve data.

Commands change data.

This separation improves readability, reviewability, and transaction reasoning.

Not every query or command needs its own file if a repository-specific file already remains below the atomic limits, but large or reusable statements should be extracted.

---

# 70. Database Mappers

Mappers convert between persistence representations and application/domain representations.

They protect the rest of the application from database-specific naming or structure.

---

# 71. Transaction Structure

Transactions are centralized under:

```text
server/database/transactions/
```

Transaction code should not be duplicated across repositories.

When multiple persistence operations must commit atomically, the use case should coordinate through the transaction boundary.

---

# 72. Database Adapter Structure

```text
server/database/adapters/
├── sql-server-adapter.ts
└── database-client.ts
```

This creates a controlled boundary around the selected database technology.

The application is built for Microsoft SQL Server now, while configuration and abstraction should make future infrastructure evolution manageable.

---

# 73. Local SQL Server vs Production SQL Server

Development and production can use different SQL Server instances without changing application architecture.

```text
Development
Browser
  ↓
Next.js
  ↓
Local SQL Server

Production
Browser
  ↓
Next.js
  ↓
Production SQL Server / Azure SQL
```

The configuration layer must determine the target database instance.

No source file should hardcode a local-only database address.

---

# 74. API Contracts

API contracts are centralized under:

```text
src/contracts/api/
```

These define stable client/server expectations such as:

- request shape;
- response shape;
- error shape;
- identifiers;
- pagination structures.

They should not contain server-only implementation details.

---

# 75. Event Contracts

Execution and visualization events use explicit contracts:

```text
contracts/events/
├── execution-events.ts
├── visualization-events.ts
└── challenge-events.ts
```

This is especially important if LogicLab later supports workers, streaming execution, replay, or collaborative features.

---

# 76. Configuration Structure

```text
src/config/
├── env.ts
├── application.ts
├── database.ts
├── security.ts
├── feature-flags.ts
└── paths.ts
```

Configuration should be centralized and validated.

Code should not repeatedly access environment variables throughout the repository.

---

# 77. Environment Configuration Rule

The environment is responsible for providing values such as:

- database connection details;
- authentication secrets;
- environment name;
- public URL;
- feature flags;
- server limits.

The application configuration layer transforms and validates these values before use.

---

# 78. Feature Flags

Feature flags belong in:

```text
config/feature-flags.ts
```

Do not scatter unexplained string comparisons throughout UI and server code.

Feature flags should have explicit names, documented meaning, and a clear removal plan when they are temporary.

---

# 79. Error Architecture

```text
src/errors/
├── app-error.ts
├── validation-error.ts
├── not-found-error.ts
├── authorization-error.ts
├── authentication-error.ts
├── execution-limit-error.ts
└── database-error.ts
```

Errors should represent meaningful categories rather than arbitrary strings.

This supports consistent API responses, logging, and debugging.

---

# 80. Observability Architecture

```text
src/observability/
├── logger/
├── metrics/
├── tracing/
└── error-reporting/
```

Observability is intentionally separate from normal business logic.

The purpose is to understand:

- API performance;
- algorithm execution performance;
- database performance;
- failures;
- user-impacting errors.

---

# 81. Shared Hooks

Only truly generic React hooks live in:

```text
src/hooks/
```

Examples:

- debounce;
- keyboard shortcuts;
- local storage;
- IndexedDB.

Feature-specific hooks remain inside their feature folders.

---

# 82. Utility Structure

```text
src/lib/
├── constants/
├── utilities/
└── browser/
```

The `lib` folder is intentionally narrow.

It must not become an "anything that does not fit elsewhere" folder.

---

# 83. Utility Anti-Dumping Rule

The following names are strongly discouraged:

```text
utils.ts
helpers.ts
common.ts
misc.ts
shared.ts
```

when they represent unrelated functions.

Prefer explicit files:

```text
clamp.ts
slugify.ts
format-duration.ts
deep-equal.ts
```

Explicit names communicate ownership.

---

# 84. Shared Types Structure

Global `src/types/` is intentionally minimal:

```text
src/types/
├── common.ts
├── api.ts
└── result.ts
```

Domain-specific types belong closer to their domain.

Examples:

```text
core/algorithms/contracts/
features/challenges/types/
features/visualizer/types/
server/database/models/
```

Do not put every interface in `src/types/`.

---

# 85. Styling Structure

```text
src/styles/
├── globals.css
├── tokens.css
├── typography.css
└── animations.css
```

This area contains global styling rules.

Component-specific styling should remain close to the component when the chosen styling approach supports that pattern.

---

# 86. Worker Architecture

Workers are separated into:

```text
workers/
├── algorithm/
├── graph/
└── trace/
```

Each worker package contains:

- worker entrypoint;
- message contract;
- main-thread client.

This makes communication explicit.

---

# 87. Worker Dependency Rule

Workers must not import:

- React components;
- DOM-only APIs unless intentionally supported;
- server-only modules;
- database modules.

Workers should depend primarily on core computational modules.

---

# 88. Naming Conventions

Consistency matters because the repository will contain a large number of files.

The chosen naming system should be predictable enough that a developer can infer a path without searching the entire project.

---

# 89. Folder Naming Rules

Use lowercase kebab-case for directories.

Examples:

```text
bubble-sort/
data-structures/
learning-paths/
server-side-rendering/
```

Avoid inconsistent mixtures such as:

```text
BubbleSort/
Bubble_Sort/
bubblesort/
```

---

# 90. File Naming Rules

Use lowercase kebab-case for ordinary TypeScript files.

Examples:

```text
bubble-sort.ts
execution-state.ts
create-execution-context.ts
```

React component filenames use PascalCase when the project convention is component-oriented:

```text
VisualizationCanvas.tsx
PlaybackControls.tsx
```

Consistency is more important than mixing conventions without reason.

---

# 91. Component Naming Rules

React component names should describe what is rendered.

Prefer:

```text
MetricsPanel
PlaybackControls
VisualizationCanvas
```

Avoid vague names:

```text
Box
Widget
Thing
Panel2
ComponentA
```

---

# 92. Algorithm Naming Rules

Algorithm slugs use lowercase kebab-case.

Examples:

```text
bubble-sort
quick-sort
binary-search
a-star
floyd-warshall
```

Implementation filenames should match the algorithm slug.

---

# 93. Type Naming Rules

Types and interfaces should describe the object or contract clearly.

Avoid:

```text
Data
Info
Thing
Props
State
```

unless the name is local and unambiguous.

Prefer:

```text
ExecutionState
AlgorithmInput
VisualizationModel
ChallengeSubmission
```

---

# 94. API Naming Rules

API paths use resource-oriented lowercase kebab-case.

Examples:

```text
/api/algorithms
/api/data-structures
/api/challenges
/api/learning-paths
```

IDs are represented using route segments where appropriate.

---

# 95. Database Naming Rules

Database naming should be explicit and consistent.

Tables, columns, constraints, indexes, and migrations should follow one SQL Server naming convention selected during implementation.

The convention must be documented before schema expansion begins.

---

# 96. Import Rules

Imports must follow architectural boundaries.

A feature should not import arbitrary database internals.

A component should not import SQL queries.

A core algorithm should not import a React component.

A content module should not become a backdoor to application services.

---

# 97. Dependency Direction

The preferred high-level dependency direction is:

```text
APP
 ↓
FEATURES
 ↓
CORE

APP/API
 ↓
SERVER USE CASES
 ↓
SERVER SERVICES
 ↓
REPOSITORIES
 ↓
DATABASE
```

Shared contracts and types sit at stable boundaries.

Dependencies should flow toward lower-level stable abstractions rather than upward into UI layers.

---

# 98. Allowed Dependencies

Typical allowed relationships:

```text
app → features
app → components
app → contracts

features → components
features → core
features → contracts
features → hooks

server → core
server → contracts
server → database
server → config
server → errors
server → observability

workers → core
workers → contracts

content → content contracts / shared types
```

The exact dependency graph may gain additional safe links, but every new cross-layer dependency should have a clear architectural reason.

---

# 99. Forbidden Dependencies

The following are explicitly forbidden:

```text
core → React
core → Next.js UI
core → DOM rendering
core → SQL Server

components → SQL queries
components → repository internals

content → database
content → React rendering internals

workers → React components
workers → database

public → source code
```

These rules prevent architectural coupling.

---

# 100. Circular Dependency Prevention

Circular dependencies should be treated as architecture defects, not merely tooling annoyances.

Example to avoid:

```text
features/visualizer
   ↓
core/visualization
   ↓
features/visualizer
```

If a cycle appears, extract the shared contract or domain concept into a lower-level stable location.

---

# 101. Barrel File Rules

Barrel files such as `index.ts` are not forbidden, but they are not automatic.

Use a barrel only when:

- the folder intentionally exposes a public module surface;
- exports are stable;
- it does not introduce circular dependencies;
- it improves discoverability.

Do not create an `index.ts` in every folder by habit.

---

# 102. Feature Isolation Rules

A feature should not reach into another feature's private internals.

Bad:

```text
features/challenges/
→ imports
features/progress/internal-secret-file.ts
```

Better:

```text
features/challenges/
→ calls stable progress use case / public API boundary
```

The goal is to keep features replaceable and independently understandable.

---

# 103. Core Independence Rules

The algorithm engine must remain usable without a browser.

This allows it to support:

- unit tests;
- workers;
- server-side execution where appropriate;
- batch comparisons;
- CLI tools in the future;
- educational exports.

This is one of the most important architectural rules in LogicLab.

---

# 104. UI vs Business Logic Separation

UI answers:

> How should this information be displayed and interacted with?

Business/domain code answers:

> What should happen?

For example:

```text
Button click
→ feature hook
→ use case/action
→ core execution
→ execution result
→ feature state
→ UI
```

Do not place algorithmic decision-making inside JSX event handlers.

---

# 105. Content vs Logic Separation

Educational content is data.

Algorithm implementation is behavior.

Visualization renderer is presentation.

Database persistence is infrastructure.

These should remain separate so each can evolve independently.

---

# 106. Server vs Client Separation

Client-side code may request data through the application interface.

Server-side code may access SQL Server.

The browser should never receive secrets or raw database credentials.

Server-only code should remain clearly separated from client modules.

---

# 107. Database Isolation Rules

Only server-side database modules should know database implementation details.

Do not allow:

```text
React Component
→ SQL query
```

or:

```text
Client Hook
→ database client
```

The correct path is:

```text
Client
→ API
→ Use Case
→ Repository
→ SQL Server
```

---

# 108. Algorithm Addition Workflow

To add a new algorithm:

```text
1. Define algorithm identity/content.
2. Add implementation under core/algorithms/implementations/.
3. Add step/tracing behavior where needed.
4. Add content under src/content/algorithms/.
5. Register the algorithm.
6. Add unit tests.
7. Add visualization mapping if needed.
8. Add visualization tests.
9. Add E2E coverage for the public learning journey.
10. Run content validation and full test suite.
```

A new algorithm must not require editing a huge central switch statement.

---

# 109. Data Structure Addition Workflow

To add a new data structure:

```text
1. Define contracts.
2. Implement the structure under core/data-structures/.
3. Add educational content.
4. Add operations/playground support.
5. Add visualization model/adapter if required.
6. Add renderer if required.
7. Add tests.
8. Register the structure.
```

---

# 110. New Visualizer Workflow

```text
1. Confirm the domain model exists.
2. Define visualization contract.
3. Define visualization model.
4. Define visual states.
5. Create adapter.
6. Register renderer.
7. Create feature UI.
8. Add interaction behavior.
9. Add visualization tests.
10. Add E2E behavior.
```

The algorithm should not be modified merely to make React easier.

---

# 111. New Challenge Workflow

```text
1. Define challenge content.
2. Define challenge contract.
3. Reuse canonical algorithm execution where possible.
4. Implement evaluation.
5. Implement scoring.
6. Implement hints/prediction behavior.
7. Add feature UI.
8. Add persistence if needed.
9. Add tests.
```

Challenge logic should not fork the algorithm implementation.

---

# 112. New API Workflow

```text
1. Define API contract.
2. Define request validation.
3. Define authorization requirements.
4. Create use case.
5. Add service only if reusable coordination is required.
6. Add repository access if persistence is required.
7. Add route.ts entrypoint.
8. Add integration tests.
9. Add security tests where appropriate.
```

---

# 113. New Database Feature Workflow

A new persistent feature should follow:

```text
Schema
→ Migration
→ Model
→ Repository
→ Mapper
→ Service/use case
→ API contract
→ API route
→ Feature state/UI
→ Tests
```

Do not start by writing SQL directly inside a React feature.

---

# 114. New Feature Workflow

A complete feature should be introduced in this order:

```text
Requirement
   ↓
Content / domain model
   ↓
Core behavior
   ↓
Contracts
   ↓
Server use case / persistence if required
   ↓
Feature state
   ↓
Feature components
   ↓
Route composition
   ↓
Tests
```

Not every feature needs every layer, but missing layers should be an intentional decision.

---

# 115. Code Splitting Rules

Code should be split when:

- a file approaches 300–350 lines;
- two responsibilities evolve independently;
- a component contains unrelated sections;
- a service has unrelated operations;
- a test file becomes difficult to navigate;
- a file has a clear internal module boundary.

Avoid arbitrary fragmentation when there is no meaningful responsibility boundary.

---

# 116. Refactoring Rules

When refactoring:

1. Preserve behavior first.
2. Split by responsibility.
3. Preserve public contracts when possible.
4. Add or update tests.
5. Remove dead code.
6. Avoid creating generic dumping-ground modules.
7. Re-run architecture checks.

Refactoring is complete only when behavior and structure are both valid.

---

# 117. File Growth Monitoring

The project should monitor file lengths automatically.

Recommended thresholds:

```text
< 250 lines     normal
250–350         review
350–399         strong refactor signal
400             fail review / split immediately
> 400           CI or quality gate failure
```

The exact tooling can be chosen during implementation.

---

# 118. Architecture Violation Rules

The following are considered architectural violations:

- a core algorithm imports React;
- a client component executes SQL directly;
- an API route contains large business logic;
- multiple algorithms are implemented inside one oversized file;
- unrelated helpers are collected in `utils.ts`;
- a feature imports another feature's private internals without a defined boundary;
- content directly queries the database;
- file exceeds 400 physical lines;
- server-only secrets appear in client code;
- a visualization renderer reimplements the algorithm;
- tests directly depend on production secrets;
- a worker imports browser UI code.

---

# 119. Development Environment File Rules

Environment-specific configuration belongs in environment files and configuration modules.

Examples:

```text
.env.example
.env.local
```

Secrets must never be committed to the repository.

`.env.example` should document required variables without real secret values.

---

# 120. Production File Rules

Production builds must contain only files required for runtime or approved deployment processes.

Development-only scripts and local secrets should not be bundled into the client.

Server-only modules must remain server-only.

---

# 121. Git/GitHub File Rules

Repository metadata belongs at the root or under `.github/`.

Examples:

```text
README.md
CONTRIBUTING.md
CHANGELOG.md
LICENSE
.github/
.husky/
```

Project source code must not be mixed into GitHub metadata folders.

---

# 122. Example: Adding Bubble Sort

A complete Bubble Sort feature can map as:

```text
core/
└── algorithms/
    └── implementations/
        └── sorting/
            └── bubble-sort/
                ├── bubble-sort.ts
                └── bubble-sort.steps.ts

content/
└── algorithms/
    └── sorting/
        └── bubble-sort/
            ├── metadata.ts
            ├── explanation.ts
            ├── pseudocode.ts
            ├── complexity.ts
            ├── examples.ts
            ├── code.ts
            └── visualization.ts

tests/
├── unit/
│   └── core/
│       └── algorithms/
│
├── visualization/
│   └── array/
│
└── e2e/
    └── algorithms/
```

The algorithm implementation, content, UI, and testing remain separate.

---

# 123. Example: Adding a New Graph Algorithm

For example, Dijkstra:

```text
core/algorithms/implementations/graphs/dijkstra/
├── dijkstra.ts
└── dijkstra.steps.ts

content/algorithms/graphs/dijkstra/
├── metadata.ts
├── explanation.ts
├── pseudocode.ts
├── complexity.ts
├── examples.ts
├── code.ts
└── visualization.ts
```

The graph domain model remains under:

```text
core/graph/
```

The visualization system consumes graph execution state through adapters and renderers.

---

# 124. Example: Adding a New Visualization

Suppose LogicLab introduces a dedicated heap visualization.

Potential structure:

```text
core/visualization/
├── models/
│   └── heap-model.ts
│
├── adapters/
│   └── heap-adapter.ts
│
└── renderers/
    └── heap/

features/visualizer/
└── components/
    └── HeapVisualization.tsx

tests/visualization/
└── heap/
```

The renderer should know how to draw a heap.

It should not know how Heap Sort itself works.

---

# 125. Example: Adding a New Challenge

Suppose a challenge asks:

> Predict the next comparison in Bubble Sort.

Its architecture can be:

```text
content/challenges/sorting/

core/challenges/
├── contracts/
├── prediction/
└── evaluation/

features/challenges/
├── session/
├── submission/
├── hints/
└── feedback/

server/use-cases/challenges/
├── start-challenge.ts
└── submit-challenge.ts
```

The challenge does not implement Bubble Sort again.

---

# 126. Example: Adding a New Database Feature

Suppose LogicLab adds saved experiment collections.

The flow becomes:

```text
database/schema/
    ↓
database/migrations/
    ↓
server/database/models/
    ↓
server/database/repositories/
    ↓
server/database/mappers/
    ↓
server/use-cases/experiments/
    ↓
contracts/api/experiments.ts
    ↓
app/api/experiments/
    ↓
features/experiments/
```

Each layer has one responsibility.

---

# 127. Example: End-to-End Feature Flow

Consider a user running Binary Search.

```text
User
 ↓
Next.js route
 ↓
Visualizer feature
 ↓
Execution hook
 ↓
Core execution engine
 ↓
Binary Search implementation
 ↓
Execution steps
 ↓
Visualization adapter
 ↓
Visualization model
 ↓
Array renderer
 ↓
React UI
```

The important rule is that the UI displays domain state. It does not become the source of truth for algorithm behavior.

---

# 128. Example: Personalized Progress Flow

```text
User action
 ↓
Feature UI
 ↓
API request
 ↓
API route
 ↓
Authentication / ownership
 ↓
Use case
 ↓
Progress service
 ↓
Progress repository
 ↓
SQL Server
```

The response returns through the defined contract.

---

# 129. Complete Conceptual Architecture

```text
                             LOGICLAB
                                │
          ┌─────────────────────┼─────────────────────┐
          │                     │                     │
          ▼                     ▼                     ▼
         APP               FEATURES              COMPONENTS
      Routes/Pages      User-facing behavior     Reusable UI
          │                     │                     │
          │                     ▼                     │
          │                   CORE ◄─────────────────┘
          │                     │
          │          ┌──────────┼──────────┐
          │          ▼          ▼          ▼
          │      Algorithms   Graphs   Visualization
          │          │
          │          ▼
          │      Execution
          │
          ├─────────────── CONTRACTS ───────────────┐
          │                                          │
          ▼                                          ▼
       SERVER                                     CONTENT
          │                                  Educational knowledge
    ┌─────┼────────┐
    ▼     ▼        ▼
 Use    Service  Security
Cases    │
    ▼    ▼
 Repositories
    │
    ▼
 SQL Server
```

---

# 130. Canonical Ownership Map

| Responsibility | Canonical location |
|---|---|
| Next.js pages/routes | `src/app/` |
| Reusable UI | `src/components/` |
| Feature-specific UI | `src/features/` |
| Algorithm implementation | `src/core/algorithms/implementations/` |
| Algorithm contracts | `src/core/algorithms/contracts/` |
| Execution engine | `src/core/execution/` |
| Algorithm metrics | `src/core/algorithms/metrics/` |
| Complexity logic | `src/core/algorithms/complexity/` |
| Algorithm comparison | `src/core/algorithms/comparison/` |
| Data structures | `src/core/data-structures/` |
| Graph domain | `src/core/graph/` |
| Input generation | `src/core/input/` |
| Challenge engine | `src/core/challenges/` |
| Visualization domain | `src/core/visualization/` |
| Educational content | `src/content/` |
| API use cases | `src/server/use-cases/` |
| Server services | `src/server/services/` |
| Database access | `src/server/database/` |
| Authentication | `src/server/auth/` |
| Server security | `src/server/security/` |
| API infrastructure | `src/server/api/` |
| API contracts | `src/contracts/api/` |
| Event contracts | `src/contracts/events/` |
| Configuration | `src/config/` |
| Application errors | `src/errors/` |
| Logs/metrics/tracing | `src/observability/` |
| Generic browser hooks | `src/hooks/` |
| Small utilities | `src/lib/` |
| Shared types | `src/types/` |
| Global styles | `src/styles/` |
| Background workers | `src/workers/` |
| SQL schema | `database/schema/` |
| SQL migrations | `database/migrations/` |
| Test implementation | `tests/` |
| CI workflows | `.github/workflows/` |
| Static public assets | `public/` |
```

---

# 131. Folder Governance Rules

Every folder should satisfy these questions:

1. What responsibility does this folder own?
2. What types of files are allowed here?
3. What dependencies may it import?
4. Which folders may import it?
5. When should a new file be added here?
6. When should code instead be placed somewhere else?

If those answers are unclear, the folder probably needs a narrower responsibility.

---

# 132. Rules for Preventing Architectural Drift

As LogicLab grows, contributors must not introduce convenience-driven architecture such as:

```text
src/utils/
src/helpers/
src/services-everything/
src/components-everything/
src/api-everything/
```

without an explicit architectural reason.

The repository should remain organized by:

- responsibility;
- domain;
- feature;
- execution layer;
- infrastructure boundary.

---

# 133. Rules for Refactoring Large Modules

When a module approaches the 400-line boundary:

```text
1. Identify responsibilities.
2. Identify independent change reasons.
3. Extract the clearest responsibility first.
4. Keep public contracts stable where practical.
5. Move tests alongside responsibility ownership.
6. Remove duplication.
7. Verify imports and dependencies.
8. Verify no circular dependency was introduced.
9. Re-run tests.
10. Re-run architecture checks.
```

Never solve a 600-line problem by creating a 550-line file plus a 50-line file merely to satisfy the number.

The separation must be meaningful.

---

# 134. Final Architecture Checklist

Before adding or merging a new file, verify:

```text
[ ] Does this file have one clear responsibility?
[ ] Does the file belong in this folder?
[ ] Is there already a canonical place for this responsibility?
[ ] Is the file under 400 physical lines?
[ ] Could the code live closer to the feature/domain?
[ ] Am I creating a dumping-ground utility?
[ ] Does this create a circular dependency?
[ ] Does this violate client/server separation?
[ ] Does this violate core/UI separation?
[ ] Does this duplicate an existing algorithm implementation?
[ ] Is there a stable contract where a boundary requires one?
[ ] Is the functionality covered by the appropriate test layer?
[ ] If database-related, is SQL isolated behind the server/database layer?
[ ] If content-related, is the content separate from executable logic?
[ ] If visualization-related, is rendering separated from algorithm behavior?
[ ] If server-related, is business logic outside route.ts?
[ ] Is the naming convention consistent?
```

---

# 135. Final Approved Rules

The following rules are considered mandatory architectural standards for LogicLab:

1. **Maximum 400 physical lines per source file.**
2. **One clear responsibility per file.**
3. **One clear responsibility per folder.**
4. **Feature-specific code stays inside features.**
5. **Reusable UI stays inside components.**
6. **Algorithm behavior stays inside core.**
7. **Educational content stays inside content.**
8. **Database access stays inside server/database.**
9. **API routes remain thin.**
10. **Business operations belong in use cases/services.**
11. **Client code never connects directly to SQL Server.**
12. **Core algorithms never depend on React or Next.js UI.**
13. **Visualization never becomes the source of algorithm truth.**
14. **Challenges reuse canonical algorithm execution.**
15. **Metrics originate from execution/domain logic rather than UI counting.**
16. **Static content is validated before production.**
17. **Workers remain independent from UI and database code.**
18. **Generic dumping-ground files are strongly discouraged.**
19. **Global types remain intentionally small.**
20. **Tests mirror the architecture and include dedicated visualization coverage.**
21. **Configuration is centralized.**
22. **API contracts are explicit.**
23. **Circular dependencies are treated as architecture defects.**
24. **Large modules must be split by responsibility, not merely by line count.**
25. **New features must follow the established ownership and dependency boundaries.**

---

# 136. Final Principle

LogicLab's folder structure is not merely a way to keep files tidy.

It is an architectural system designed to make the correct implementation path obvious.

A developer should be able to look at a requirement and determine its location without guessing:

```text
"I need a new algorithm."
→ core + content + tests

"I need a new visualization."
→ core/visualization + feature visualizer + tests

"I need a new challenge."
→ content/challenges + core/challenges + feature/challenges + tests

"I need to save user progress."
→ use case + repository + database + API contract + feature

"I need a reusable button."
→ components/ui

"I need a visualizer-specific control."
→ features/visualizer/components

"I need a new SQL table."
→ database/schema + migration + server/database
```

The final goal is **predictability, isolation, maintainability, testability, and scalability**.

The repository should remain understandable even after LogicLab contains hundreds of algorithms, visualizations, challenges, experiments, pages, API operations, and user-facing features.
