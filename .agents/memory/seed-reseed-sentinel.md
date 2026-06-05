---
name: Course seed auto-reseed sentinel
description: How the api-server course seed decides whether to wipe and re-seed on boot, and the trap when changing assignment/problem content only.
---

# Course seed auto-reseed mechanism

`seedIfEmpty` in the api-server course seed decides whether to wipe + re-seed by comparing TWO things against the live DB:
1. The **set of topic slugs** (sorted, joined) vs. the expected slug set.
2. A **sentinel phrase** that must literally appear in one designated lecture body (a specific topic slug).

`CONTENT_REVISION` is **only logged**, never compared — bumping it alone does nothing.

**Why this matters / the trap:** If you change *assignment problems, prompts, or correct answers only* (and leave topic slugs and the sentinel lecture body untouched), the reseed will NOT trigger and your content change will not reach the database. The slug set still matches and the sentinel phrase still matches, so the seed is skipped on every boot.

**How to apply:** To force a one-time reseed after any content edit that doesn't change slugs, you must make the live DB's stored sentinel phrase differ from the code constant. The clean way: edit the sentinel lecture body to contain a NEW phrase, then update the sentinel-phrase constant to that new phrase (and bump CONTENT_REVISION for the human-readable log). On the next boot the phrase mismatch triggers a wipe + re-seed; afterward the DB body contains the new phrase so subsequent boots skip again. Confirm via logs: look for "course content drifted ... wiping and re-seeding" with `revisionMatches: false`, then "Seed complete" with the expected topic/assignment counts.

**Also note:** The "Reset course" button only wipes student progress (attempts/answers/practice), it does NOT re-seed course content. The DB schema must be pushed (`pnpm --filter @workspace/db run push`) before first boot, or the seed fails with `relation "topics" does not exist`.
