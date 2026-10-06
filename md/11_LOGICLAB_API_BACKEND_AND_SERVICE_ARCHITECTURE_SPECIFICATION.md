# LogicLab — API, Backend & Service Architecture Specification

## 1. Document Purpose

This document defines the complete API, backend, server-side, service, and data-access architecture for LogicLab.

It acts as the architectural bridge between:

```text
Browser / React UI
        |
        v
Next.js Route Handlers
        |
        v
Request Validation
        |
        v
Authentication / Authorization
        |
        v
Application Use Cases
        |
        v
Domain / Core Logic
        |
        +-------------------+
        |                   |
        v                   v
Content Engine        Algorithm Engine
        |                   |
        +---------+---------+
                  |
                  v
              Repositories
                  |
                  v
            Database Adapter
                  |
                  v
             SQL Server
```

The purpose of this document is to ensure that LogicLab does not become a collection of API routes containing business logic, database queries, validation, and UI-specific behavior all mixed together.

The architecture must remain:

- modular;
- atomic;
- testable;
- secure;
- observable;
- versionable;
- scalable;
- understandable by new contributors;
- compatible with the folder structure defined in MD-09;
- compatible with the database design defined in MD-10.

---

# 2. Backend Architecture Goals

The LogicLab backend must:

1. Protect the database from direct browser access.
2. Keep API routes thin.
3. Keep business logic outside route handlers.
4. Reuse the same core algorithm engine for UI, challenges, experiments, and comparisons.
5. Validate every untrusted request.
6. Authenticate users before protected operations.
7. Authorize every user-owned resource operation.
8. Prevent ownership bypasses.
9. Provide predictable request and response contracts.
10. Return consistent errors.
11. Support cancellation and execution limits.
12. Handle concurrent writes safely.
13. Keep database transactions short.
14. Support caching without compromising correctness.
15. Provide logs, metrics, and request tracing.
16. Provide a clean testing boundary.
17. Keep all server-only code away from client bundles.
18. Allow the database implementation to evolve without rewriting frontend features.
19. Keep static educational content separate from dynamic user data.
20. Support production deployment without requiring architectural rewrites.

---

# 3. Backend Design Principles

## 3.1 Thin Route Handler Principle

A route handler should primarily perform:

```text
HTTP request
    ↓
Parse
    ↓
Validate
    ↓
Authenticate
    ↓
Authorize
    ↓
Build use-case input
    ↓
Call use case
    ↓
Map result
    ↓
Return HTTP response
```

A route handler must not contain:

- complex algorithm logic;
- challenge evaluation logic;
- scoring rules;
- SQL queries;
- large transformation pipelines;
- database transaction orchestration;
- content parsing logic;
- feature-specific business rules.

---

# 4. What the Backend Must Not Do

The server architecture must explicitly prevent these patterns.

## Forbidden Pattern 1 — SQL in a React component

```text
❌ React Component
     ↓
SQL Server
```

## Forbidden Pattern 2 — SQL in a route handler

```text
❌ route.ts
     ↓
database.query(...)
     ↓
SQL
```

## Forbidden Pattern 3 — Business logic in a route

```text
❌ POST /challenge/submit
     ↓
300 lines of evaluation logic
```

## Forbidden Pattern 4 — Duplicate algorithm implementations

```text
❌ Challenge Bubble Sort
❌ Visualizer Bubble Sort
❌ Compare Bubble Sort
```

There must be one canonical algorithm implementation:

```text
Core Bubble Sort
      |
      +---- Visualizer
      +---- Challenge
      +---- Experiment
      +---- Comparison
```

---

# 5. Backend Layers

LogicLab uses the following conceptual layers:

```text
1. API / Transport
2. Authentication
3. Authorization
4. Validation
5. Use Cases
6. Services / Domain Coordination
7. Core Engine
8. Repository
9. Database Adapter
10. SQL Server
```

Each layer has one primary responsibility.

---

# 6. Layer 1 — API / Transport

Responsible for:

- HTTP methods;
- URL routing;
- query strings;
- path parameters;
- headers;
- request body parsing;
- response status codes;
- response headers;
- API serialization.

The transport layer should remain small.

---

# 7. Layer 2 — Authentication

Responsible for answering:

> Who is making this request?

It handles:

- session retrieval;
- session validation;
- session expiration;
- token verification;
- logout;
- login;
- account state validation.

It does not decide whether a user owns a resource.

That is authorization.

---

# 8. Layer 3 — Authorization

Responsible for answering:

> Is this authenticated user allowed to perform this operation?

Examples:

```text
Can this user read this experiment?
Can this user update this bookmark?
Can this user submit this challenge?
Can this user delete this account?
Can this user access admin functionality?
```

Authorization must occur server-side.

Client-side route guards are useful for UX but are not security boundaries.

---

# 9. Layer 4 — Validation

Validation has two distinct forms.

## 9.1 Transport validation

Validates:

- request shape;
- required fields;
- field types;
- string lengths;
- numeric ranges;
- JSON structure;
- enum values.

## 9.2 Domain validation

Validates:

- algorithm input rules;
- challenge eligibility;
- experiment constraints;
- graph limits;
- tree limits;
- execution limits;
- business rules.

Example:

```text
Transport Validation
    ↓
"inputData is an array"

Domain Validation
    ↓
"array size must be <= configured algorithm limit"
```

---

# 10. Layer 5 — Use Cases

Use cases represent a single application action.

Examples:

```text
RegisterUser
LoginUser
GetAlgorithm
ExecuteAlgorithm
SubmitChallenge
SaveExperiment
ExecuteExperiment
CreateComparison
UpdateProgress
AddFavorite
AddBookmark
GetLearningPath
CompleteLearningPathItem
```

A use case should represent:

> What the user/system is trying to accomplish.

It should not represent an HTTP endpoint.

The same use case may be called from:

- API;
- server action if explicitly approved;
- background job;
- test harness.

---

# 11. Layer 6 — Services

Services coordinate reusable business rules or multi-step domain operations.

Examples:

```text
ProgressService
ChallengeService
ExperimentService
LearningPathService
AchievementService
HistoryService
FavoriteService
```

A service may call:

- repositories;
- core engines;
- validators;
- other carefully bounded services.

Services must not know React UI details.

---

# 12. Layer 7 — Core Engine

The core engine contains framework-independent LogicLab logic.

Examples:

```text
Algorithm Engine
Execution Engine
Challenge Evaluation
Input Generators
Graph Engine
Tree Engine
Visualization Models
Metrics
Complexity
```

The core engine must not import:

```text
React
Next.js
SQL drivers
browser APIs
route handlers
cookies
HTTP request objects
```

This makes algorithm execution highly testable.

---

# 13. Layer 8 — Repository

Repositories define persistence operations.

Examples:

```text
UserRepository
ProgressRepository
ChallengeRepository
ExperimentRepository
HistoryRepository
FavoriteRepository
BookmarkRepository
LearningPathRepository
AchievementRepository
```

Repositories know:

- how data is stored;
- how records are queried;
- how records are mapped.

Repositories should not contain UI decisions.

---

# 14. Layer 9 — Database Adapter

The database adapter owns the actual database client/pool implementation.

Conceptual flow:

```text
Repository
    ↓
Database Adapter
    ↓
Connection Pool
    ↓
SQL Server
```

The rest of the application should not depend directly on the SQL driver package.

This creates a controlled replacement point for:

- driver upgrades;
- testing adapters;
- connection configuration;
- pool configuration.

---

# 15. Complete Request Architecture

```text
┌───────────────────────────────┐
│        Browser / React        │
└───────────────┬───────────────┘
                │ HTTPS
                ▼
┌───────────────────────────────┐
│      Next.js Route Handler    │
└───────────────┬───────────────┘
                │
                ▼
┌───────────────────────────────┐
│ Request Parsing               │
│ Request ID / Correlation ID   │
└───────────────┬───────────────┘
                │
                ▼
┌───────────────────────────────┐
│ Authentication                │
└───────────────┬───────────────┘
                │
                ▼
┌───────────────────────────────┐
│ Authorization / Ownership     │
└───────────────┬───────────────┘
                │
                ▼
┌───────────────────────────────┐
│ Input Validation              │
└───────────────┬───────────────┘
                │
                ▼
┌───────────────────────────────┐
│ Application Use Case          │
└───────────────┬───────────────┘
                │
       ┌────────┴─────────┐
       ▼                  ▼
┌───────────────┐  ┌──────────────┐
│ Core Engine   │  │   Services   │
└───────┬───────┘  └──────┬───────┘
        │                 │
        └────────┬────────┘
                 ▼
        ┌───────────────────┐
        │   Repositories    │
        └─────────┬─────────┘
                  ▼
        ┌───────────────────┐
        │ Database Adapter  │
        └─────────┬─────────┘
                  ▼
             SQL Server
```

---

# 16. Response Architecture

Every endpoint must produce a consistent response shape.

## Success

Conceptually:

```json
{
  "success": true,
  "data": {},
  "meta": {}
}
```

`meta` is optional and can contain:

```text
requestId
pagination
execution information
version information
```

## Error

Conceptually:

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "The request is invalid.",
    "details": {}
  },
  "meta": {
    "requestId": "..."
  }
}
```

The client must not receive raw SQL errors or stack traces in production.

---

# 17. Standard HTTP Status Codes

## 200 — OK

Successful read/update operation.

## 201 — Created

Successful creation.

## 202 — Accepted

Used when work is legitimately asynchronous.

## 204 — No Content

Successful operation with intentionally empty body.

## 400 — Bad Request

Malformed request.

## 401 — Unauthorized

Authentication missing or invalid.

## 403 — Forbidden

Authenticated but not authorized.

## 404 — Not Found

Requested resource does not exist or is intentionally hidden.

## 409 — Conflict

Concurrency conflict, duplicate resource, or state conflict.

## 422 — Unprocessable Content

Request shape is valid but domain validation fails.

## 429 — Too Many Requests

Rate limit exceeded.

## 500 — Internal Server Error

Unexpected server failure.

## 503 — Service Unavailable

Dependency unavailable, including controlled database/service outage.

---

# 18. API Versioning

The initial API can use:

```text
/api/...
```

If a breaking API version is required later:

```text
/api/v2/...
```

Versioning must be introduced deliberately.

Do not introduce version numbers into every route just because a version might exist later.

---

# 19. Endpoint Naming Rules

Use resource-oriented names.

Preferred:

```text
/api/algorithms
/api/algorithms/[slug]
/api/challenges/[id]/submit
/api/experiments/[id]/executions
```

Avoid:

```text
/api/getAlgorithm
/api/saveExperimentNow
/api/doChallengeSubmit
```

Use HTTP methods to express intent.

---

# 20. HTTP Method Rules

```text
GET     Read
POST    Create / execute command
PUT     Full replacement
PATCH   Partial update
DELETE  Delete/archive when appropriate
```

For command-style operations such as:

```text
submit challenge
execute experiment
start session
```

`POST` is appropriate.

---

# 21. Complete API Endpoint Inventory

## Health

```text
GET /api/health
GET /api/health/live
GET /api/health/ready
```

---

# 22. Authentication Endpoints

```text
POST /api/auth/register
POST /api/auth/login
POST /api/auth/logout
GET  /api/auth/session
```

Future:

```text
POST /api/auth/verify-email
POST /api/auth/forgot-password
POST /api/auth/reset-password
POST /api/auth/change-password
```

These can be added when the authentication product scope requires them.

---

# 23. User Endpoints

```text
GET   /api/users/me
PATCH /api/users/me
DELETE /api/users/me
```

Settings:

```text
GET   /api/users/me/settings
PATCH /api/users/me/settings
```

The server determines the user from authenticated session context.

The client must not be allowed to choose another `UserId` for these endpoints.

---

# 24. Algorithm Endpoints

```text
GET /api/algorithms
GET /api/algorithms/[algorithmSlug]
```

Optional filters:

```text
category
difficulty
search
page
pageSize
```

Execution:

```text
POST /api/execution/algorithm
```

The algorithm execution endpoint should accept:

```text
algorithm reference
input
configuration
execution limits
random seed where appropriate
```

It returns a structured execution result.

---

# 25. Algorithm Search

Search should preferably operate against static content registries.

Example:

```text
GET /api/algorithms?search=binary&page=1&pageSize=20
```

The server should enforce:

- maximum page size;
- normalized search query;
- safe filter values;
- stable ordering.

---

# 26. Data Structure Endpoints

```text
GET /api/data-structures
GET /api/data-structures/[structureSlug]
```

Operations:

```text
POST /api/execution/data-structure
```

The server must validate:

- operation type;
- input structure;
- size limits;
- operation-specific parameters.

---

# 27. Execution Architecture

Algorithm execution is a special backend capability because:

- inputs may be expensive;
- graph/tree execution may be CPU-heavy;
- trace output can become large;
- recursive algorithms can exhaust resources.

The execution layer must have:

```text
input limits
time limits
step limits
memory-conscious output limits
cancellation
```

---

# 28. Execution API

Conceptually:

```text
POST /api/execution
```

or specialized:

```text
POST /api/execution/algorithm
POST /api/execution/data-structure
```

Request:

```json
{
  "algorithm": "quick-sort",
  "input": [8, 2, 9, 1],
  "options": {
    "trace": true,
    "randomSeed": 1234
  }
}
```

Response:

```json
{
  "success": true,
  "data": {
    "result": [1, 2, 8, 9],
    "metrics": {},
    "trace": []
  }
}
```

---

# 29. Execution Limits

Every execution must be bounded.

Potential limits include:

```text
maximum input elements
maximum graph nodes
maximum graph edges
maximum tree nodes
maximum matrix dimensions
maximum trace steps
maximum execution duration
maximum serialized response size
```

Limits should be centralized in configuration.

---

# 30. Execution Cancellation

Execution must be cancellable when supported.

Flow:

```text
User presses Stop
        |
        v
Abort request
        |
        v
Execution Controller
        |
        v
Algorithm execution observes cancellation
        |
        v
Execution terminates safely
```

Long-running execution must not ignore cancellation signals.

---

# 31. Worker Integration

Heavy browser-side execution may use Web Workers.

Server-side execution may use worker/background infrastructure later where required.

The core algorithm engine remains reusable in both cases.

The worker boundary must use explicit message contracts.

---

# 32. Challenge Endpoints

```text
GET  /api/challenges
GET  /api/challenges/[challengeId]
POST /api/challenges/[challengeId]/start
POST /api/challenges/[challengeId]/submit
GET  /api/challenges/[challengeId]/progress
GET  /api/challenges/[challengeId]/attempts
```

Potential hints:

```text
POST /api/challenges/[challengeId]/hints
```

---

# 33. Challenge Start Flow

```text
POST /start
   |
   v
Authentication
   |
   v
Challenge lookup
   |
   v
Content version lookup
   |
   v
Eligibility validation
   |
   v
Create challenge session/attempt state
   |
   v
Return challenge state
```

The challenge definition remains static content.

The attempt is dynamic database state.

---

# 34. Challenge Submission Flow

```text
Browser
   |
   v
Submit Answer
   |
   v
Authenticate
   |
   v
Validate request
   |
   v
Load challenge version
   |
   v
Evaluate answer server-side
   |
   v
BEGIN TRANSACTION
   |
   +-- ChallengeAttempts
   +-- ChallengeProgress
   +-- UserActivity
   +-- UserDailyActivity
   +-- Achievement evaluation
   |
   v
COMMIT
   |
   v
Return result
```

---

# 35. Challenge Security

The client must never be trusted for:

```text
isCorrect
score
bestScore
challenge completion
achievement unlock
```

The server owns evaluation.

For interactive challenge types, the server should validate the submitted structured state instead of trusting visual/UI flags.

---

# 36. Progress Endpoints

Algorithm:

```text
GET   /api/progress/algorithms/[algorithmSlug]
PATCH /api/progress/algorithms/[algorithmSlug]
```

Data structures:

```text
GET   /api/progress/data-structures/[structureSlug]
PATCH /api/progress/data-structures/[structureSlug]
```

Overall:

```text
GET /api/progress
```

Progress updates should be idempotent where possible.

---

# 37. Progress Ownership

Every progress query must use:

```text
authenticated UserId
+
content identity
```

Never:

```text
client supplied userId
```

without server-side ownership checks.

---

# 38. History Endpoints

```text
GET /api/history
GET /api/history/[id]
DELETE /api/history/[id]
```

Filtering:

```text
type
date range
content
action
page
pageSize
```

History must be paginated.

---

# 39. Favorites Endpoints

```text
GET    /api/favorites
POST   /api/favorites
DELETE /api/favorites/[contentItemId]
```

The server validates that the target is an active favorite-able content type.

Duplicates should return either:

```text
409 Conflict
```

or an idempotent success according to the chosen API contract.

The project should select one policy and keep it consistent.

---

# 40. Bookmark Endpoints

```text
GET    /api/bookmarks
POST   /api/bookmarks
PATCH  /api/bookmarks/[bookmarkId]
DELETE /api/bookmarks/[bookmarkId]
```

Ownership must be checked before any modification.

---

# 41. Experiment Endpoints

```text
GET    /api/experiments
POST   /api/experiments

GET    /api/experiments/[experimentId]
PATCH  /api/experiments/[experimentId]
DELETE /api/experiments/[experimentId]

POST   /api/experiments/[experimentId]/execute
GET    /api/experiments/[experimentId]/executions
GET    /api/experiments/[experimentId]/executions/[executionId]
```

Optional algorithm composition:

```text
POST   /api/experiments/[experimentId]/algorithms
DELETE /api/experiments/[experimentId]/algorithms/[algorithmId]
```

---

# 42. Experiment Authorization

Every experiment operation follows:

```text
Authenticate
    ↓
Load experiment
    ↓
Check experiment.UserId == session.UserId
    ↓
Allow / deny
```

Never rely on:

```text
hidden UI buttons
```

for ownership security.

---

# 43. Experiment Execution

Execution must:

1. load experiment;
2. verify ownership;
3. load algorithm definitions;
4. load pinned content versions;
5. validate input;
6. enforce limits;
7. execute;
8. store snapshot/result;
9. return result.

The execution itself must not hold a SQL transaction open.

---

# 44. Comparison Endpoints

```text
GET  /api/compare
POST /api/compare

GET /api/compare/[comparisonId]
POST /api/compare/[comparisonId]/execute
GET /api/compare/[comparisonId]/results
```

Algorithm selection should validate:

- algorithm exists;
- algorithm is active;
- algorithm is compatible with input;
- algorithm is not duplicated if duplicates are prohibited.

---

# 45. Learning Path Endpoints

```text
GET /api/learning-paths
GET /api/learning-paths/[learningPathSlug]
GET /api/learning-paths/[learningPathSlug]/progress
PATCH /api/learning-paths/[learningPathSlug]/progress
POST /api/learning-paths/[learningPathSlug]/items/[itemSlug]/complete
```

The server should use the pinned learning-path content version when determining progress structure.

---

# 46. Achievement Endpoints

```text
GET /api/achievements
GET /api/achievements/me
```

Achievement granting should not be directly exposed as a client endpoint.

The server should award achievements based on validated user actions.

---

# 47. Health Endpoints

## Liveness

```text
GET /api/health/live
```

Answers:

> Is the application process alive?

It should not require a full database query.

## Readiness

```text
GET /api/health/ready
```

Answers:

> Is the application ready to receive normal traffic?

It may check:

- database connectivity;
- required configuration;
- essential dependencies.

---

# 48. Request IDs

Every request should receive a request ID.

Example:

```text
X-Request-Id: 01...
```

If a trusted incoming request ID is accepted, validation rules must prevent unsafe header abuse.

The request ID should be included in:

- logs;
- error responses;
- traces;
- support/debugging information.

---

# 49. Correlation IDs

For a request that triggers multiple internal operations:

```text
Request
   |
   +-- Use case
   +-- Service
   +-- Repository
   +-- Database
```

the same correlation ID should connect relevant logs.

---

# 50. Logging

Log structured events, not arbitrary strings.

Include when useful:

```text
requestId
route
method
userId pseudonymous reference
duration
status
errorCode
operation
```

Do not log:

```text
passwords
session tokens
raw auth headers
sensitive user content unnecessarily
database credentials
```

---

# 51. Metrics

Backend metrics should cover:

```text
request count
request latency
error rate
database latency
database errors
execution duration
execution cancellations
challenge evaluation duration
cache hit rate
rate-limit violations
```

Metrics should be aggregated, not based on raw sensitive content.

---

# 52. Tracing

Tracing is especially useful for:

```text
API request
   ↓
Use case
   ↓
Service
   ↓
Repository
   ↓
SQL query
```

The implementation should avoid leaking sensitive values into trace payloads.

---

# 53. Error Architecture

Define server-side errors such as:

```text
AppError
ValidationError
AuthenticationError
AuthorizationError
NotFoundError
ConflictError
ExecutionLimitError
RateLimitError
DatabaseError
ExternalDependencyError
```

Each error maps to a controlled HTTP response.

---

# 54. Error Codes

Error codes should be stable machine-readable identifiers.

Examples:

```text
VALIDATION_ERROR
AUTH_REQUIRED
AUTH_INVALID
FORBIDDEN
RESOURCE_NOT_FOUND
OWNERSHIP_REQUIRED
CONCURRENCY_CONFLICT
DUPLICATE_RESOURCE
EXECUTION_LIMIT_EXCEEDED
RATE_LIMIT_EXCEEDED
DATABASE_UNAVAILABLE
INTERNAL_ERROR
```

Frontend code must use `code`, not parse human-readable error messages.

---

# 55. Internal Error Handling

Production responses must not expose:

```text
SQL query text
SQL server hostname
stack trace
file path
secret names
internal library details
```

Detailed information goes to protected server logs.

---

# 56. Ownership Validation

All user-owned resource operations require ownership validation.

Examples:

```text
Experiment
Bookmark
History item
User setting
Progress
Challenge attempt
Comparison
```

Pattern:

```text
load resource
    ↓
verify owner
    ↓
perform operation
```

Never use:

```text
WHERE ResourceId = @id
```

alone for sensitive user-owned data when ownership is relevant.

Prefer:

```text
WHERE
    ResourceId = @id
    AND UserId = @authenticatedUserId
```

when appropriate.

---

# 57. IDOR / BOLA Prevention

The server must assume that users can alter:

```text
experimentId
bookmarkId
comparisonId
historyId
challengeId
```

in requests.

Every object identifier is untrusted.

---

# 58. Mass Assignment Prevention

Do not blindly persist request bodies.

Bad:

```text
repository.update(request.body)
```

Good:

```text
const command = {
  name: body.name,
  description: body.description
}
```

The server explicitly chooses writable fields.

Users must never be able to set:

```text
Role
AccountStatus
UserId
BestScore
Achievement state
Ownership
```

through generic object spreading.

---

# 59. Rate Limiting

Rate limits should be applied based on endpoint sensitivity.

Examples:

```text
Login
Challenge submit
Experiment execution
Algorithm execution
Password reset
```

can use stricter limits than:

```text
GET static algorithm
GET public learning path
```

Rate limits can consider:

```text
IP
session/user
route
```

without creating privacy problems.

---

# 60. Request Size Limits

Limit:

- JSON body size;
- array element counts;
- graph node counts;
- graph edge counts;
- tree depth;
- matrix dimensions;
- notes;
- challenge answers;
- experiment snapshots.

These limits must be enforced before expensive processing.

---

# 61. Timeout Strategy

Each expensive operation needs a bounded execution time.

Examples:

```text
API request timeout
database query timeout
algorithm execution limit
challenge evaluation timeout
```

Timeouts should fail safely.

---

# 62. Retry Strategy

Do not blindly retry all failed operations.

Retries are appropriate only when:

- operation is transient;
- operation is safe/idempotent;
- retry cannot duplicate side effects.

Do not automatically retry:

```text
challenge submission
achievement awarding
database writes
```

unless idempotency is guaranteed.

---

# 63. Idempotency

Idempotency protects against double submissions caused by:

- double clicks;
- mobile retries;
- network reconnects;
- proxy retries.

Sensitive commands can accept an idempotency key:

```text
Idempotency-Key
```

Examples:

```text
challenge submit
create experiment
execute command
```

The exact endpoints requiring idempotency must be documented during implementation.

---

# 64. Concurrency

Potential conflicts include:

```text
two browser tabs editing an experiment
two challenge submissions arriving simultaneously
progress updated from two devices
favorite added twice
```

Use:

- unique constraints;
- transactions;
- `ROWVERSION`;
- idempotency keys;
- appropriate query conditions.

---

# 65. Caching Strategy

Static content is the easiest cache target.

Potential cache layers:

```text
request-level
in-memory process cache
framework cache
CDN/static cache
database query cache where appropriate
```

Dynamic user-specific records should not be cached in ways that can leak another user's data.

---

# 66. Cache Keys

User-specific cache keys must include ownership context.

Bad:

```text
progress:bubble-sort
```

Good:

```text
progress:<userId>:bubble-sort
```

Public content can use content identity/version:

```text
content:algorithm:bubble-sort:v3
```

---

# 67. Cache Invalidation

When content changes:

```text
ContentVersion v3
        ↓
v4 published
        ↓
invalidate current content cache
```

When user state changes:

```text
Progress update
        ↓
invalidate user progress cache
```

Cache invalidation must be part of the mutation flow.

---

# 68. Server-Only Code Boundary

These modules must never be imported into client components:

```text
server/
database/
auth/
database adapter
server secrets
```

Use clear module boundaries and, where supported, framework server-only protections.

---

# 69. Environment Configuration

Server code must read configuration through:

```text
src/config/
```

instead of scattering:

```text
process.env.X
```

throughout the project.

Configuration should validate required values at startup.

---

# 70. API Contract Architecture

Contracts should define:

```text
request body
query parameters
path parameters
response data
error data
```

Shared types should be reused between client and server where safe.

Do not share server-only types that accidentally expose internal database models.

---

# 71. DTO Rules

Use DTOs to separate:

```text
Database model
```

from:

```text
API response
```

For example:

```text
User database model
```

must not automatically become:

```text
GET /api/users/me
```

response.

The API should deliberately omit:

```text
PasswordHash
session internals
security metadata
internal database fields
```

---

# 72. Database Model vs Domain Model vs API Model

These three concepts should remain distinct when their needs differ.

```text
SQL Row
   ↓
Repository Mapper
   ↓
Domain Model
   ↓
Use Case Result
   ↓
Response DTO
```

Avoid directly returning ORM/database objects from API routes.

---

# 73. Service Responsibility Rules

A service can:

- coordinate multiple repositories;
- enforce a reusable business process;
- coordinate a transaction;
- invoke core engines;
- trigger achievement/progress updates.

A service should not:

- parse raw HTTP requests;
- return `NextResponse`;
- render UI;
- manipulate DOM.

---

# 74. Repository Responsibility Rules

A repository can:

- query;
- insert;
- update;
- delete/archive;
- map database rows.

A repository should not:

- decide HTTP status;
- read cookies;
- evaluate UI state;
- calculate challenge scores;
- call React.

---

# 75. Use-Case Responsibility Rules

A use case coordinates one user/system intention.

Example:

```text
SubmitChallenge
```

can coordinate:

```text
validate challenge
evaluate answer
insert attempt
update progress
update activity
award achievement
```

It should not know about:

```text
Request
NextResponse
DOM
React state
```

---

# 76. Dependency Direction

Preferred dependency direction:

```text
API
 ↓
Use Cases
 ↓
Services
 ↓
Core / Repositories
 ↓
Database Adapter
```

Core algorithms should remain below application layers and independent from transport.

Forbidden:

```text
Core Algorithm
    ↓
Next.js
```

---

# 77. Circular Dependency Prevention

Avoid:

```text
Service A
 ↓
Service B
 ↓
Service A
```

When two services depend on each other, extract shared domain logic into:

```text
core/
```

or create a new narrower service/use case.

---

# 78. Backend Folder Alignment

The backend should map to MD-09 approximately as:

```text
src/server/
│
├── auth/
├── use-cases/
├── services/
├── database/
│   ├── connection/
│   ├── repositories/
│   ├── queries/
│   ├── commands/
│   ├── mappers/
│   └── adapters/
│
├── api/
├── validation/
└── security/
```

No backend folder should become a generic dumping ground.

---

# 79. API Route Structure

Next.js routes should remain minimal.

Example:

```text
src/app/api/challenges/[challengeId]/submit/route.ts
```

should conceptually contain only:

```text
POST
  ↓
authenticate
  ↓
parse request
  ↓
validate request
  ↓
call SubmitChallenge
  ↓
map result
  ↓
return response
```

---

# 80. API Testing

Every important endpoint requires:

- success path;
- validation failure;
- authentication failure;
- authorization failure;
- not found;
- conflict;
- rate limit where relevant;
- database failure where relevant.

Sensitive endpoints also require concurrency tests.

---

# 81. Algorithm API Test Example

```text
GET /api/algorithms/bubble-sort
```

Tests:

```text
[ ] 200 for valid slug
[ ] 404 for nonexistent slug
[ ] inactive content behavior
[ ] metadata shape
[ ] version metadata
```

---

# 82. Challenge API Test Example

```text
POST /api/challenges/binary-search-001/submit
```

Tests:

```text
[ ] authenticated user succeeds
[ ] anonymous user denied
[ ] malformed answer rejected
[ ] oversized answer rejected
[ ] incorrect answer evaluated correctly
[ ] correct answer evaluated correctly
[ ] duplicate submission handled
[ ] progress updated
[ ] activity updated
[ ] achievement logic correct
```

---

# 83. Experiment API Test Example

```text
POST /api/experiments/[id]/execute
```

Tests:

```text
[ ] owner can execute
[ ] non-owner denied
[ ] invalid algorithm rejected
[ ] invalid input rejected
[ ] execution limits enforced
[ ] result saved
[ ] repeated execution creates distinct execution record
[ ] cancellation handled
```

---

# 84. Error Flow

Example:

```text
Database unavailable
       |
       v
Database Adapter
       |
       v
DatabaseError
       |
       v
Use Case / Error Boundary
       |
       v
HTTP 503
       |
       v
{
  "success": false,
  "error": {
    "code": "DATABASE_UNAVAILABLE",
    "message": "The service is temporarily unavailable."
  },
  "meta": {
    "requestId": "..."
  }
}
```

No SQL connection string or internal stack trace should be returned.

---

# 85. Concurrency Conflict Flow

```text
Client A loads Experiment
       |
       | RowVersion = X
       v
Client B updates Experiment
       |
       | RowVersion becomes Y
       v
Client A attempts update with X
       |
       v
0 rows updated
       |
       v
409 CONFLICT
```

The frontend can then:

```text
reload
show conflict
allow retry
```

---

# 86. Database Failure Flow

```text
Route
  ↓
Use Case
  ↓
Repository
  ↓
Database Adapter
  ↓
SQL Server unavailable
  ↓
DatabaseError
  ↓
Controlled error response
```

The error should be logged with:

```text
requestId
operation
latency
database error category
```

without exposing secrets.

---

# 87. API Security Checklist

Every protected endpoint should verify:

```text
[ ] Authentication
[ ] Ownership
[ ] Authorization
[ ] Request validation
[ ] Size limits
[ ] Rate limits where appropriate
[ ] CSRF protection where applicable
[ ] Input sanitization/encoding where applicable
[ ] Safe database queries
[ ] Safe error output
[ ] No sensitive logging
```

---

# 88. CORS

The default rule should be restrictive.

If frontend and API share the same application origin, avoid unnecessary CORS configuration.

If cross-origin requests are required later:

- allow only known origins;
- allow only required methods;
- allow only required headers;
- do not use wildcard origins for authenticated requests.

---

# 89. CSRF

If authentication uses cookies, state-changing operations require an appropriate CSRF strategy.

The implementation must account for:

```text
POST
PUT
PATCH
DELETE
```

and any command-like endpoint.

CSRF protection must not be treated as a frontend-only feature.

---

# 90. XSS and Output Handling

API responses should contain structured data.

The frontend is responsible for rendering safely.

The server must not intentionally return unsanitized HTML for ordinary educational content unless there is a controlled trusted-content rendering mechanism.

User-created notes, names, and descriptions are untrusted data.

---

# 91. SSRF and External Requests

The initial backend should avoid arbitrary URL fetching.

If future integrations require external requests:

- validate URLs;
- restrict protocols;
- restrict hosts where possible;
- block private-network targets;
- enforce timeouts;
- limit response sizes;
- handle redirects safely.

---

# 92. Logging Privacy

Never log:

```text
PasswordHash
session token
cookie contents
authorization headers
full user secrets
```

User-generated content should only be logged when necessary for debugging and must follow privacy requirements.

---

# 93. API Documentation

The implementation should eventually generate or maintain machine-readable API documentation.

OpenAPI can be introduced when endpoint count justifies it.

The source of truth should remain the API contracts, not hand-written documentation that drifts from implementation.

---

# 94. API Contract Evolution

When a response must change:

## Additive change

Generally safe:

```text
new optional response field
```

## Breaking change

Requires versioning or migration strategy:

```text
remove field
change field type
change meaning
change required request field
```

Client compatibility must be considered before deployment.

---

# 95. Caching Public Content

Public algorithm metadata can be cached aggressively because it is:

- static;
- versioned;
- not user-owned.

Potential cache key:

```text
algorithm:bubble-sort:v3
```

The current version can be discovered through the content registry.

---

# 96. Caching User Progress

User progress should not use globally shared cache keys.

Good:

```text
progress:<userId>:algorithm:<contentItemId>
```

Bad:

```text
progress:algorithm:<contentItemId>
```

The latter risks cross-user data leakage.

---

# 97. API Performance Targets

The implementation should define measured targets rather than promising absolute latency.

Important measurements:

```text
route processing duration
validation duration
core execution duration
repository duration
SQL query duration
serialization duration
overall response time
```

These should be observable separately where practical.

---

# 98. API Rate-Limit Categories

Suggested categories:

```text
PUBLIC_READ
AUTHENTICATION
USER_WRITE
EXECUTION
CHALLENGE_SUBMISSION
ACCOUNT_SECURITY
```

Each can have different thresholds.

Exact numbers should be selected during implementation/load testing.

---

# 99. Background Work

Some operations may eventually move to background execution:

```text
large analytics processing
achievement recalculation
cleanup
archival
heavy experiment execution
report generation
```

Do not introduce a queue merely because background jobs are possible.

Use one when:

- latency requirements demand it;
- work exceeds request lifetime;
- retries need isolation;
- execution must survive process restart.

---

# 100. API Observability

Every request should be measurable by:

```text
route
method
status
duration
requestId
```

High-value operations also track:

```text
execution algorithm
execution duration
input-size category
trace size
cache result
database query duration
```

Do not record raw sensitive payloads in metrics labels.

---

# 101. Complete Backend Flow Example — Algorithm Execution

```text
User
 ↓
Visualizer
 ↓
POST /api/execution/algorithm
 ↓
Route Handler
 ↓
Request Validation
 ↓
Execution Use Case
 ↓
Algorithm Registry
 ↓
Input Validator
 ↓
Execution Engine
 ↓
Trace Builder
 ↓
Metrics Collector
 ↓
Execution Result
 ↓
Response Mapper
 ↓
HTTP Response
```

No database access is required for every execution if all required algorithm content is static and public.

User history/progress persistence can happen as a separate bounded action.

---

# 102. Complete Backend Flow Example — Save Experiment

```text
User
 ↓
Experiment UI
 ↓
POST /api/experiments
 ↓
Route
 ↓
Auth
 ↓
Validation
 ↓
CreateExperiment Use Case
 ↓
Experiment Service
 ↓
Repository
 ↓
SQL Transaction
 ├── Experiments
 └── ExperimentAlgorithms
 ↓
Result
 ↓
Response DTO
```

---

# 103. Complete Backend Flow Example — Execute Experiment

```text
User
 ↓
POST /api/experiments/[id]/execute
 ↓
Auth
 ↓
Ownership
 ↓
Execution Use Case
 ↓
Load Experiment
 ↓
Load Algorithm Versions
 ↓
Validate Input
 ↓
Execute Core Engine
 ↓
Store ExperimentExecution
 ↓
Return Execution Result
```

---

# 104. Complete Backend Flow Example — Compare Algorithms

```text
User
 ↓
POST /api/compare/[id]/execute
 ↓
Authentication
 ↓
Ownership
 ↓
Load Comparison
 ↓
Load Algorithm Content Versions
 ↓
Validate shared input
 ↓
Execute each algorithm
 ↓
Collect metrics
 ↓
Persist ComparisonAlgorithms
 ↓
Return comparison result
```

---

# 105. Complete Backend Flow Example — Learning Path

```text
User
 ↓
GET learning path
 ↓
Content Registry
 ↓
Current Version
 ↓
Return content

User completes item
 ↓
POST complete-item
 ↓
Authentication
 ↓
Ownership
 ↓
Validate item belongs to path version
 ↓
Transaction
 ├── LearningPathItemProgress
 ├── LearningPathProgress
 ├── UserDailyActivity
 └── Achievement evaluation
 ↓
Response
```

---

# 106. API Implementation Rules

A new endpoint must not be implemented by immediately creating:

```text
route.ts
```

and putting everything there.

Instead define:

```text
1. API contract
2. Request validation
3. Use case
4. Service need, if any
5. Repository need, if any
6. Authorization requirements
7. Error behavior
8. Tests
9. Route handler
```

---

# 107. Adding a New Endpoint Workflow

```text
Requirement
    ↓
Define resource/action
    ↓
Define request contract
    ↓
Define response contract
    ↓
Define auth requirements
    ↓
Define validation
    ↓
Define use case
    ↓
Reuse/create service
    ↓
Reuse/create repository
    ↓
Write tests
    ↓
Implement route
    ↓
Add logging/metrics
    ↓
Document endpoint
```

---

# 108. Adding a New Database-Backed Feature

Example:

```text
Saved Notes
```

Workflow:

```text
Feature requirement
    ↓
Database table if durable
    ↓
Migration
    ↓
Repository
    ↓
Service/use case
    ↓
API contract
    ↓
API endpoint
    ↓
Frontend feature
    ↓
Tests
```

Do not let the feature jump directly from UI to SQL.

---

# 109. API Testing Matrix

Every endpoint should be reviewed against:

| Test | Required |
|---|---|
| Success | Yes |
| Invalid input | Yes |
| Missing authentication | Protected endpoints |
| Forbidden ownership | User-owned resources |
| Not found | Yes |
| Conflict | Where applicable |
| Database failure | Important writes |
| Concurrency | Mutable resources |
| Rate limit | Sensitive endpoints |
| Large payload | Input-heavy endpoints |
| Cancellation | Execution endpoints |

---

# 110. Backend Testing Layers

```text
Unit
  ↓
Use Case
  ↓
Repository
  ↓
API Integration
  ↓
E2E
```

Core algorithms are tested independently of HTTP.

---

# 111. Do Not Test Only API Responses

For critical actions, verify database state too.

Example:

```text
Submit challenge
```

must test:

```text
HTTP response
+
ChallengeAttempts row
+
ChallengeProgress update
+
Activity update
+
Achievement behavior
```

This prevents false-positive API tests.

---

# 112. API Contract Tests

Contract tests should verify that:

```text
frontend expectation
=
server response
```

Especially important for:

```text
pagination
challenge result
execution result
experiment result
comparison result
progress dashboard
```

---

# 113. Database Transaction Tests

Test rollback scenarios.

Example:

```text
Challenge attempt INSERT succeeds
Challenge progress UPDATE fails
```

Expected:

```text
attempt INSERT rolled back
```

No partial completion state should remain.

---

# 114. Retry and Duplicate Tests

Simulate:

```text
same request sent twice
same idempotency key sent twice
two tabs submit simultaneously
network retry after server success
```

The result must remain correct and consistent.

---

# 115. Security Test Matrix

Protected APIs should test:

```text
anonymous user
authenticated user
wrong user
admin user
expired session
revoked session
malformed token
tampered resource ID
oversized payload
invalid JSON
unexpected fields
```

---

# 116. Performance Test Matrix

Load test:

```text
algorithm execution
challenge submission
progress dashboard
history pagination
experiment execution
comparison execution
```

Measure:

```text
p50
p95
p99
error rate
CPU
memory
database latency
```

---

# 117. Production Readiness Checklist

```text
[ ] Route handlers are thin
[ ] Use cases are defined
[ ] Services have clear responsibilities
[ ] Repositories are isolated
[ ] Core engine is framework-independent
[ ] API contracts are defined
[ ] Validation is server-side
[ ] Authentication is server-side
[ ] Authorization checks ownership
[ ] Errors are standardized
[ ] No raw SQL errors returned
[ ] Rate limits configured
[ ] Request size limits configured
[ ] Expensive execution bounded
[ ] Cancellation supported where appropriate
[ ] Concurrency handling tested
[ ] Database transactions tested
[ ] Logs structured
[ ] Request IDs enabled
[ ] Health checks enabled
[ ] Secrets validated at startup
[ ] API tests passing
[ ] E2E tests passing
```

---

# 118. Final Approved API Architecture

```text
                         BROWSER
                            |
                            v
                     NEXT.JS / REACT
                            |
                            v
                   ROUTE HANDLER LAYER
                            |
          +-----------------+-----------------+
          |                 |                 |
          v                 v                 v
      Parsing         Authentication      Validation
          |                 |                 |
          +-----------------+-----------------+
                            |
                            v
                        USE CASE
                            |
                            v
                         SERVICE
                     /            \
                    /              \
                   v                v
             CORE ENGINE       REPOSITORY
                   |                |
                   |                v
                   |        DATABASE ADAPTER
                   |                |
                   +--------+-------+
                            |
                            v
                       SQL SERVER
```

---

# 119. Final Responsibility Map

| Layer | Primary Responsibility | Must Not Own |
|---|---|---|
| Route Handler | HTTP transport | Business logic |
| Authentication | Identity | Resource ownership |
| Authorization | Permission | UI behavior |
| Validation | Request/domain validation | Persistence |
| Use Case | Application action | HTTP details |
| Service | Business coordination | React/UI |
| Core Engine | Algorithms/execution | SQL |
| Repository | Persistence | HTTP |
| DB Adapter | SQL connection | Business rules |
| SQL Server | Durable state/integrity | UI/content presentation |

---

# 120. Final Architecture Rules

The following rules are mandatory for LogicLab:

1. Browser code must never access SQL Server directly.
2. API routes must remain thin.
3. Business logic must live outside route handlers.
4. Core algorithms must remain framework-independent.
5. The same canonical algorithm engine must power visualizers, challenges, experiments, and comparisons.
6. Every protected endpoint must authenticate the user.
7. Every user-owned resource operation must validate ownership.
8. Every request must be validated server-side.
9. Client-provided scores, achievements, progress, and ownership must never be trusted.
10. Database queries must be parameterized.
11. Repositories must isolate persistence logic.
12. Database models must not automatically become API response models.
13. Errors must use stable machine-readable codes.
14. Production responses must not leak internal implementation details.
15. Expensive execution must have explicit resource limits.
16. Long-running work must support cancellation where practical.
17. Retry behavior must be deliberate and safe.
18. Critical mutations must be transactional.
19. Optimistic concurrency must be used for relevant mutable records.
20. High-volume data must have retention rules.
21. Static content must remain separate from dynamic user state.
22. Content versions must be used when historical reproducibility matters.
23. Cache keys for user data must include user identity.
24. Sensitive values must never appear in normal logs.
25. All major endpoints must have unit/integration coverage.
26. API contracts must be kept synchronized with implementation.
27. No generic `utils`/`helpers` dumping ground may be created for backend logic.
28. No route may directly contain a large SQL query or business workflow.
29. No feature may bypass the use-case/service/repository boundary without an explicit architectural decision.
30. New endpoints must follow this document and MD-09 folder rules.

---

# 121. Final API / Backend Quality Gate

Before declaring an API feature complete, verify:

```text
[ ] Endpoint defined
[ ] HTTP method correct
[ ] Path naming correct
[ ] Request contract defined
[ ] Response contract defined
[ ] Error codes defined
[ ] Authentication defined
[ ] Authorization defined
[ ] Ownership defined
[ ] Validation defined
[ ] Use case created
[ ] Service created only if required
[ ] Repository created only if required
[ ] Transaction boundary defined
[ ] Concurrency behavior defined
[ ] Idempotency behavior defined where required
[ ] Rate limit considered
[ ] Request size limit considered
[ ] Cache behavior considered
[ ] Logs/metrics considered
[ ] Unit tests created
[ ] Integration tests created
[ ] E2E coverage added where appropriate
[ ] No client/server boundary violation
[ ] No direct DB access from UI
[ ] No duplicated core algorithm logic
[ ] No sensitive information in responses
```

---

# 122. Final Principle

The LogicLab backend should remain a **controlled application boundary**, not a second implementation of the frontend and not a collection of database wrappers.

The intended architecture is:

```text
                         LOGICLAB
                            |
             +--------------+--------------+
             |                             |
             v                             v
          PUBLIC                       PROTECTED
          CONTENT                       USER DATA
             |                             |
             v                             v
       Content Engine                  SQL Server
             |                             |
             +--------------+--------------+
                            |
                            v
                         USE CASES
                            |
             +--------------+---------------+
             |                              |
             v                              v
        CORE ENGINE                     SERVICES
             |                              |
             +---------------+--------------+
                             |
                             v
                         REPOSITORIES
                             |
                             v
                       DATABASE ADAPTER
                             |
                             v
                         SQL SERVER
```

The backend exists to enforce **correctness, security, consistency, persistence, and controlled access** while keeping LogicLab's algorithmic intelligence reusable and independent of HTTP, React, and SQL Server.
