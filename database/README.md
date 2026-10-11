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

## SQL Server Authentication

The application supports two explicit database authentication modes:

- `DB_AUTH_MODE=windows` — Windows/Trusted Connection through `mssql/msnodesqlv8`. This is the recommended local configuration when SSMS uses Windows Authentication.
- `DB_AUTH_MODE=sql` — SQL Server username/password authentication through the default `mssql` driver.

For SQL Express named instances use a host such as `.\\SQLEXPRESS`. The connection adapter parses the instance name and does not force TCP port `1433` for named-instance connections. SQL Server Browser must be available when the driver needs instance discovery.

Windows Authentication requires the optional `msnodesqlv8` package plus Microsoft ODBC Driver 17 or 18 for SQL Server on the host. The project keeps that native dependency optional so SQL-auth deployments do not need it.

## Migration Integrity

Every applied migration stores a SHA-256 checksum in `dbo._Migrations`. Before new migrations run, the runner recalculates the checksum of every applied migration and fails if a historical migration was modified or removed. Historical migrations must never be edited after application; create a new migration instead.

Migration execution also uses a SQL Server application lock so two application processes cannot apply the same migration concurrently. Each migration is committed atomically with its registry record, and batch numbers advance per migration.

## Verification

Use `database/scripts/verify-database.sql` after migrations to confirm the active database, login, domain table count, migration registry, and latest migration batch.

### Local Windows Authentication prerequisite

From a Windows development machine, install the native driver once when using `DB_AUTH_MODE=windows`:

```powershell
npm install msnodesqlv8
```

Also install Microsoft ODBC Driver 17 or 18 for SQL Server. This native dependency is intentionally not included in the base lockfile because SQL-auth deployments do not require it; the application fails fast with a clear message if Windows Authentication is selected without the driver.

## Educational content synchronization

Phase 8 adds repository-backed content synchronization. Apply database migrations first, then use the content commands from the project root:

```text
npm run content:validate
npm run content:sync -- --dry-run
npm run content:sync -- --mode development
npm run content:sync -- --check
```

Staging and production require an explicit mode. Production writes additionally require `--confirm-production`. Retirement of content missing from the repository is opt-in with `--retire-missing`. Historical `ContentVersions` are never deleted.
