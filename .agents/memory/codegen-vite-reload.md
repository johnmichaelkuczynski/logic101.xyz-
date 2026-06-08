---
name: transient vite reload errors during OpenAPI codegen
description: Why "Failed to load url .../generated/api.ts" appears in qr-course vite logs right after running api-spec codegen, and when to ignore it.
---

# Transient vite "Failed to reload" during codegen

Running `pnpm --filter @workspace/api-spec run codegen` prints "Cleaning output folder" and briefly deletes/rewrites `lib/api-client-react/src/generated/api.ts` + `api.schemas.ts`. If a qr-course vite dev server is running, its HMR fires mid-regen and logs `Pre-transform error: Failed to load url .../generated/api.ts` / `Failed to reload /src/pages/*.tsx`.

**These are transient.** Once codegen finishes and files are back, the next load is clean.

**How to apply:** after codegen + client edits, don't trust stale vite "Failed to reload" lines. Confirm health with `pnpm --filter @workspace/qr-course run typecheck` (passes = generated files resolve) and, if unsure, restart the `artifacts/qr-course: web` workflow to clear stale HMR state, then re-check logs. Do not start rewriting imports chasing a phantom missing-module error.
