# LogicLab — Technology Stack & Development Environment Specification

## 1. Purpose of This Document

This document defines the **approved technology stack, development environment, storage strategy, database strategy, tooling, testing approach, and production transition rules** for LogicLab.

The purpose is to make the technology decisions explicit before implementation starts.

This document answers:

> **What technologies are we using to build LogicLab, what is each technology responsible for, where does each kind of data live, how does the application communicate with the database, and how can the project move from local development to production without major code rewrites?**

This document is intentionally focused on technology and implementation choices.

It does not redefine:

- The complete educational content model.
- The complete website layout.
- The complete animation specification.
- The detailed interactive feature specification.

Those are defined in the other LogicLab documentation files.

---

# 2. Final Technology Direction

The initial LogicLab stack should be:

```text
Frontend:
Next.js + React + TypeScript

Server / API:
Next.js server-side API layer

Database:
Microsoft SQL Server

Static Educational Content:
TypeScript / JSON / Markdown structured content

Browser Persistence:
LocalStorage / IndexedDB where appropriate

Visualization:
SVG + DOM as the primary approach
Canvas only where a visualization genuinely benefits from it

Styling:
CSS / CSS Modules or the selected project styling system

Code Display:
Syntax highlighting / code viewer library

Charts:
A lightweight charting solution only where needed

Testing:
Unit + Integration + End-to-End testing

Version Control:
Git + GitHub

Deployment:
Next.js-compatible production hosting
+
Production Microsoft SQL Server / Azure SQL
```

The exact package versions should be selected and locked at implementation time based on the currently supported stable releases.

---

# 3. Core Technology Principle

LogicLab should avoid unnecessary technology complexity.

The project should use the smallest stack that can comfortably support:

```text
Interactive learning
Algorithm execution
Complex visualizations
User interaction
User progress
Persistent user data
Testing
Production deployment
```

The first version should not introduce infrastructure merely because it may be useful someday.

At the same time, code boundaries must be designed so the project can scale later.

---

# 4. Architectural Technology Model

The technology stack should be organized as:

```text
┌──────────────────────────────────────────────────────────────┐
│                         USER                                 │
└───────────────────────────────┬──────────────────────────────┘
                                │
                                ▼
┌──────────────────────────────────────────────────────────────┐
│                       FRONTEND                               │
│                                                              │
│                 Next.js + React + TypeScript                 │
│                                                              │
│  Pages / Components / Visualizers / Controls / Forms         │
└───────────────────────────────┬──────────────────────────────┘
                                │
                                ▼
┌──────────────────────────────────────────────────────────────┐
│                     SERVER / API                             │
│                                                              │
│               Next.js Server/API Layer                       │
│                                                              │
│ Authentication / Validation / Business Services              │
│ Progress / Favorites / History / Experiments                  │
└───────────────────────────────┬──────────────────────────────┘
                                │
                                ▼
┌──────────────────────────────────────────────────────────────┐
│                  DATA ACCESS LAYER                            │
│                                                              │
│ Repository / Query / ORM Boundary                             │
│                                                              │
│        Environment-Based Database Configuration               │
└───────────────────────────────┬──────────────────────────────┘
                                │
                                ▼
┌──────────────────────────────────────────────────────────────┐
│                    MICROSOFT SQL SERVER                       │
│                                                              │
│        Local DB during development                            │
│        Server DB in production                                │
└──────────────────────────────────────────────────────────────┘
```

Static educational content follows a separate path:

```text
Algorithm Definitions
        ↓
Structured Project Content
        ↓
Application
```

It does not need to travel through SQL Server in V1.

---

# 5. Frontend Framework — Next.js

## 5.1 Role

Next.js is the primary application framework.

It provides the overall web application structure, routing, rendering, server capabilities, and deployment model.

LogicLab should use Next.js for:

- Application routing.
- Page composition.
- Layouts.
- Server-side functionality where appropriate.
- API/server endpoints.
- Static content loading.
- Frontend application delivery.
- Production build.
- Environment configuration.

---

# 6. React

React is the primary UI component system inside Next.js.

React should be used for:

- Reusable components.
- Interactive visualizers.
- Playback controls.
- Graph editors.
- Tree editors.
- Challenge interfaces.
- Forms.
- Panels.
- Progress views.
- Dynamic application state.

React components should remain focused on presentation and interaction.

Algorithm logic should not be embedded directly into large UI components.

---

# 7. TypeScript

TypeScript is the primary programming language for the application.

TypeScript should be used for:

- React components.
- Next.js server code.
- Algorithm implementations.
- Content definitions where appropriate.
- State models.
- Visualization state.
- Shared contracts.
- API request / response types.
- Database service contracts.
- Testing code where appropriate.

TypeScript is especially important because LogicLab has many interconnected concepts:

```text
Algorithm
Execution Step
Visualization State
Metrics
Challenge
Progress
User Data
```

Shared types should prevent these concepts from drifting apart.

---

# 8. TypeScript Architecture Rules

Type definitions should exist at clear boundaries.

Examples:

```text
AlgorithmDefinition
ExecutionStep
VisualizationState
AlgorithmResult
Metrics
ChallengeDefinition
ChallengeAttempt
ProgressRecord
Experiment
User
```

The project should avoid:

```text
any
```

where a real type can be defined.

Use strict TypeScript configuration.

Important interfaces should be explicit and reusable.

---

# 9. Static Educational Content Strategy

LogicLab's educational content should **not** be stored in SQL Server initially.

Content such as:

```text
Algorithm names
Descriptions
Examples
Pseudocode
Code
Complexity
Properties
Explanations
Challenges
Hints
Tags
Learning paths
Related topics
Visualization metadata
```

should remain in the codebase as structured content.

Possible formats:

```text
TypeScript
JSON
Markdown
```

The final implementation may use a combination.

---

# 10. Why Educational Content Stays in Code

This provides several benefits:

```text
Version controlled
Easy to review
Easy to update
Easy to test
Easy to deploy
No database dependency for core learning content
Simple local development
```

A developer can update an algorithm definition and commit the change through Git.

---

# 11. Static Content Organization

Conceptually:

```text
content/
│
├── algorithms/
│   ├── sorting/
│   ├── searching/
│   ├── graphs/
│   └── trees/
│
├── data-structures/
│
├── challenges/
│
├── examples/
│
├── learning-paths/
│
└── shared/
```

The exact folder structure can be refined later.

The important rule is:

> Educational content must be separate from UI components.

---

# 12. Content Format Rules

Structured content should be:

- Machine-readable.
- Type-safe where practical.
- Consistent across algorithms.
- Reusable by multiple pages.
- Version controlled.
- Independently testable.

Avoid placing large educational strings directly inside JSX/TSX components.

---

# 13. Microsoft SQL Server

Microsoft SQL Server is the selected relational database for LogicLab.

It is responsible for **dynamic and user-specific data**.

The database should eventually contain data such as:

```text
Users
Profiles
Progress
Challenge Attempts
Favorites
History
Saved Experiments
Bookmarks
Achievements
Learning Path Progress
User Settings
Optional User Notes
```

---

# 14. Why SQL Server

SQL Server is a strong fit because LogicLab has many relational concepts:

```text
User
   ↓
Progress
   ↓
Algorithm
   ↓
Challenge Attempts
```

and:

```text
User
   ↓
Saved Experiment
   ↓
Algorithm
   ↓
Input / Configuration
```

Relational constraints, indexing, transactions, and structured querying are useful for these relationships.

---

# 15. Database Strategy — Hybrid Storage

LogicLab will use a hybrid storage strategy.

```text
                    LOGICLAB DATA
                         │
             ┌───────────┴───────────┐
             │                       │
       STATIC CONTENT            USER DATA
             │                       │
       Code / JSON / MD          SQL Server
             │                       │
             │              ┌────────┴─────────┐
             │              │                  │
             │          Production DB      Browser Cache
             │
             └───────────────┬────────────────┘
                             ▼
                         Application
```

---

# 16. Data Stored in Code

The codebase owns:

```text
Algorithm definitions
Algorithm explanations
Pseudocode
Code examples
Complexity information
Algorithm properties
Examples
Visualization definitions
Challenge templates
Hints
Categories
Tags
Related topics
Learning path definitions
Static achievement definitions
```

These are product content, not user records.

---

# 17. Data Stored in SQL Server

SQL Server owns dynamic user-related information.

Recommended initial entities:

```text
Users
UserProfiles
UserProgress
ChallengeAttempts
Favorites
ViewHistory
SavedExperiments
StepBookmarks
LearningPathProgress
Achievements
UserSettings
```

Additional entities can be added later.

---

# 18. Data Stored in Browser Storage

Browser storage can be used for small client-side preferences and temporary information.

Suitable data:

```text
Selected theme preference
Playback speed
Last selected language
Temporary input
UI preferences
Temporary experiment state
Recently used local settings
```

Browser storage should not be treated as authoritative for critical server-side user data.

---

# 19. Storage Decision Rules

Use this rule:

```text
Is it educational content created by LogicLab?
→ Keep it in code / structured content.

Is it user-specific and should survive login/device changes?
→ SQL Server.

Is it temporary or device-specific?
→ LocalStorage / IndexedDB.

Is it generated only for the current session?
→ In-memory application state.
```

---

# 20. Local Development Database

During development, LogicLab should use a **local Microsoft SQL Server instance**.

Conceptually:

```text
Developer Machine
│
├── LogicLab
│
└── SQL Server
    └── LogicLabDB
```

This keeps development independent from a paid cloud database during the initial development phase.

---

# 21. Production Database

When LogicLab goes live, the database should move to a server-accessible Microsoft SQL Server environment.

Possible production targets:

```text
Azure SQL Database
```

or:

```text
Microsoft SQL Server on a managed / cloud server
```

The application should not be written in a way that assumes the database runs on the developer's machine.

---

# 22. Mandatory Development-to-Production Rule

This is a core architectural requirement:

> **Build the database integration as production-ready from the beginning, while using local SQL Server during development.**

Moving to production should require:

```text
Configuration change
+
Database migration / backup restore
+
Production deployment
```

not:

```text
Major application rewrite
```

---

# 23. Database Independence From Localhost

No application logic should contain:

```text
localhost
```

as a permanent database dependency.

Do not write:

```text
server = "localhost"
```

inside application services.

Instead:

```text
Environment Variables
        ↓
Database Configuration
        ↓
Database Connection
```

---

# 24. Environment Variables

Database configuration must come from environment variables.

Conceptual example:

```text
DB_SERVER
DB_PORT
DB_NAME
DB_USER
DB_PASSWORD
DB_ENCRYPT
```

The exact variable naming can be finalized during implementation.

Local:

```text
DB_SERVER=localhost
```

Production:

```text
DB_SERVER=<production-server>
```

The application code should use the same configuration abstraction in both environments.

---

# 25. Environment Separation

At minimum:

```text
Development
Test
Production
```

Each environment should have its own configuration.

Never commit production credentials to Git.

---

# 26. Secrets

Sensitive values should never be stored in:

```text
Source code
Public JSON
Static content
Git history
Frontend bundle
```

Examples:

```text
Database password
Auth secrets
API secrets
Encryption keys
```

These belong in secure environment configuration.

---

# 27. Database Access Layer

The application should not allow random UI components to directly connect to SQL Server.

Use a dedicated boundary:

```text
API / Server Layer
        ↓
Service Layer
        ↓
Repository / Data Access Layer
        ↓
SQL Server
```

This keeps database details isolated.

---

# 28. ORM / Query Strategy

The project should use one consistent database access approach.

Possible approaches include:

```text
Prisma
Drizzle
MSSQL driver + repository/query layer
```

The final choice should be made before database implementation and then used consistently.

Regardless of the library, the application should keep SQL/database code behind repositories or a dedicated data-access boundary.

---

# 29. Recommended Database Boundary

Conceptually:

```text
UI
 ↓
API
 ↓
Service
 ↓
Repository
 ↓
Database Client / ORM
 ↓
SQL Server
```

The UI should never know:

```text
SQL Server hostname
Database credentials
SQL query syntax
```

---

# 30. Repository Responsibilities

Repositories should handle:

```text
Read User
Save Progress
Create Challenge Attempt
Get History
Add Favorite
Remove Favorite
Save Experiment
Load Experiment
```

Repositories should not contain:

```text
Visual animation logic
React state
Page layout
Button behavior
```

---

# 31. Service Responsibilities

Services should contain application-level rules.

Example:

```text
ProgressService
ChallengeService
ExperimentService
FavoriteService
HistoryService
UserService
```

A service may:

```text
Validate request
Apply business rule
Call repository
Return normalized result
```

---

# 32. API Layer

The API layer exists to safely connect the browser to server-side functionality.

The browser communicates with:

```text
Next.js API / server functions
```

The API communicates with:

```text
Services
Repositories
SQL Server
```

---

# 33. API Data Scope

APIs should mainly handle dynamic/user data.

Examples:

```text
GET    /api/progress
POST   /api/progress

GET    /api/favorites
POST   /api/favorites
DELETE /api/favorites/:id

GET    /api/history
POST   /api/history

GET    /api/experiments
POST   /api/experiments
DELETE /api/experiments/:id

POST   /api/challenges/attempt
GET    /api/challenges/history
```

These are examples of responsibility, not final mandatory endpoint names.

---

# 34. No Need for Content APIs in V1

Avoid unnecessary endpoints such as:

```text
GET /api/bubble-sort
GET /api/bfs
GET /api/dijkstra
```

when the content already exists inside the application.

Static educational content can be loaded directly by the application.

This reduces backend complexity.

---

# 35. Why the Browser Should Not Connect Directly to SQL Server

Direct browser-to-database access would expose unacceptable concerns:

```text
Database credentials
Database topology
SQL interface
Unauthorized access risks
Poor separation
```

The correct model is:

```text
Browser
  ↓
Server/API
  ↓
Database
```

---

# 36. Algorithm Engine Technology

Algorithms should be implemented in TypeScript.

Each algorithm should be:

- Pure where practical.
- Deterministic where possible.
- Independently testable.
- UI-independent.
- Database-independent.

Example:

```text
BubbleSort Engine
      ↓
Execution Steps
      ↓
Metrics
      ↓
Result
```

No SQL calls should exist inside algorithm implementations.

---

# 37. Visualization Technology

LogicLab should primarily use:

## SVG + DOM

for:

```text
Graphs
Trees
Linked Lists
Small / medium arrays
Stacks
Queues
Interactive diagrams
```

SVG is particularly useful for node/edge relationships because elements can remain individually interactive.

---

# 38. Canvas Usage

Canvas should be considered for visualization types that genuinely benefit from it.

Possible cases:

```text
Very large datasets
Particle-like visualizations
Extremely dense graphs
Large-scale performance-heavy rendering
```

Canvas should not automatically be used for everything.

When interaction with individual objects is central, SVG/DOM is usually easier to reason about.

---

# 39. Visualization Abstraction

The architecture should keep visualization rendering behind reusable components:

```text
ArrayVisualizer
GraphVisualizer
TreeVisualizer
StackVisualizer
QueueVisualizer
LinkedListVisualizer
GridVisualizer
MatrixVisualizer
```

The renderer receives state.

It does not implement the algorithm.

---

# 40. Animation Technology

Animation should be handled by the frontend presentation layer.

Possible technologies:

```text
CSS transitions
CSS animations
React-supported animation patterns
Web Animations API
A dedicated animation library where genuinely useful
```

The project should avoid adding a heavy animation library unless it provides clear value.

---

# 41. Animation Principle

Algorithm engines produce:

```text
COMPARE
SWAP
VISIT
INSERT
DELETE
MOVE
RELAX
```

The animation layer decides how those operations appear.

Example:

```text
Algorithm:
SWAP(index 2, index 3)

Visualizer:
Animate cell 2 → cell 3
Animate cell 3 → cell 2
```

---

# 42. State Management

State should be separated by responsibility.

Likely state groups:

```text
Navigation State
Visualization State
Input State
Challenge State
Comparison State
Progress State
Settings State
```

Not everything should be global.

Only shared or cross-component state should be elevated.

---

# 43. Local Component State

Use local component state for short-lived UI state.

Examples:

```text
Dropdown open
Tooltip visible
Modal open
Input field draft
Hover state
Temporary menu state
```

Do not put every small UI value into global state.

---

# 44. Shared Application State

Use shared state where multiple parts need the information.

Examples:

```text
Current algorithm
Current step
Playback state
Current graph
Current challenge
User session
```

The exact state library can be selected based on the project size.

Do not introduce a state-management library if plain React state/context is sufficient.

---

# 45. Routing

Next.js routing should define clear destinations for:

```text
Algorithms
Data Structures
Visualizer
Playground
Challenges
Compare
Progress
History
Favorites
Settings
```

Important content should have stable routes.

---

# 46. Direct Topic Access

Algorithms should be addressable directly.

Examples:

```text
/algorithms/bubble-sort
/algorithms/bfs
/algorithms/dijkstra
```

Data structures:

```text
/data-structures/stack
/data-structures/bst
```

The exact route structure can be refined during implementation.

---

# 47. API Communication

Frontend-to-server communication should use a consistent approach.

The application should standardize:

```text
Request format
Response format
Error format
Loading state
Authentication handling
Validation errors
```

Do not have every feature invent a different response style.

---

# 48. API Response Structure

Conceptually:

```text
Success:

{
    data: {...},
    error: null
}
```

or an equivalent consistent contract.

Error:

```text
{
    data: null,
    error: {
        code: "...",
        message: "..."
    }
}
```

The exact contract can be finalized during implementation.

---

# 49. Validation Technology

Input validation should be centralized.

Validation is required for:

```text
User input
Graph configuration
Tree operations
Challenge submissions
API payloads
Database-bound data
```

A schema validation library may be used if helpful.

The important rule is:

> Never trust client-provided data at the server boundary.

---

# 50. Search

Search should initially operate on static metadata.

It should search:

```text
Algorithm name
Data structure name
Description
Tags
Category
Complexity
Concept keywords
```

A full external search service is unnecessary for V1.

---

# 51. Code Viewer

The code display should support:

```text
Syntax highlighting
Line numbers
Current line highlighting
Language switching
Scrolling
Copy
Expand / collapse
```

The code viewer should not execute arbitrary user-submitted code in V1.

---

# 52. Syntax Highlighting

Use a mature syntax-highlighting solution rather than building a lexer only for code display.

Supported languages can initially include:

```text
TypeScript / JavaScript
Python
Java
C++
```

Additional languages can be added later.

---

# 53. Code Execution Policy

LogicLab should initially display code, not execute arbitrary user-written code in the browser.

The algorithm engine already provides the canonical execution.

If user-code execution is added later, it should be isolated from the main application.

---

# 54. Complexity Charts

Charts should only be used where they improve understanding.

Possible chart use:

```text
Complexity growth
Algorithm comparison
Observed operation counts
Progress
```

The chart library should remain lightweight.

---

# 55. Icon Technology

Use one consistent icon library.

The exact library can be selected during implementation, but avoid combining several icon sets unnecessarily.

Icons should remain visually and semantically consistent.

---

# 56. Typography

The project has two main fonts.

## Primary UI Font

```text
Inter
```

Use for:

```text
Navigation
Headings
Body
Buttons
Labels
Cards
Metrics
Explanations
```

## Technical / Code Font

```text
JetBrains Mono
```

Use for:

```text
Code
Pseudocode
Technical values
Execution identifiers
Debug-style information
```

---

# 57. Google Fonts

Fonts should be loaded from Google Fonts or another reliable optimized font-delivery strategy, depending on deployment requirements.

The project should avoid loading unnecessary font families.

Recommended:

```text
Inter
JetBrains Mono
```

The actual loading method should respect Next.js optimization and deployment best practices.

---

# 58. CSS / Styling Strategy

The project should use a consistent styling approach.

Possible options:

```text
CSS Modules
Global CSS + CSS variables
Utility-first styling if selected
```

The final project should choose one primary strategy rather than mixing several systems without a reason.

Design tokens should be centralized.

---

# 59. Design Tokens

The visual system should define reusable tokens for:

```text
Colors
Spacing
Typography
Radii
Shadows
Motion
Breakpoints
Control sizes
```

These should be consumed by components rather than copied as random values.

---

# 60. Testing Stack

LogicLab needs multiple levels of testing.

```text
Unit Testing
Integration Testing
End-to-End Testing
Visual / Interaction Testing where useful
```

---

# 61. Unit Testing

Unit tests should cover:

```text
Algorithms
Input validation
Generators
Metrics
Execution trace logic
Utility functions
Challenge validation
Scoring
Data transformation
```

Algorithm correctness should not depend on the UI tests.

---

# 62. Integration Testing

Integration tests should verify:

```text
API → Service → Repository
Database operations
Progress saving
Challenge attempts
Favorites
History
Experiments
Authentication flows if implemented
```

The goal is to verify that layers work together correctly.

---

# 63. End-to-End Testing

E2E tests should cover important user journeys.

Examples:

```text
Open algorithm
Run visualization
Step through
Complete challenge
Save favorite
View history
Save experiment
Reload
Return to saved content
```

---

# 64. Visualization Testing

Visualization tests should verify:

```text
Correct initial state
Correct current state
Correct highlighted elements
Correct state transitions
Correct final state
Correct previous-step behavior
Correct next-step behavior
Correct reset behavior
```

---

# 65. Database Testing

Database tests should verify:

```text
Insert
Read
Update
Delete
Constraints
Relationships
Indexes where relevant
Migrations
Rollback strategy where supported
```

Production database operations should never be tested by accidentally pointing tests at the production database.

---

# 66. Linting

The project should use a linter appropriate for:

```text
TypeScript
React
Next.js
```

The linter should run:

```text
During development
In CI
Before production build where practical
```

---

# 67. Formatting

Use a consistent formatter.

Formatting should cover:

```text
TypeScript
TSX
JSON
Markdown
Configuration files
```

The repository should enforce consistent formatting.

---

# 68. Package Manager

Choose one package manager and use it consistently.

Possible choices:

```text
npm
pnpm
yarn
```

For a straightforward initial setup:

```text
npm
```

is acceptable.

The repository must lock dependency versions using the appropriate lockfile.

---

# 69. Dependency Management

Every dependency should have a reason to exist.

Before adding a library, ask:

```text
Does the project genuinely need it?
Can the feature be implemented simply with existing tools?
Is the dependency maintained?
Does it add significant bundle size?
Does it overlap with an existing dependency?
```

Avoid dependency accumulation.

---

# 70. Git

Git is the required version-control system.

The repository should contain:

```text
Source Code
Documentation
Tests
Configuration Templates
Database Migrations
```

It should not contain:

```text
Secrets
Production credentials
Local database files
Node modules
Build output
Temporary files
```

---

# 71. GitHub

GitHub should be used for:

```text
Source control
Issue tracking
Pull requests
Documentation
Release history
CI
Project discussions where appropriate
```

The repository README should eventually explain:

```text
What LogicLab is
How to run it
Technology stack
Project structure
How to contribute
```

---

# 72. Development Environment

Initial development target:

```text
Operating System:
Windows-compatible

Runtime:
Node.js supported by the selected Next.js release

Database:
Local Microsoft SQL Server

Editor:
Any TypeScript-capable IDE
```

The project should not depend on one developer's machine path.

---

# 73. Local Development Architecture

```text
┌──────────────────────────────────────────┐
│              Developer PC                │
│                                          │
│  Browser                                 │
│     ↓                                    │
│  LogicLab / Next.js                      │
│     ↓                                    │
│  Next.js Server/API                      │
│     ↓                                    │
│  Data Access Layer                       │
│     ↓                                    │
│  Microsoft SQL Server                    │
│     └── LogicLabDB                       │
└──────────────────────────────────────────┘
```

Static content is loaded directly from the project:

```text
content/
   ↓
LogicLab
```

---

# 74. Production Architecture

```text
                    INTERNET
                       │
                       ▼
              ┌────────────────┐
              │ LogicLab Web App│
              │   Next.js       │
              └────────┬────────┘
                       │
                       ▼
              ┌────────────────┐
              │ Server / API   │
              │ Layer          │
              └────────┬───────┘
                       │
                       ▼
              ┌────────────────┐
              │ Data Access    │
              │ Layer          │
              └────────┬───────┘
                       │
                       ▼
              ┌────────────────┐
              │ Production     │
              │ SQL Server     │
              │ / Azure SQL    │
              └────────────────┘
```

---

# 75. Local-to-Production Transition

The target transition is:

```text
LOCAL

Next.js
   ↓
Local SQL Server


             ↓
       DATABASE MIGRATION
             ↓


PRODUCTION

Next.js
   ↓
Production SQL Server / Azure SQL
```

The application code should remain substantially the same.

---

# 76. Production Transition Rule

The production move should mainly involve:

```text
1. Provision production database.
2. Apply migrations.
3. Migrate required data.
4. Set production environment variables.
5. Deploy application.
6. Verify database connectivity.
7. Run smoke tests.
```

It should not require:

```text
Rewriting repositories
Rewriting services
Rewriting API contracts
Rewriting UI data flows
```

---

# 77. Database Schema Stability

The local and production database should use the same logical schema.

Example:

```text
Development:
LogicLabDB

Production:
LogicLabDB
```

The environment changes.

The application model does not.

---

# 78. Database Migration Strategy

Use version-controlled database migrations.

Conceptually:

```text
Migration 001
Create Users

Migration 002
Create Progress

Migration 003
Create Favorites

Migration 004
Create ChallengeAttempts
```

Every schema change should be represented by a migration.

---

# 79. Migration Rules

Migrations should be:

- Version controlled.
- Reproducible.
- Tested locally.
- Applied to production deliberately.
- Never edited casually after being applied to shared environments.

---

# 80. Seed Data

Development may use seed data.

Examples:

```text
Test users
Sample progress
Example experiments
Development challenge attempts
```

Static educational content should remain separate from database seed data.

---

# 81. Production Data Protection

Production user data should not be treated as disposable development data.

Do not use:

```text
Development reset scripts
```

against production.

Any destructive migration should be reviewed carefully.

---

# 82. Database Backup Strategy

When production deployment begins, database backups should be part of the operating plan.

The application itself should not assume backups are handled by application code.

Backup responsibility belongs to the production database environment.

---

# 83. Database Connection Management

The server-side application should manage database connections efficiently.

Do not create a brand-new database connection blindly for every request.

Use the selected driver/ORM's recommended connection management approach.

---

# 84. Transactions

Use database transactions when multiple related records must remain consistent.

Examples:

```text
Challenge attempt
+
Progress update
+
Achievement update
```

If these belong to one logical operation, transactional handling should be considered.

---

# 85. User Data Model Direction

The database should be designed around user-owned dynamic data.

Conceptually:

```text
User
 │
 ├── Progress
 ├── Favorites
 ├── History
 ├── Challenge Attempts
 ├── Saved Experiments
 ├── Bookmarks
 ├── Learning Path Progress
 └── Settings
```

---

# 86. Static Algorithm Relationship

User tables may reference stable algorithm IDs:

```text
algorithmId = "sorting.bubble-sort"
```

The algorithm definition itself remains in the application content.

The database does not need to duplicate the complete Bubble Sort record.

---

# 87. Example Progress Record

Conceptually:

```text
userId:
42

algorithmId:
sorting.bubble-sort

completed:
true

completionCount:
3

lastViewedAt:
...

challengeAccuracy:
0.86
```

The `algorithmId` connects dynamic user data with static content.

---

# 88. Example Saved Experiment

Conceptually:

```text
userId:
42

algorithmId:
graph.dijkstra

input:
{
    nodes: [...],
    edges: [...],
    start: "A",
    target: "H"
}

configuration:
{
    mode: "weighted"
}
```

The experiment's configuration can be stored as structured JSON where appropriate.

---

# 89. JSON Data in SQL Server

SQL Server can store structured configuration or flexible user-generated experiment data where appropriate.

Examples:

```text
Graph definition
Tree definition
Experiment configuration
Challenge metadata snapshot
```

But JSON should not replace normal relational columns where relational querying is important.

Use a hybrid relational + structured approach.

---

# 90. Authentication

Authentication is optional for the earliest fully local learning experience.

The project should support two conceptual modes:

```text
Guest / local mode
Authenticated user mode
```

If accounts are added:

```text
Browser
 ↓
Authentication
 ↓
Server
 ↓
SQL Server
```

User identity should be resolved server-side.

---

# 91. Authentication Data

If implemented, SQL Server may store:

```text
User ID
Email / username as appropriate
Created date
Profile settings
Account metadata
```

Passwords should never be stored in plaintext.

Use a mature authentication approach.

---

# 92. Guest Mode

Users should ideally be able to explore core LogicLab content without creating an account.

Guest mode can use:

```text
LocalStorage / IndexedDB
```

for temporary progress.

When authentication is introduced, a future migration flow can optionally associate local progress with the account.

---

# 93. Search Storage

Search does not require its own database service in V1.

Static content can be indexed in memory at runtime.

A future large-scale search implementation could use a dedicated search service, but it is unnecessary initially.

---

# 94. Browser Storage Rules

LocalStorage is suitable for small values such as:

```text
Theme
Speed preference
Simple UI settings
```

IndexedDB is more appropriate for:

```text
Larger saved experiments
Complex graph structures
Longer local records
Offline data
```

Do not store secrets in browser storage.

---

# 95. Logging

Application logging should exist at the server layer.

Useful information:

```text
Request
Endpoint
User / session reference where appropriate
Operation
Error
Duration
Database failure
```

Do not log:

```text
Passwords
Database credentials
Tokens
Sensitive secrets
```

---

# 96. Error Handling

Use structured errors.

Separate:

```text
Validation error
Authentication error
Authorization error
Not found
Database error
Unexpected application error
```

The UI should receive safe, useful messages.

Detailed technical information should remain on the server logs.

---

# 97. Performance Strategy

The architecture should avoid unnecessary database traffic.

Examples:

```text
Algorithm content
→ local/static content

Visualization execution
→ in-memory

User-specific progress
→ database when needed

Temporary UI state
→ local state
```

The system should not call SQL Server simply to retrieve information already bundled with the application.

---

# 98. Performance — Algorithm Execution

Algorithms should execute independently from database latency.

Example:

```text
Bubble Sort
```

should not require a database call for every execution step.

This would make the visualizer unnecessarily slow.

---

# 99. Performance — Visualization

Visualization should operate primarily in memory.

The database should not receive:

```text
Step 1
Step 2
Step 3
...
Step 1000
```

during normal playback.

The current execution can remain client-side.

Only meaningful user progress or saved experiment data should be persisted.

---

# 100. Performance — Database Writes

Potential write points:

```text
Challenge completed
Algorithm completion
Favorite changed
Experiment saved
Bookmark created
Progress milestone
```

Avoid writing to SQL Server on every animation frame.

---

# 101. Browser Support

The project should target modern browsers.

Primary support:

```text
Chrome
Edge
Firefox
Safari
```

The application should test core interaction behavior across supported browsers.

---

# 102. Accessibility Technology

The project should use standard web accessibility capabilities:

```text
Semantic HTML
ARIA only where necessary
Keyboard interaction
Focus management
Reduced motion
Accessible labels
Screen-reader-friendly state descriptions
```

The algorithm state model should provide semantic descriptions.

---

# 103. Security Baseline

Although LogicLab is not a security product, normal application security is mandatory.

The application should:

```text
Validate server input
Protect secrets
Use authenticated server operations
Prevent unauthorized access to user data
Use secure cookies / session handling where appropriate
Avoid direct database exposure
```

---

# 104. No Direct Database Exposure

Never expose:

```text
SQL Server hostname
Database port
Database credentials
Database driver
```

to the browser.

The database is an internal service.

---

# 105. Production Environment Variables

Production configuration should be supplied securely.

Example categories:

```text
Database
Authentication
Application URL
Session secrets
Optional third-party integrations
```

A `.env.example` file can document the required variables without containing real secrets.

---

# 106. Development Environment Variables

Local development can use:

```text
.env.local
```

or the environment mechanism supported by the chosen deployment model.

The repository should include an example configuration template.

---

# 107. Docker Decision

Docker is optional for the initial application.

It becomes useful for:

```text
Reproducible development
CI
Deployment
Database-related local services
Team setup
```

A possible future setup:

```text
Docker Compose
├── LogicLab
└── SQL Server
```

However, Docker should not be introduced solely for the sake of having Docker.

---

# 108. CI / Continuous Integration

The GitHub repository should eventually run:

```text
Install dependencies
Lint
Type-check
Unit tests
Integration tests where possible
Build
```

before merging important changes.

---

# 109. CI and Database

CI database tests can use a dedicated test database or disposable SQL Server environment.

Never point CI tests at production.

---

# 110. Build System

The Next.js build should produce a production-ready application.

The build should verify:

```text
Type correctness
Dependency consistency
Routing
Static content
Server code
```

---

# 111. Production Deployment

Deployment can be:

```text
GitHub
  ↓
CI
  ↓
Build
  ↓
Deployment Platform
  ↓
LogicLab
```

Database deployment:

```text
Database Migrations
  ↓
Production SQL Server
```

The application and database should be deployed in a controlled sequence.

---

# 112. Deployment Sequence

Recommended:

```text
1. Review migration.
2. Backup production database if applicable.
3. Apply migration.
4. Deploy compatible application.
5. Run smoke tests.
6. Verify core user flows.
```

For backward-compatible migrations, a safer staged rollout can be used.

---

# 113. Backward-Compatible Database Changes

Prefer database changes that can support old and new application versions during deployment.

For example:

```text
Add nullable column
      ↓
Deploy code
      ↓
Backfill data
      ↓
Later enforce constraint
```

Avoid destructive schema changes without a migration plan.

---

# 114. Technology Alternatives Considered

The project may consider:

```text
PostgreSQL
MySQL
MongoDB
SQLite
```

But the approved database is:

```text
Microsoft SQL Server
```

Reason:

- Strong relational model.
- Good fit for user-centric data.
- Familiar technology for the project.
- Works well locally and in production.
- Suitable for structured relational data plus flexible JSON-like configuration where appropriate.

---

# 115. Backend Alternatives Considered

Possible:

```text
Separate Node.js backend
Separate Python/FastAPI backend
Next.js server/API layer
```

For V1, choose:

```text
Next.js server/API layer
```

Reason:

- One primary application codebase.
- TypeScript across frontend and server.
- Less infrastructure.
- Simpler deployment.
- Easy transition to a separate backend later if the system grows.

---

# 116. Why Not a Separate Backend Now

A separate backend would introduce:

```text
Second repository
Second runtime
Second deployment
Second dependency ecosystem
Second API project
```

LogicLab does not require that complexity initially.

The Next.js server/API layer is sufficient for V1.

---

# 117. Future Backend Split

If LogicLab grows substantially:

```text
Current:

Next.js
 ├── Frontend
 └── Server/API


Future:

Next.js Frontend
       ↓
Dedicated API
       ↓
Services
       ↓
SQL Server
```

The key is that the current code should keep business logic in services rather than embedding it directly in UI.

---

# 118. Technology Version Policy

Because frameworks and libraries evolve, LogicLab should not blindly hardcode an outdated version in architecture documentation.

The implementation rule is:

```text
Use a currently supported stable release
compatible with the project.
```

Then:

```text
Lock exact versions in package.json / lockfile.
```

Before a major upgrade:

```text
Review breaking changes
Run full tests
Update dependencies
Verify production build
```

---

# 119. Compatibility Policy

All major dependencies should be compatible with:

```text
Next.js
React
TypeScript
Node.js
Browser targets
Selected SQL Server access library
Testing tools
```

Do not upgrade one major technology without checking the others.

---

# 120. Development Dependencies vs Production Dependencies

Development-only tooling may include:

```text
Test runners
Linting
Formatters
Type-check tooling
Story / visual development tools
Database migration tooling
```

Production dependencies should include only what the deployed application actually needs.

---

# 121. Dependency Introduction Rules

Before adding a package:

```text
1. Confirm the feature requirement.
2. Check whether existing tools can solve it.
3. Check package maintenance.
4. Check bundle impact.
5. Check security / license considerations.
6. Check compatibility.
7. Add only if justified.
```

Document significant dependencies in the project documentation.

---

# 122. Avoiding Technology Sprawl

LogicLab should not become:

```text
React
+
Five UI libraries
+
Three animation libraries
+
Multiple state managers
+
Multiple HTTP clients
+
Multiple validation libraries
+
Multiple chart libraries
```

Prefer a small, coherent stack.

---

# 123. Recommended Core Technology Set

The preferred V1 technology set is:

```text
Language:
TypeScript

Framework:
Next.js

UI:
React

Server/API:
Next.js server/API layer

Database:
Microsoft SQL Server

Static Content:
TypeScript / JSON / Markdown

Database Access:
One selected ORM/query approach

Browser Storage:
LocalStorage / IndexedDB

Visualization:
SVG + DOM
Canvas when appropriate

Styling:
One primary CSS/styling approach

Code Display:
One syntax-highlighting solution

Charts:
One lightweight charting solution if needed

Testing:
Unit + Integration + E2E

Version Control:
Git + GitHub

Deployment:
Next.js-compatible hosting + production SQL Server
```

---

# 124. Technology Responsibility Matrix

| Technology / Tool | Primary Responsibility |
|---|---|
| Next.js | Application framework, routing, rendering, server features |
| React | UI components and interactive interfaces |
| TypeScript | Application programming language and type safety |
| SQL Server | Persistent user/dynamic data |
| LocalStorage | Small local preferences |
| IndexedDB | Larger local/offline state |
| SVG | Interactive structural visualizations |
| DOM | UI and lightweight visualization elements |
| Canvas | High-density visualizations where justified |
| CSS / Styling System | Layout and visual design |
| Code Highlighting | Source code presentation |
| Charting Tool | Complexity / comparison charts |
| Git | Version control |
| GitHub | Repository, collaboration, CI |
| Testing Tools | Automated correctness verification |
| Migration Tool | Database schema evolution |
| Next.js Server/API | Browser ↔ server communication |

---

# 125. Final Local Architecture

```text
                         LOCAL DEVELOPMENT

                        ┌─────────────┐
                        │   Browser   │
                        └──────┬──────┘
                               │
                               ▼
                     ┌──────────────────┐
                     │     Next.js      │
                     │                  │
                     │ React UI         │
                     │ Algorithms       │
                     │ Visualizers      │
                     │ Static Content   │
                     │ Server/API       │
                     └────────┬─────────┘
                              │
                              ▼
                     ┌──────────────────┐
                     │ Data Access      │
                     │ Layer            │
                     └────────┬─────────┘
                              │
                              ▼
                     ┌──────────────────┐
                     │ SQL Server       │
                     │ LogicLabDB       │
                     └──────────────────┘
```

---

# 126. Final Production Architecture

```text
                          USERS
                            │
                            ▼
                  ┌──────────────────┐
                  │ Production       │
                  │ LogicLab         │
                  │ Next.js          │
                  └────────┬─────────┘
                           │
                           ▼
                  ┌──────────────────┐
                  │ Server/API       │
                  │ Services         │
                  └────────┬─────────┘
                           │
                           ▼
                  ┌──────────────────┐
                  │ Repository /     │
                  │ Data Access      │
                  └────────┬─────────┘
                           │
                           ▼
               ┌─────────────────────────┐
               │ Production SQL Server   │
               │ / Azure SQL             │
               └─────────────────────────┘
```

---

# 127. Full Technology Flow

```text
USER
  ↓
Browser
  ↓
Next.js / React
  ↓
Interactive UI
  │
  ├──────────────→ Static Content
  │                  │
  │                  └── Algorithms / Explanations / Code
  │
  ├──────────────→ Algorithm Engine
  │                  │
  │                  └── Execution Trace
  │
  └──────────────→ Server/API
                       │
                       ▼
                    Services
                       │
                       ▼
                  Repository
                       │
                       ▼
                  SQL Server
```

---

# 128. Development-to-Production Goal

The ideal transition is:

```text
                         DEVELOPMENT

Next.js
   +
Local SQL Server
   +
Local Environment Variables
   +
Local Testing


                           ↓


                    SAME APPLICATION


                           ↓


                         PRODUCTION

Next.js
   +
Production SQL Server / Azure SQL
   +
Production Environment Variables
   +
CI / Deployment
```

The application architecture should remain fundamentally unchanged.

---

# 129. The "No Extreme Migration Stress" Rule

This is one of the most important requirements in this document.

LogicLab must be built so that:

```text
Local DB
```

is simply a development instance of the same logical database architecture.

The following should remain stable:

```text
Database schema
Entity names
Repository contracts
Service contracts
API contracts
User-data models
Application logic
```

The following should be environment-specific:

```text
Database server
Credentials
Connection settings
Deployment configuration
```

Therefore:

> Moving from local SQL Server to production SQL Server should be primarily an infrastructure/configuration/data-migration operation, not an application rewrite.

---

# 130. Example Transition

Development:

```text
DB_SERVER=localhost
DB_NAME=LogicLabDB
```

Production:

```text
DB_SERVER=production-server
DB_NAME=LogicLabDB
```

Application:

```text
Same code
Same repository
Same service
Same API
Same UI
```

Only the deployment configuration changes.

---

# 131. Data Migration Strategy

When moving to production:

```text
1. Create production database.
2. Apply all migrations.
3. Seed required system data if needed.
4. Import user data only if there are real users.
5. Update production environment variables.
6. Deploy application.
7. Verify database connectivity.
8. Run smoke tests.
```

Static educational content is deployed with the application and does not need database migration.

---

# 132. Production Readiness Checklist

Before going live:

```text
Database schema finalized
Migrations tested
Production DB created
Secrets configured
Database connectivity tested
Authentication tested
API endpoints tested
Static content verified
Algorithm engine tested
Visualization tested
E2E flows tested
Build succeeds
CI green
Backups available
Logging available
Error handling verified
```

---

# 133. Technology Lock Decision

The following is the approved baseline:

```text
PROJECT:
LogicLab

FRONTEND:
Next.js
React
TypeScript

SERVER:
Next.js server/API layer

DATABASE:
Microsoft SQL Server

DATABASE STRATEGY:
Local MSSQL during development
Production MSSQL / Azure SQL when live

STATIC CONTENT:
Code / JSON / Markdown

CLIENT STORAGE:
LocalStorage / IndexedDB where useful

VISUALIZATION:
SVG + DOM
Canvas only where justified

ALGORITHM ENGINE:
TypeScript

TESTING:
Unit + Integration + E2E

VERSION CONTROL:
Git + GitHub

CONFIGURATION:
Environment variables

DEPLOYMENT:
Next.js-compatible hosting
+
Production SQL Server
```

---

# 134. Technology Decision Principles

Future technology decisions should follow:

```text
1. Prefer simplicity.
2. Prefer existing project capabilities.
3. Avoid duplicate technologies.
4. Keep algorithm logic independent.
5. Keep database logic isolated.
6. Keep static content out of the database unless there is a real reason.
7. Keep user data persistent and secure.
8. Keep local and production environments structurally compatible.
9. Prefer testable technologies.
10. Add infrastructure only when it solves a real problem.
```

---

# 135. Final Principle

LogicLab should be engineered so that the developer experience is simple now and the production transition is simple later.

The intended lifecycle is:

```text
BUILD LOCALLY
      ↓
TEST LOCALLY
      ↓
USE LOCAL SQL SERVER
      ↓
STABILIZE APPLICATION
      ↓
PROVISION PRODUCTION SQL SERVER
      ↓
RUN MIGRATIONS
      ↓
CHANGE ENVIRONMENT CONFIGURATION
      ↓
DEPLOY
      ↓
RUN
```

The application should not need a major redesign when it goes live.

The core technology principle is:

> **Keep the product simple during development, but keep the boundaries production-ready from day one.**

---

# 136. Final Stack in One Diagram

```text
                         LOGICLAB
                            │
              ┌─────────────┼─────────────┐
              │             │             │
              ▼             ▼             ▼
          FRONTEND       ALGORITHM     STATIC
              │           ENGINE        CONTENT
              │             │             │
              └─────────────┼─────────────┘
                            │
                         Next.js
                            │
                    Next.js Server/API
                            │
                       Service Layer
                            │
                     Repository Layer
                            │
                            ▼
                    Microsoft SQL Server
                            │
              ┌─────────────┴─────────────┐
              │                           │
       LOCAL DEVELOPMENT             PRODUCTION
       Local SQL Server             Azure SQL /
                                    Server SQL
```

LogicLab should therefore have a technology stack that is **simple enough to build quickly, structured enough to test properly, and separated enough to move from local SQL Server development to production SQL Server infrastructure without major code changes**.
