# LogicLab — Development Setup Guide

Welcome to the **LogicLab** development setup guide. LogicLab is an interactive algorithm and data-structure learning laboratory.

## 1. Prerequisites

Before setting up LogicLab locally, ensure your machine has the following tools installed:

- **Node.js**: `v22.20.0` or higher (compatible with Node LTS `>= 20.0.0`). See `.nvmrc`.
- **Package Manager**: `npm` version `10.9.3` or higher (standardized with `package-lock.json`).
- **Git**: `2.40.0` or higher.

If you use `nvm` (Node Version Manager):

```bash
nvm use
```

## 2. Installation

Clone the repository and install dependencies using clean installation:

```bash
# Clean install using package-lock.json
npm ci
```

## 3. Environment Configuration

Copy the template environment file to `.env.local`:

```bash
cp .env.example .env.local
```

Never commit `.env.local` or any sensitive credentials into Git. The repository's `.gitignore` explicitly excludes all local environment files.

## 4. Development Workflow

Start the Next.js local development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to view the application.

## 5. Verification Commands

The project enforces strict TypeScript, linting, formatting, and unit testing:

### Type Checking

```bash
npm run typecheck
```

Executes TypeScript compiler (`tsc --noEmit`) in strict mode.

### Linting

```bash
npm run lint
```

Executes ESLint with Next.js core web vitals and TypeScript rules. To auto-fix:

```bash
npm run lint:fix
```

### Formatting

```bash
npm run format:check
```

Checks compliance with Prettier rules and automated import sorting. To format:

```bash
npm run format
```

### Automated Testing & Coverage

```bash
npm run test
npm run test:coverage
```

Executes unit and integration test suites using Vitest and generates v8 coverage reports.

### Production Build

```bash
npm run build
npm run start
```

Compiles and generates the optimized production build.

## 6. Git Hooks & Lint-Staged

Husky is configured in `.husky/` to run pre-commit checks:

- Staged TypeScript/TSX files are automatically formatted with Prettier and linted with ESLint via `lint-staged`.
- `npm run typecheck` is executed to guarantee zero type regressions before any commit is finalized.
