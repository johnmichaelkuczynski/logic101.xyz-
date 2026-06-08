---
name: per-user scoping for course activity
description: How qr-course / api-server scopes graded attempts and practice runs to a Clerk user, including the dev (no-auth) case.
---

# Per-user scoping convention (qr-course api-server)

All user-owned course rows (graded `attempts`, `practice_assignments`, `feedback_messages`) carry a **nullable** `userId` (Clerk id). `getUserId(req)` returns the id or `null` when no session (dev/preview).

**Rule:** every read/write/submit of a user-owned row must verify ownership, treating `null === null` as a match so the no-auth dev flow still works:
- Filtered queries use a predicate like `userId ? eq(table.userId, userId) : sql\`table.user_id is null\``.
- Single-row fetches verify with an `owns(row, userId)` helper (`(row.userId ?? null) === (userId ?? null)`) and return **403** on mismatch, **404** when absent.
- Readiness/analytics aggregation must apply the same null-aware filter, or unauthenticated requests bleed across all null-owned rows.

**Why:** an earlier pass fetched/mutated by `:id` only → IDOR (any authed user could read/submit another's run) and the null-user readiness path aggregated everyone's data.

**How to apply:** when adding any endpoint touching these tables, scope the query AND guard single rows. Also guard state transitions: submit endpoints reject unless `status === "in_progress"` so re-submits don't double-count `recordTopicResult` into the per-topic profile.
