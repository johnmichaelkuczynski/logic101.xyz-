# ⊢ Teach Yourself Formal Logic

**A Four-Week Course on Reasoning, Arguments, and Proof — From Informal Argument Analysis to Soundness, Completeness, and the Limits of Decidability**

---

## Overview

**Teach Yourself Formal Logic** is a self-paced, single-user web course that takes you from *"what makes an argument good?"* to the machinery of formal proof and the metatheorems that describe its limits. It teaches the **form** of valid reasoning: how to strip an argument down to its logical skeleton, write it in symbols, and test it.

The course is a content reskin of the **QuantReason** Quantitative Reasoning app. The full QuantReason runtime — lectures with short / medium / long depth, a section-scoped AI tutor, adaptive practice, AI-graded homework / tests / midterm / final, two-layer AI-authorship detection, and one-click diagnostics — is preserved unchanged. Its **purpose** is to teach formal logic, the backbone every philosophy, mathematics, and computer-science student eventually meets, presented in one connected arc.

> Read the idea, ground the idea, write the idea.

---

## What It Does

### Four-week curriculum of 28 micro-lectures

- **Week 1 — Reasoning, arguments, and logical form (7 lectures):** what logic is; statements and truth values; validity and soundness; deductive vs. inductive reasoning; logical form and translation; informal fallacies; necessary and sufficient conditions.
- **Week 2 — Propositional logic (6 lectures):** the propositional connectives; truth tables; tautology, contradiction, and contingency; logical equivalence and De Morgan's laws; translating into propositional logic; natural deduction in propositional logic.
- **Week 3 — Predicate logic (7 lectures):** predicates and singular terms; the quantifiers; translating into predicate logic; multiple quantifiers and scope; identity and definite descriptions; natural deduction in predicate logic; models, interpretations, and counterexamples.
- **Week 4 — Metalogic and beyond (8 lectures):** soundness and completeness; modal logic; set theory for logicians; relations and functions; decidability and its limits; non-classical and defeasible logics; applying argument analysis; a capstone synthesis.

### One real example per lecture

Every micro-lecture grounds its concept in a worked argument or historical case — Aristotle's syllogistic in the *Prior Analytics*, modus ponens vs. affirming the consequent, the truth-table test for validity, De Morgan duality, Russell's theory of definite descriptions, Gödel's completeness theorem vs. the incompleteness theorems, and the undecidability of first-order validity.

### One symbolic question per lecture

Every homework / test / midterm / final problem requires the student to **write the key statement in symbols** (∧ ∨ ¬ → ↔, ∀ ∃, ⊢ ⊨, □ ◇, set-builder notation, ≡), not just describe it in English. The on-screen math/logic keyboard is the only practical way to compose these answers.

### Inherited runtime

Three-depth lectures, section-scoped tutor, adaptive practice, AI grading, two-layer detection, and one-click diagnostics — all inherited unchanged from the QuantReason runtime. A companion `qr-course-demo` artifact ships a short animated product demo of the live UI.

---

## Architecture

This is a [pnpm](https://pnpm.io/) workspace monorepo. The deployable applications live in `artifacts/`, shared code in `lib/`.

| Artifact | Kind | Path | Description |
| --- | --- | --- | --- |
| `qr-course` | web | `/` | The React + Vite course front end. |
| `api-server` | api | `/api` | Express server: lectures, tutor (SSE), practice, grading, detection, diagnostics. |
| `qr-course-demo` | video | `/qr-course-demo` | Animated product-demo video built with React + Framer Motion. |

Shared libraries in `lib/` include the OpenAPI contract and generated React Query hooks / Zod validators, the database client and schema, and the math-notation keyboard.

### Contract-first API

A single OpenAPI document is the source of truth. React Query hooks for the UI and Zod validators for the server are generated from it:

```bash
pnpm --filter @workspace/api-spec run codegen
```

### Key technical features

- **Symbolic answer harness** — Prompts render with KaTeX; answers are entered and graded with a LaTeX-aware AI grader (with a numeric short-circuit) that handles connectives, quantifiers, turnstiles (⊢, ⊨), modal operators (□, ◇), set-builder notation, and congruence (≡).
- **Two-layer AI-authorship detection** —
  - *Static (GPTZero):* every submitted answer is sent to GPTZero's `predict/text` endpoint; the AI probability is blended `0.85 × GPTZero + 0.15 × structural-heuristic`. If GPTZero is unavailable, the system silently falls back to an LLM scorer plus heuristic.
  - *Diachronic (keystroke pattern):* the answer textarea captures keystroke count, erase count, bulk-insert events, rewrite segments, and total duration, then penalizes paste-then-reword behavior and impossibly sustained typing.
- **Streaming AI tutor** — token-by-token Server-Sent-Event streaming with a section-scoped system prompt grounded in the active lecture.
- **Adaptive practice engine** — per-session difficulty (1–4) adjusts after each attempt; problems are generated on demand.
- **Auto-reseed on curriculum change** — `seedIfEmpty` compares the database topic-slug set to the expected curriculum *and* checks a sentinel phrase in a designated lecture. If either differs, it wipes and re-seeds in dependency order, so a single content swap propagates cleanly.

---

## Diagnostics

The Diagnostics page exposes three one-click self-tests:

1. **System diagnostic** (`/diagnostics/system`) — environment, database round-trip, course-seed integrity, OpenAI chat completion, OpenAI JSON mode, the detection pipeline, an AI-positive control sample, and GPTZero connectivity.
2. **Synthetic-student diagnostic** (`/diagnostics/synthetic-run`) — end-to-end stack proof: a fake student takes a practice session and a full assignment attempt, submits, and verifies grading + detection + analytics all reflect the run.
3. **Content audit** — an LLM auditor reviews seeded lecture and problem content for accuracy and flags suspected errors.

---

## Getting Started

The app runs via Replit workflows (one per artifact); there is no root `dev` script.

```bash
# Type-check everything
pnpm run typecheck

# Type-check a single artifact
pnpm --filter @workspace/qr-course run typecheck
pnpm --filter @workspace/api-server run typecheck

# Regenerate API hooks / validators after editing the OpenAPI spec
pnpm --filter @workspace/api-spec run codegen
```

### Required secrets

| Secret | Required | Purpose |
| --- | --- | --- |
| `DATABASE_URL` | yes | Postgres connection string (external Neon supported; the client enables SSL automatically). |
| `OPENAI_API_KEY` | yes (at boot) | Powers the tutor, practice generator, AI graders, and lecture-expansion job. |
| `GPTZERO_API_KEY` | recommended | Enables the GPTZero leg of static AI detection. If absent, the system falls back to the LLM scorer + heuristic. |

All secrets are read from the environment; none are hard-coded.

---

## Designed For

- **Anyone who wants to reason rigorously** — a short, focused course on the form of valid argument: statement, validity, connective, quantifier, proof, and the metatheorems that bound them.
- **The maintainer of QuantReason and its clones** — a pure stress test of the math-notation stack (keyboard, LaTeX rendering, grading, and AI detection) under a different curriculum, with answers that lean on connectives, quantifiers, and turnstiles.

---

## Core Idea

Most logic is learned as a pile of rules — modus ponens here, De Morgan there. Far fewer courses make the **form** itself the object of study: what a statement is, what makes an inference valid, what a quantifier ranges over, what a proof guarantees, and what no proof procedure can decide.

Read the idea, see it grounded in a real argument, then write the defining statement in symbols of your own.

**Teach Yourself Formal Logic — read the idea, ground the idea, write the idea.**
