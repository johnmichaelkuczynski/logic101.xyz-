---
name: connect-pg-simple under esbuild bundling
description: Why the session store fails with ENOENT table.sql when the server is bundled, and the two-part fix
---

# connect-pg-simple + bundled server

**Rule:** When the api-server is bundled with esbuild, `connect-pg-simple`'s `createTableIfMissing` reads `table.sql` relative to `__dirname`, which resolves to `dist/` — causing `ENOENT dist/table.sql` at runtime.

**Why:** Bundling relocates `__dirname` away from the package directory; the SQL file is not part of the JS bundle.

**How to apply:** `build.mjs` copies `require.resolve("connect-pg-simple/table.sql")` into `dist/` after the esbuild step. The `user_sessions` table was also created directly in the DB, so the file is only needed on a fresh database.

Also: the app uses passport-google-oauth20 Google login (user's canonical auth.ts, treated as verbatim — do not rewrite it), NOT Clerk or Replit Auth. Auth routes live at root `/api/auth/*`, mounted before the /api router.
