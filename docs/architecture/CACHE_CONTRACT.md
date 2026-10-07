# LogicLab — Cache Contract & Invalidation Rules

**Document Type:** Architectural Contract  
**Status:** Approved Specification Baseline

---

## 1. Caching Tiers & Invalidation Matrix

| Cache Tier                    | Storage Layer                        | TTL                                 | Invalidation Trigger                 | Isolation Rules                  |
| ----------------------------- | ------------------------------------ | ----------------------------------- | ------------------------------------ | -------------------------------- |
| **Public Static Content**     | HTTP / CDN / Edge                    | 1 Year (Immutable)                  | New Content Hash / Git Deployment    | Public / Shared across all users |
| **Catalog Metadata**          | Next.js Server Memory                | 1 Hour / Revalidate on Demand       | New Content Item Publication         | Public / Shared across all users |
| **User Progress & Stats**     | User-Scoped Memory Cache / Direct DB | 60 Seconds / Stale-While-Revalidate | Progress Update / Attempt Submission | Strictly isolated per `UserId`   |
| **Execution Traces**          | Ephemeral Browser Memory             | Session duration                    | User resets input or edits array     | Scoped to active browser tab     |
| **Experiments & Comparisons** | SQL Server (Source of Truth)         | No cache (Always fresh)             | Mutated by user save/edit            | Scoped to owner `UserId`         |

---

## 2. Invalidation Principles

1. **Deterministic Cache Keys:** All cache keys must follow structured namespaces (e.g. `catalog:algorithms:v1`, `user:progress:{userId}`).
2. **Immediate Invalidation on Mutation:** When a user completes a challenge or logs progress, cached summaries for that `UserId` are immediately evicted.
3. **No Cross-User Leakage:** User-scoped cache keys must always include the verified `UserId` to prevent cross-tenant data contamination.
