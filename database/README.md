# LogicLab — Database Architecture & Migrations

This directory contains the complete database schema definitions, idempotent SQL migrations, seed fixtures, and utility scripts for the **LogicLab** SQL Server database (`LogicLab_Development`).

## Architecture Principles

1. **Static Educational Content vs. Dynamic User State**:
   - Algorithm specifications, theory, code implementations, and default test cases remain versioned in the application repository.
   - SQL Server stores user sessions, learning progress, custom experiments, benchmarks, attempts, bookmarks, and activity metrics.
2. **Strict Referential Integrity**:
   - Every foreign key constraint is explicitly defined and validated.
   - Cascade deletions are scoped to user-owned operational entities.
3. **Idempotent Migrations**:
   - Every migration file checks `IF OBJECT_ID(...) IS NULL` before executing DDL.
   - Migrations can safely be applied to an existing database or run from scratch.

## Schema Tables (24 Tables)

| #   | Table Name                     | Purpose                                            |
| --- | ------------------------------ | -------------------------------------------------- |
| 1   | `dbo.Users`                    | User accounts, credentials, status, role           |
| 2   | `dbo.UserSessions`             | Active sessions, token hashes, revocation          |
| 3   | `dbo.UserSettings`             | Preferences (theme, language, speed)               |
| 4   | `dbo.ContentItems`             | Catalog items (algorithms, structures, paths)      |
| 5   | `dbo.ContentVersions`          | Immutable content versions with SHA-256 hashes     |
| 6   | `dbo.AlgorithmProgress`        | User progress and step tracking on algorithms      |
| 7   | `dbo.DataStructureProgress`    | User progress on data structure interactions       |
| 8   | `dbo.ChallengeProgress`        | User challenge high-level status and best attempts |
| 9   | `dbo.ChallengeAttempts`        | Individual attempts, answers, scores, feedback     |
| 10  | `dbo.LearningPathProgress`     | Learning path progression and current position     |
| 11  | `dbo.LearningPathItemProgress` | Detailed progress on items within paths            |
| 12  | `dbo.Favorites`                | User bookmarked content items                      |
| 13  | `dbo.Experiments`              | User-created sandbox experiments                   |
| 14  | `dbo.ExperimentAlgorithms`     | Algorithms attached to experiments                 |
| 15  | `dbo.ExperimentExecutions`     | Execution history, snapshots, and metrics          |
| 16  | `dbo.Bookmarks`                | Granular step bookmarks with user notes            |
| 17  | `dbo.Comparisons`              | Multi-algorithm comparison workspaces              |
| 18  | `dbo.ComparisonAlgorithms`     | Metrics and results for compared algorithms        |
| 19  | `dbo.History`                  | Comprehensive audit trail of user actions          |
| 20  | `dbo.UserActivity`             | Timestamped action logs for analytics              |
| 21  | `dbo.UserDailyActivity`        | Daily rollups for heatmaps and streaks             |
| 22  | `dbo.Achievements`             | Achievement catalog and unlock criteria            |
| 23  | `dbo.UserAchievements`         | User unlocked achievements and timestamps          |
| 24  | `dbo._Migrations`              | Internal migration registry table                  |

## CLI Commands

- `npm run db:migrate` — Applies all pending migrations in `database/migrations/` in transaction.
- `npm run db:seed` — Runs development seeds (`database/seeds/development/`).
- `npm run db:reset` — Safely drops all tables and constraints (development/testing only).
