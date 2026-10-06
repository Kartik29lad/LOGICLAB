# LogicLab

**Explore. Visualize. Understand.**

LogicLab is an interactive algorithm and data-structure learning laboratory designed to make complex computational concepts intuitive, observable, and engaging.

---

## Current Status: Phase 1 — Repository and Development Foundation

This repository has completed **Phase 0 (Project Governance & Master Setup)** and **Phase 1 (Repository and Development Foundation)**.

The technical foundation, tooling, strict type-checking, code quality invariants, and directory boundaries are fully established and operational.

---

## Technology Foundation

- **Framework:** Next.js (App Router)
- **UI & Language:** React 19 & TypeScript (Strict Mode)
- **Design & Styling:** Design Tokens & Vanilla CSS / CSS Modules
- **Testing:** Vitest with V8 Coverage
- **Linting & Code Quality:** ESLint with TypeScript and Next.js rules
- **Formatting:** Prettier with `@ianvs/prettier-plugin-sort-imports`
- **Git Hooks:** Husky & lint-staged
- **Database (Target):** Microsoft SQL Server (via server-side abstraction)

---

## Quick Start

### Prerequisites

- Node.js `>= 20.0.0` (Recommended: `v22.20.0`, see `.nvmrc`)
- npm `>= 10.0.0`

### Installation

```bash
# Clean install dependencies
npm ci

# Set up local environment variables
cp .env.example .env.local
```

### Essential Commands

| Command                 | Action                                                     |
| ----------------------- | ---------------------------------------------------------- |
| `npm run dev`           | Launch local development server on `http://localhost:3000` |
| `npm run build`         | Build optimized Next.js production bundle                  |
| `npm run start`         | Run production server                                      |
| `npm run typecheck`     | Run strict TypeScript compiler verification                |
| `npm run lint`          | Run ESLint static analysis                                 |
| `npm run format:check`  | Verify code formatting compliance                          |
| `npm run format`        | Auto-format codebase using Prettier                        |
| `npm run test`          | Run Vitest unit & integration test suites                  |
| `npm run test:coverage` | Run test suite with V8 code coverage report                |

---

## Architecture & Documentation

- **Development Guide:** [docs/DEVELOPMENT_SETUP.md](docs/DEVELOPMENT_SETUP.md)
- **Git Workflow & Branching:** [docs/GIT_WORKFLOW.md](docs/GIT_WORKFLOW.md)
- **Architectural Decision Log:** [docs/decisions/](docs/decisions/)
- **Approved Specifications:** [md/](md/)
  - `01_LOGICLAB_PROJECT_DATA_SPECIFICATION.md`
  - `02_LOGICLAB_SYSTEM_ARCHITECTURE.md`
  - `06_LOGICLAB_TECHNOLOGY_STACK_AND_DEVELOPMENT_ENVIRONMENT.md`
  - `09_LOGICLAB_FOLDER_STRUCTURE_AND_CODE_ORGANIZATION.md`
  - `14_LOGICLAB_FINAL_IMPLEMENTATION_PLAN.md`
