# LogicLab — Code Naming & Layer Conventions

This document establishes the standardized naming conventions for LogicLab across all architectural layers.

---

## 1. File & Component Naming Rules

| Layer / Responsibility   | Casing Convention | File Pattern                      | Example                                           |
| ------------------------ | ----------------- | --------------------------------- | ------------------------------------------------- |
| **UI Components**        | `PascalCase`      | `[ComponentName].tsx`             | `PlaybackControls.tsx`, `VisualizationCanvas.tsx` |
| **Custom Hooks**         | `camelCase`       | `use[Feature].ts`                 | `usePlayback.ts`, `useVisualizerState.ts`         |
| **Domain Use Cases**     | `kebab-case`      | `[action].use-case.ts`            | `execute-algorithm.use-case.ts`                   |
| **Use Case Contracts**   | `kebab-case`      | `[domain]-use-cases.contract.ts`  | `algorithm-use-cases.contract.ts`                 |
| **Repositories**         | `kebab-case`      | `[entity].repository.ts`          | `progress.repository.ts`                          |
| **Repository Contracts** | `kebab-case`      | `[entity]-repository.contract.ts` | `progress-repository.contract.ts`                 |
| **API DTOs**             | `kebab-case`      | `[domain]-dto.ts`                 | `execution-dto.ts`, `challenge-dto.ts`            |
| **Domain Errors**        | `kebab-case`      | `[domain]-errors.ts`              | `domain-errors.ts`                                |
| **Execution Events**     | `kebab-case`      | `[type]-events.ts`                | `trace-events.ts`                                 |
| **Content Items**        | `kebab-case`      | `[algorithm-slug].json` / `.md`   | `bubble-sort.md`, `dijkstra.json`                 |
| **Automated Tests**      | `kebab-case`      | `[subject].test.ts` / `.test.tsx` | `architecture-boundaries.test.ts`                 |

---

## 2. Directory Hierarchy Rules

1. **`src/core/` (Computational Core):**
   - Strictly framework-independent pure TypeScript.
   - Prohibited from importing React, Next.js, or SQL drivers.

2. **`src/contracts/` (Boundary Contracts):**
   - Type definitions, interfaces, request/response schemas, trace event types.
   - Zero runtime business logic.

3. **`src/server/` (Backend Application Services):**
   - Implements use cases and repositories.
   - Never bundled into client-side code.

4. **`src/features/` & `src/components/` (Presentation):**
   - Components consume trace state snapshots; they never perform algorithm computations or direct database queries.

5. **`src/app/api/` (Thin Route Handlers):**
   - Receives HTTP request $\rightarrow$ Validates input $\rightarrow$ Calls Use Case $\rightarrow$ Formats `ApiResponse<T>`.
   - Never inlines SQL queries or computational algorithms.
