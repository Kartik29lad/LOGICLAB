# LogicLab — Database Architecture & SQL Server Specification

## 1. Document Purpose

This document is the single source of truth for the LogicLab database architecture.

It defines the Microsoft SQL Server design, the boundary between static educational content and dynamic user data, the complete relational model, integrity rules, indexing strategy, transaction rules, security requirements, migration strategy, testing strategy, and the complete SQL schema.

The database is designed specifically for LogicLab as an interactive algorithm and data-structure learning laboratory. It must preserve learning state and user-owned work without turning SQL Server into the canonical store for every piece of educational content.

---

## 2. Database Goals

The database must provide:

1. Strong user-data integrity.
2. Reliable progress tracking.
3. Reproducible experiments.
4. Reproducible challenge attempts.
5. Version-aware learning records.
6. Normalized comparison data.
7. Secure authentication/session data handling.
8. Efficient history and dashboard queries.
9. Optimistic concurrency protection.
10. Strong referential integrity wherever practical.
11. Clear ownership boundaries.
12. Safe schema evolution.
13. Local SQL Server development with an uncomplicated production migration path.
14. Predictable behavior under growth.
15. Clear retention and deletion policies.

---

## 3. Database Design Philosophy

LogicLab uses hybrid storage.

```text
                    LOGICLAB
                       |
          +------------+------------+
          |                         |
          v                         v
   STATIC KNOWLEDGE           DYNAMIC STATE
          |                         |
          v                         v
 TypeScript / JSON / MD         SQL Server
          |                         |
          |              +----------+----------+
          |              |          |          |
          |            Users     Progress   Experiments
          |              |          |          |
          |              |        History    Challenges
          |              |          |          |
          +------- slug/version references ---+
```

### Static content

The repository is the canonical source for:

- algorithm explanations;
- algorithm pseudocode;
- source-code examples;
- complexity explanations;
- visualization definitions;
- data-structure explanations;
- challenge definitions;
- learning-path definitions;
- examples;
- glossary and related-topic content.

### Dynamic database state

SQL Server stores:

- users;
- sessions;
- settings;
- learning progress;
- challenge attempts;
- saved experiments;
- experiment executions;
- comparisons;
- favorites;
- bookmarks;
- history;
- user activity;
- daily activity summaries;
- achievements and earned achievements.

### Browser storage

LocalStorage/IndexedDB can hold temporary or device-specific state such as playback preferences and unsaved drafts. Durable account-owned state must not depend only on browser storage.

---

## 4. Why Microsoft SQL Server

Microsoft SQL Server is the selected database because it provides:

- mature relational integrity;
- strong transaction support;
- `UNIQUEIDENTIFIER` keys;
- `ROWVERSION` optimistic concurrency;
- filtered indexes;
- JSON validation through `ISJSON`;
- production-grade backup and recovery capabilities;
- compatibility with Azure SQL;
- a development environment that matches the user's existing SQL Server experience.

LogicLab application code must remain independent from local-only database details.

---

## 5. Environment Strategy

### Development

```text
Developer PC
    |
    v
Next.js Application
    |
    v
Local SQL Server
    |
    +-- LogicLab_Development
```

### Testing

```text
Automated Tests
      |
      v
Test Application
      |
      v
Dedicated Test SQL Server Database
```

### Staging

```text
Staging Application
        |
        v
Staging SQL Server / Azure SQL
```

### Production

```text
Browser
   |
   v
Next.js
   |
   v
Server/API Layer
   |
   v
Use Case / Service
   |
   v
Repository / Data Access
   |
   v
Production SQL Server / Azure SQL
```

The browser must never directly connect to SQL Server.

---

## 6. Local → Production Migration Strategy

The schema and application contracts should remain stable across environments.

```text
LOCAL SQL SERVER
       |
       | same schema
       | same repositories
       | same API contracts
       v
PRODUCTION SQL SERVER / AZURE SQL
```

The normal production change should be configuration and infrastructure work, not a rewrite of business logic.

---

## 7. Database Naming Conventions

Default SQL schema:

```text
dbo
```

Table names use plural PascalCase:

```text
Users
AlgorithmProgress
ChallengeAttempts
ExperimentExecutions
```

Columns use PascalCase:

```text
UserId
CreatedAt
ContentVersionId
LastActivityAt
```

Primary keys follow:

```text
<TableName>Id
```

Constraint names use explicit prefixes:

```text
PK_<Table>
FK_<Table>_<ReferencedTable>
UQ_<Table>_<Meaning>
CK_<Table>_<Meaning>
DF_<Table>_<Column>
```

---

## 8. Identifier Strategy

Primary keys use:

```text
UNIQUEIDENTIFIER
```

with:

```sql
NEWSEQUENTIALID()
```

The database-generated identifier is authoritative. The browser must not choose privileged identifiers for ownership-sensitive records.

Static content also has stable human-readable slugs, but those are metadata references rather than a replacement for relational primary keys.

---

## 9. Date and Time Strategy

Persistent timestamps use:

```text
DATETIME2(3)
```

All timestamps are stored in UTC.

Examples:

```text
CreatedAt
UpdatedAt
StartedAt
SubmittedAt
CompletedAt
LastActivityAt
```

Calendar-based daily summaries use `DATE`.

The client is responsible for displaying timestamps in the user's local timezone.

---

## 10. Boolean and Status Strategy

Booleans use `BIT`.

Examples:

```text
IsActive
AutoPlay
ReducedMotion
SoundEnabled
IsCurrent
```

Finite states use a `VARCHAR` value plus a `CHECK` constraint.

Examples:

```text
NOT_STARTED
IN_PROGRESS
COMPLETED
```

Application code should use typed constants/unions/enums corresponding to these database values.

---

## 11. Nullable vs Required Fields

A field is nullable only when the absence of the value represents a legitimate state.

Examples:

```text
EmailVerifiedAt
LastLoginAt
CompletedAt
SubmittedAt
```

are nullable because those events may not have happened yet.

Identifiers, ownership fields, and required content references remain `NOT NULL`.

---

## 12. Audit Fields and Concurrency

Mutable aggregate tables should use:

```text
CreatedAt
UpdatedAt
RowVersion
```

`UpdatedAt` is maintained by the server-side repository/data-access layer so update semantics remain predictable and do not depend on client timestamps.

`ROWVERSION` is database-generated and is used for optimistic concurrency. Clients never provide their own row-version values.

---

## 13. Soft Delete Strategy

Users support account deletion using:

```text
AccountStatus = DELETED
DeletedAt IS NOT NULL
```

Unique email/username indexes are filtered by `DeletedAt IS NULL`, allowing a product policy that can reuse identity data after deletion.

This policy must be aligned with the account-recovery/privacy requirements.

Achievement definitions are normally deactivated instead of deleted so earned historical records remain valid.

---

# 14. Content Registry Architecture

The key architecture decision is that static content lives in the repository while SQL Server stores its identity and version metadata.

```text
src/content/
    algorithms/
    data-structures/
    challenges/
    learning-paths/

            |
            | build/publish synchronization
            v
ContentItems
            |
            +---- ContentVersions
```

`ContentItems` answers:

> What is this piece of LogicLab content?

`ContentVersions` answers:

> Which exact published version was used?

---

## 15. ContentItems

### Purpose

Registers static LogicLab content without copying all educational text into SQL.

### Supported types

```text
ALGORITHM
DATA_STRUCTURE
CHALLENGE
LEARNING_PATH
```

### Attributes

```text
ContentItemId
ContentType
Slug
DisplayName
IsActive
CreatedAt
UpdatedAt
RowVersion
```

### Rules

- `(ContentType, Slug)` must be unique.
- Inactive items are retained when historical records still reference them.
- Content files remain the canonical source of educational content.
- SQL Server provides stable identity and reference points.

---

## 16. ContentVersions

### Purpose

Provides historical reproducibility for user records.

A record can say:

```text
Quick Sort
Version 3
```

even after version 4 becomes current.

### Attributes

```text
ContentVersionId
ContentItemId
VersionNumber
ContentHash
PublishedAt
IsCurrent
CreatedAt
```

### Rules

- `(ContentItemId, VersionNumber)` is unique.
- Only one version per content item may be current.
- Published versions should be treated as immutable.
- A correction creates a new version instead of silently changing historical content.
- `ContentHash` can detect content changes between builds.

---

# 17. Users

Stores account identity and authentication state.

```text
Users
├── UserId
├── Username
├── NormalizedUsername
├── Email
├── NormalizedEmail
├── PasswordHash
├── DisplayName
├── AvatarUrl
├── Role
├── AccountStatus
├── EmailVerifiedAt
├── LastLoginAt
├── CreatedAt
├── UpdatedAt
├── DeletedAt
└── RowVersion
```

### Rules

- Passwords are never stored in plaintext.
- Email and username are normalized before storage.
- Normalized values are used for uniqueness and lookup.
- The server controls role and account status.
- Account deletion must follow the privacy/account lifecycle policy.

---

# 18. UserSessions

Stores server-side sessions.

```text
UserSessions
├── SessionId
├── UserId
├── SessionTokenHash
├── UserAgent
├── IpAddressHash
├── CreatedAt
├── LastSeenAt
├── ExpiresAt
├── LastRotatedAt
├── RevokedAt
└── RevocationReason
```

Raw session tokens must never be stored.

Expired and revoked sessions should be cleaned up periodically.

---

# 19. UserSettings

Stores durable user preferences.

```text
Theme
Language
DefaultPlaybackSpeed
AutoPlay
ReducedMotion
SoundEnabled
```

These preferences are separate from application-global configuration.

---

# 20. AlgorithmProgress

Stores aggregate learning state for one user and one algorithm content item.

Important fields:

```text
CompletionPercent
TimesViewed
TimesStarted
TimesCompleted
TimesPracticed
TimesPredicted
LastStepViewed
BestScore
FirstViewedAt
LastViewedAt
CompletedAt
```

This is a summary table, not a raw event log.

Counters must be updated transactionally with the action that caused the change when strong consistency is required.

---

# 21. DataStructureProgress

Equivalent aggregate state for data-structure learning.

`LastOperation` is only the latest summary snapshot. Detailed operations belong in experiment/history data when they need to persist.

---

# 22. ChallengeProgress

Long-term relationship between a user and a challenge.

```text
ChallengeProgress
       |
       +---- AttemptsCount
       +---- HintsUsed
       +---- BestAttemptId
       +---- FirstAttemptedAt
       +---- LastAttemptedAt
       +---- CompletedAt
```

The best result is derived from the referenced best attempt rather than duplicating score/time in multiple places.

---

# 23. ChallengeAttempts

Each individual attempt is persisted separately.

```text
AttemptNumber
AttemptStatus
AnswerData
EvaluationData
FeedbackData
IsCorrect
Score
QuestionsAnswered
CorrectAnswers
HintsUsed
TimeSpentMs
ContentVersionId
```

A unique constraint prevents duplicate:

```text
(UserId, ContentItemId, AttemptNumber)
```

The server calculates score/correctness. The browser is not trusted to report those values.

---

# 24. LearningPathProgress

Stores path-level progress.

```text
LearningPathProgress
├── ContentVersionId
├── Status
├── CompletionPercent
├── CurrentItemContentItemId
├── ItemsCompleted
├── StartedAt
├── LastActivityAt
└── CompletedAt
```

The current item is identified by a content item rather than a free-form string.

---

# 25. LearningPathItemProgress

Tracks individual path items.

This solves the problem of a path saying `75% complete` without knowing which specific units were completed.

```text
LearningPathProgress
        |
        +---- Item A -> COMPLETED
        +---- Item B -> COMPLETED
        +---- Item C -> IN_PROGRESS
        +---- Item D -> NOT_STARTED
```

---

# 26. Favorites

Favorites use a direct FK to `ContentItems`.

This intentionally avoids a generic:

```text
EntityType + EntitySlug
```

relationship when the target can be represented directly.

Duplicate favorites are blocked by:

```text
UNIQUE(UserId, ContentItemId)
```

---

# 27. Bookmarks

A bookmark can target exactly one of:

```text
ContentItem
Experiment
```

The `CHECK` constraint prevents both or neither from being selected.

The partial unique indexes prevent duplicate bookmarks for the same user/target/step combination.

---

# 28. Experiments

An experiment represents saved experiment state, not one execution result.

It stores:

```text
Name
Description
ExperimentType
InputData
ConfigurationData
RandomSeed
ExecutionSettings
Status
```

It intentionally does not store a single mutable `ResultData` because results belong to individual executions.

---

# 29. ExperimentAlgorithms

Stores which algorithms participate in an experiment.

```text
Experiment
    |
    +-- Algorithm A
    +-- Algorithm B
    +-- Algorithm C
```

Each row references a specific content version so a later content update does not silently change historical experiment meaning.

---

# 30. ExperimentExecutions

Each run receives its own immutable-ish snapshot.

```text
InputSnapshot
ConfigurationSnapshot
RandomSeed
ResultData
MetricsData
ExecutionStatus
ExecutionDurationMs
StartedAt
ExecutedAt
```

The `ExperimentId` is intentionally not duplicated here. It is derived through `ExperimentAlgorithmId`.

This prevents an execution from claiming:

```text
Experiment A
Algorithm from Experiment B
```

through mismatched foreign keys.

---

# 31. Comparisons

Stores one saved comparison configuration/input.

The algorithm list is normalized into `ComparisonAlgorithms` rather than an array or comma-separated field.

---

# 32. ComparisonAlgorithms

Stores the algorithm-specific portion of a comparison:

```text
ContentItemId
ContentVersionId
ExecutionOrder
MetricsData
ResultData
ExecutionDurationMs
```

This supports clean queryability and independent algorithm results.

---

# 33. History

History is user-facing meaningful history.

Allowed actions include:

```text
VIEW
START
EXECUTE
COMPLETE
PRACTICE
PREDICT
COMPARE
OPEN
SAVE
```

A history record targets exactly one of:

```text
ContentItem
Experiment
Comparison
```

This is deliberately different from raw analytics.

---

# 34. UserActivity

UserActivity is lightweight analytics/behavior tracking.

It may record:

```text
algorithm opened
challenge completed
experiment executed
comparison created
```

It must not store every visualizer step.

---

# 35. UserDailyActivity

Aggregates daily activity for dashboards and streaks.

```text
UserId
ActivityDate
ActivityCount
LearningMinutes
ChallengesCompleted
AlgorithmsCompleted
DataStructuresCompleted
UpdatedAt
RowVersion
```

The table should be updated transactionally or by a reliable aggregation process.

---

# 36. Achievements

Stores achievement definitions.

An achievement should normally be deactivated rather than deleted.

Example:

```text
AchievementCode = FIRST_SORT
Name = First Sorting Algorithm Completed
```

The `Criteria` JSON contains the machine-evaluable criteria for the achievement.

---

# 37. UserAchievements

Connects users to earned achievement definitions.

A user can earn a given achievement only once under the baseline model.

The application must validate the achievement criteria before inserting the earned record.

---

# 38. Database Relationship Summary

```text
Users
│
├── UserSessions
├── UserSettings
├── AlgorithmProgress
├── DataStructureProgress
├── ChallengeProgress
│     └── ChallengeAttempts
├── LearningPathProgress
│     └── LearningPathItemProgress
├── Favorites
├── Bookmarks
├── Experiments
│     └── ExperimentAlgorithms
│            └── ExperimentExecutions
├── Comparisons
│     └── ComparisonAlgorithms
├── History
├── UserActivity
├── UserDailyActivity
└── UserAchievements
          │
          └── Achievements

ContentItems
│
└── ContentVersions
```

---

# 39. Database Integrity Principles

The database should enforce the strongest relationship it can.

Prefer:

```text
Favorites -> ContentItems FK
Bookmarks -> ContentItems / Experiments FK
Progress -> ContentItems FK
Attempts -> ContentItems FK
```

Avoid unnecessary polymorphic references.

When a polymorphic concept is truly necessary, it should be constrained at the application layer and covered by validation tests.

---

# 40. Aggregate Consistency

Fields such as:

```text
TimesCompleted
AttemptsCount
ItemsCompleted
ActivityCount
ChallengesCompleted
AlgorithmsCompleted
```

are derived aggregates.

They are not independent facts.

The application must update them consistently with their underlying records inside the appropriate transaction.

Periodic reconciliation can be used to detect drift.

---

# 41. Content Version Integrity

A record using a content version must reference a version belonging to the same content item wherever that relationship matters.

The server must validate version/content compatibility before writes.

For important records, the content version must be immutable after publication.

---

# 42. Content Synchronization

A build/publish validation process should detect:

```text
Static content exists
BUT
ContentItems record missing
```

and:

```text
ContentItems record exists
BUT
Static content missing
```

The repository becomes the canonical content source and the database becomes the durable registry/version store.

---

# 43. Transaction Strategy

Multi-write operations use short database transactions.

### Challenge submission

```text
BEGIN
  insert ChallengeAttempt
  update ChallengeProgress
  update UserActivity
  update UserDailyActivity
  award achievement if needed
COMMIT
```

### Save experiment

```text
BEGIN
  insert Experiment
  insert ExperimentAlgorithms
COMMIT
```

### Complete learning-path item

```text
BEGIN
  update LearningPathItemProgress
  update LearningPathProgress
  update UserDailyActivity
  award achievement if needed
COMMIT
```

Do not keep transactions open during long algorithm execution, streaming, external calls, or user waiting time.

---

# 44. Concurrency Strategy

Normal updates should use optimistic concurrency when multiple writers may touch the same aggregate.

Pattern:

```sql
UPDATE dbo.Experiments
SET
    Name = @Name,
    UpdatedAt = SYSUTCDATETIME()
WHERE
    ExperimentId = @ExperimentId
    AND RowVersion = @ExpectedRowVersion;
```

If zero rows are updated, return a concurrency conflict and ask the service layer to resolve it.

---

# 45. Aggregate Counter Concurrency

For counters, the service layer must use an atomic update or a transaction that prevents lost updates.

A pattern such as:

```sql
UPDATE dbo.ChallengeProgress
SET AttemptsCount = AttemptsCount + 1
WHERE UserId = @UserId
  AND ContentItemId = @ContentItemId;
```

is preferred over reading a count, incrementing it in application memory, and writing it back.

---

# 46. Repository Architecture

The approved server-side path is:

```text
Next.js Route
      |
      v
Request Validation
      |
      v
Use Case
      |
      v
Service / Domain Logic
      |
      v
Repository
      |
      v
Database Adapter
      |
      v
SQL Server
```

React components must not contain SQL.

Client-side feature code must not connect to SQL Server.

---

# 47. Connection Pooling

The application uses one controlled database client/pool abstraction.

Requirements:

- reuse connections;
- bounded pool size;
- acquire/release correctly;
- timeout unhealthy connections;
- prevent leaked connections;
- expose health/diagnostic information.

---

# 48. Query Organization

SQL belongs in responsibility-specific database modules.

Examples:

```text
server/database/queries/users/
server/database/queries/progress/
server/database/queries/challenges/
server/database/queries/experiments/
server/database/queries/comparisons/
```

Avoid giant SQL files mixing unrelated domains.

---

# 49. SQL Injection Protection

Never construct untrusted SQL by string concatenation.

Use:

- parameterized queries;
- safe query builders;
- prepared statements;
- trusted repository methods.

User input must never determine SQL syntax.

---

# 50. JSON Storage Rules

JSON is appropriate for variable or snapshot-like payloads such as:

```text
AnswerData
EvaluationData
FeedbackData
InputData
ConfigurationData
ExecutionSettings
MetricsData
Metadata
```

JSON must not be used merely to avoid proper relational modeling.

If a value becomes a high-frequency query/filter field, it should be evaluated for promotion to a real column.

---

# 51. JSON Size Limits

`NVARCHAR(MAX)` does not mean unlimited user input.

The application validation layer must define bounded limits for:

- challenge answers;
- experiment inputs;
- configuration objects;
- result snapshots;
- metrics payloads;
- metadata.

This reduces resource-exhaustion and abusive-payload risks.

---

# 52. Pagination

Unbounded queries are prohibited for potentially large tables such as:

```text
History
UserActivity
ChallengeAttempts
ExperimentExecutions
Comparisons
```

Use stable ordering and bounded page sizes. Keyset/cursor pagination should be preferred for very large datasets.

---

# 53. Indexing Strategy

Indexes must serve real query patterns.

Important access paths include:

```text
Users(NormalizedEmail)
Users(NormalizedUsername)
AlgorithmProgress(UserId, LastViewedAt)
ChallengeAttempts(UserId, ContentItemId, CreatedAt)
LearningPathProgress(UserId, LastActivityAt)
Experiments(UserId, UpdatedAt)
History(UserId, CreatedAt)
UserActivity(UserId, CreatedAt)
```

Every new index must have a query/use-case justification.

---

# 54. Search Strategy

The initial SQL database is not the canonical full-text search engine for educational content.

Static content search should primarily use the content registry/search layer.

SQL full-text search may be introduced later if a verified requirement justifies it.

---

# 55. Activity Retention

`UserActivity` may become high-volume.

The project must define:

```text
raw activity retention
archive period
cleanup schedule
summary retention
```

Daily summaries may be retained longer than raw activity.

---

# 56. Experiment Execution Retention

Saved experiments are long-lived user assets.

Individual execution snapshots can have a bounded retention policy if they are not explicitly saved/bookmarked.

Suggested conceptual split:

```text
Saved Experiment       -> long-lived
Saved/Bookmarked Run   -> long-lived
Transient Run          -> short-lived or memory only
```

---

# 57. Backup Strategy

Production must have:

- automated backups;
- point-in-time recovery where available;
- tested restores;
- documented retention;
- protected backup storage;
- recovery documentation.

A backup is not considered verified until restoration has been tested.

---

# 58. Disaster Recovery

The deployment plan must define:

```text
RPO
RTO
Backup Retention
Restore Procedure
Database Failover
Credential Recovery
Application Redeployment
```

Exact targets are deployment-specific.

---

# 59. Data Deletion and Privacy

Account deletion policy must cover:

```text
Users
UserSessions
UserSettings
Progress
Attempts
Experiments
Comparisons
Favorites
Bookmarks
History
Activity
Achievements
```

Some records may need retention for legal/security reasons; those cases must be explicitly documented.

---

# 60. User Data Export

A user export should be able to include:

```text
profile
settings
progress
favorites
bookmarks
experiments
challenge history
learning progress
achievements
```

The export should reference static content by stable identifiers rather than duplicating the full educational content.

---

# 61. Database Security

Production requirements include:

- encrypted database connections;
- least-privilege database identity;
- secure secret storage;
- credential rotation;
- restricted network access;
- no production credentials in Git;
- separate development/staging/production credentials.

Do not use `sa` or another administrator-level account for routine application requests.

---

# 62. Password Security

Only `PasswordHash` is stored.

Use an appropriate dedicated password hashing algorithm in the application, such as:

```text
Argon2id
bcrypt
scrypt
```

Do not use MD5, SHA-1, or plain SHA-256 for password storage.

---

# 63. Session Security

Sessions must support:

```text
expiration
rotation
revocation
logout
multiple-device/session management
```

Raw authentication tokens must never be persisted.

---

# 64. Migration Strategy

Every schema modification must have an ordered migration.

Example:

```text
001_initial_schema.sql
002_content_registry.sql
003_challenge_progress.sql
004_experiment_executions.sql
```

Migrations must be reviewed and tested before production.

---

# 65. Migration Rules

### Adding a required column to existing production data

Prefer:

```text
add nullable
    -> backfill
    -> validate
    -> enforce NOT NULL
```

### Removing a column

Use:

```text
stop application reads/writes
    -> deploy migration
    -> remove column
```

Do not remove a live field without an application rollout strategy.

### Renaming

Use a data-preserving migration instead of drop-and-recreate.

---

# 66. Seed Strategy

Maintain separate seed sets for:

```text
development

testing

demo
```

Production must never depend on developer seed data.

Tests should use deterministic fixtures.

---

# 67. Database Testing

Integration tests must verify real SQL Server behavior where database semantics matter.

Test:

- foreign keys;
- uniqueness constraints;
- check constraints;
- cascade behavior;
- transaction rollback;
- concurrent updates;
- row-version conflicts;
- migration correctness;
- filtered unique indexes;
- JSON validation.

---

# 68. End-to-End Database Tests

Important E2E flows include:

```text
Register
Login
Open algorithm
Execute algorithm
Save progress
Start challenge
Submit challenge
Save experiment
Run experiment
Compare algorithms
Bookmark an item
Favorite an item
Advance learning path
Earn achievement
Delete account
```

---

# 69. Database Failure Handling

When SQL Server is unavailable:

- static public educational content should remain usable where architecture permits;
- persistent writes must fail safely;
- the UI must not claim a successful save when persistence failed;
- retry behavior must be bounded;
- errors should be logged without leaking secrets.

---

# 70. Partial Failure Handling

If a business operation requires several writes, use one transaction.

```text
BEGIN
  write A
  write B
  write C
COMMIT
```

On failure:

```text
ROLLBACK
```

Do not allow a half-completed business operation to be represented as successful state.

---

# 71. Streak Strategy

Use `UserDailyActivity` to support:

- current streak;
- longest streak;
- active days;
- weekly/monthly learning summaries.

Raw activity remains useful for detailed history, while daily summaries are optimized for dashboard queries.

---

# 72. Achievement Strategy

Achievement evaluation is a server-side responsibility.

Example:

```text
Complete 10 algorithms
        |
        v
Progress/activity aggregates
        |
        v
Achievement evaluator
        |
        v
UserAchievements
```

The browser cannot simply send `achievementEarned = true`.

---

# 73. Reproducibility Rules

Saved historical data should remain understandable after content or implementation changes.

Important long-lived records should reference the content version that was used.

Examples:

```text
ChallengeAttempts -> ContentVersionId
AlgorithmProgress -> ContentVersionId
ExperimentAlgorithms -> ContentVersionId
ComparisonAlgorithms -> ContentVersionId
LearningPathProgress -> ContentVersionId
```

---

# 74. Content Hashing Workflow

A publishing process may:

1. load canonical content from the repository;
2. normalize the representation;
3. calculate a SHA-256 hash;
4. compare it with the current database version;
5. create a new `ContentVersions` row when content changes;
6. mark the new version current.

Historical versions should remain referenceable.

---

# 75. Avoid Database Overengineering

Do not introduce a new table unless the data requires:

- independent lifecycle;
- independent ownership;
- relational integrity;
- independent retention;
- independent query patterns;
- transactional behavior that cannot cleanly fit another table.

The database should remain understandable to a new contributor.

---

# 76. Performance Growth Strategy

The intended growth path is:

```text
Correct schema
      |
      v
Correct indexes
      |
      v
Bounded queries
      |
      v
Connection pooling
      |
      v
Caching
      |
      v
Query optimization
      |
      v
Larger SQL Server / Azure SQL
```

Do not begin with distributed-database complexity.

---

# 77. SQL Server → Azure SQL Strategy

The application should treat the database location as infrastructure configuration.

A production move should preserve:

```text
repository contracts
service contracts
API contracts
logical relationships
schema semantics
```

The expected changes are primarily:

```text
connection configuration
infrastructure
secrets
migration deployment
backup/recovery setup
```

---

# 78. Complete Table Inventory

The baseline schema contains 23 tables:

```text
01. Users
02. UserSessions
03. UserSettings
04. ContentItems
05. ContentVersions
06. AlgorithmProgress
07. DataStructureProgress
08. ChallengeProgress
09. ChallengeAttempts
10. LearningPathProgress
11. LearningPathItemProgress
12. Favorites
13. Experiments
14. ExperimentAlgorithms
15. ExperimentExecutions
16. Bookmarks
17. Comparisons
18. ComparisonAlgorithms
19. History
20. UserActivity
21. UserDailyActivity
22. Achievements
23. UserAchievements
```

Additional tables require a documented product/architecture requirement.

---

# 79. Example: Algorithm Progress Flow

```text
User opens Bubble Sort
        |
        v
ContentItems lookup
        |
        v
Current ContentVersion lookup
        |
        v
AlgorithmProgress read/create
        |
        v
Visualizer runs
        |
        v
Progress transaction
        |
        +-- AlgorithmProgress
        +-- UserActivity
        +-- UserDailyActivity
```

---

# 80. Example: Challenge Submission Flow

```text
Browser
   |
   v
POST /api/challenges/[id]/submit
   |
   v
Validate request
   |
   v
Resolve ContentItem + ContentVersion
   |
   v
Server-side evaluation
   |
   v
BEGIN TRANSACTION
   |
   +-- ChallengeAttempts INSERT
   +-- ChallengeProgress UPDATE
   +-- UserActivity INSERT
   +-- UserDailyActivity UPSERT
   +-- Achievement evaluation
   |
   v
COMMIT
```

---

# 81. Example: Experiment Flow

```text
Create experiment
       |
       v
Experiments
       |
       v
ExperimentAlgorithms
       |
       v
Run
       |
       v
ExperimentExecutions
       |
       +-- InputSnapshot
       +-- ConfigurationSnapshot
       +-- RandomSeed
       +-- ResultData
       +-- MetricsData
```

---

# 82. Example: Comparison Flow

```text
Create comparison
       |
       v
Comparisons
       |
       +---- Bubble Sort
       +---- Merge Sort
       +---- Quick Sort
                    |
                    v
          ComparisonAlgorithms
                    |
                    +-- Metrics
                    +-- Result
                    +-- Duration
```

---

# 83. Example: Learning Path Flow

```text
Open learning path
       |
       v
LearningPathProgress
       |
       v
LearningPathItemProgress
       |
       v
Complete item
       |
       +-- item progress update
       +-- path aggregate update
       +-- daily activity update
       +-- achievement evaluation
```

---

# 84. Example SQL — Recent Progress

```sql
SELECT
    ProgressId,
    ContentItemId,
    ContentVersionId,
    Status,
    CompletionPercent,
    LastViewedAt,
    CompletedAt
FROM dbo.AlgorithmProgress
WHERE UserId = @UserId
ORDER BY LastViewedAt DESC;
```

---

# 85. Example SQL — Recent History

```sql
SELECT
    HistoryId,
    ContentItemId,
    ExperimentId,
    ComparisonId,
    ActionType,
    CreatedAt
FROM dbo.History
WHERE UserId = @UserId
ORDER BY CreatedAt DESC
OFFSET @Offset ROWS
FETCH NEXT @PageSize ROWS ONLY;
```

---

# 86. Example SQL — Challenge Attempts

```sql
SELECT
    AttemptId,
    AttemptNumber,
    AttemptStatus,
    Score,
    TimeSpentMs,
    StartedAt,
    SubmittedAt
FROM dbo.ChallengeAttempts
WHERE
    UserId = @UserId
    AND ContentItemId = @ContentItemId
ORDER BY AttemptNumber DESC;
```

---

# 87. Example SQL — Optimistic Update

```sql
UPDATE dbo.Experiments
SET
    Name = @Name,
    Description = @Description,
    ConfigurationData = @ConfigurationData,
    UpdatedAt = SYSUTCDATETIME()
WHERE
    ExperimentId = @ExperimentId
    AND RowVersion = @ExpectedRowVersion;
```

The repository checks the affected-row count.

```text
1 row -> success
0 rows -> concurrency conflict
```

---

# 88. Example SQL — Transaction

```sql
BEGIN TRANSACTION;

INSERT INTO dbo.ChallengeAttempts
(
    UserId,
    ContentItemId,
    ContentVersionId,
    AttemptNumber,
    AttemptStatus,
    AnswerData,
    EvaluationData,
    FeedbackData,
    IsCorrect,
    Score,
    HintsUsed,
    TimeSpentMs,
    SubmittedAt
)
VALUES
(
    @UserId,
    @ContentItemId,
    @ContentVersionId,
    @AttemptNumber,
    'EVALUATED',
    @AnswerData,
    @EvaluationData,
    @FeedbackData,
    @IsCorrect,
    @Score,
    @HintsUsed,
    @TimeSpentMs,
    SYSUTCDATETIME()
);

UPDATE dbo.ChallengeProgress
SET
    AttemptsCount = AttemptsCount + 1,
    LastAttemptedAt = SYSUTCDATETIME(),
    UpdatedAt = SYSUTCDATETIME()
WHERE
    UserId = @UserId
    AND ContentItemId = @ContentItemId;

COMMIT TRANSACTION;
```

The real application must also handle duplicate attempt conflicts, achievements, activity, rollback, and concurrency.

---

# 89. Production Database Checklist

```text
[ ] Production SQL Server/Azure SQL created
[ ] Correct schema version deployed
[ ] All migrations applied
[ ] Backup configured
[ ] Restore tested
[ ] Runtime database identity created
[ ] Least privileges configured
[ ] Credentials stored securely
[ ] Encrypted connections enabled
[ ] Connection limits configured
[ ] Indexes reviewed
[ ] Slow-query monitoring enabled
[ ] Health checks enabled
[ ] Retention jobs configured
[ ] User deletion policy tested
[ ] Migration rollback strategy verified
[ ] Development seed scripts restricted
[ ] No local database hardcoding
[ ] No production secrets in Git
```

---

# 90. Development Database Checklist

```text
[ ] New table has one clear responsibility
[ ] Primary key defined
[ ] Foreign keys defined
[ ] Required columns are NOT NULL
[ ] Nullable columns are justified
[ ] Unique constraints reviewed
[ ] Check constraints reviewed
[ ] Indexes based on real queries
[ ] CreatedAt handled
[ ] UpdatedAt handled
[ ] RowVersion added where needed
[ ] JSON validated where used
[ ] Application payload limits defined
[ ] Transaction boundary defined
[ ] Repository created
[ ] Integration tests added
[ ] Migration created
[ ] Seed strategy reviewed
```

---

# 91. Final Architecture Rules

The following rules are mandatory:

1. Browser code must never directly connect to SQL Server.
2. SQL Server must not become the canonical store for static educational text/code.
3. User-owned records must always be protected by ownership checks.
4. Client-provided scores, correctness, progress, and achievements are untrusted.
5. Passwords are never stored in plaintext.
6. Raw session tokens are never persisted.
7. Real foreign keys are preferred over polymorphic references.
8. Aggregate counters need a consistency strategy.
9. High-volume tables need retention policies.
10. Mutable aggregates use optimistic concurrency where needed.
11. Schema changes use versioned migrations.
12. Production credentials never enter source control.
13. Large unbounded queries are prohibited.
14. Database writes go through the server/data-access layer.
15. Important historical records reference content versions.
16. Published content versions are immutable.
17. Achievement definitions are normally deactivated rather than deleted.
18. Transactions remain short-lived.
19. Raw visualization steps are not stored in analytics by default.
20. Any new table requires an explicit architectural reason.

---

# 92. Final Approved Database Model

```text
                            LOGICLAB
                               |
              +----------------+----------------+
              |                                 |
              v                                 v
       STATIC CONTENT                       SQL SERVER
              |                                 |
       TypeScript/JSON/MD                       |
              |                                 |
              v                       +---------+---------+
      ContentItems                    |                   |
              |                       v                   v
              v                    USERS              CONTENT
      ContentVersions                |                   |
                                     |              ContentItems
                   +-----------------+                 |
                   |        |        |                 +-- ContentVersions
                   v        v        v
               Progress  Practice  Learning
                   |        |        |
             Algorithms  Challenges  Paths
                         |
                         +-- Attempts

Experiments
    |
    +-- ExperimentAlgorithms
              |
              +-- ExperimentExecutions

Comparisons
    |
    +-- ComparisonAlgorithms

Users
    |
    +-- Favorites
    +-- Bookmarks
    +-- History
    +-- UserActivity
    +-- UserDailyActivity
    +-- UserAchievements
                         |
                         +-- Achievements
```

The final principle is:

> **SQL Server stores durable dynamic state about how users interact with LogicLab, while the repository remains the canonical source for the educational knowledge itself.**

---

# 93. Complete SQL Server Schema

The following is the approved baseline schema corresponding to the architecture documented above.

```sql
/* ============================================================
   LOGICLAB — FINAL DATABASE SCHEMA
   Engine: Microsoft SQL Server
   Schema: dbo

   Static educational content remains in TypeScript/JSON/MD.
   SQL Server stores dynamic user/application state.
   ============================================================ */

SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
SET XACT_ABORT ON;

BEGIN TRANSACTION;

/* ============================================================
   1. USERS
   ============================================================ */

CREATE TABLE dbo.Users
(
    UserId                  UNIQUEIDENTIFIER NOT NULL
        CONSTRAINT PK_Users PRIMARY KEY
        DEFAULT NEWSEQUENTIALID(),

    Username                NVARCHAR(50) NOT NULL,
    NormalizedUsername      NVARCHAR(50) NOT NULL,
    Email                   NVARCHAR(320) NOT NULL,
    NormalizedEmail         NVARCHAR(320) NOT NULL,
    PasswordHash            NVARCHAR(500) NOT NULL,
    DisplayName             NVARCHAR(100) NULL,
    AvatarUrl               NVARCHAR(1000) NULL,

    Role                    VARCHAR(30) NOT NULL
        CONSTRAINT DF_Users_Role DEFAULT 'USER',

    AccountStatus           VARCHAR(30) NOT NULL
        CONSTRAINT DF_Users_AccountStatus DEFAULT 'ACTIVE',

    EmailVerifiedAt         DATETIME2(3) NULL,
    LastLoginAt             DATETIME2(3) NULL,

    CreatedAt               DATETIME2(3) NOT NULL
        CONSTRAINT DF_Users_CreatedAt DEFAULT SYSUTCDATETIME(),

    UpdatedAt               DATETIME2(3) NOT NULL
        CONSTRAINT DF_Users_UpdatedAt DEFAULT SYSUTCDATETIME(),

    DeletedAt               DATETIME2(3) NULL,
    RowVersion              ROWVERSION NOT NULL,

    CONSTRAINT CK_Users_Role
        CHECK (Role IN ('USER', 'ADMIN')),

    CONSTRAINT CK_Users_AccountStatus
        CHECK
        (
            AccountStatus IN
            (
                'ACTIVE',
                'SUSPENDED',
                'LOCKED',
                'DELETED'
            )
        ),

    CONSTRAINT CK_Users_DeletedState
        CHECK
        (
            (
                AccountStatus = 'DELETED'
                AND DeletedAt IS NOT NULL
            )
            OR
            AccountStatus <> 'DELETED'
        )
);


/* ============================================================
   2. USER SESSIONS
   ============================================================ */

CREATE TABLE dbo.UserSessions
(
    SessionId               UNIQUEIDENTIFIER NOT NULL
        CONSTRAINT PK_UserSessions PRIMARY KEY
        DEFAULT NEWSEQUENTIALID(),

    UserId                  UNIQUEIDENTIFIER NOT NULL,
    SessionTokenHash        BINARY(32) NOT NULL,
    UserAgent               NVARCHAR(1000) NULL,
    IpAddressHash           BINARY(32) NULL,

    CreatedAt               DATETIME2(3) NOT NULL
        CONSTRAINT DF_UserSessions_CreatedAt DEFAULT SYSUTCDATETIME(),

    LastSeenAt              DATETIME2(3) NOT NULL
        CONSTRAINT DF_UserSessions_LastSeenAt DEFAULT SYSUTCDATETIME(),

    ExpiresAt               DATETIME2(3) NOT NULL,
    LastRotatedAt           DATETIME2(3) NULL,
    RevokedAt               DATETIME2(3) NULL,
    RevocationReason        NVARCHAR(500) NULL,

    CONSTRAINT FK_UserSessions_Users
        FOREIGN KEY (UserId)
        REFERENCES dbo.Users(UserId)
        ON DELETE CASCADE,

    CONSTRAINT UQ_UserSessions_TokenHash
        UNIQUE (SessionTokenHash)
);


/* ============================================================
   3. USER SETTINGS
   ============================================================ */

CREATE TABLE dbo.UserSettings
(
    UserId                  UNIQUEIDENTIFIER NOT NULL
        CONSTRAINT PK_UserSettings PRIMARY KEY,

    Theme                   VARCHAR(20) NOT NULL
        CONSTRAINT DF_UserSettings_Theme DEFAULT 'SYSTEM',

    Language                VARCHAR(20) NOT NULL
        CONSTRAINT DF_UserSettings_Language DEFAULT 'en',

    DefaultPlaybackSpeed    DECIMAL(4,2) NOT NULL
        CONSTRAINT DF_UserSettings_PlaybackSpeed DEFAULT 1.00,

    AutoPlay                BIT NOT NULL
        CONSTRAINT DF_UserSettings_AutoPlay DEFAULT 0,

    ReducedMotion           BIT NOT NULL
        CONSTRAINT DF_UserSettings_ReducedMotion DEFAULT 0,

    SoundEnabled            BIT NOT NULL
        CONSTRAINT DF_UserSettings_SoundEnabled DEFAULT 1,

    CreatedAt               DATETIME2(3) NOT NULL
        CONSTRAINT DF_UserSettings_CreatedAt DEFAULT SYSUTCDATETIME(),

    UpdatedAt               DATETIME2(3) NOT NULL
        CONSTRAINT DF_UserSettings_UpdatedAt DEFAULT SYSUTCDATETIME(),

    RowVersion              ROWVERSION NOT NULL,

    CONSTRAINT FK_UserSettings_Users
        FOREIGN KEY (UserId)
        REFERENCES dbo.Users(UserId)
        ON DELETE CASCADE,

    CONSTRAINT CK_UserSettings_Theme
        CHECK (Theme IN ('LIGHT', 'DARK', 'SYSTEM')),

    CONSTRAINT CK_UserSettings_PlaybackSpeed
        CHECK
        (
            DefaultPlaybackSpeed >= 0.25
            AND DefaultPlaybackSpeed <= 4.00
        )
);


/* ============================================================
   4. CONTENT ITEMS
   ============================================================ */

CREATE TABLE dbo.ContentItems
(
    ContentItemId           UNIQUEIDENTIFIER NOT NULL
        CONSTRAINT PK_ContentItems PRIMARY KEY
        DEFAULT NEWSEQUENTIALID(),

    ContentType             VARCHAR(30) NOT NULL,
    Slug                    NVARCHAR(200) NOT NULL,
    DisplayName             NVARCHAR(200) NOT NULL,

    IsActive                BIT NOT NULL
        CONSTRAINT DF_ContentItems_IsActive DEFAULT 1,

    CreatedAt               DATETIME2(3) NOT NULL
        CONSTRAINT DF_ContentItems_CreatedAt DEFAULT SYSUTCDATETIME(),

    UpdatedAt               DATETIME2(3) NOT NULL
        CONSTRAINT DF_ContentItems_UpdatedAt DEFAULT SYSUTCDATETIME(),

    RowVersion              ROWVERSION NOT NULL,

    CONSTRAINT CK_ContentItems_ContentType
        CHECK
        (
            ContentType IN
            (
                'ALGORITHM',
                'DATA_STRUCTURE',
                'CHALLENGE',
                'LEARNING_PATH'
            )
        ),

    CONSTRAINT UQ_ContentItems_TypeSlug
        UNIQUE (ContentType, Slug),

    CONSTRAINT UQ_ContentItems_IdType
        UNIQUE (ContentItemId, ContentType)
);


/* ============================================================
   5. CONTENT VERSIONS
   ============================================================ */

CREATE TABLE dbo.ContentVersions
(
    ContentVersionId        UNIQUEIDENTIFIER NOT NULL
        CONSTRAINT PK_ContentVersions PRIMARY KEY
        DEFAULT NEWSEQUENTIALID(),

    ContentItemId           UNIQUEIDENTIFIER NOT NULL,
    VersionNumber           INT NOT NULL,
    ContentHash             CHAR(64) NOT NULL,
    PublishedAt             DATETIME2(3) NULL,

    IsCurrent               BIT NOT NULL
        CONSTRAINT DF_ContentVersions_IsCurrent DEFAULT 0,

    CreatedAt               DATETIME2(3) NOT NULL
        CONSTRAINT DF_ContentVersions_CreatedAt DEFAULT SYSUTCDATETIME(),

    CONSTRAINT FK_ContentVersions_ContentItems
        FOREIGN KEY (ContentItemId)
        REFERENCES dbo.ContentItems(ContentItemId),

    CONSTRAINT CK_ContentVersions_Version
        CHECK (VersionNumber > 0),

    CONSTRAINT UQ_ContentVersions_ItemVersion
        UNIQUE (ContentItemId, VersionNumber),

    CONSTRAINT UQ_ContentVersions_IdItem
        UNIQUE (ContentVersionId, ContentItemId)
);


/* ============================================================
   6. ALGORITHM PROGRESS
   ============================================================ */

CREATE TABLE dbo.AlgorithmProgress
(
    ProgressId              UNIQUEIDENTIFIER NOT NULL
        CONSTRAINT PK_AlgorithmProgress PRIMARY KEY
        DEFAULT NEWSEQUENTIALID(),

    UserId                  UNIQUEIDENTIFIER NOT NULL,
    ContentItemId           UNIQUEIDENTIFIER NOT NULL,
    ContentType             VARCHAR(30) NOT NULL
        CONSTRAINT DF_AlgorithmProgress_ContentType DEFAULT 'ALGORITHM',
    ContentVersionId        UNIQUEIDENTIFIER NOT NULL,

    Status                  VARCHAR(30) NOT NULL
        CONSTRAINT DF_AlgorithmProgress_Status DEFAULT 'NOT_STARTED',

    CompletionPercent       DECIMAL(5,2) NOT NULL
        CONSTRAINT DF_AlgorithmProgress_Completion DEFAULT 0,

    TimesViewed             INT NOT NULL
        CONSTRAINT DF_AlgorithmProgress_TimesViewed DEFAULT 0,

    TimesStarted            INT NOT NULL
        CONSTRAINT DF_AlgorithmProgress_TimesStarted DEFAULT 0,

    TimesCompleted          INT NOT NULL
        CONSTRAINT DF_AlgorithmProgress_TimesCompleted DEFAULT 0,

    TimesPracticed          INT NOT NULL
        CONSTRAINT DF_AlgorithmProgress_TimesPracticed DEFAULT 0,

    TimesPredicted          INT NOT NULL
        CONSTRAINT DF_AlgorithmProgress_TimesPredicted DEFAULT 0,

    LastStepViewed          INT NULL,
    BestScore               DECIMAL(10,2) NULL,
    FirstViewedAt           DATETIME2(3) NULL,
    LastViewedAt            DATETIME2(3) NULL,
    CompletedAt             DATETIME2(3) NULL,

    UpdatedAt               DATETIME2(3) NOT NULL
        CONSTRAINT DF_AlgorithmProgress_UpdatedAt DEFAULT SYSUTCDATETIME(),

    RowVersion              ROWVERSION NOT NULL,

    CONSTRAINT FK_AlgorithmProgress_Users
        FOREIGN KEY (UserId)
        REFERENCES dbo.Users(UserId)
        ON DELETE CASCADE,

    CONSTRAINT FK_AlgorithmProgress_ContentItem
        FOREIGN KEY (ContentItemId, ContentType)
        REFERENCES dbo.ContentItems(ContentItemId, ContentType),

    CONSTRAINT FK_AlgorithmProgress_ContentVersion
        FOREIGN KEY (ContentVersionId, ContentItemId)
        REFERENCES dbo.ContentVersions(ContentVersionId, ContentItemId),

    CONSTRAINT CK_AlgorithmProgress_ContentType
        CHECK (ContentType = 'ALGORITHM'),

    CONSTRAINT CK_AlgorithmProgress_Status
        CHECK
        (
            Status IN
            (
                'NOT_STARTED',
                'IN_PROGRESS',
                'COMPLETED'
            )
        ),

    CONSTRAINT CK_AlgorithmProgress_Completion
        CHECK
        (
            CompletionPercent >= 0
            AND CompletionPercent <= 100
        ),

    CONSTRAINT CK_AlgorithmProgress_Counters
        CHECK
        (
            TimesViewed >= 0
            AND TimesStarted >= 0
            AND TimesCompleted >= 0
            AND TimesPracticed >= 0
            AND TimesPredicted >= 0
        ),

    CONSTRAINT UQ_AlgorithmProgress_UserItem
        UNIQUE (UserId, ContentItemId)
);


/* ============================================================
   7. DATA STRUCTURE PROGRESS
   ============================================================ */

CREATE TABLE dbo.DataStructureProgress
(
    ProgressId              UNIQUEIDENTIFIER NOT NULL
        CONSTRAINT PK_DataStructureProgress PRIMARY KEY
        DEFAULT NEWSEQUENTIALID(),

    UserId                  UNIQUEIDENTIFIER NOT NULL,
    ContentItemId           UNIQUEIDENTIFIER NOT NULL,
    ContentType             VARCHAR(30) NOT NULL
        CONSTRAINT DF_DataStructureProgress_ContentType DEFAULT 'DATA_STRUCTURE',
    ContentVersionId        UNIQUEIDENTIFIER NOT NULL,

    Status                  VARCHAR(30) NOT NULL
        CONSTRAINT DF_DataStructureProgress_Status DEFAULT 'NOT_STARTED',

    CompletionPercent       DECIMAL(5,2) NOT NULL
        CONSTRAINT DF_DataStructureProgress_Completion DEFAULT 0,

    TimesViewed             INT NOT NULL
        CONSTRAINT DF_DataStructureProgress_TimesViewed DEFAULT 0,

    TimesStarted            INT NOT NULL
        CONSTRAINT DF_DataStructureProgress_TimesStarted DEFAULT 0,

    TimesCompleted          INT NOT NULL
        CONSTRAINT DF_DataStructureProgress_TimesCompleted DEFAULT 0,

    TimesPracticed          INT NOT NULL
        CONSTRAINT DF_DataStructureProgress_TimesPracticed DEFAULT 0,

    LastOperation           VARCHAR(50) NULL,
    FirstViewedAt           DATETIME2(3) NULL,
    LastViewedAt            DATETIME2(3) NULL,
    CompletedAt             DATETIME2(3) NULL,

    UpdatedAt               DATETIME2(3) NOT NULL
        CONSTRAINT DF_DataStructureProgress_UpdatedAt DEFAULT SYSUTCDATETIME(),

    RowVersion              ROWVERSION NOT NULL,

    CONSTRAINT FK_DataStructureProgress_Users
        FOREIGN KEY (UserId)
        REFERENCES dbo.Users(UserId)
        ON DELETE CASCADE,

    CONSTRAINT FK_DataStructureProgress_ContentItem
        FOREIGN KEY (ContentItemId, ContentType)
        REFERENCES dbo.ContentItems(ContentItemId, ContentType),

    CONSTRAINT FK_DataStructureProgress_ContentVersion
        FOREIGN KEY (ContentVersionId, ContentItemId)
        REFERENCES dbo.ContentVersions(ContentVersionId, ContentItemId),

    CONSTRAINT CK_DataStructureProgress_ContentType
        CHECK (ContentType = 'DATA_STRUCTURE'),

    CONSTRAINT CK_DataStructureProgress_Status
        CHECK
        (
            Status IN
            (
                'NOT_STARTED',
                'IN_PROGRESS',
                'COMPLETED'
            )
        ),

    CONSTRAINT CK_DataStructureProgress_Completion
        CHECK
        (
            CompletionPercent >= 0
            AND CompletionPercent <= 100
        ),

    CONSTRAINT CK_DataStructureProgress_Counters
        CHECK
        (
            TimesViewed >= 0
            AND TimesStarted >= 0
            AND TimesCompleted >= 0
            AND TimesPracticed >= 0
        ),

    CONSTRAINT UQ_DataStructureProgress_UserItem
        UNIQUE (UserId, ContentItemId)
);


/* ============================================================
   8. CHALLENGE PROGRESS
   ============================================================ */

CREATE TABLE dbo.ChallengeProgress
(
    ChallengeProgressId     UNIQUEIDENTIFIER NOT NULL
        CONSTRAINT PK_ChallengeProgress PRIMARY KEY
        DEFAULT NEWSEQUENTIALID(),

    UserId                  UNIQUEIDENTIFIER NOT NULL,
    ContentItemId           UNIQUEIDENTIFIER NOT NULL,
    ContentType             VARCHAR(30) NOT NULL
        CONSTRAINT DF_ChallengeProgress_ContentType DEFAULT 'CHALLENGE',
    ContentVersionId        UNIQUEIDENTIFIER NOT NULL,

    Status                  VARCHAR(30) NOT NULL
        CONSTRAINT DF_ChallengeProgress_Status DEFAULT 'NOT_STARTED',

    BestAttemptId           UNIQUEIDENTIFIER NULL,
    AttemptsCount           INT NOT NULL
        CONSTRAINT DF_ChallengeProgress_Attempts DEFAULT 0,

    HintsUsed               INT NOT NULL
        CONSTRAINT DF_ChallengeProgress_Hints DEFAULT 0,

    FirstAttemptedAt        DATETIME2(3) NULL,
    LastAttemptedAt         DATETIME2(3) NULL,
    CompletedAt             DATETIME2(3) NULL,

    UpdatedAt               DATETIME2(3) NOT NULL
        CONSTRAINT DF_ChallengeProgress_UpdatedAt DEFAULT SYSUTCDATETIME(),

    RowVersion              ROWVERSION NOT NULL,

    CONSTRAINT FK_ChallengeProgress_Users
        FOREIGN KEY (UserId)
        REFERENCES dbo.Users(UserId)
        ON DELETE CASCADE,

    CONSTRAINT FK_ChallengeProgress_ContentItem
        FOREIGN KEY (ContentItemId, ContentType)
        REFERENCES dbo.ContentItems(ContentItemId, ContentType),

    CONSTRAINT FK_ChallengeProgress_ContentVersion
        FOREIGN KEY (ContentVersionId, ContentItemId)
        REFERENCES dbo.ContentVersions(ContentVersionId, ContentItemId),

    CONSTRAINT FK_ChallengeProgress_BestAttempt
        FOREIGN KEY (BestAttemptId, UserId, ContentItemId)
        REFERENCES dbo.ChallengeAttempts
        (
            AttemptId,
            UserId,
            ContentItemId
        ),

    CONSTRAINT CK_ChallengeProgress_ContentType
        CHECK (ContentType = 'CHALLENGE'),

    CONSTRAINT CK_ChallengeProgress_Status
        CHECK
        (
            Status IN
            (
                'NOT_STARTED',
                'IN_PROGRESS',
                'COMPLETED'
            )
        ),

    CONSTRAINT CK_ChallengeProgress_Attempts
        CHECK (AttemptsCount >= 0),

    CONSTRAINT CK_ChallengeProgress_Hints
        CHECK (HintsUsed >= 0),

    CONSTRAINT UQ_ChallengeProgress_UserChallenge
        UNIQUE (UserId, ContentItemId)
);


/* ============================================================
   9. CHALLENGE ATTEMPTS
   ============================================================ */

CREATE TABLE dbo.ChallengeAttempts
(
    AttemptId               UNIQUEIDENTIFIER NOT NULL
        CONSTRAINT PK_ChallengeAttempts PRIMARY KEY
        DEFAULT NEWSEQUENTIALID(),

    UserId                  UNIQUEIDENTIFIER NOT NULL,
    ContentItemId           UNIQUEIDENTIFIER NOT NULL,
    ContentType             VARCHAR(30) NOT NULL
        CONSTRAINT DF_ChallengeAttempts_ContentType DEFAULT 'CHALLENGE',
    ContentVersionId        UNIQUEIDENTIFIER NOT NULL,

    AttemptNumber           INT NOT NULL,

    AttemptStatus           VARCHAR(30) NOT NULL
        CONSTRAINT DF_ChallengeAttempts_Status DEFAULT 'STARTED',

    AnswerData              NVARCHAR(MAX) NULL,
    EvaluationData          NVARCHAR(MAX) NULL,
    FeedbackData            NVARCHAR(MAX) NULL,
    IsCorrect               BIT NULL,
    Score                   DECIMAL(10,2) NULL,
    QuestionsAnswered       INT NULL,
    CorrectAnswers          INT NULL,
    HintsUsed               INT NOT NULL
        CONSTRAINT DF_ChallengeAttempts_Hints DEFAULT 0,
    TimeSpentMs             BIGINT NULL,

    StartedAt               DATETIME2(3) NOT NULL
        CONSTRAINT DF_ChallengeAttempts_StartedAt DEFAULT SYSUTCDATETIME(),

    SubmittedAt             DATETIME2(3) NULL,

    CreatedAt               DATETIME2(3) NOT NULL
        CONSTRAINT DF_ChallengeAttempts_CreatedAt DEFAULT SYSUTCDATETIME(),

    CONSTRAINT FK_ChallengeAttempts_Users
        FOREIGN KEY (UserId)
        REFERENCES dbo.Users(UserId)
        ON DELETE CASCADE,

    CONSTRAINT FK_ChallengeAttempts_ContentItem
        FOREIGN KEY (ContentItemId, ContentType)
        REFERENCES dbo.ContentItems(ContentItemId, ContentType),

    CONSTRAINT FK_ChallengeAttempts_ContentVersion
        FOREIGN KEY (ContentVersionId, ContentItemId)
        REFERENCES dbo.ContentVersions(ContentVersionId, ContentItemId),

    CONSTRAINT CK_ChallengeAttempts_ContentType
        CHECK (ContentType = 'CHALLENGE'),

    CONSTRAINT CK_ChallengeAttempts_Status
        CHECK
        (
            AttemptStatus IN
            (
                'STARTED',
                'SUBMITTED',
                'EVALUATED',
                'ABANDONED'
            )
        ),

    CONSTRAINT CK_ChallengeAttempts_AttemptNumber
        CHECK (AttemptNumber > 0),

    CONSTRAINT CK_ChallengeAttempts_Hints
        CHECK (HintsUsed >= 0),

    CONSTRAINT CK_ChallengeAttempts_Time
        CHECK
        (
            TimeSpentMs IS NULL
            OR TimeSpentMs >= 0
        ),

    CONSTRAINT CK_ChallengeAttempts_AnswerJson
        CHECK
        (
            AnswerData IS NULL
            OR ISJSON(AnswerData) = 1
        ),

    CONSTRAINT CK_ChallengeAttempts_EvaluationJson
        CHECK
        (
            EvaluationData IS NULL
            OR ISJSON(EvaluationData) = 1
        ),

    CONSTRAINT CK_ChallengeAttempts_FeedbackJson
        CHECK
        (
            FeedbackData IS NULL
            OR ISJSON(FeedbackData) = 1
        ),

    CONSTRAINT UQ_ChallengeAttempts_UserChallengeAttempt
        UNIQUE
        (
            UserId,
            ContentItemId,
            AttemptNumber
        ),

    CONSTRAINT UQ_ChallengeAttempts_AttemptUserContent
        UNIQUE
        (
            AttemptId,
            UserId,
            ContentItemId
        )
);


/* ============================================================
   10. LEARNING PATH PROGRESS
   ============================================================ */

CREATE TABLE dbo.LearningPathProgress
(
    ProgressId                  UNIQUEIDENTIFIER NOT NULL
        CONSTRAINT PK_LearningPathProgress PRIMARY KEY
        DEFAULT NEWSEQUENTIALID(),

    UserId                      UNIQUEIDENTIFIER NOT NULL,
    ContentItemId               UNIQUEIDENTIFIER NOT NULL,
    ContentType                 VARCHAR(30) NOT NULL
        CONSTRAINT DF_LearningPathProgress_ContentType DEFAULT 'LEARNING_PATH',
    ContentVersionId            UNIQUEIDENTIFIER NOT NULL,

    Status                      VARCHAR(30) NOT NULL
        CONSTRAINT DF_LearningPathProgress_Status DEFAULT 'NOT_STARTED',

    CompletionPercent           DECIMAL(5,2) NOT NULL
        CONSTRAINT DF_LearningPathProgress_Completion DEFAULT 0,

    CurrentItemContentItemId    UNIQUEIDENTIFIER NULL,
    CurrentItemContentType      VARCHAR(30) NULL,

    ItemsCompleted              INT NOT NULL
        CONSTRAINT DF_LearningPathProgress_ItemsCompleted DEFAULT 0,

    StartedAt                   DATETIME2(3) NULL,
    LastActivityAt              DATETIME2(3) NULL,
    CompletedAt                 DATETIME2(3) NULL,

    UpdatedAt                   DATETIME2(3) NOT NULL
        CONSTRAINT DF_LearningPathProgress_UpdatedAt DEFAULT SYSUTCDATETIME(),

    RowVersion                  ROWVERSION NOT NULL,

    CONSTRAINT FK_LearningPathProgress_Users
        FOREIGN KEY (UserId)
        REFERENCES dbo.Users(UserId)
        ON DELETE CASCADE,

    CONSTRAINT FK_LearningPathProgress_ContentItem
        FOREIGN KEY (ContentItemId, ContentType)
        REFERENCES dbo.ContentItems(ContentItemId, ContentType),

    CONSTRAINT FK_LearningPathProgress_ContentVersion
        FOREIGN KEY (ContentVersionId, ContentItemId)
        REFERENCES dbo.ContentVersions(ContentVersionId, ContentItemId),

    CONSTRAINT FK_LearningPathProgress_CurrentItem
        FOREIGN KEY
        (
            CurrentItemContentItemId,
            CurrentItemContentType
        )
        REFERENCES dbo.ContentItems
        (
            ContentItemId,
            ContentType
        ),

    CONSTRAINT CK_LearningPathProgress_CurrentItemPair
        CHECK
        (
            (
                CurrentItemContentItemId IS NULL
                AND CurrentItemContentType IS NULL
            )
            OR
            (
                CurrentItemContentItemId IS NOT NULL
                AND CurrentItemContentType IS NOT NULL
            )
        ),

    CONSTRAINT CK_LearningPathProgress_ContentType
        CHECK (ContentType = 'LEARNING_PATH'),

    CONSTRAINT CK_LearningPathProgress_Status
        CHECK
        (
            Status IN
            (
                'NOT_STARTED',
                'IN_PROGRESS',
                'COMPLETED'
            )
        ),

    CONSTRAINT CK_LearningPathProgress_Completion
        CHECK
        (
            CompletionPercent >= 0
            AND CompletionPercent <= 100
        ),

    CONSTRAINT CK_LearningPathProgress_ItemsCompleted
        CHECK (ItemsCompleted >= 0),

    CONSTRAINT UQ_LearningPathProgress_UserPath
        UNIQUE (UserId, ContentItemId)
);


/* ============================================================
   11. LEARNING PATH ITEM PROGRESS
   ============================================================ */

CREATE TABLE dbo.LearningPathItemProgress
(
    ItemProgressId              UNIQUEIDENTIFIER NOT NULL
        CONSTRAINT PK_LearningPathItemProgress PRIMARY KEY
        DEFAULT NEWSEQUENTIALID(),

    ProgressId                  UNIQUEIDENTIFIER NOT NULL,

    ItemContentItemId           UNIQUEIDENTIFIER NOT NULL,
    ItemContentType             VARCHAR(30) NOT NULL,
    ItemContentVersionId        UNIQUEIDENTIFIER NOT NULL,

    Status                      VARCHAR(30) NOT NULL
        CONSTRAINT DF_LearningPathItemProgress_Status DEFAULT 'NOT_STARTED',

    CompletionPercent           DECIMAL(5,2) NOT NULL
        CONSTRAINT DF_LearningPathItemProgress_Completion DEFAULT 0,

    StartedAt                   DATETIME2(3) NULL,
    LastActivityAt              DATETIME2(3) NULL,
    CompletedAt                 DATETIME2(3) NULL,

    UpdatedAt                   DATETIME2(3) NOT NULL
        CONSTRAINT DF_LearningPathItemProgress_UpdatedAt DEFAULT SYSUTCDATETIME(),

    RowVersion                  ROWVERSION NOT NULL,

    CONSTRAINT FK_LearningPathItemProgress_Progress
        FOREIGN KEY (ProgressId)
        REFERENCES dbo.LearningPathProgress(ProgressId)
        ON DELETE CASCADE,

    CONSTRAINT FK_LearningPathItemProgress_ContentItem
        FOREIGN KEY
        (
            ItemContentItemId,
            ItemContentType
        )
        REFERENCES dbo.ContentItems
        (
            ContentItemId,
            ContentType
        ),

    CONSTRAINT FK_LearningPathItemProgress_ContentVersion
        FOREIGN KEY
        (
            ItemContentVersionId,
            ItemContentItemId
        )
        REFERENCES dbo.ContentVersions
        (
            ContentVersionId,
            ContentItemId
        ),

    CONSTRAINT CK_LearningPathItemProgress_ItemType
        CHECK
        (
            ItemContentType IN
            (
                'ALGORITHM',
                'DATA_STRUCTURE',
                'CHALLENGE',
                'LEARNING_PATH'
            )
        ),

    CONSTRAINT CK_LearningPathItemProgress_Status
        CHECK
        (
            Status IN
            (
                'NOT_STARTED',
                'IN_PROGRESS',
                'COMPLETED'
            )
        ),

    CONSTRAINT CK_LearningPathItemProgress_Completion
        CHECK
        (
            CompletionPercent >= 0
            AND CompletionPercent <= 100
        ),

    CONSTRAINT UQ_LearningPathItemProgress_Item
        UNIQUE
        (
            ProgressId,
            ItemContentItemId
        )
);


/* ============================================================
   12. FAVORITES
   ============================================================ */

CREATE TABLE dbo.Favorites
(
    FavoriteId              UNIQUEIDENTIFIER NOT NULL
        CONSTRAINT PK_Favorites PRIMARY KEY
        DEFAULT NEWSEQUENTIALID(),

    UserId                  UNIQUEIDENTIFIER NOT NULL,
    ContentItemId           UNIQUEIDENTIFIER NOT NULL,

    CreatedAt               DATETIME2(3) NOT NULL
        CONSTRAINT DF_Favorites_CreatedAt DEFAULT SYSUTCDATETIME(),

    CONSTRAINT FK_Favorites_Users
        FOREIGN KEY (UserId)
        REFERENCES dbo.Users(UserId)
        ON DELETE CASCADE,

    CONSTRAINT FK_Favorites_ContentItems
        FOREIGN KEY (ContentItemId)
        REFERENCES dbo.ContentItems(ContentItemId),

    CONSTRAINT UQ_Favorites_UserContent
        UNIQUE (UserId, ContentItemId)
);


/* ============================================================
   13. EXPERIMENTS
   ============================================================ */

CREATE TABLE dbo.Experiments
(
    ExperimentId             UNIQUEIDENTIFIER NOT NULL
        CONSTRAINT PK_Experiments PRIMARY KEY
        DEFAULT NEWSEQUENTIALID(),

    UserId                   UNIQUEIDENTIFIER NOT NULL,
    Name                     NVARCHAR(200) NOT NULL,
    Description              NVARCHAR(2000) NULL,

    ExperimentType           VARCHAR(40) NOT NULL,

    InputData                NVARCHAR(MAX) NOT NULL,
    ConfigurationData        NVARCHAR(MAX) NULL,
    RandomSeed               BIGINT NULL,
    ExecutionSettings        NVARCHAR(MAX) NULL,

    Status                   VARCHAR(30) NOT NULL
        CONSTRAINT DF_Experiments_Status DEFAULT 'DRAFT',

    CreatedAt                DATETIME2(3) NOT NULL
        CONSTRAINT DF_Experiments_CreatedAt DEFAULT SYSUTCDATETIME(),

    UpdatedAt                DATETIME2(3) NOT NULL
        CONSTRAINT DF_Experiments_UpdatedAt DEFAULT SYSUTCDATETIME(),

    LastOpenedAt             DATETIME2(3) NULL,
    RowVersion               ROWVERSION NOT NULL,

    CONSTRAINT FK_Experiments_Users
        FOREIGN KEY (UserId)
        REFERENCES dbo.Users(UserId)
        ON DELETE CASCADE,

    CONSTRAINT CK_Experiments_Type
        CHECK
        (
            ExperimentType IN
            (
                'ALGORITHM',
                'DATA_STRUCTURE',
                'GRAPH',
                'TREE',
                'COMPARISON',
                'CUSTOM'
            )
        ),

    CONSTRAINT CK_Experiments_Status
        CHECK
        (
            Status IN
            (
                'DRAFT',
                'SAVED',
                'ARCHIVED'
            )
        ),

    CONSTRAINT CK_Experiments_InputJson
        CHECK (ISJSON(InputData) = 1),

    CONSTRAINT CK_Experiments_ConfigurationJson
        CHECK
        (
            ConfigurationData IS NULL
            OR ISJSON(ConfigurationData) = 1
        ),

    CONSTRAINT CK_Experiments_ExecutionSettingsJson
        CHECK
        (
            ExecutionSettings IS NULL
            OR ISJSON(ExecutionSettings) = 1
        )
);


/* ============================================================
   14. EXPERIMENT ALGORITHMS
   ============================================================ */

CREATE TABLE dbo.ExperimentAlgorithms
(
    ExperimentAlgorithmId    UNIQUEIDENTIFIER NOT NULL
        CONSTRAINT PK_ExperimentAlgorithms PRIMARY KEY
        DEFAULT NEWSEQUENTIALID(),

    ExperimentId             UNIQUEIDENTIFIER NOT NULL,
    ContentItemId            UNIQUEIDENTIFIER NOT NULL,
    ContentVersionId         UNIQUEIDENTIFIER NOT NULL,
    ExecutionOrder           INT NOT NULL,

    CreatedAt                DATETIME2(3) NOT NULL
        CONSTRAINT DF_ExperimentAlgorithms_CreatedAt DEFAULT SYSUTCDATETIME(),

    CONSTRAINT FK_ExperimentAlgorithms_Experiments
        FOREIGN KEY (ExperimentId)
        REFERENCES dbo.Experiments(ExperimentId)
        ON DELETE CASCADE,

    CONSTRAINT FK_ExperimentAlgorithms_ContentItem
        FOREIGN KEY (ContentItemId)
        REFERENCES dbo.ContentItems(ContentItemId),

    CONSTRAINT FK_ExperimentAlgorithms_ContentVersion
        FOREIGN KEY
        (
            ContentVersionId,
            ContentItemId
        )
        REFERENCES dbo.ContentVersions
        (
            ContentVersionId,
            ContentItemId
        ),

    CONSTRAINT CK_ExperimentAlgorithms_Order
        CHECK (ExecutionOrder > 0),

    CONSTRAINT UQ_ExperimentAlgorithms_Algorithm
        UNIQUE (ExperimentId, ContentItemId)
);


/* ============================================================
   15. EXPERIMENT EXECUTIONS
   ============================================================ */

CREATE TABLE dbo.ExperimentExecutions
(
    ExecutionId              UNIQUEIDENTIFIER NOT NULL
        CONSTRAINT PK_ExperimentExecutions PRIMARY KEY
        DEFAULT NEWSEQUENTIALID(),

    ExperimentAlgorithmId    UNIQUEIDENTIFIER NOT NULL,
    ExecutionNumber          INT NOT NULL,

    InputSnapshot            NVARCHAR(MAX) NOT NULL,
    ConfigurationSnapshot    NVARCHAR(MAX) NULL,
    RandomSeed               BIGINT NULL,
    ResultData               NVARCHAR(MAX) NULL,
    MetricsData              NVARCHAR(MAX) NULL,

    ExecutionStatus          VARCHAR(30) NOT NULL
        CONSTRAINT DF_ExperimentExecutions_Status DEFAULT 'QUEUED',

    ExecutionDurationMs      BIGINT NULL,
    StartedAt                DATETIME2(3) NULL,
    ExecutedAt               DATETIME2(3) NULL,

    CreatedAt                DATETIME2(3) NOT NULL
        CONSTRAINT DF_ExperimentExecutions_CreatedAt DEFAULT SYSUTCDATETIME(),

    CONSTRAINT FK_ExperimentExecutions_ExperimentAlgorithm
        FOREIGN KEY (ExperimentAlgorithmId)
        REFERENCES dbo.ExperimentAlgorithms(ExperimentAlgorithmId)
        ON DELETE CASCADE,

    CONSTRAINT CK_ExperimentExecutions_Number
        CHECK (ExecutionNumber > 0),

    CONSTRAINT CK_ExperimentExecutions_InputJson
        CHECK (ISJSON(InputSnapshot) = 1),

    CONSTRAINT CK_ExperimentExecutions_ConfigJson
        CHECK
        (
            ConfigurationSnapshot IS NULL
            OR ISJSON(ConfigurationSnapshot) = 1
        ),

    CONSTRAINT CK_ExperimentExecutions_ResultJson
        CHECK
        (
            ResultData IS NULL
            OR ISJSON(ResultData) = 1
        ),

    CONSTRAINT CK_ExperimentExecutions_MetricsJson
        CHECK
        (
            MetricsData IS NULL
            OR ISJSON(MetricsData) = 1
        ),

    CONSTRAINT CK_ExperimentExecutions_Status
        CHECK
        (
            ExecutionStatus IN
            (
                'QUEUED',
                'RUNNING',
                'COMPLETED',
                'FAILED',
                'CANCELLED'
            )
        ),

    CONSTRAINT CK_ExperimentExecutions_Duration
        CHECK
        (
            ExecutionDurationMs IS NULL
            OR ExecutionDurationMs >= 0
        ),

    CONSTRAINT UQ_ExperimentExecutions_Run
        UNIQUE
        (
            ExperimentAlgorithmId,
            ExecutionNumber
        )
);


/* ============================================================
   16. BOOKMARKS
   ============================================================ */

CREATE TABLE dbo.Bookmarks
(
    BookmarkId              UNIQUEIDENTIFIER NOT NULL
        CONSTRAINT PK_Bookmarks PRIMARY KEY
        DEFAULT NEWSEQUENTIALID(),

    UserId                  UNIQUEIDENTIFIER NOT NULL,
    ContentItemId           UNIQUEIDENTIFIER NULL,
    ExperimentId            UNIQUEIDENTIFIER NULL,
    StepNumber              INT NULL,
    Note                    NVARCHAR(2000) NULL,

    CreatedAt               DATETIME2(3) NOT NULL
        CONSTRAINT DF_Bookmarks_CreatedAt DEFAULT SYSUTCDATETIME(),

    UpdatedAt               DATETIME2(3) NOT NULL
        CONSTRAINT DF_Bookmarks_UpdatedAt DEFAULT SYSUTCDATETIME(),

    CONSTRAINT FK_Bookmarks_Users
        FOREIGN KEY (UserId)
        REFERENCES dbo.Users(UserId)
        ON DELETE CASCADE,

    CONSTRAINT FK_Bookmarks_ContentItems
        FOREIGN KEY (ContentItemId)
        REFERENCES dbo.ContentItems(ContentItemId),

    CONSTRAINT FK_Bookmarks_Experiments
        FOREIGN KEY (ExperimentId)
        REFERENCES dbo.Experiments(ExperimentId),

    CONSTRAINT CK_Bookmarks_Target
        CHECK
        (
            (
                ContentItemId IS NOT NULL
                AND ExperimentId IS NULL
            )
            OR
            (
                ContentItemId IS NULL
                AND ExperimentId IS NOT NULL
            )
        ),

    CONSTRAINT CK_Bookmarks_StepNumber
        CHECK
        (
            StepNumber IS NULL
            OR StepNumber >= 0
        )
);


/* ============================================================
   17. COMPARISONS
   ============================================================ */

CREATE TABLE dbo.Comparisons
(
    ComparisonId             UNIQUEIDENTIFIER NOT NULL
        CONSTRAINT PK_Comparisons PRIMARY KEY
        DEFAULT NEWSEQUENTIALID(),

    UserId                   UNIQUEIDENTIFIER NOT NULL,
    Name                     NVARCHAR(200) NULL,
    InputData                NVARCHAR(MAX) NOT NULL,
    ConfigurationData        NVARCHAR(MAX) NULL,

    CreatedAt                DATETIME2(3) NOT NULL
        CONSTRAINT DF_Comparisons_CreatedAt DEFAULT SYSUTCDATETIME(),

    UpdatedAt                DATETIME2(3) NOT NULL
        CONSTRAINT DF_Comparisons_UpdatedAt DEFAULT SYSUTCDATETIME(),

    RowVersion               ROWVERSION NOT NULL,

    CONSTRAINT FK_Comparisons_Users
        FOREIGN KEY (UserId)
        REFERENCES dbo.Users(UserId)
        ON DELETE CASCADE,

    CONSTRAINT CK_Comparisons_InputJson
        CHECK (ISJSON(InputData) = 1),

    CONSTRAINT CK_Comparisons_ConfigJson
        CHECK
        (
            ConfigurationData IS NULL
            OR ISJSON(ConfigurationData) = 1
        )
);


/* ============================================================
   18. COMPARISON ALGORITHMS
   ============================================================ */

CREATE TABLE dbo.ComparisonAlgorithms
(
    ComparisonAlgorithmId    UNIQUEIDENTIFIER NOT NULL
        CONSTRAINT PK_ComparisonAlgorithms PRIMARY KEY
        DEFAULT NEWSEQUENTIALID(),

    ComparisonId             UNIQUEIDENTIFIER NOT NULL,
    ContentItemId            UNIQUEIDENTIFIER NOT NULL,
    ContentVersionId         UNIQUEIDENTIFIER NOT NULL,
    ExecutionOrder           INT NOT NULL,

    MetricsData              NVARCHAR(MAX) NULL,
    ResultData               NVARCHAR(MAX) NULL,
    ExecutionDurationMs      BIGINT NULL,

    CreatedAt                DATETIME2(3) NOT NULL
        CONSTRAINT DF_ComparisonAlgorithms_CreatedAt DEFAULT SYSUTCDATETIME(),

    CONSTRAINT FK_ComparisonAlgorithms_Comparisons
        FOREIGN KEY (ComparisonId)
        REFERENCES dbo.Comparisons(ComparisonId)
        ON DELETE CASCADE,

    CONSTRAINT FK_ComparisonAlgorithms_ContentItem
        FOREIGN KEY (ContentItemId)
        REFERENCES dbo.ContentItems(ContentItemId),

    CONSTRAINT FK_ComparisonAlgorithms_ContentVersion
        FOREIGN KEY
        (
            ContentVersionId,
            ContentItemId
        )
        REFERENCES dbo.ContentVersions
        (
            ContentVersionId,
            ContentItemId
        ),

    CONSTRAINT CK_ComparisonAlgorithms_Order
        CHECK (ExecutionOrder > 0),

    CONSTRAINT CK_ComparisonAlgorithms_MetricsJson
        CHECK
        (
            MetricsData IS NULL
            OR ISJSON(MetricsData) = 1
        ),

    CONSTRAINT CK_ComparisonAlgorithms_ResultJson
        CHECK
        (
            ResultData IS NULL
            OR ISJSON(ResultData) = 1
        ),

    CONSTRAINT CK_ComparisonAlgorithms_Duration
        CHECK
        (
            ExecutionDurationMs IS NULL
            OR ExecutionDurationMs >= 0
        ),

    CONSTRAINT UQ_ComparisonAlgorithms_Algorithm
        UNIQUE
        (
            ComparisonId,
            ContentItemId
        )
);


/* ============================================================
   19. HISTORY
   ============================================================ */

CREATE TABLE dbo.History
(
    HistoryId               UNIQUEIDENTIFIER NOT NULL
        CONSTRAINT PK_History PRIMARY KEY
        DEFAULT NEWSEQUENTIALID(),

    UserId                  UNIQUEIDENTIFIER NOT NULL,
    ContentItemId           UNIQUEIDENTIFIER NULL,
    ExperimentId            UNIQUEIDENTIFIER NULL,
    ComparisonId            UNIQUEIDENTIFIER NULL,
    ContentVersionId        UNIQUEIDENTIFIER NULL,

    ActionType              VARCHAR(30) NOT NULL,

    InputData               NVARCHAR(MAX) NULL,
    ResultData              NVARCHAR(MAX) NULL,
    ExecutionMetrics        NVARCHAR(MAX) NULL,

    CreatedAt               DATETIME2(3) NOT NULL
        CONSTRAINT DF_History_CreatedAt DEFAULT SYSUTCDATETIME(),

    CONSTRAINT FK_History_Users
        FOREIGN KEY (UserId)
        REFERENCES dbo.Users(UserId)
        ON DELETE CASCADE,

    CONSTRAINT FK_History_ContentItem
        FOREIGN KEY (ContentItemId)
        REFERENCES dbo.ContentItems(ContentItemId),

    CONSTRAINT FK_History_Experiment
        FOREIGN KEY (ExperimentId)
        REFERENCES dbo.Experiments(ExperimentId),

    CONSTRAINT FK_History_Comparison
        FOREIGN KEY (ComparisonId)
        REFERENCES dbo.Comparisons(ComparisonId),

    CONSTRAINT FK_History_ContentVersion
        FOREIGN KEY
        (
            ContentVersionId,
            ContentItemId
        )
        REFERENCES dbo.ContentVersions
        (
            ContentVersionId,
            ContentItemId
        ),

    CONSTRAINT CK_History_Target
        CHECK
        (
            (
                CASE WHEN ContentItemId IS NOT NULL THEN 1 ELSE 0 END
            )
            +
            (
                CASE WHEN ExperimentId IS NOT NULL THEN 1 ELSE 0 END
            )
            +
            (
                CASE WHEN ComparisonId IS NOT NULL THEN 1 ELSE 0 END
            )
            = 1
        ),

    CONSTRAINT CK_History_ContentVersion
        CHECK
        (
            ContentVersionId IS NULL
            OR ContentItemId IS NOT NULL
        ),

    CONSTRAINT CK_History_ActionType
        CHECK
        (
            ActionType IN
            (
                'VIEW',
                'START',
                'EXECUTE',
                'COMPLETE',
                'PRACTICE',
                'PREDICT',
                'COMPARE',
                'OPEN',
                'SAVE'
            )
        ),

    CONSTRAINT CK_History_InputJson
        CHECK
        (
            InputData IS NULL
            OR ISJSON(InputData) = 1
        ),

    CONSTRAINT CK_History_ResultJson
        CHECK
        (
            ResultData IS NULL
            OR ISJSON(ResultData) = 1
        ),

    CONSTRAINT CK_History_MetricsJson
        CHECK
        (
            ExecutionMetrics IS NULL
            OR ISJSON(ExecutionMetrics) = 1
        )
);


/* ============================================================
   20. USER ACTIVITY
   ============================================================ */

CREATE TABLE dbo.UserActivity
(
    ActivityId              UNIQUEIDENTIFIER NOT NULL
        CONSTRAINT PK_UserActivity PRIMARY KEY
        DEFAULT NEWSEQUENTIALID(),

    UserId                  UNIQUEIDENTIFIER NOT NULL,

    ActivityDate            DATE NOT NULL
        CONSTRAINT DF_UserActivity_ActivityDate
        DEFAULT CONVERT(DATE, SYSUTCDATETIME()),

    ActivityType            VARCHAR(40) NOT NULL,

    ContentItemId           UNIQUEIDENTIFIER NULL,
    ExperimentId            UNIQUEIDENTIFIER NULL,
    ComparisonId            UNIQUEIDENTIFIER NULL,

    DurationSeconds         INT NULL,
    Metadata                NVARCHAR(MAX) NULL,

    CreatedAt               DATETIME2(3) NOT NULL
        CONSTRAINT DF_UserActivity_CreatedAt DEFAULT SYSUTCDATETIME(),

    CONSTRAINT FK_UserActivity_Users
        FOREIGN KEY (UserId)
        REFERENCES dbo.Users(UserId)
        ON DELETE CASCADE,

    CONSTRAINT FK_UserActivity_ContentItem
        FOREIGN KEY (ContentItemId)
        REFERENCES dbo.ContentItems(ContentItemId),

    CONSTRAINT FK_UserActivity_Experiment
        FOREIGN KEY (ExperimentId)
        REFERENCES dbo.Experiments(ExperimentId),

    CONSTRAINT FK_UserActivity_Comparison
        FOREIGN KEY (ComparisonId)
        REFERENCES dbo.Comparisons(ComparisonId),

    CONSTRAINT CK_UserActivity_Target
        CHECK
        (
            (
                CASE WHEN ContentItemId IS NOT NULL THEN 1 ELSE 0 END
            )
            +
            (
                CASE WHEN ExperimentId IS NOT NULL THEN 1 ELSE 0 END
            )
            +
            (
                CASE WHEN ComparisonId IS NOT NULL THEN 1 ELSE 0 END
            )
            <= 1
        ),

    CONSTRAINT CK_UserActivity_Duration
        CHECK
        (
            DurationSeconds IS NULL
            OR DurationSeconds >= 0
        ),

    CONSTRAINT CK_UserActivity_MetadataJson
        CHECK
        (
            Metadata IS NULL
            OR ISJSON(Metadata) = 1
        )
);


/* ============================================================
   21. USER DAILY ACTIVITY
   ============================================================ */

CREATE TABLE dbo.UserDailyActivity
(
    UserId                  UNIQUEIDENTIFIER NOT NULL,
    ActivityDate            DATE NOT NULL,

    ActivityCount           INT NOT NULL
        CONSTRAINT DF_UserDailyActivity_ActivityCount DEFAULT 0,

    LearningMinutes         INT NOT NULL
        CONSTRAINT DF_UserDailyActivity_LearningMinutes DEFAULT 0,

    ChallengesCompleted     INT NOT NULL
        CONSTRAINT DF_UserDailyActivity_Challenges DEFAULT 0,

    AlgorithmsCompleted     INT NOT NULL
        CONSTRAINT DF_UserDailyActivity_Algorithms DEFAULT 0,

    DataStructuresCompleted INT NOT NULL
        CONSTRAINT DF_UserDailyActivity_DataStructures DEFAULT 0,

    UpdatedAt               DATETIME2(3) NOT NULL
        CONSTRAINT DF_UserDailyActivity_UpdatedAt DEFAULT SYSUTCDATETIME(),

    RowVersion              ROWVERSION NOT NULL,

    CONSTRAINT PK_UserDailyActivity
        PRIMARY KEY (UserId, ActivityDate),

    CONSTRAINT FK_UserDailyActivity_Users
        FOREIGN KEY (UserId)
        REFERENCES dbo.Users(UserId)
        ON DELETE CASCADE,

    CONSTRAINT CK_UserDailyActivity_ActivityCount
        CHECK (ActivityCount >= 0),

    CONSTRAINT CK_UserDailyActivity_LearningMinutes
        CHECK (LearningMinutes >= 0),

    CONSTRAINT CK_UserDailyActivity_Challenges
        CHECK (ChallengesCompleted >= 0),

    CONSTRAINT CK_UserDailyActivity_Algorithms
        CHECK (AlgorithmsCompleted >= 0),

    CONSTRAINT CK_UserDailyActivity_DataStructures
        CHECK (DataStructuresCompleted >= 0)
);


/* ============================================================
   22. ACHIEVEMENTS
   ============================================================ */

CREATE TABLE dbo.Achievements
(
    AchievementId          UNIQUEIDENTIFIER NOT NULL
        CONSTRAINT PK_Achievements PRIMARY KEY
        DEFAULT NEWSEQUENTIALID(),

    AchievementCode        VARCHAR(100) NOT NULL,
    Name                   NVARCHAR(150) NOT NULL,
    Description            NVARCHAR(1000) NOT NULL,
    Category               VARCHAR(50) NOT NULL,
    Criteria               NVARCHAR(MAX) NOT NULL,
    Icon                   NVARCHAR(500) NULL,

    IsActive               BIT NOT NULL
        CONSTRAINT DF_Achievements_IsActive DEFAULT 1,

    CreatedAt              DATETIME2(3) NOT NULL
        CONSTRAINT DF_Achievements_CreatedAt DEFAULT SYSUTCDATETIME(),

    UpdatedAt              DATETIME2(3) NOT NULL
        CONSTRAINT DF_Achievements_UpdatedAt DEFAULT SYSUTCDATETIME(),

    CONSTRAINT UQ_Achievements_Code
        UNIQUE (AchievementCode),

    CONSTRAINT CK_Achievements_CriteriaJson
        CHECK (ISJSON(Criteria) = 1)
);


/* ============================================================
   23. USER ACHIEVEMENTS
   ============================================================ */

CREATE TABLE dbo.UserAchievements
(
    UserAchievementId       UNIQUEIDENTIFIER NOT NULL
        CONSTRAINT PK_UserAchievements PRIMARY KEY
        DEFAULT NEWSEQUENTIALID(),

    UserId                  UNIQUEIDENTIFIER NOT NULL,
    AchievementId           UNIQUEIDENTIFIER NOT NULL,
    ProgressData            NVARCHAR(MAX) NULL,

    EarnedAt                DATETIME2(3) NOT NULL
        CONSTRAINT DF_UserAchievements_EarnedAt DEFAULT SYSUTCDATETIME(),

    CONSTRAINT FK_UserAchievements_Users
        FOREIGN KEY (UserId)
        REFERENCES dbo.Users(UserId)
        ON DELETE CASCADE,

    CONSTRAINT FK_UserAchievements_Achievements
        FOREIGN KEY (AchievementId)
        REFERENCES dbo.Achievements(AchievementId),

    CONSTRAINT CK_UserAchievements_ProgressJson
        CHECK
        (
            ProgressData IS NULL
            OR ISJSON(ProgressData) = 1
        ),

    CONSTRAINT UQ_UserAchievements_UserAchievement
        UNIQUE (UserId, AchievementId)
);


/* ============================================================
   INDEXES
   ============================================================ */

CREATE UNIQUE INDEX UX_Users_NormalizedUsername
ON dbo.Users(NormalizedUsername)
WHERE DeletedAt IS NULL;

CREATE UNIQUE INDEX UX_Users_NormalizedEmail
ON dbo.Users(NormalizedEmail)
WHERE DeletedAt IS NULL;

CREATE INDEX IX_UserSessions_UserId
ON dbo.UserSessions(UserId);

CREATE INDEX IX_UserSessions_ExpiresAt
ON dbo.UserSessions(ExpiresAt);

CREATE INDEX IX_ContentItems_Type
ON dbo.ContentItems(ContentType);

CREATE INDEX IX_ContentItems_IsActive
ON dbo.ContentItems(ContentType, IsActive);

CREATE INDEX IX_ContentVersions_Item
ON dbo.ContentVersions(ContentItemId, VersionNumber DESC);

CREATE UNIQUE INDEX UX_ContentVersions_Current
ON dbo.ContentVersions(ContentItemId)
WHERE IsCurrent = 1;

CREATE INDEX IX_AlgorithmProgress_UserLastViewed
ON dbo.AlgorithmProgress(UserId, LastViewedAt DESC);

CREATE INDEX IX_AlgorithmProgress_Status
ON dbo.AlgorithmProgress(UserId, Status);

CREATE INDEX IX_DataStructureProgress_UserLastViewed
ON dbo.DataStructureProgress(UserId, LastViewedAt DESC);

CREATE INDEX IX_DataStructureProgress_Status
ON dbo.DataStructureProgress(UserId, Status);

CREATE INDEX IX_ChallengeProgress_UserLastAttempt
ON dbo.ChallengeProgress(UserId, LastAttemptedAt DESC);

CREATE INDEX IX_ChallengeProgress_Status
ON dbo.ChallengeProgress(UserId, Status);

CREATE INDEX IX_ChallengeAttempts_UserChallenge
ON dbo.ChallengeAttempts
(
    UserId,
    ContentItemId,
    CreatedAt DESC
);

CREATE INDEX IX_ChallengeAttempts_ContentVersion
ON dbo.ChallengeAttempts(ContentVersionId);

CREATE INDEX IX_ChallengeAttempts_Status
ON dbo.ChallengeAttempts(AttemptStatus);

CREATE INDEX IX_LearningPathProgress_UserActivity
ON dbo.LearningPathProgress
(
    UserId,
    LastActivityAt DESC
);

CREATE INDEX IX_LearningPathProgress_Status
ON dbo.LearningPathProgress(UserId, Status);

CREATE INDEX IX_LearningPathItemProgress_Progress
ON dbo.LearningPathItemProgress(ProgressId);

CREATE INDEX IX_LearningPathItemProgress_Status
ON dbo.LearningPathItemProgress(ProgressId, Status);

CREATE INDEX IX_Favorites_User
ON dbo.Favorites(UserId);

CREATE INDEX IX_Favorites_ContentItem
ON dbo.Favorites(ContentItemId);

CREATE UNIQUE INDEX UX_Bookmarks_UserContentStep
ON dbo.Bookmarks
(
    UserId,
    ContentItemId,
    StepNumber
)
WHERE ContentItemId IS NOT NULL;

CREATE UNIQUE INDEX UX_Bookmarks_UserExperimentStep
ON dbo.Bookmarks
(
    UserId,
    ExperimentId,
    StepNumber
)
WHERE ExperimentId IS NOT NULL;

CREATE INDEX IX_Bookmarks_User
ON dbo.Bookmarks(UserId);

CREATE INDEX IX_Experiments_UserUpdated
ON dbo.Experiments(UserId, UpdatedAt DESC);

CREATE INDEX IX_Experiments_UserStatus
ON dbo.Experiments(UserId, Status);

CREATE INDEX IX_ExperimentAlgorithms_ExperimentOrder
ON dbo.ExperimentAlgorithms
(
    ExperimentId,
    ExecutionOrder
);

CREATE INDEX IX_ExperimentExecutions_AlgorithmExecuted
ON dbo.ExperimentExecutions
(
    ExperimentAlgorithmId,
    ExecutedAt DESC
);

CREATE INDEX IX_ExperimentExecutions_Status
ON dbo.ExperimentExecutions(ExecutionStatus);

CREATE INDEX IX_Comparisons_UserUpdated
ON dbo.Comparisons(UserId, UpdatedAt DESC);

CREATE INDEX IX_ComparisonAlgorithms_ComparisonOrder
ON dbo.ComparisonAlgorithms
(
    ComparisonId,
    ExecutionOrder
);

CREATE INDEX IX_History_UserCreated
ON dbo.History(UserId, CreatedAt DESC);

CREATE INDEX IX_History_Content
ON dbo.History(ContentItemId, CreatedAt DESC)
WHERE ContentItemId IS NOT NULL;

CREATE INDEX IX_History_Experiment
ON dbo.History(ExperimentId, CreatedAt DESC)
WHERE ExperimentId IS NOT NULL;

CREATE INDEX IX_History_Comparison
ON dbo.History(ComparisonId, CreatedAt DESC)
WHERE ComparisonId IS NOT NULL;

CREATE INDEX IX_UserActivity_UserCreated
ON dbo.UserActivity(UserId, CreatedAt DESC);

CREATE INDEX IX_UserActivity_Date
ON dbo.UserActivity(ActivityDate DESC);

CREATE INDEX IX_UserActivity_Type
ON dbo.UserActivity(ActivityType, CreatedAt DESC);

CREATE INDEX IX_UserDailyActivity_Date
ON dbo.UserDailyActivity(ActivityDate DESC);

CREATE INDEX IX_Achievements_Category
ON dbo.Achievements(Category);

CREATE INDEX IX_Achievements_Active
ON dbo.Achievements(IsActive);

CREATE INDEX IX_UserAchievements_User
ON dbo.UserAchievements(UserId);

CREATE INDEX IX_UserAchievements_EarnedAt
ON dbo.UserAchievements(UserId, EarnedAt DESC);

COMMIT TRANSACTION;
```

---

# 94. Schema Review Notes

The SQL schema is intentionally relational in the important areas.

The following decisions are deliberate:

- content identity is normalized through `ContentItems`;
- published content is versioned through `ContentVersions`;
- experiment result data is separated into `ExperimentExecutions`;
- comparisons use a child table rather than an algorithm array;
- challenge attempts are unique by attempt number;
- bookmarks have explicit target FKs;
- favorites have an explicit content FK;
- history allows exactly one target;
- activity can remain lightweight;
- daily activity supports streaks efficiently;
- achievements are persistent master definitions;
- earned achievements are protected from accidental cascade deletion;
- row versions support optimistic concurrency;
- indexes are aligned to the major query paths.

---

# 95. Final Database Decision

The final LogicLab database principle is:

> **SQL Server stores durable dynamic state about how users interact with LogicLab, while the code repository remains the canonical source for educational knowledge.**

This keeps the database normalized, the content system manageable, the application architecture clean, and the local-to-production database migration straightforward.
