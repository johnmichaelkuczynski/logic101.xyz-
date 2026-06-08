# ⊢ Formal Logic

**A Four-Week Course on Reasoning, Arguments, and Proof — From Informal Argument Analysis to Soundness, Completeness, and the Limits of Decidability**

---

## 🧩 Overview

Formal Logic is a self-paced, single-user web course that takes you from "what makes an argument good?" to the machinery of formal proof and the metatheorems that describe its limits. It teaches the *form* of valid reasoning: how to strip an argument down to its logical skeleton, write it in symbols, and test it.

The course is a content reskin of the **QuantReason** Quantitative Reasoning app. The full QuantReason runtime — lectures with short / medium / long depth, section-scoped AI tutor, adaptive practice, AI-graded homework / tests / midterm / final, two-layer AI-authorship detection, and one-click diagnostics — is preserved unchanged. The **purpose** of this build is to teach formal logic — the same backbone every philosophy, mathematics, and computer-science student eventually meets — presented in one connected arc.

---

## 🧠 What It Does

- **Four-Week Curriculum of 28 Micro-Lectures** — organized by theme:
  - **Week 1 — Reasoning, arguments, and logical form (7 lectures):** what logic is; statements and truth values; validity and soundness; deductive vs. inductive reasoning; logical form and translation; informal fallacies; necessary and sufficient conditions.
  - **Week 2 — Propositional logic (6 lectures):** the propositional connectives; truth tables; tautology, contradiction, and contingency; logical equivalence and De Morgan's laws; translating into propositional logic; natural deduction in propositional logic.
  - **Week 3 — Predicate logic (7 lectures):** predicates and singular terms; the quantifiers; translating into predicate logic; multiple quantifiers and scope; identity and definite descriptions; natural deduction in predicate logic; models, interpretations, and counterexamples.
  - **Week 4 — Metalogic and beyond (8 lectures):** soundness and completeness; modal logic; set theory for logicians; relations and functions; decidability and its limits; non-classical and defeasible logics; applying argument analysis; a capstone synthesis.
- **One Real Example per Lecture** — Every micro-lecture grounds its concept in a worked argument or historical case — e.g. Aristotle's syllogistic in the *Prior Analytics*, modus ponens vs. affirming the consequent, the truth-table test for validity, De Morgan duality, Russell's theory of definite descriptions, Gödel's completeness theorem vs. the incompleteness theorems, and the undecidability of first-order validity.
- **One Symbolic Question per Lecture** — Every homework / test / midterm / final problem requires the student to *write the key statement in symbols* (∧ ∨ ¬ → ↔, ∀ ∃, ⊢ ⊨, □ ◇, set-builder notation, ≡), not just describe it in English. The on-screen math/logic keyboard is the only practical way to compose these answers.
- **Three-Depth Lectures, Section-Scoped Tutor, Adaptive Practice, AI Grading, Two-Layer Detection, One-Click Diagnostics** — All inherited unchanged from the QuantReason runtime.
- **Built-In Product Demo Video** — The companion `qr-course-demo` artifact still ships as a short screencast of the live UI.

---

## ⚙️ Technical Features

- **Symbolic Answer Harness** — Every problem prompt is structured so the canonical answer is a piece of logical notation. Both the prompt rendering (KaTeX) and the answer entry/grading (LaTeX-aware AI grader with numeric short-circuit) must handle connectives, quantifiers, turnstiles (⊢, ⊨), modal operators (□, ◇), set-builder notation, congruence/equivalence (≡), and the rest cleanly.
- **Two-Layer AI-Authorship Detection** —
  - **Static (GPTZero):** Every submitted answer is sent to GPTZero's `predict/text` endpoint; the per-document AI probability is blended `0.85 × GPTZero + 0.15 × structural-heuristic` for the final score. If GPTZero is unavailable, the system silently falls back to an LLM scorer plus heuristic.
  - **Diachronic (Keystroke Pattern):** The student textarea captures keystroke count, erase count, bulk-insert events, longest bulk insert, rewrite segments, and total duration. A scorer penalizes paste-then-reword behavior, low keystroke-to-output ratios, and impossibly sustained typing speeds.
- **Two Diagnostic Self-Tests** —
  - **System Diagnostic** (`/diagnostics/system`): environment, database round-trip, course-seed integrity, OpenAI chat completion, OpenAI JSON mode, detection pipeline, AI-positive control sample, and GPTZero connectivity.
  - **Synthetic-Student Diagnostic** (`/diagnostics/synthetic-run`): end-to-end stack proof — fake student takes a practice session, takes a full assignment attempt, submits, and verifies grading + detection + analytics all reflect the run.
- **Auto-Reseed on Curriculum Change** — `seedIfEmpty` compares the set of topic slugs in the database to the expected curriculum *and* checks a sentinel phrase in a designated lecture. If either differs, it wipes and re-seeds in dependency order. This is what lets a single content swap propagate cleanly when the seed file changes.
- **Contract-First API** — Single OpenAPI document; React Query hooks for the UI and Zod validators for the server are generated from it.
- **Streaming AI Tutor** — Token-by-token Server-Sent-Event streaming with a section-scoped system prompt grounded in the active lecture.
- **Adaptive Practice Engine** — Per-session difficulty (1–4) adjusts after each attempt; problems are generated on demand.
- **Operator Console** — Dedicated Diagnostics page surfaces both self-tests with one-click execution and raw error output.

---

## 🔐 Required Secrets

- `OPENAI_API_KEY` — required at boot. Powers the tutor, practice generator, AI graders, and lecture-expansion job.
- `GPTZERO_API_KEY` — required for the GPTZero leg of the static-AI-detection layer. If absent, the system falls back to the LLM scorer + heuristic, but you lose the primary detection signal.

Both are requested via the secrets panel; neither is hard-coded.

---

## 🎓 Designed For

- **Anyone Who Wants to Reason Rigorously:** A short, focused course on the form of valid argument — statement, validity, connective, quantifier, proof, and the metatheorems that bound them.
- **The Maintainer of QuantReason and Its Clones:** A pure stress test of the math-notation stack — keyboard, LaTeX rendering, grading, and AI detection — under a different curriculum, with answers that lean on connectives, quantifiers, and turnstiles.

---

## 💡 Core Idea

Most logic is learned as a pile of rules — modus ponens here, De Morgan there. Far fewer courses make the *form* itself the object of study: what a statement is, what makes an inference valid, what a quantifier ranges over, what a proof guarantees, and what no proof procedure can decide.

Read the idea, see it grounded in a real argument, then write the defining statement in symbols of your own.

**Formal Logic — read the idea, ground the idea, write the idea.**

---

## User preferences

_(none recorded yet)_
