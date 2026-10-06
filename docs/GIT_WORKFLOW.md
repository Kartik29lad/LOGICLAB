# LogicLab — Git Workflow & Branching Conventions

This document outlines the version control strategy, branch hierarchy, and pull request guidelines for LogicLab.

## 1. Branch Hierarchy

LogicLab follows a structured Git flow model:

- **`main`**: Production-ready branch. Every commit on `main` represents a stable, release-ready milestone.
- **`develop`**: Primary integration branch. All active development slices and feature branches merge into `develop`.
- **`feature/*`**: Feature branches branched from `develop` (e.g., `feature/sorting-visualizer`, `feature/step-engine`).
- **`fix/*`**: Bug fixes branched from `develop` or hotfixes from `main` (e.g., `fix/step-pointer-bounds`).
- **`chore/*`**: Maintenance, dependency updates, and tooling changes (e.g., `chore/upgrade-vitest`).
- **`docs/*`**: Pure documentation and specification updates (e.g., `docs/update-architecture`).

## 2. Remote Branch Protection Guidelines

Branch protection rules must be configured in GitHub repository settings (requires repository admin privileges):

### Protected Branch: `main`

- Require pull request reviews before merging (minimum 1 approval).
- Require status checks to pass before merging:
  - `LogicLab CI / validate` (`npm run typecheck`, `npm run lint`, `npm run test:coverage`, `npm run build`).
- Require branches to be up to date before merging.
- Prohibit direct commits to `main`.
- Prohibit force pushes and branch deletions.

### Protected Branch: `develop`

- Require pull request reviews before merging.
- Require passing CI status checks.
- Prohibit force pushes.

> **Note on Local Environment:** Local Git cannot enforce server-side GitHub branch protection rules. The guidelines above represent the required remote GitHub repository configuration.

## 3. Contribution Workflow

1. Check out the latest `develop` branch:
   ```bash
   git checkout develop
   git pull origin develop
   ```
2. Create your working branch:
   ```bash
   git checkout -b feature/your-feature-name
   ```
3. Implement your changes within architectural limits:
   - Max 400 physical lines per file.
   - Core domain logic in `src/core/` must not import React, Next.js, or SQL drivers.
4. Verify locally before pushing:
   ```bash
   npm run typecheck
   npm run lint
   npm run format:check
   npm run test:coverage
   npm run build
   ```
5. Commit using descriptive commit messages:
   ```bash
   git commit -m "feat(core): implement insertion sort step generator"
   ```
6. Push and submit a Pull Request targeting `develop`.
