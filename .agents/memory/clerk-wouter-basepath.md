---
name: Clerk auth on wouter base-path artifacts (QuantReason clones)
description: How Clerk login is wired into the qr-course / QuantReason-family React apps that run under a non-root base path
---

# Clerk + wouter base-path wiring

These artifacts (qr-course and its QuantReason clones) are Vite+React+wouter apps served under a base path (`import.meta.env.BASE_URL`). Replit-managed Clerk (whitelabel) is the auth solution.

**Rule:** follow the canonical wiring in `.local/skills/clerk-auth/references/setup-and-customization.md` exactly — do not improvise.
- Client `ClerkProvider`: `publishableKeyFromHost(...)`, `proxyUrl` from `VITE_CLERK_PROXY_URL`, `signInUrl`/`signUpUrl`, and `routerPush`/`routerReplace` that `stripBase` so Clerk's absolute paths work with wouter's `<Router base=...>`.
- Auth routes must be public wildcards: `/sign-in/*?` and `/sign-up/*?` (wouter v3 optional wildcard) so OAuth callbacks/nested steps match.
- Server (api-server `app.ts`): mount the copied `clerkProxyMiddleware` BEFORE body parsers, then `clerkMiddleware()` globally before `/api` routes.

**Why:** the proxy is prod-only; dev uses `pk_test` keys and the "development keys" + "Development mode" badge are EXPECTED — do not try to "fix" them.

**Gotcha:** the param pages (AssignmentRunner, WeekView, LectureView, TopicPractice) read params via `useParams()` internally — they do NOT accept a `params` prop. Gate them by wrapping in children form (`<Route path="/x/:id"><Protected><Page/></Protected></Route>`), never a render-prop that passes `params`.

**Scope note:** these course apps are single-user data models — frontend gating + server middleware only; per-user DB scoping was intentionally NOT added.
