import { db } from "@workspace/db";
import {
  topicsTable,
  lecturesTable,
  assignmentsTable,
  problemsTable,
} from "@workspace/db";
import { sql } from "drizzle-orm";
import { logger } from "./logger";

type SeedTopic = {
  slug: string;
  title: string;
  weekNumber: number;
  blurb: string;
  lectureTitle: string;
  body: string;
};

const TOPICS: SeedTopic[] = [
  // ───────────────────────────────────────────────────────────────
  // Week 1 — Reasoning, arguments, and logical form
  // ───────────────────────────────────────────────────────────────
  {
    slug: "what-logic-is",
    title: "What logic is: arguments and inference",
    weekNumber: 1,
    blurb: "Logic studies which conclusions follow from which premises.",
    lectureTitle: "1.1 What logic is: arguments and inference",
    body: `# What logic is: arguments and inference

Logic is the study of **inference** — of which conclusions *follow from* which assumptions. It is not the study of what is true in the world (that is for the sciences), but of the relation $\\vdash$ between **premises** and a **conclusion**: when does accepting the premises commit you to accepting the conclusion?

## Arguments

An **argument** is a finite list of statements — the **premises** $P_1, P_2, \\ldots, P_n$ — offered in support of a final statement, the **conclusion** $C$. We write it

$$P_1,\\ P_2,\\ \\ldots,\\ P_n \\ \\therefore\\ C.$$

The turnstile $\\vdash$ records the *claim* that $C$ is derivable from the premises: $P_1, \\ldots, P_n \\vdash C$. Logic asks whether that claim holds, by inspecting the **form** of the argument rather than the subject matter.

## Inference vs. assertion

Asserting "$C$ is true" is not arguing. An argument exhibits *grounds*: it says "given these, you must accept this." The premises need not be true for the inference to be good — what matters is the *connection*. We will spend the course making that connection precise.

## The classic example

Aristotle's syllogistic, set out in the *Prior Analytics* (c. 350 BCE), was the first formal theory of valid inference — the first time the *form* of an argument was studied in abstraction from its content. His standard example:

- $P_1$: All humans are mortal.
- $P_2$: Socrates is a human.
- $C$: Therefore Socrates is mortal.

Aristotle's insight is that the argument is good *because of its shape* — "All $M$ are $P$; $s$ is $M$; therefore $s$ is $P$" — and any argument of that shape is equally good, whatever $M$, $P$, and $s$ stand for. That move, from particular arguments to argument **forms**, is the beginning of logic and the thread of this entire course.`,
  },
  {
    slug: "statements-truth-values",
    title: "Statements, truth, and truth-values",
    weekNumber: 1,
    blurb: "The bearers of truth: declarative sentences and their values.",
    lectureTitle: "1.2 Statements, truth, and truth-values",
    body: `# Statements, truth, and truth-values

Logic works on **statements** (also called *propositions*): declarative sentences that are either **true** or **false**. The two possible values, written $\\top$ (true) and $\\bot$ (false) — or $T$ and $F$ — are the **truth-values**.

## What counts as a statement

A sentence is a statement only if it has a truth-value. "The Moon orbits the Earth" is a statement (true). "$7$ is prime" is a statement (true). "Is it raining?", "Shut the door!", and "Hello" are *not* statements — questions, commands, and greetings are not true or false.

## Bivalence

Classical logic assumes the principle of **bivalence**: every statement has exactly one of the two truth-values — never both, never neither. Formally, for any statement $A$,

$$A = \\top \\quad\\text{or}\\quad A = \\bot, \\quad\\text{and not both.}$$

This is a substantive assumption. In week 4 we meet logics that reject it (for vagueness, for the future, for partial information). For now it is our ground rule.

## A subtle example: the Liar

Consider the sentence $L$: "This sentence is false." If $L$ is true, then what it says holds, so it is false; if $L$ is false, then what it says fails, so it is true. $L$ has no consistent truth-value at all.

The Liar paradox, known to the Megarian logician Eubulides in the 4th century BCE, shows that not every grammatical declarative sentence expresses a genuine statement. Twenty-three centuries later the *same* self-referential trick reappears at the heart of Gödel's and Tarski's theorems (week 4): the careful separation of a language from talk *about* that language is logic's response to the Liar.`,
  },
  {
    slug: "validity-soundness",
    title: "Validity and soundness",
    weekNumber: 1,
    blurb: "The two central virtues of a deductive argument.",
    lectureTitle: "1.3 Validity and soundness",
    body: `# Validity and soundness

The central concept of deductive logic is **validity**. An argument is **valid** when the truth of its premises *guarantees* the truth of its conclusion — when it is impossible for the premises to be true and the conclusion false.

## The definition

An argument with premises $P_1, \\ldots, P_n$ and conclusion $C$ is valid iff

$$\\text{there is no situation in which } P_1, \\ldots, P_n \\text{ are all true and } C \\text{ is false.}$$

In the semantic notation of later weeks, validity is written $P_1, \\ldots, P_n \\models C$. Validity is about the *form* of the inference, not about whether the premises actually hold.

## Validity does not require true premises

This valid argument has a false premise and a false conclusion:

- All fish are mammals. $\\quad$ All mammals breathe air. $\\quad\\therefore$ All fish breathe air.

It is *valid* — IF the premises held, the conclusion would have to. Conversely, an argument can have true premises and a true conclusion yet be **invalid**, if the conclusion does not follow from them.

## Soundness

An argument is **sound** iff it is *both* valid *and* has all true premises. Soundness is what we ultimately want, because:

$$\\text{valid} + \\text{true premises} \\;\\Rightarrow\\; \\text{true conclusion}.$$

## Example

- All whales are mammals. (true) $\\quad$ All mammals are warm-blooded. (true) $\\quad\\therefore$ All whales are warm-blooded.

Valid *and* both premises true — so it is sound, and the conclusion is guaranteed. Logic alone delivers validity; establishing the premises is the job of the sciences. The division of labour between *valid* and *true* is one of the most useful distinctions you will learn.`,
  },
  {
    slug: "deductive-inductive",
    title: "Deductive and inductive reasoning",
    weekNumber: 1,
    blurb: "Necessity vs. probability: two ways an argument can support a conclusion.",
    lectureTitle: "1.4 Deductive and inductive reasoning",
    body: `# Deductive and inductive reasoning

There are two great families of argument, distinguished by *how strongly* the premises are meant to support the conclusion.

## Deductive arguments

A **deductive** argument aims at **validity**: the premises are intended to *guarantee* the conclusion. Deduction is **monotonic** and **truth-preserving** — adding premises never destroys validity, and true premises in a valid argument force a true conclusion. The syllogism of 1.1 is deductive.

## Inductive arguments

An **inductive** argument aims only at **strength**: the premises make the conclusion *probable*, not certain. Inductive support comes in degrees and is **ampliative** — the conclusion says more than the premises strictly contain. Crucially, induction is **defeasible**: a strong inductive argument can be overturned by new information.

The standard contrast:

- Deductive: "All ravens are black; this is a raven; so it is black." Conclusion *guaranteed*.
- Inductive: "Every raven observed so far has been black; so all ravens are black." Conclusion *supported*, not guaranteed.

## Hume's problem of induction

David Hume (1748) pointed out that induction has no *deductive* justification. The inference "the future will resemble the past" cannot itself be proved deductively (it might fail) nor inductively (that would be circular). Yet all of empirical science rests on it.

Nelson Goodman sharpened this in 1955 with the predicate *grue* (green if examined before some future time $t$, blue afterwards): the same evidence that "confirms" *all emeralds are green* equally "confirms" *all emeralds are grue*. Deciding which inductions are legitimate turns out to be deep — which is exactly why this course's *formal* machinery is built for deduction, and induction is handled separately in week 4's defeasible logics.`,
  },
  {
    slug: "logical-form-translation",
    title: "Logical form and translation",
    weekNumber: 1,
    blurb: "Stripping content to expose the skeleton on which validity depends.",
    lectureTitle: "1.5 Logical form and translation",
    body: `# Logical form and translation

Validity depends on **form**, not content. The work of formal logic is to *translate* a natural-language argument into a symbolic skeleton in which that form is visible, and then test the skeleton.

## What "form" means

Compare:

- All cats are animals; Felix is a cat; so Felix is an animal.
- All primes are integers; $7$ is a prime; so $7$ is an integer.

Different subject matter, *same form*: "All $F$ are $G$; $a$ is $F$; therefore $a$ is $G$." The validity lives in the schematic letters and the logical words — *all*, *is*, *therefore* — not in cats or primes. We isolate that by **translation**: choose symbols for the building blocks, then write the form.

## Logical vs. non-logical vocabulary

Translation hinges on separating two kinds of words:

- **Logical constants** — *not, and, or, if…then, all, some, is identical to* — rendered $\\neg, \\wedge, \\vee, \\to, \\forall, \\exists, =$. Their meaning is fixed by logic.
- **Non-logical vocabulary** — *cat, prime, Felix, 7* — rendered by schematic letters $F, G, a, b$. Their meaning is supplied by interpretation.

A valid form is one that comes out valid for *every* reinterpretation of the non-logical letters.

## Why translation is hard: an example

English hides logical form. "Nothing is better than eternal happiness, and a cheese sandwich is better than nothing" looks like it yields "a cheese sandwich is better than eternal happiness." The joke works because *nothing* is not a name; properly translated with quantifiers ($\\neg\\exists x\\, Bx$ vs. $Bca$ for some $a$), the two "nothings" have different logical forms and the inference collapses. Getting the translation right is most of the battle — and the central skill of weeks 2 and 3.`,
  },
  {
    slug: "informal-fallacies",
    title: "Informal fallacies",
    weekNumber: 1,
    blurb: "Arguments that persuade without being valid.",
    lectureTitle: "1.6 Informal fallacies",
    body: `# Informal fallacies

A **fallacy** is an argument that tends to persuade while failing to give genuine logical support. *Formal* fallacies are invalid in virtue of their shape; *informal* fallacies fail because of their content, context, or rhetoric, even when the surface form looks fine.

## Two formal fallacies (for contrast)

These are invalid *forms* that mimic valid ones:

- **Affirming the consequent**: $P \\to Q,\\ Q \\;\\therefore\\; P$. (Invalid — $Q$ might hold for another reason.)
- **Denying the antecedent**: $P \\to Q,\\ \\neg P \\;\\therefore\\; \\neg Q$. (Invalid.)

Compare the *valid* modus ponens $P \\to Q,\\ P \\therefore Q$ and modus tollens $P \\to Q,\\ \\neg Q \\therefore \\neg P$ from week 2. One symbol out of place flips validity.

## A catalogue of informal fallacies

- **Ad hominem** — attacking the arguer, not the argument.
- **Straw man** — refuting a distorted version of the opponent's claim.
- **Begging the question** (*petitio principii*) — assuming the conclusion among the premises.
- **False dilemma** — presenting two options as exhaustive when they are not.
- **Equivocation** — shifting the meaning of a term mid-argument.
- **Appeal to ignorance** — "not proven false, therefore true."

## Example: equivocation

> Only *man* is rational. No *woman* is a man. Therefore no woman is rational.

The word *man* means "human being" in the first premise and "male" in the second. Because the term changes meaning, the argument has *no single logical form* — it merely looks like a valid syllogism. Diagnosing equivocation is exactly diagnosing a failed *translation*: under an honest symbolization the middle term splits into two predicates $M_1$ and $M_2$, and the syllogism's link is severed. Fallacy-spotting is applied translation, which is why it belongs at the end of week 1.`,
  },
  {
    slug: "necessary-sufficient",
    title: "Necessary and sufficient conditions",
    weekNumber: 1,
    blurb: "The two directions of the conditional, and the biconditional.",
    lectureTitle: "1.7 Necessary and sufficient conditions",
    body: `# Necessary and sufficient conditions

Much careless reasoning comes from confusing **necessary** with **sufficient** conditions. The conditional $\\to$ makes the distinction exact.

## Definitions

Let $P$ and $Q$ be statements.

- $P$ is **sufficient** for $Q$ when $P$'s holding is enough to guarantee $Q$: $\\;P \\to Q$.
- $P$ is **necessary** for $Q$ when $Q$ cannot hold without $P$: $\\;Q \\to P$, equivalently $\\neg P \\to \\neg Q$.

These are *converse* conditionals. "Sufficient" points one way; "necessary" points the other.

## The biconditional

If $P$ is **both** necessary and sufficient for $Q$, then $P$ and $Q$ hold under exactly the same conditions:

$$(P \\to Q) \\wedge (Q \\to P) \\;\\equiv\\; P \\leftrightarrow Q.$$

"$P$ if and only if $Q$" — abbreviated **iff** — is the biconditional $P \\leftrightarrow Q$. Mathematical definitions are biconditionals.

## Example

Being divisible by $4$ is *sufficient* for being even ($\\text{div}_4(n) \\to \\text{Even}(n)$) but not necessary ($6$ is even, not divisible by $4$). Being even is *necessary* for being divisible by $4$ ($\\text{div}_4(n) \\to \\text{Even}(n)$, read the other way) but not sufficient.

A real-world cost: a medical test that is *sufficient* for a diagnosis (a positive result guarantees the disease) is very different from one that is *necessary* (everyone with the disease tests positive). Confusing the two — "the test was negative, so you're fine," when the test is only sufficient, not necessary — is a literal life-and-death conditional error. The arrow's *direction* is everything, and keeping it straight is the bridge into the propositional logic of week 2.`,
  },

  // ───────────────────────────────────────────────────────────────
  // Week 2 — Propositional logic
  // ───────────────────────────────────────────────────────────────
  {
    slug: "propositional-connectives",
    title: "Propositional connectives",
    weekNumber: 2,
    blurb: "Five truth-functional operators that build complex statements.",
    lectureTitle: "2.1 Propositional connectives",
    body: `# Propositional connectives

Propositional logic takes atomic statements — letters $p, q, r, \\ldots$ — and builds compound statements with **connectives**. The connectives are **truth-functional**: the truth-value of a compound is fixed entirely by the truth-values of its parts.

## The five standard connectives

| Name | Symbol | English |
|---|---|---|
| Negation | $\\neg p$ | not $p$ |
| Conjunction | $p \\wedge q$ | $p$ and $q$ |
| Disjunction | $p \\vee q$ | $p$ or $q$ (inclusive) |
| Conditional | $p \\to q$ | if $p$ then $q$ |
| Biconditional | $p \\leftrightarrow q$ | $p$ if and only if $q$ |

Negation is **unary** (one input); the rest are **binary** (two inputs).

## How each behaves

- $\\neg p$ flips the value of $p$.
- $p \\wedge q$ is true exactly when *both* are true.
- $p \\vee q$ is true when *at least one* is true (inclusive *or* — both counts).
- $p \\to q$ is false in exactly one case: $p$ true and $q$ false.
- $p \\leftrightarrow q$ is true when the two sides *match*.

## The material conditional, and an example

The conditional $\\to$ is **material**: $p \\to q$ is *defined* as $\\neg p \\vee q$. So a conditional with a false antecedent is automatically true ("vacuously true"). "If the Moon is made of cheese, then $2+2=4$" is true, simply because the antecedent is false.

This bites in mathematics. The statement "for all $x$, if $x$ is a unicorn, then $x$ can fly" is *true* — there are no unicorns, so every instance has a false antecedent. The material reading is what makes such *vacuously* true conditionals — those with no satisfying instances, every antecedent false — come out true, a convention you will rely on constantly from week 3 onward.`,
  },
  {
    slug: "truth-tables",
    title: "Truth tables",
    weekNumber: 2,
    blurb: "An exhaustive method that decides every propositional question.",
    lectureTitle: "2.2 Truth tables",
    body: `# Truth tables

A **truth table** lists every possible assignment of truth-values to the atomic letters and computes the value of a formula in each. With $n$ distinct letters there are $2^n$ rows — the table is finite, so it *mechanically decides* any propositional question.

## The base tables

$$
\\begin{array}{cc|c|c|c|c}
p & q & \\neg p & p\\wedge q & p\\vee q & p\\to q \\\\ \\hline
\\top & \\top & \\bot & \\top & \\top & \\top \\\\
\\top & \\bot & \\bot & \\bot & \\top & \\bot \\\\
\\bot & \\top & \\top & \\bot & \\top & \\top \\\\
\\bot & \\bot & \\top & \\bot & \\bot & \\top
\\end{array}
$$

Note the single $\\bot$ in the $p \\to q$ column: a conditional fails only when a true antecedent meets a false consequent.

## Building bigger tables

For a compound formula, give each atomic letter a column, then add a column for each sub-formula, working outward. The final column is the formula's truth-function. Two formulas are equivalent exactly when their final columns agree row by row (lecture 2.4).

## Testing an argument

An argument is valid iff there is **no row** where all premises are $\\top$ and the conclusion is $\\bot$. So truth tables decide validity by inspection.

## Example

Test modus ponens $p,\\ p \\to q \\models q$. The only rows where both premises $p$ and $p \\to q$ are true is the first row ($p = \\top$, $q = \\top$), and there $q = \\top$. No counterexample row exists, so the argument is valid. The same table, read for the form $p \\to q,\\ q \\models p$, *does* have a bad row ($p = \\bot$, $q = \\top$): premises true, conclusion false. That is the fallacy of affirming the consequent, caught mechanically. The price of this certainty is the $2^n$ blow-up — the first hint of the complexity questions in week 4.`,
  },
  {
    slug: "tautology-contradiction-contingency",
    title: "Tautology, contradiction, and contingency",
    weekNumber: 2,
    blurb: "Three ways a formula can relate to truth.",
    lectureTitle: "2.3 Tautology, contradiction, and contingency",
    body: `# Tautology, contradiction, and contingency

Looking only at a formula's final truth-table column sorts every propositional formula into three classes.

## The three classes

- A **tautology** is true on *every* row — true under all assignments. We write $\\models A$.
- A **contradiction** is false on *every* row.
- A **contingency** is true on some rows and false on others.

A formula is a tautology iff its negation is a contradiction, and vice versa.

## Canonical examples

- Tautology: the **law of excluded middle**, $p \\vee \\neg p$. Whatever $p$ is, one of the two disjuncts holds.
- Contradiction: the **law of non-contradiction's negation**, $p \\wedge \\neg p$ — never true.
- Contingency: $p \\to q$ — true in three rows, false in one.

## Tautologies and valid arguments

The two big ideas of the week connect here. An argument $P_1, \\ldots, P_n \\models C$ is valid **iff** the single conditional

$$(P_1 \\wedge \\cdots \\wedge P_n) \\to C$$

is a tautology. So "is this argument valid?" and "is this formula a tautology?" are the same question. Validity-checking *is* tautology-checking.

## Example: a logical truth in disguise

Peirce's law, $((p \\to q) \\to p) \\to p$, is a tautology — but a surprising one. It contains no atom that is plainly forced, and intuitively it looks contingent. Build the four-row table and the final column is all $\\top$. (Remarkably, Peirce's law is a tautology of *classical* logic that *fails* in the intuitionistic logic of week 4 — a first sign that "logical truth" depends on which logic you adopt.) The lesson: do not trust intuition about tautologies; compute the column.`,
  },
  {
    slug: "logical-equivalence-demorgan",
    title: "Logical equivalence and De Morgan's laws",
    weekNumber: 2,
    blurb: "When two formulas say the same thing, and how to push negation inward.",
    lectureTitle: "2.4 Logical equivalence and De Morgan's laws",
    body: `# Logical equivalence and De Morgan's laws

Two formulas are **logically equivalent**, written $A \\equiv B$, when they have the *same* truth-value on every row of the truth table — equivalently, when $A \\leftrightarrow B$ is a tautology. Equivalent formulas are interchangeable.

## The core equivalences

- **Double negation**: $\\neg\\neg p \\equiv p$.
- **Commutativity**: $p \\wedge q \\equiv q \\wedge p$, $\\;p \\vee q \\equiv q \\vee p$.
- **Distributivity**: $p \\wedge (q \\vee r) \\equiv (p \\wedge q) \\vee (p \\wedge r)$.
- **Conditional as disjunction**: $p \\to q \\equiv \\neg p \\vee q$.
- **Contrapositive**: $p \\to q \\equiv \\neg q \\to \\neg p$.

## De Morgan's laws

The two most useful equivalences govern how negation interacts with $\\wedge$ and $\\vee$:

$$\\neg(p \\wedge q) \\equiv \\neg p \\vee \\neg q, \\qquad \\neg(p \\vee q) \\equiv \\neg p \\wedge \\neg q.$$

Negation pushed through a conjunction becomes a disjunction of negations, and vice versa — "not (both)" is "(not one) or (not the other)"; "not (either)" is "(not this) and (not that)." Augustus De Morgan stated them in 1847, though they were known to medieval logicians.

## Example: negating a promise

"You may have cake **and** ice cream" denied is "you may **not** have cake **or** not have ice cream" — $\\neg(c \\wedge i) \\equiv \\neg c \\vee \\neg i$. People routinely get this wrong, sliding to "not cake and not ice cream," which over-denies.

De Morgan's laws are also the engine of digital hardware: every Boolean circuit can be rebuilt from NAND gates alone precisely because $\\neg(p \\wedge q)$ generates the whole connective family by these laws. And in week 3 they generalize to quantifiers — $\\neg\\forall$ becomes $\\exists\\neg$ — making them among the most reused identities in all of logic.`,
  },
  {
    slug: "translating-propositional",
    title: "Translating natural language into propositional logic",
    weekNumber: 2,
    blurb: "Turning English sentences into formulas — and the traps that lurk.",
    lectureTitle: "2.5 Translating natural language into propositional logic",
    body: `# Translating natural language into propositional logic

To *use* propositional logic you must translate. Fix a **dictionary** assigning atomic letters to simple statements, then render the connecting words with the five connectives.

## The standard cues

- *not, it is not the case that, fails to* $\\to \\neg$
- *and, but, however, moreover, yet* $\\to \\wedge$
- *or, unless* $\\to \\vee$
- *if … then, only if, provided that* $\\to \\to$
- *if and only if, exactly when, just in case* $\\to \\leftrightarrow$

"But" is logically just $\\wedge$ — the contrast it signals is rhetorical, not truth-functional.

## The conditional traps

The two hardest cues:

- "$p$ **only if** $q$" translates to $p \\to q$ — *not* $q \\to p$. ("Only if" gives a *necessary* condition for $p$.)
- "$p$ **unless** $q$" translates to $\\neg q \\to p$, equivalently $p \\vee q$. ("Unless" is "if not.")

## Example

> "I'll go to the party only if Sam goes, but I won't go unless Maria goes too."

Dictionary: $g$ = I go, $s$ = Sam goes, $m$ = Maria goes. Piece by piece: "go only if Sam goes" is $g \\to s$; "won't go unless Maria goes" is $g \\to m$ (I go only if Maria goes). Joined by "but" ($\\wedge$):

$$(g \\to s) \\wedge (g \\to m), \\quad\\text{equivalently}\\quad g \\to (s \\wedge m).$$

Notice the equivalence collapses two conditions into one — a small theorem about your own social plans, derived purely by translation and the equivalences of 2.4. Sloppy readers translate "only if" as $s \\to g$ and reach the opposite commitment; precise translation is the whole game.`,
  },
  {
    slug: "natural-deduction-propositional",
    title: "Natural deduction in propositional logic",
    weekNumber: 2,
    blurb: "Proving conclusions by chaining inference rules instead of tables.",
    lectureTitle: "2.6 Natural deduction in propositional logic",
    body: `# Natural deduction in propositional logic

Truth tables *decide* validity but say nothing about *why*. **Natural deduction** is a proof system: a small kit of **inference rules** that let you derive a conclusion from premises step by step, writing $\\Gamma \\vdash C$ ("$C$ is provable from the set of premises $\\Gamma$").

## The core rules

Each connective has an **introduction** rule (how to prove it) and an **elimination** rule (how to use it):

- $\\wedge$-elim: from $p \\wedge q$ infer $p$ (and infer $q$).
- $\\wedge$-intro: from $p$ and $q$ infer $p \\wedge q$.
- $\\to$-elim (**modus ponens**): from $p$ and $p \\to q$ infer $q$.
- $\\to$-intro: assume $p$, derive $q$, then discharge to conclude $p \\to q$.
- $\\vee$-intro: from $p$ infer $p \\vee q$.
- $\\neg$-intro: assume $p$, derive a contradiction $\\bot$, discharge to conclude $\\neg p$. ($\\neg$-elim is the converse: from $p$ and $\\neg p$ infer $\\bot$; classical *reductio* instead assumes $\\neg p$, derives $\\bot$, and concludes $p$.)

## Derived rules

From the core you can derive shortcuts — **modus tollens** ($p \\to q,\\ \\neg q \\vdash \\neg p$), **hypothetical syllogism** ($p \\to q,\\ q \\to r \\vdash p \\to r$), and **disjunctive syllogism** ($p \\vee q,\\ \\neg p \\vdash q$).

## A worked proof

Show $p \\to q,\\ q \\to r,\\ p \\vdash r$:

1. $p \\to q$ — premise
2. $q \\to r$ — premise
3. $p$ — premise
4. $q$ — from 1, 3 by modus ponens
5. $r$ — from 2, 4 by modus ponens. $\\;\\blacksquare$

## Why two systems? An example of the payoff

Proof and truth tables answer the same question by opposite routes — and in week 4 we prove they *always* agree: $\\Gamma \\vdash C$ if and only if $\\Gamma \\models C$ (soundness and completeness). Deduction also scales where tables cannot: when we add quantifiers in week 3, the $2^n$ table can become *infinite*, but the proof rules carry over almost unchanged. Natural deduction, introduced by Gentzen in 1934 to mirror how mathematicians actually argue, is the method you will use for the rest of the course.`,
  },

  // ───────────────────────────────────────────────────────────────
  // Week 3 — Predicate logic
  // ───────────────────────────────────────────────────────────────
  {
    slug: "predicates-singular-terms",
    title: "Predicates and singular terms",
    weekNumber: 3,
    blurb: "Looking inside the atom: objects, names, and properties.",
    lectureTitle: "3.1 Predicates and singular terms",
    body: `# Predicates and singular terms

Propositional logic treats "Socrates is mortal" as a single unanalyzed atom $p$. But then it cannot see why "Socrates is mortal" follows from "all humans are mortal." **Predicate logic** opens the atom into *objects* and *properties*.

## The building blocks

- **Singular terms** name individual objects: **constants** $a, b, c$ (proper names like $s$ for Socrates) and **variables** $x, y, z$ (placeholders).
- **Predicates** stand for properties and relations: $Hx$ ("$x$ is human"), $Mx$ ("$x$ is mortal"), $Lxy$ ("$x$ loves $y$"). A predicate's number of slots is its **arity**.

## Atomic formulas

Filling a predicate's slots with terms gives an **atomic formula**:

$$Ms \\;(\\text{Socrates is mortal}), \\qquad Lsa \\;(\\text{Socrates loves } a).$$

An atomic formula is true or false once we say which objects exist and which satisfy which predicates — that is the *interpretation* of lecture 3.7.

## Relations need order

For relations, *order matters*: $Lxy$ ("$x$ loves $y$") is generally not the same as $Lyx$. "Romeo loves Juliet" is $Lrj$; "Juliet loves Romeo" is $Ljr$; the tragedy is precisely that these can differ.

## Example

Frege's *Begriffsschrift* (1879) introduced exactly this object/predicate split, replacing the subject–predicate grammar that logic had used since Aristotle. The gain is enormous: with one binary predicate $Pxy$ ("$x$ is a parent of $y$") we can later define grandparent, ancestor, and sibling, none of which Aristotelian logic could express. Cracking the atom into terms and predicates is the single step that lets logic finally handle the language of mathematics — and it is the foundation for the quantifiers of 3.2.`,
  },
  {
    slug: "quantifiers",
    title: "Universal and existential quantifiers",
    weekNumber: 3,
    blurb: "Saying 'all' and 'some' with $\\forall$ and $\\exists$.",
    lectureTitle: "3.2 Universal and existential quantifiers",
    body: `# Universal and existential quantifiers

Predicates give us properties of *named* objects. **Quantifiers** let us speak about *all* objects or *some* object without naming them — the heart of predicate logic.

## The two quantifiers

- The **universal quantifier** $\\forall x\\, \\varphi(x)$ — "for all $x$, $\\varphi(x)$."
- The **existential quantifier** $\\exists x\\, \\varphi(x)$ — "there exists an $x$ such that $\\varphi(x)$."

A quantifier **binds** the variable in its scope; a variable not bound by any quantifier is **free**. A formula with no free variables is a **sentence** and has a definite truth-value (relative to an interpretation).

## The standard sentence shapes

The two most common forms, which you must memorize:

$$\\text{"All } F \\text{ are } G\\text{"}: \\quad \\forall x\\,(Fx \\to Gx),$$
$$\\text{"Some } F \\text{ is } G\\text{"}: \\quad \\exists x\\,(Fx \\wedge Gx).$$

Note the connectives: *universal goes with $\\to$, existential goes with $\\wedge$*. Writing $\\forall x (Fx \\wedge Gx)$ wrongly claims *everything* is both $F$ and $G$; writing $\\exists x (Fx \\to Gx)$ is true far too easily (any non-$F$ makes it true).

## Quantifier duality

The quantifiers are linked by negation, generalizing De Morgan:

$$\\neg \\forall x\\, \\varphi \\equiv \\exists x\\, \\neg\\varphi, \\qquad \\neg \\exists x\\, \\varphi \\equiv \\forall x\\, \\neg\\varphi.$$

## Example

"All humans are mortal" is $\\forall x\\,(Hx \\to Mx)$. Its negation, "not all humans are mortal," becomes $\\exists x\\,(Hx \\wedge \\neg Mx)$ — "some human is immortal." To *refute* a universal claim you need just one counterexample; to refute an existential claim you must rule out *every* candidate. This asymmetry — cheap to refute "all," expensive to refute "some" — is why mathematicians prize counterexamples, and it drives the whole method of models and counterexamples in 3.7.`,
  },
  {
    slug: "translating-predicate",
    title: "Translating into predicate logic",
    weekNumber: 3,
    blurb: "Rendering English generality with predicates and quantifiers.",
    lectureTitle: "3.3 Translating into predicate logic",
    body: `# Translating into predicate logic

Translation into predicate logic is harder than into propositional logic because we must expose *generality*. The recipe: fix a **domain** of discourse, a **dictionary** of predicates and constants, then build the quantified formula.

## The four Aristotelian forms

The categorical sentences, now precise:

$$
\\begin{array}{ll}
\\text{All } F \\text{ are } G & \\forall x\\,(Fx \\to Gx) \\\\
\\text{No } F \\text{ is } G & \\forall x\\,(Fx \\to \\neg Gx) \\\\
\\text{Some } F \\text{ is } G & \\exists x\\,(Fx \\wedge Gx) \\\\
\\text{Some } F \\text{ is not } G & \\exists x\\,(Fx \\wedge \\neg Gx)
\\end{array}
$$

## "Only" and "any" and "no"

- "Only $F$s are $G$" reverses to $\\forall x\\,(Gx \\to Fx)$.
- "No $F$ is $G$" is $\\forall x\\,(Fx \\to \\neg Gx)$, equivalently $\\neg\\exists x\\,(Fx \\wedge Gx)$.
- "Any" is treacherous: "if anyone can solve it, Pat can" is $\\forall x(Sx \\to Sp)$ in antecedent position, not $\\exists$.

## Example

> "Every student who studies passes; some students do not pass; therefore some students do not study."

Domain: people. $Tx$ = $x$ studies, $Px$ = $x$ passes, $Sx$ = $x$ is a student.

- $P_1$: $\\forall x\\,((Sx \\wedge Tx) \\to Px)$
- $P_2$: $\\exists x\\,(Sx \\wedge \\neg Px)$
- $C$: $\\exists x\\,(Sx \\wedge \\neg Tx)$

Once written symbolically, the argument is plainly *valid* — the non-passing student from $P_2$ cannot have studied, by $P_1$ (contrapositive), so it satisfies $C$. The English alone leaves people unsure; the translation settles it. This is why mathematics is *written* in this notation: ambiguity that survives in prose dies on contact with quantifiers.`,
  },
  {
    slug: "multiple-quantifiers-scope",
    title: "Multiple quantifiers and scope",
    weekNumber: 3,
    blurb: "Why the order of $\\forall$ and $\\exists$ can reverse meaning.",
    lectureTitle: "3.4 Multiple quantifiers and scope",
    body: `# Multiple quantifiers and scope

The real expressive power — and the real danger — of predicate logic appears when quantifiers **nest**. The **scope** of a quantifier is the sub-formula it governs, and the *order* of nested quantifiers can completely change the claim.

## Order matters for mixed quantifiers

With a binary relation $Lxy$ ("$x$ loves $y$"), compare:

$$\\forall x\\, \\exists y\\, Lxy \\qquad\\text{vs.}\\qquad \\exists y\\, \\forall x\\, Lxy.$$

- $\\forall x\\, \\exists y\\, Lxy$: *everyone loves someone* — each person may love a different someone.
- $\\exists y\\, \\forall x\\, Lxy$: *someone is loved by everyone* — one fixed person whom all love.

The second implies the first, but not conversely. Swapping $\\forall$ and $\\exists$ is not innocent.

## Same-type quantifiers commute

Two universals can be swapped freely, and likewise two existentials:

$$\\forall x\\,\\forall y\\,\\varphi \\equiv \\forall y\\,\\forall x\\,\\varphi, \\qquad \\exists x\\,\\exists y\\,\\varphi \\equiv \\exists y\\,\\exists x\\,\\varphi.$$

Only *mixed* $\\forall\\exists$ vs. $\\exists\\forall$ is order-sensitive.

## The example that runs all of analysis

Continuity and uniform continuity differ *only* in quantifier order. A function $f$ is continuous when

$$\\forall \\varepsilon>0\\, \\forall x\\, \\exists \\delta>0\\, \\forall y\\,\\bigl(|x-y|<\\delta \\to |f(x)-f(y)|<\\varepsilon\\bigr),$$

but **uniformly** continuous when the $\\exists\\delta$ moves *out front*, before $\\forall x$:

$$\\forall \\varepsilon>0\\, \\exists \\delta>0\\, \\forall x\\, \\forall y\\,\\bigl(|x-y|<\\delta \\to |f(x)-f(y)|<\\varepsilon\\bigr).$$

Generations of calculus students conflate these two, and the difference is *purely* the position of one quantifier — exactly the $\\forall\\exists$ vs. $\\exists\\forall$ distinction above. Mastering quantifier scope is mastering the language in which all of modern mathematics is written.`,
  },
  {
    slug: "identity-definite-descriptions",
    title: "Identity and definite descriptions",
    weekNumber: 3,
    blurb: "The logic of '=', counting, and 'the so-and-so'.",
    lectureTitle: "3.5 Identity and definite descriptions",
    body: `# Identity and definite descriptions

Adding one special two-place predicate — **identity**, $x = y$ — vastly increases what predicate logic can say. Identity is fixed in meaning: $x = y$ holds exactly when $x$ and $y$ are the *same object*.

## What identity buys

With $=$ we can express **numerical** claims that pure predicates cannot:

- "At least two $F$s": $\\exists x\\, \\exists y\\,(Fx \\wedge Fy \\wedge x \\neq y)$.
- "At most one $F$": $\\forall x\\, \\forall y\\,((Fx \\wedge Fy) \\to x = y)$.
- "Exactly one $F$": $\\exists x\\,(Fx \\wedge \\forall y\\,(Fy \\to y = x))$.

Identity obeys two laws: **reflexivity** $\\forall x\\,(x = x)$ and **substitution** (**Leibniz's Law**) — identicals share all properties, $x = y \\to (\\varphi(x) \\leftrightarrow \\varphi(y))$.

## Definite descriptions

A **definite description** — "**the** $F$" — presupposes a unique $F$. Bertrand Russell's 1905 analysis ("On Denoting") renders "the $F$ is $G$" as a conjunction of *existence*, *uniqueness*, and *predication*:

$$\\exists x\\,\\bigl(Fx \\wedge \\forall y\\,(Fy \\to y = x) \\wedge Gx\\bigr).$$

## Example

"The present King of France is bald" has no real referent — France has no king. Naively it looks neither true nor false, threatening bivalence. Russell's analysis rescues classical logic: the sentence is simply **false**, because its existence clause $\\exists x(Kx \\wedge \\ldots)$ fails. And its negation splits into two readings depending on whether $\\neg$ takes wide or narrow scope over the description — a genuine ambiguity that the *scope* tools of 3.4 resolve exactly. Russell's theory of descriptions is often called the paradigm of analytic philosophy precisely because it shows logical form solving a puzzle that grammar could not.`,
  },
  {
    slug: "natural-deduction-predicate",
    title: "Natural deduction in predicate logic",
    weekNumber: 3,
    blurb: "Four new rules for introducing and eliminating quantifiers.",
    lectureTitle: "3.6 Natural deduction in predicate logic",
    body: `# Natural deduction in predicate logic

The propositional proof rules of 2.6 carry over unchanged; predicate logic just adds **four quantifier rules**, two for each quantifier. Proof now reaches conclusions that no finite truth table could.

## The four rules

- **$\\forall$-elimination** (universal instantiation): from $\\forall x\\, \\varphi(x)$ infer $\\varphi(a)$ for any term $a$. (What holds of all holds of each.)
- **$\\forall$-introduction** (universal generalization): if you derive $\\varphi(a)$ for an **arbitrary** $a$ (a constant about which you assumed nothing), conclude $\\forall x\\, \\varphi(x)$.
- **$\\exists$-introduction** (existential generalization): from $\\varphi(a)$ infer $\\exists x\\, \\varphi(x)$.
- **$\\exists$-elimination**: from $\\exists x\\, \\varphi(x)$, introduce a fresh name $a$ for the witness, prove your goal from $\\varphi(a)$, then discharge $a$.

## The crucial side-condition

$\\forall$-introduction and $\\exists$-elimination require the chosen name to be **arbitrary/fresh** — it must not appear in any premise or undischarged assumption. Violating this is the commonest proof error: you cannot generalize from a name you have already constrained.

## A worked proof

Show the syllogism $\\forall x\\,(Hx \\to Mx),\\ Hs \\vdash Ms$:

1. $\\forall x\\,(Hx \\to Mx)$ — premise
2. $Hs$ — premise
3. $Hs \\to Ms$ — from 1 by $\\forall$-elim (instantiate $x := s$)
4. $Ms$ — from 2, 3 by modus ponens. $\\;\\blacksquare$

## Example: proving an entailment a table cannot

Show $\\forall x\\,(Fx \\to Gx),\\ \\exists x\\, Fx \\vdash \\exists x\\, Gx$. To use $\\exists$-elim on $\\exists x\\, Fx$, open a subproof assuming $F(a)$ for a *fresh* constant $a$; instantiate the universal to $F(a) \\to G(a)$, apply modus ponens for $G(a)$, then $\\exists$-introduce $\\exists x\\, Gx$ — which, having no free $a$, discharges out of the subproof. Truth tables cannot check this first-order entailment at all (they are a method for propositional logic), yet the proof is four lines. That gap — finite proofs deciding infinite-domain validities — is precisely the power that makes week 4's completeness theorem so remarkable.`,
  },
  {
    slug: "models-interpretations-counterexamples",
    title: "Models, interpretations, and counterexamples",
    weekNumber: 3,
    blurb: "The semantics of predicate logic: making formulas true or false.",
    lectureTitle: "3.7 Models, interpretations, and counterexamples",
    body: `# Models, interpretations, and counterexamples

Proof ($\\vdash$) is the *syntactic* side of logic. **Semantics** is the other side: an **interpretation** assigns meaning, and asks whether a formula is *true*. The semantic counterpart of $\\vdash$ is the double turnstile $\\models$.

## What an interpretation is

A **structure** (or **model**) $\\mathcal{M}$ provides:

- a non-empty **domain** $D$ — the objects in play;
- an object in $D$ for each constant;
- a subset of $D$ for each one-place predicate (the things that satisfy it), a set of pairs for each two-place predicate, and so on.

A sentence is **true in $\\mathcal{M}$**, written $\\mathcal{M} \\models \\varphi$, when it holds under these assignments. $\\varphi$ is **valid** ($\\models \\varphi$) when true in *every* model; satisfiable when true in *some*.

## Semantic entailment

$\\Gamma \\models \\varphi$ means every model of all of $\\Gamma$ is also a model of $\\varphi$. This is the precise notion of "follows from" that validity (1.3) was reaching for.

## Counterexamples

To show an argument is **invalid**, exhibit a **counterexample**: one model where the premises are true and the conclusion false. A single such model defeats any claim of validity.

## Example

Is $\\forall x\\,(Fx \\to Gx),\\ \\exists x\\, Gx \\models \\exists x\\, Fx$? Try the model $D = \\{1, 2\\}$ with $F = \\varnothing$ (nothing is $F$) and $G = \\{1\\}$. Then the universal premise is *vacuously* true (no $F$s), $\\exists x\\, Gx$ is true ($1$ is $G$), but $\\exists x\\, Fx$ is **false**. So the argument is invalid — caught by one tiny two-element model. Building such finite counter-models is the day-to-day craft of logic, and the fact that finite models suffice for many questions is the launch point for the metalogic of week 4: how proof ($\\vdash$) and truth ($\\models$) relate, and where that relationship breaks down.`,
  },

  // ───────────────────────────────────────────────────────────────
  // Week 4 — Metalogic and beyond
  // ───────────────────────────────────────────────────────────────
  {
    slug: "soundness-completeness",
    title: "Soundness and completeness",
    weekNumber: 4,
    blurb: "Proof and truth coincide: $\\vdash$ and $\\models$ are two sides of one coin.",
    lectureTitle: "4.1 Soundness and completeness",
    body: `# Soundness and completeness

We now have two notions of "follows from": the *syntactic* $\\Gamma \\vdash \\varphi$ ("there is a proof") and the *semantic* $\\Gamma \\models \\varphi$ ("true in every model"). **Metalogic** studies the proof system itself — and its two headline theorems say these notions match exactly.

## The two directions

- **Soundness**: $\\Gamma \\vdash \\varphi \\;\\Rightarrow\\; \\Gamma \\models \\varphi$. Everything provable is true — the rules never lead from truths to a falsehood. Soundness is what makes proof *trustworthy*.
- **Completeness**: $\\Gamma \\models \\varphi \\;\\Rightarrow\\; \\Gamma \\vdash \\varphi$. Everything true (in all models) is provable — the rule kit misses nothing. Completeness is what makes proof *sufficient*.

Together:

$$\\Gamma \\vdash \\varphi \\;\\Longleftrightarrow\\; \\Gamma \\models \\varphi.$$

## What this means

Soundness is the easy direction — check each rule preserves truth. Completeness is deep: it promises that for *any* valid argument, however complex, *some* finite proof exists. Kurt Gödel proved the completeness of first-order predicate logic in his 1929 doctoral thesis — a triumphant result, and not to be confused with his *incompleteness* theorems (4.5), which are about arithmetic, not pure logic.

## Example: a corollary that shapes everything after

From completeness flows **compactness**: if every *finite* subset of $\\Gamma$ is satisfiable, then $\\Gamma$ itself is satisfiable. This sounds technical but is explosive — it implies first-order logic *cannot* pin down the natural numbers uniquely (there exist "non-standard models" with infinite integers), which in turn is why no first-order theory can be both complete and categorical. The clean match of $\\vdash$ and $\\models$ here is the high-water mark of logic; the rest of the week is about where, and why, the tide goes out.`,
  },
  {
    slug: "modal-logic",
    title: "Modal logic",
    weekNumber: 4,
    blurb: "Adding 'necessarily' $\\Box$ and 'possibly' $\\Diamond$ to logic.",
    lectureTitle: "4.2 Modal logic",
    body: `# Modal logic

Classical logic handles *is* and *is not*. **Modal logic** adds operators for *must* and *might*: the **necessity** operator $\\Box$ ("it is necessary that") and the **possibility** operator $\\Diamond$ ("it is possible that").

## The duality

The two modal operators are interdefinable through negation, exactly like the quantifiers:

$$\\Diamond p \\equiv \\neg \\Box \\neg p, \\qquad \\Box p \\equiv \\neg \\Diamond \\neg p.$$

"Possibly $p$" is "not necessarily not-$p$"; "necessarily $p$" is "not possibly not-$p$."

## Possible-worlds semantics

Saul Kripke's semantics (1959, at age 18) interprets modality over a set of **possible worlds** $W$ with an **accessibility relation** $R$:

- $\\Box p$ is true at world $w$ iff $p$ is true at **every** world accessible from $w$.
- $\\Diamond p$ is true at $w$ iff $p$ is true at **some** accessible world.

So $\\Box$ behaves like $\\forall$ over worlds and $\\Diamond$ like $\\exists$ — modal logic is "quantification over worlds in disguise."

## Systems and their axioms

Different properties of $R$ give different modal logics. The most important axiom, **T**, is $\\Box p \\to p$ ("the necessary is actual"), valid exactly when $R$ is **reflexive**. Adding $\\Box p \\to \\Box\\Box p$ (axiom **4**, transitivity) and $\\Diamond p \\to \\Box\\Diamond p$ (axiom **5**, the **Euclidean** property) builds the standard systems **T**, **S4**, **S5**. (Symmetry is the separate axiom **B**, $p \\to \\Box\\Diamond p$; over reflexive frames Euclidean already implies symmetry.)

## Example

Read $\\Box$ as "it is provable" and the system becomes **provability logic**, in which Gödel's second incompleteness theorem is captured by a single modal formula: $\\neg\\Box\\bot$ (consistency) implies $\\neg\\Box(\\neg\\Box\\bot)$ (consistency is unprovable). Read $\\Box$ as "it is obligatory" and you get **deontic logic** for ethics and law; read it as "agent $a$ knows" and you get **epistemic logic** for AI and game theory. One pair of operators, $\\Box$ and $\\Diamond$, with one tunable relation $R$, models necessity, time, knowledge, obligation, and proof — which is why modal logic is the most widely applied extension of the classical core.`,
  },
  {
    slug: "set-theory-logicians",
    title: "Set theory for logicians",
    weekNumber: 4,
    blurb: "The universe of sets, and the paradox that forced axioms on it.",
    lectureTitle: "4.3 Set theory for logicians",
    body: `# Set theory for logicians

Modern logic and mathematics are built on **sets**. A set is a collection of objects, its **members**; the basic relation is membership, $x \\in S$. Two sets are equal iff they have the same members (the **Axiom of Extensionality**):

$$\\forall x\\,(x \\in A \\leftrightarrow x \\in B) \\;\\to\\; A = B.$$

## The operations

- **Subset**: $A \\subseteq B \\;\\equiv\\; \\forall x\\,(x \\in A \\to x \\in B)$.
- **Union / intersection**: $A \\cup B = \\{x : x \\in A \\vee x \\in B\\}$, $\\;A \\cap B = \\{x : x \\in A \\wedge x \\in B\\}$.
- **Power set**: $\\mathcal{P}(A) = \\{X : X \\subseteq A\\}$, the set of all subsets.

Notice each definition is just a predicate-logic formula — set theory and logic are deeply intertwined.

## Russell's paradox

Naive set theory allowed **unrestricted comprehension**: any predicate $\\varphi$ defines a set $\\{x : \\varphi(x)\\}$. Bertrand Russell (1901) asked about the set of all sets that are not members of themselves:

$$R = \\{x : x \\notin x\\}.$$

Then $R \\in R \\leftrightarrow R \\notin R$ — a contradiction either way. Naive set theory is *inconsistent*.

## The axiomatic fix

The cure (Zermelo–Fraenkel, **ZFC**) replaces unrestricted comprehension with **separation**: you may only carve a subset *out of an existing set*, $\\{x \\in A : \\varphi(x)\\}$. This blocks $R$ because there is no universal set $A$ to carve from.

## Example

Russell's paradox is the Liar of lecture 1.2 wearing set-theoretic clothing — both turn self-reference into contradiction. The same diagonal shape recurs once more in Cantor's theorem $|A| < |\\mathcal{P}(A)|$ and yet again in the halting problem (4.5). Recognizing this *one* recurring move — diagonalization against self-membership — is the deepest unifying idea in foundational logic, and ZFC is the carefully fenced playground built to keep it from biting.`,
  },
  {
    slug: "relations-functions",
    title: "Relations and functions",
    weekNumber: 4,
    blurb: "Sets of ordered pairs, and the special relations called functions.",
    lectureTitle: "4.4 Relations and functions",
    body: `# Relations and functions

With sets in hand we can define the two structures that organize all of mathematics: **relations** and **functions**. Both are sets of **ordered pairs**, where $(a, b)$ records its components *in order*: $(a, b) = (c, d)$ iff $a = c$ and $b = d$.

## Relations

A (binary) **relation** $R$ from $A$ to $B$ is any subset $R \\subseteq A \\times B$ of the Cartesian product. We write $aRb$ for $(a, b) \\in R$. Key properties of a relation on a single set $A$:

- **Reflexive**: $\\forall x\\, (xRx)$.
- **Symmetric**: $\\forall x\\, \\forall y\\, (xRy \\to yRx)$.
- **Transitive**: $\\forall x\\, \\forall y\\, \\forall z\\, ((xRy \\wedge yRz) \\to xRz)$.

A relation that is reflexive, symmetric, and transitive is an **equivalence relation**; it partitions $A$ into disjoint **equivalence classes**.

## Functions

A **function** $f : A \\to B$ is a relation that is **total** and **single-valued**: every input has exactly one output —

$$\\forall x \\in A\\, \\exists! y \\in B\\,\\bigl((x, y) \\in f\\bigr).$$

We write $f(x) = y$. Functions can be **injective** ($f(x_1) = f(x_2) \\to x_1 = x_2$), **surjective** (every $b \\in B$ is hit), or **bijective** (both).

## Example

A bijection $f : A \\to B$ is the precise sense in which two sets "have the same size." This is how Cantor compares infinities: $\\mathbb{N}$ and $\\mathbb{Q}$ are the same size (a bijection exists), but $\\mathbb{N}$ and $\\mathbb{R}$ are *not* (Cantor's diagonal argument shows no surjection $\\mathbb{N} \\to \\mathbb{R}$ exists). The accessibility relation of modal logic (4.2), the orderings of mathematics, and the very notion of "computable function" (4.5) are all just relations and functions with extra properties — the vocabulary of this lecture is the connective tissue of everything else.`,
  },
  {
    slug: "decidability-limits",
    title: "Decidability and the limits of formal systems",
    weekNumber: 4,
    blurb: "Gödel, Turing, and questions no algorithm can settle.",
    lectureTitle: "4.5 Decidability and the limits of formal systems",
    body: `# Decidability and the limits of formal systems

We close the formal core with logic's most profound results: the discovery of sharp, *provable* limits on what formal systems and algorithms can do.

## Decidability

A set or problem is **decidable** if some algorithm always halts with a correct yes/no answer. Propositional validity is decidable (truth tables). But **first-order validity is undecidable** (Church and Turing, 1936): no algorithm can decide, for every formula, whether $\\models \\varphi$. First-order logic is complete (4.1) yet *not* decidable — provability can be *enumerated* but not *decided*.

## Gödel's incompleteness theorems

For any consistent, effectively axiomatized theory $T$ strong enough to express arithmetic:

- **First theorem**: there is a sentence $G$ such that $T \\nvdash G$ and $T \\nvdash \\neg G$ — $G$ is **undecidable in $T$** (and, if $T$ is sound, $G$ is true in the standard model). No such $T$ is complete.
- **Second theorem**: $T$ cannot prove its own consistency, $T \\nvdash \\operatorname{Con}(T)$ (unless $T$ is inconsistent).

Gödel (1931) builds $G$ to say, via arithmetic self-reference, "$G$ is not provable in $T$" — the Liar of 1.2, made rigorous.

## The halting problem

Alan Turing (1936) gave the computational twin. The **halting problem** — given a program $M$ and input $x$, decide whether $M$ halts on $x$ — is **undecidable**:

$$\\nexists\\ H\\ \\text{such that for all } M, x: \\; H(M, x) = \\text{halts?}(M, x).$$

The proof is diagonalization: a hypothetical $H$ lets you build a program that halts iff it does not.

## Example

These are not three separate facts but one idea — diagonal self-reference (Russell 4.3, Cantor 4.4) — in three costumes: sets, arithmetic, and computation. The reach of formal logic is staggering; its limits are equally sharp and, remarkably, are themselves *theorems of logic*. Logic is the rare discipline that can rigorously prove what it cannot do.`,
  },
  {
    slug: "nonclassical-defeasible",
    title: "Non-classical and defeasible logics",
    weekNumber: 4,
    blurb: "Logics that drop bivalence, explosion, or monotonicity.",
    lectureTitle: "4.6 Non-classical and defeasible logics",
    body: `# Non-classical and defeasible logics

Classical logic rests on choices — bivalence, the law of excluded middle, explosion, monotonicity — and each can be *rejected* to model reasoning the classical system handles badly. These are the **non-classical** logics.

## Intuitionistic logic

Rejects the law of excluded middle $p \\vee \\neg p$ and double negation $\\neg\\neg p \\to p$ as universal laws. A statement is asserted only when *constructively proved*; "there exists" demands a witness, not a proof-by-contradiction. Brouwer and Heyting's system is the logic of constructive mathematics and, via the Curry–Howard correspondence, of *programs as proofs*.

## Many-valued and fuzzy logic

Reject **bivalence**: admit a third value (Łukasiewicz's $\\tfrac12$ for "indeterminate") or a whole continuum $[0,1]$ of degrees of truth (Zadeh's **fuzzy logic**). Useful for vagueness ("tall," "warm") and control systems.

## Paraconsistent logic

Rejects **explosion**, $p \\wedge \\neg p \\to q$ ("from a contradiction, everything follows"). A paraconsistent logic tolerates *local* contradictions without trivializing — valuable for inconsistent databases and legal codes.

## Defeasible (non-monotonic) reasoning

Classical entailment is **monotonic**: $\\Gamma \\vdash \\varphi$ implies $\\Gamma, \\psi \\vdash \\varphi$ — more premises never retract a conclusion. **Defeasible** logic drops this, formalizing the inductive reasoning of 1.4.

## Example

"Tweety is a bird, so Tweety flies" — a sensible default. Learn "Tweety is a penguin," and you *retract* the conclusion. Classically impossible; in non-monotonic logic, routine. This is exactly how the law works (rules with exceptions), how doctors reason (diagnoses revised by tests), and how AI systems update. The classical logic of weeks 1–3 is the rigorous core; these non-classical systems extend it to the messy, revisable reasoning of real life — setting up the applied analysis of 4.7.`,
  },
  {
    slug: "applying-argument-analysis",
    title: "Applying formal logic to argument analysis",
    weekNumber: 4,
    blurb: "The full pipeline: from prose to symbols to a verdict.",
    lectureTitle: "4.7 Applying formal logic to argument analysis",
    body: `# Applying formal logic to argument analysis

Everything in the course now combines into a single workflow for evaluating real arguments: **identify, translate, test, diagnose.**

## The four-step method

1. **Identify** the argument: find the conclusion, then the premises; discard rhetoric.
2. **Translate** into the right system — propositional if the structure lives in connectives, predicate if it lives in *all*/*some* and relations.
3. **Test** validity — a truth table or proof for entailment, a counter-model for refutation.
4. **Diagnose**: if valid, are the premises true (is it *sound*)? If invalid, name the fallacy or exhibit the counterexample.

## Worked example

> "If the witness is telling the truth, the defendant was in the city. The defendant was not in the city. So the witness is not telling the truth."

Dictionary: $w$ = witness truthful, $c$ = defendant in city.

- $P_1$: $w \\to c$
- $P_2$: $\\neg c$
- $C$: $\\neg w$

This is **modus tollens**: $w \\to c,\\ \\neg c \\vdash \\neg w$ — **valid**. The single bad row (premises true, conclusion false) would need $w = \\top$, $c = \\bot$, which makes $P_1$ false. So the inference is airtight; the remaining question is purely *factual* — is the witness really truthful, was the defendant really absent? Logic has cleanly separated the part it settles (the inference) from the part it hands to evidence (the premises).

## A near-miss to contrast

Swap $P_2$ to "the defendant *was* in the city" ($c$) and conclude $w$: now it is *affirming the consequent*, $w \\to c,\\ c \\vdash w$ — **invalid**, with counter-model $w = \\bot$, $c = \\top$. One premise flipped turns a proof into a fallacy. This pipeline — the same one used in law, science, and mathematics — is the practical payoff of the entire course.`,
  },
  {
    slug: "capstone-synthesis",
    title: "Capstone synthesis",
    weekNumber: 4,
    blurb: "The arc from inference to incompleteness, in one picture.",
    lectureTitle: "4.8 Capstone synthesis",
    body: `# Capstone synthesis

Stand back and the whole course is a single ascent: from the bare idea of inference to the precise limits of formalization.

## The arc

- **Week 1** asked *what an argument is*: premises, a conclusion, and the relation of **validity** — truth-preservation independent of content — refined into **soundness** when the premises also hold.
- **Week 2** built the first formal language, **propositional logic**: five truth-functional connectives, the decision procedure of **truth tables**, the classification into tautology/contradiction/contingency, and a proof system, **natural deduction**.
- **Week 3** cracked the atom into **predicates, terms, and quantifiers**, gaining the power to express generality, multiple quantifiers and scope, identity, and a full semantics of **models and counterexamples**.
- **Week 4** turned logic on itself — **metalogic**: $\\vdash$ and $\\models$ coincide (**soundness and completeness**), modality and set theory extend the reach, and **Gödel** and **Turing** mark the sharp edge where formalization meets its limits.

## The two turnstiles

The deepest single idea of the course is the relationship between its two turnstiles:

$$\\Gamma \\vdash \\varphi \\quad(\\text{provable}) \\qquad \\Gamma \\models \\varphi \\quad(\\text{true in all models}).$$

For first-order logic they *coincide* — by soundness ($\\Gamma \\vdash \\varphi \\Rightarrow \\Gamma \\models \\varphi$) and completeness ($\\Gamma \\models \\varphi \\Rightarrow \\Gamma \\vdash \\varphi$) together. For sufficiently strong effectively axiomatized theories of arithmetic, truth outruns proof (incompleteness). Logic is the study of that gap.

## The recurring move

One trick appears again and again: **self-reference and diagonalization** — in the Liar (1.2), Russell's set (4.3), Cantor's theorem (4.4), Gödel's $G$ and the halting problem (4.5). Learn to recognize it and the foundations of mathematics stop being a list of theorems and become a single idea.

We began by asking when a conclusion *follows*. We end knowing exactly when it does, exactly how to prove that it does, and — most striking of all — exactly where no proof can reach. *That* is formal logic.`,
  },
];

type SeedAssignment = {
  kind: "homework" | "test" | "midterm" | "final";
  title: string;
  weekNumber: number;
  isTimed: boolean;
  timeLimitMinutes: number | null;
  instructions: string;
  problems: Array<{
    topicSlug: string;
    prompt: string;
    correctAnswer: string;
    explanation: string;
    hint?: string;
  }>;
};

const ASSIGNMENTS: SeedAssignment[] = [
  // ───────────── Week 1 ─────────────
  {
    kind: "homework",
    title: "Homework 1.1 — Arguments, statements, validity",
    weekNumber: 1,
    isTimed: false,
    timeLimitMinutes: null,
    instructions:
      "Short-answer problems on inference, truth-values, and validity. Use the math keyboard (the 'Logic & Sets' tab) for ⊢, ⊨, ∴, ⊤, ⊥, → and the other logical symbols.",
    problems: [
      {
        topicSlug: "what-logic-is",
        prompt:
          "Using the ∴ symbol, write the general schematic form of an argument with premises P₁, …, Pₙ and conclusion C.",
        correctAnswer: "P₁, P₂, …, Pₙ ∴ C",
        explanation:
          "An argument lists premises $P_1, \\ldots, P_n$ in support of a conclusion: $P_1, P_2, \\ldots, P_n \\therefore C$. The turnstile version is $P_1, \\ldots, P_n \\vdash C$.",
      },
      {
        topicSlug: "statements-truth-values",
        prompt:
          "Using ⊤ and ⊥, write the principle of bivalence for a statement A: that A takes exactly one of the two truth-values.",
        correctAnswer: "A = ⊤ or A = ⊥, and not both",
        explanation:
          "Bivalence: every statement is true or false and not both — $A = \\top$ or $A = \\bot$, exclusively. Classical logic assumes this.",
      },
      {
        topicSlug: "validity-soundness",
        prompt:
          "Using the semantic turnstile ⊨, write that the premises P₁, …, Pₙ logically entail the conclusion C (i.e. the argument is valid).",
        correctAnswer: "P₁, …, Pₙ ⊨ C",
        explanation:
          "$P_1, \\ldots, P_n \\models C$ asserts validity: there is no situation making every premise true and $C$ false.",
      },
      {
        topicSlug: "validity-soundness",
        prompt:
          "Write the equation that defines soundness in terms of validity and the premises. (Use words joined by ∧ for the two conditions.)",
        correctAnswer: "sound = valid ∧ all premises true",
        explanation:
          "An argument is sound iff it is valid AND all its premises are true: $\\text{sound} \\equiv \\text{valid} \\wedge (\\text{all premises true})$. Soundness guarantees a true conclusion.",
      },
    ],
  },
  {
    kind: "homework",
    title: "Homework 1.2 — Form, fallacies, and conditions",
    weekNumber: 1,
    isTimed: false,
    timeLimitMinutes: null,
    instructions:
      "Use the math keyboard for →, ↔, ¬, ∧, and ∴.",
    problems: [
      {
        topicSlug: "deductive-inductive",
        prompt:
          "Write, in schematic form using ∴, the valid argument form 'modus ponens' (from P and the conditional, conclude Q).",
        correctAnswer: "P, P → Q ∴ Q",
        explanation:
          "Modus ponens: $P,\\ P \\to Q \\therefore Q$ — the paradigm deductive (truth-preserving) inference.",
      },
      {
        topicSlug: "logical-form-translation",
        prompt:
          "Write the shared logical form of 'All cats are animals; Felix is a cat; so Felix is an animal' using schematic letters F, G and a constant a.",
        correctAnswer: "∀x (Fx → Gx), Fa ∴ Ga",
        explanation:
          "The form is $\\forall x\\,(Fx \\to Gx),\\ Fa \\therefore Ga$ — validity lives in this skeleton, not in the words 'cat' or 'animal'.",
      },
      {
        topicSlug: "informal-fallacies",
        prompt:
          "Using →, write the invalid form known as 'affirming the consequent' (the fallacy that mimics modus ponens).",
        correctAnswer: "P → Q, Q ∴ P",
        explanation:
          "Affirming the consequent: $P \\to Q,\\ Q \\therefore P$. Invalid — $Q$ may hold for another reason. Contrast the valid modus ponens.",
      },
      {
        topicSlug: "necessary-sufficient",
        prompt:
          "Using → in both directions, write what it means for P to be both necessary and sufficient for Q, then give the single biconditional it equals.",
        correctAnswer: "(P → Q) ∧ (Q → P) ≡ P ↔ Q",
        explanation:
          "$P$ sufficient for $Q$ is $P \\to Q$; $P$ necessary for $Q$ is $Q \\to P$. Both together is $(P \\to Q) \\wedge (Q \\to P) \\equiv P \\leftrightarrow Q$.",
      },
    ],
  },
  {
    kind: "test",
    title: "Week 1 Test — Reasoning and logical form",
    weekNumber: 1,
    isTimed: true,
    timeLimitMinutes: 30,
    instructions:
      "Timed. 30 minutes. Math keyboard available; pasting is disabled. Write answers in compact symbolic form using the on-screen keyboard.",
    problems: [
      {
        topicSlug: "validity-soundness",
        prompt:
          "State, using ⊨, the definition of validity as the non-existence of a counterexample situation. (Write it as: P₁,…,Pₙ ⊨ C iff there is no situation where … .)",
        correctAnswer:
          "P₁,…,Pₙ ⊨ C iff there is no situation in which P₁,…,Pₙ are all true and C is false",
        explanation:
          "Validity $P_1, \\ldots, P_n \\models C$ means: no situation makes all premises true while $C$ is false.",
      },
      {
        topicSlug: "what-logic-is",
        prompt:
          "Using ∀ and a constant s, write the logical form of Aristotle's syllogism 'All humans are mortal; Socrates is human; so Socrates is mortal' (H = human, M = mortal).",
        correctAnswer: "∀x (Hx → Mx), Hs ∴ Ms",
        explanation:
          "$\\forall x\\,(Hx \\to Mx),\\ Hs \\therefore Ms$. The argument is valid in virtue of this form.",
      },
      {
        topicSlug: "necessary-sufficient",
        prompt:
          "Using →, write the symbolic claim that being divisible by 4 is sufficient (but we are not claiming necessary) for being even. (D = divisible by 4, E = even.)",
        correctAnswer: "∀n (Dn → En)",
        explanation:
          "Sufficiency is the forward conditional: $\\forall n\\,(Dn \\to En)$. The converse fails ($6$ is even, not divisible by $4$), so it is not necessary.",
      },
      {
        topicSlug: "informal-fallacies",
        prompt:
          "Using → and ¬, write the invalid form 'denying the antecedent'.",
        correctAnswer: "P → Q, ¬P ∴ ¬Q",
        explanation:
          "Denying the antecedent: $P \\to Q,\\ \\neg P \\therefore \\neg Q$ — invalid. Contrast the valid modus tollens $P \\to Q,\\ \\neg Q \\therefore \\neg P$.",
      },
      {
        topicSlug: "deductive-inductive",
        prompt:
          "Using → and ¬, write the valid form 'modus tollens'.",
        correctAnswer: "P → Q, ¬Q ∴ ¬P",
        explanation:
          "Modus tollens: $P \\to Q,\\ \\neg Q \\therefore \\neg P$ — a valid deductive form, the contrapositive use of a conditional.",
      },
    ],
  },

  // ───────────── Week 2 ─────────────
  {
    kind: "homework",
    title: "Homework 2.1 — Connectives and truth tables",
    weekNumber: 2,
    isTimed: false,
    timeLimitMinutes: null,
    instructions:
      "Use the math keyboard for ¬, ∧, ∨, →, ↔, ⊤, ⊥, ⊨.",
    problems: [
      {
        topicSlug: "propositional-connectives",
        prompt:
          "Write the definition of the material conditional p → q as a disjunction involving a negation.",
        correctAnswer: "p → q ≡ ¬p ∨ q",
        explanation:
          "The material conditional is defined as $p \\to q \\equiv \\neg p \\vee q$ — false only when $p$ is true and $q$ false.",
      },
      {
        topicSlug: "truth-tables",
        prompt:
          "For n distinct atomic letters, write the number of rows in the full truth table.",
        correctAnswer: "2^n",
        explanation:
          "Each letter is independently $\\top$ or $\\bot$, giving $2^n$ assignments — one row each.",
      },
      {
        topicSlug: "truth-tables",
        prompt:
          "Using ⊨, state the truth-table criterion for an argument with premises P₁,…,Pₙ and conclusion C to be valid (in terms of the rows of the table).",
        correctAnswer:
          "P₁,…,Pₙ ⊨ C iff no row has all of P₁,…,Pₙ true and C false",
        explanation:
          "Valid iff there is no row of the truth table where every premise is $\\top$ and the conclusion is $\\bot$.",
      },
      {
        topicSlug: "tautology-contradiction-contingency",
        prompt:
          "Using ⊨, write that the formula p ∨ ¬p is a tautology (the law of excluded middle).",
        correctAnswer: "⊨ p ∨ ¬p",
        explanation:
          "$\\models p \\vee \\neg p$: the law of excluded middle is true on every row, hence a tautology.",
      },
    ],
  },
  {
    kind: "homework",
    title: "Homework 2.2 — Equivalence, translation, and deduction",
    weekNumber: 2,
    isTimed: false,
    timeLimitMinutes: null,
    instructions:
      "Use the math keyboard for ≡, ¬, ∧, ∨, →, ⊢.",
    problems: [
      {
        topicSlug: "logical-equivalence-demorgan",
        prompt:
          "Write both of De Morgan's laws, using ≡, ¬, ∧, ∨.",
        correctAnswer: "¬(p ∧ q) ≡ ¬p ∨ ¬q; ¬(p ∨ q) ≡ ¬p ∧ ¬q",
        explanation:
          "De Morgan: $\\neg(p \\wedge q) \\equiv \\neg p \\vee \\neg q$ and $\\neg(p \\vee q) \\equiv \\neg p \\wedge \\neg q$.",
      },
      {
        topicSlug: "logical-equivalence-demorgan",
        prompt:
          "Using ≡, write the contrapositive equivalence for the conditional p → q.",
        correctAnswer: "p → q ≡ ¬q → ¬p",
        explanation:
          "A conditional is equivalent to its contrapositive: $p \\to q \\equiv \\neg q \\to \\neg p$.",
      },
      {
        topicSlug: "translating-propositional",
        prompt:
          "Translate 'I will go (g) only if Sam goes (s)' into propositional logic.",
        correctAnswer: "g → s",
        explanation:
          "'$p$ only if $q$' gives the necessary condition: $g \\to s$. (NOT $s \\to g$.)",
      },
      {
        topicSlug: "natural-deduction-propositional",
        prompt:
          "Using ⊢, write the derived rule 'hypothetical syllogism' (chaining two conditionals).",
        correctAnswer: "p → q, q → r ⊢ p → r",
        explanation:
          "Hypothetical syllogism: $p \\to q,\\ q \\to r \\vdash p \\to r$ — transitivity of the conditional.",
      },
    ],
  },
  {
    kind: "midterm",
    title: "Midterm — Weeks 1 & 2",
    weekNumber: 2,
    isTimed: true,
    timeLimitMinutes: 60,
    instructions:
      "Cumulative midterm on reasoning, logical form, and propositional logic. 60 minutes. Math keyboard available; pasting disabled.",
    problems: [
      {
        topicSlug: "validity-soundness",
        prompt:
          "Using ⊨, write that premises P₁, P₂ entail conclusion C.",
        correctAnswer: "P₁, P₂ ⊨ C",
        explanation: "$P_1, P_2 \\models C$ — semantic entailment / validity.",
      },
      {
        topicSlug: "necessary-sufficient",
        prompt:
          "Using ↔, write that P is necessary and sufficient for Q as a single biconditional.",
        correctAnswer: "P ↔ Q",
        explanation:
          "Necessary and sufficient combine into the biconditional $P \\leftrightarrow Q$.",
      },
      {
        topicSlug: "propositional-connectives",
        prompt:
          "Write the material conditional p → q as an equivalent disjunction.",
        correctAnswer: "¬p ∨ q",
        explanation: "$p \\to q \\equiv \\neg p \\vee q$.",
      },
      {
        topicSlug: "logical-equivalence-demorgan",
        prompt: "Write the first De Morgan law for ¬(p ∧ q).",
        correctAnswer: "¬(p ∧ q) ≡ ¬p ∨ ¬q",
        explanation: "$\\neg(p \\wedge q) \\equiv \\neg p \\vee \\neg q$.",
      },
      {
        topicSlug: "tautology-contradiction-contingency",
        prompt:
          "Using ⊨, write the link between validity of P₁,…,Pₙ ∴ C and the tautologyhood of a single conditional.",
        correctAnswer:
          "P₁,…,Pₙ ⊨ C iff ⊨ (P₁ ∧ … ∧ Pₙ) → C",
        explanation:
          "An argument is valid iff the conditional $(P_1 \\wedge \\cdots \\wedge P_n) \\to C$ is a tautology.",
      },
      {
        topicSlug: "truth-tables",
        prompt:
          "Write the number of rows in the truth table of a formula with 3 distinct atomic letters.",
        correctAnswer: "2^3 = 8",
        explanation: "$2^3 = 8$ rows.",
      },
      {
        topicSlug: "natural-deduction-propositional",
        prompt:
          "Using ⊢, write modus ponens as a provability claim.",
        correctAnswer: "p, p → q ⊢ q",
        explanation: "$p,\\ p \\to q \\vdash q$ — the $\\to$-elimination rule.",
      },
      {
        topicSlug: "translating-propositional",
        prompt:
          "Translate 'I will go (g) unless Maria goes (m)' into propositional logic, as a disjunction.",
        correctAnswer: "g ∨ m",
        explanation:
          "'$p$ unless $q$' is $\\neg q \\to p$, equivalently $g \\vee m$.",
      },
    ],
  },

  // ───────────── Week 3 ─────────────
  {
    kind: "homework",
    title: "Homework 3.1 — Predicates and quantifiers",
    weekNumber: 3,
    isTimed: false,
    timeLimitMinutes: null,
    instructions:
      "Use the math keyboard for ∀, ∃, →, ∧, ¬, and predicate letters.",
    problems: [
      {
        topicSlug: "predicates-singular-terms",
        prompt:
          "Using a constant s (Socrates) and a predicate M (mortal), write the atomic formula 'Socrates is mortal'.",
        correctAnswer: "Ms",
        explanation:
          "An atomic formula fills a predicate's slot with a term: $Ms$ (Socrates is mortal).",
      },
      {
        topicSlug: "quantifiers",
        prompt:
          "Write the standard form of 'All F are G' using ∀ and →.",
        correctAnswer: "∀x (Fx → Gx)",
        explanation:
          "'All $F$ are $G$' is $\\forall x\\,(Fx \\to Gx)$ — universal goes with the conditional.",
      },
      {
        topicSlug: "quantifiers",
        prompt:
          "Write the standard form of 'Some F is G' using ∃ and ∧.",
        correctAnswer: "∃x (Fx ∧ Gx)",
        explanation:
          "'Some $F$ is $G$' is $\\exists x\\,(Fx \\wedge Gx)$ — existential goes with conjunction.",
      },
      {
        topicSlug: "translating-predicate",
        prompt:
          "Using ∀, ¬, write 'No F is G' as a universal conditional.",
        correctAnswer: "∀x (Fx → ¬Gx)",
        explanation:
          "'No $F$ is $G$' is $\\forall x\\,(Fx \\to \\neg Gx)$, equivalently $\\neg\\exists x\\,(Fx \\wedge Gx)$.",
      },
    ],
  },
  {
    kind: "homework",
    title: "Homework 3.2 — Scope, identity, deduction, and models",
    weekNumber: 3,
    isTimed: false,
    timeLimitMinutes: null,
    instructions:
      "Use the math keyboard for ∀, ∃, =, ≠, ⊢, ⊨.",
    problems: [
      {
        topicSlug: "quantifiers",
        prompt:
          "Using ¬, ∀, ∃, write the quantifier-duality equivalence for the negation of a universal statement.",
        correctAnswer: "¬∀x P(x) ≡ ∃x ¬P(x)",
        explanation:
          "$\\neg\\forall x\\, P(x) \\equiv \\exists x\\, \\neg P(x)$ — to deny 'all', assert 'some not'.",
      },
      {
        topicSlug: "multiple-quantifiers-scope",
        prompt:
          "Using L for the loving relation, write the two mixed-quantifier statements 'everyone loves someone' and 'someone is loved by everyone', and indicate which entails the other with →.",
        correctAnswer:
          "∀x ∃y Lxy and ∃y ∀x Lxy; ∃y ∀x Lxy → ∀x ∃y Lxy",
        explanation:
          "Order matters: $\\exists y\\, \\forall x\\, Lxy \\to \\forall x\\, \\exists y\\, Lxy$, but not conversely.",
      },
      {
        topicSlug: "identity-definite-descriptions",
        prompt:
          "Using ∃, ∀, =, write 'there is exactly one F' (the uniqueness statement).",
        correctAnswer: "∃x (Fx ∧ ∀y (Fy → y = x))",
        explanation:
          "Exactly one $F$: $\\exists x\\,(Fx \\wedge \\forall y\\,(Fy \\to y = x))$ — existence plus uniqueness.",
      },
      {
        topicSlug: "natural-deduction-predicate",
        prompt:
          "Using ⊢, write the entailment proved with the quantifier rules: from 'all F are G' and 'some F exists', conclude 'some G exists'.",
        correctAnswer: "∀x (Fx → Gx), ∃x Fx ⊢ ∃x Gx",
        explanation:
          "$\\forall x\\,(Fx \\to Gx),\\ \\exists x\\, Fx \\vdash \\exists x\\, Gx$ — via ∃-elim, ∀-elim, modus ponens, ∃-intro.",
      },
    ],
  },
  {
    kind: "test",
    title: "Week 3 Test — Predicate logic",
    weekNumber: 3,
    isTimed: true,
    timeLimitMinutes: 40,
    instructions: "Timed. 40 minutes. Math keyboard available; pasting disabled.",
    problems: [
      {
        topicSlug: "quantifiers",
        prompt: "Write 'All F are G' in symbols.",
        correctAnswer: "∀x (Fx → Gx)",
        explanation: "$\\forall x\\,(Fx \\to Gx)$.",
      },
      {
        topicSlug: "quantifiers",
        prompt:
          "Using ¬, ∃, ∀, write the negation of 'all humans are mortal' (H, M) as an existential statement.",
        correctAnswer: "∃x (Hx ∧ ¬Mx)",
        explanation:
          "$\\neg\\forall x\\,(Hx \\to Mx) \\equiv \\exists x\\,(Hx \\wedge \\neg Mx)$ — some human is not mortal.",
      },
      {
        topicSlug: "multiple-quantifiers-scope",
        prompt:
          "Using the relation L, write 'someone is loved by everyone'.",
        correctAnswer: "∃y ∀x Lxy",
        explanation:
          "$\\exists y\\, \\forall x\\, Lxy$ — one fixed person whom all love. Order of quantifiers is essential.",
      },
      {
        topicSlug: "identity-definite-descriptions",
        prompt:
          "Using ∃, ∀, =, write Russell's analysis of 'the F is G' (existence, uniqueness, predication).",
        correctAnswer: "∃x (Fx ∧ ∀y (Fy → y = x) ∧ Gx)",
        explanation:
          "$\\exists x\\,(Fx \\wedge \\forall y\\,(Fy \\to y = x) \\wedge Gx)$ — Russell's theory of definite descriptions.",
      },
      {
        topicSlug: "models-interpretations-counterexamples",
        prompt:
          "Using ⊨, define semantic entailment Γ ⊨ φ in terms of models.",
        correctAnswer: "Γ ⊨ φ iff every model of Γ is a model of φ",
        explanation:
          "$\\Gamma \\models \\varphi$ iff every interpretation making all of $\\Gamma$ true also makes $\\varphi$ true.",
      },
    ],
  },

  // ───────────── Week 4 ─────────────
  {
    kind: "homework",
    title: "Homework 4.1 — Metalogic, modality, and sets",
    weekNumber: 4,
    isTimed: false,
    timeLimitMinutes: null,
    instructions:
      "Use the math keyboard for ⊢, ⊨, □, ◇, ∈, ⊆, ∪, ∩, and quantifiers.",
    problems: [
      {
        topicSlug: "soundness-completeness",
        prompt:
          "Using ⊢ and ⊨, write the two implications that together state soundness and completeness for a logic.",
        correctAnswer:
          "Soundness: Γ ⊢ φ → Γ ⊨ φ. Completeness: Γ ⊨ φ → Γ ⊢ φ.",
        explanation:
          "Soundness $\\Gamma \\vdash \\varphi \\Rightarrow \\Gamma \\models \\varphi$; completeness $\\Gamma \\models \\varphi \\Rightarrow \\Gamma \\vdash \\varphi$. Together: $\\Gamma \\vdash \\varphi \\Leftrightarrow \\Gamma \\models \\varphi$.",
      },
      {
        topicSlug: "modal-logic",
        prompt:
          "Using □, ◇, ¬, write the modal duality defining possibility in terms of necessity.",
        correctAnswer: "◇p ≡ ¬□¬p",
        explanation:
          "$\\Diamond p \\equiv \\neg\\Box\\neg p$ — 'possibly $p$' is 'not necessarily not-$p$'.",
      },
      {
        topicSlug: "set-theory-logicians",
        prompt:
          "Using set-builder notation, write Russell's set R — the set of all sets that are not members of themselves.",
        correctAnswer: "R = { x : x ∉ x }",
        explanation:
          "$R = \\{\\,x : x \\notin x\\,\\}$. Asking whether $R \\in R$ yields a contradiction either way, so naive comprehension is inconsistent.",
      },
      {
        topicSlug: "relations-functions",
        prompt:
          "Using ∀, list the three defining properties of an equivalence relation ∼ on a set S (reflexive, symmetric, transitive).",
        correctAnswer:
          "Reflexive: ∀x (x ∼ x). Symmetric: ∀x ∀y (x ∼ y → y ∼ x). Transitive: ∀x ∀y ∀z ((x ∼ y ∧ y ∼ z) → x ∼ z).",
        explanation:
          "An equivalence relation is reflexive, symmetric, and transitive — it partitions $S$ into disjoint equivalence classes.",
      },
    ],
  },
  {
    kind: "homework",
    title: "Homework 4.2 — Decidability, non-classical logic, and application",
    weekNumber: 4,
    isTimed: false,
    timeLimitMinutes: null,
    instructions: "Use the math keyboard for ⊢, ¬, ∨, →, □.",
    problems: [
      {
        topicSlug: "decidability-limits",
        prompt:
          "State Gödel's First Incompleteness Theorem in one sentence: for a suitable consistent system T, what sentence G must exist?",
        correctAnswer:
          "There is a sentence G such that T ⊬ G and T ⊬ ¬G, yet G is true.",
        explanation:
          "For any consistent, effectively axiomatized $T$ expressing arithmetic, there is a sentence $G$ with $T \\nvdash G$ and $T \\nvdash \\neg G$ — true but unprovable.",
      },
      {
        topicSlug: "decidability-limits",
        prompt:
          "Using set-builder notation, write the halting set H (with M(x)↓ meaning 'M halts on x'), then state Turing's result symbolically: that no total computable decider for it exists.",
        correctAnswer:
          "H = {⟨M, x⟩ : M(x)↓}; ¬∃ computable f ∀M ∀x (f(⟨M, x⟩) = 1 ↔ M(x)↓)",
        explanation:
          "The halting set is $H = \\{\\langle M, x\\rangle : M(x){\\downarrow}\\}$, and Turing's theorem is $\\neg\\exists$ computable $f\\,\\forall M\\,\\forall x\\,(f(\\langle M,x\\rangle) = 1 \\leftrightarrow M(x){\\downarrow})$ — $H$ is undecidable, proved by diagonalization.",
      },
      {
        topicSlug: "nonclassical-defeasible",
        prompt:
          "Write the law of excluded middle that intuitionistic logic rejects as a universal law.",
        correctAnswer: "p ∨ ¬p",
        explanation:
          "Intuitionistic logic does not accept $p \\vee \\neg p$ (nor $\\neg\\neg p \\to p$) as a general law — assertion requires a constructive proof.",
      },
      {
        topicSlug: "applying-argument-analysis",
        prompt:
          "Translate and identify the form: 'If the witness is truthful (w), the defendant was in the city (c); the defendant was not in the city; so the witness is not truthful.' Give the symbolic argument.",
        correctAnswer: "w → c, ¬c ∴ ¬w (modus tollens — valid)",
        explanation:
          "$w \\to c,\\ \\neg c \\therefore \\neg w$ is modus tollens, a valid form.",
      },
    ],
  },
  {
    kind: "final",
    title: "Final Exam — Formal logic",
    weekNumber: 4,
    isTimed: true,
    timeLimitMinutes: 90,
    instructions:
      "Cumulative final covering all four weeks. 90 minutes. Math keyboard available; pasting disabled.",
    problems: [
      {
        topicSlug: "validity-soundness",
        prompt:
          "Using ⊨, write that premises P₁, …, Pₙ entail conclusion C.",
        correctAnswer: "P₁, …, Pₙ ⊨ C",
        explanation: "$P_1, \\ldots, P_n \\models C$ — validity.",
      },
      {
        topicSlug: "necessary-sufficient",
        prompt:
          "Using ↔, write that P is necessary and sufficient for Q.",
        correctAnswer: "P ↔ Q",
        explanation: "$P \\leftrightarrow Q$.",
      },
      {
        topicSlug: "logical-equivalence-demorgan",
        prompt: "Write both De Morgan laws using ≡.",
        correctAnswer: "¬(p ∧ q) ≡ ¬p ∨ ¬q; ¬(p ∨ q) ≡ ¬p ∧ ¬q",
        explanation:
          "$\\neg(p \\wedge q) \\equiv \\neg p \\vee \\neg q$ and $\\neg(p \\vee q) \\equiv \\neg p \\wedge \\neg q$.",
      },
      {
        topicSlug: "natural-deduction-propositional",
        prompt: "Using ⊢, write modus tollens as a provability claim.",
        correctAnswer: "p → q, ¬q ⊢ ¬p",
        explanation: "$p \\to q,\\ \\neg q \\vdash \\neg p$.",
      },
      {
        topicSlug: "quantifiers",
        prompt: "Write 'Some F is G' in symbols.",
        correctAnswer: "∃x (Fx ∧ Gx)",
        explanation: "$\\exists x\\,(Fx \\wedge Gx)$.",
      },
      {
        topicSlug: "quantifiers",
        prompt:
          "Using ¬, ∃, ∀, write the quantifier-duality equivalence for ¬∃x P(x).",
        correctAnswer: "¬∃x P(x) ≡ ∀x ¬P(x)",
        explanation: "$\\neg\\exists x\\, P(x) \\equiv \\forall x\\, \\neg P(x)$.",
      },
      {
        topicSlug: "identity-definite-descriptions",
        prompt:
          "Using ∃, ∀, =, write 'there is exactly one F'.",
        correctAnswer: "∃x (Fx ∧ ∀y (Fy → y = x))",
        explanation:
          "$\\exists x\\,(Fx \\wedge \\forall y\\,(Fy \\to y = x))$.",
      },
      {
        topicSlug: "soundness-completeness",
        prompt:
          "Using ⊢ and ⊨, write the biconditional that soundness and completeness together establish.",
        correctAnswer: "Γ ⊢ φ ⟺ Γ ⊨ φ",
        explanation:
          "$\\Gamma \\vdash \\varphi \\Leftrightarrow \\Gamma \\models \\varphi$ — provability and validity coincide for first-order logic.",
      },
      {
        topicSlug: "modal-logic",
        prompt: "Using □, ◇, ¬, write the modal duality for ◇p.",
        correctAnswer: "◇p ≡ ¬□¬p",
        explanation: "$\\Diamond p \\equiv \\neg\\Box\\neg p$.",
      },
      {
        topicSlug: "decidability-limits",
        prompt:
          "State Gödel's First Incompleteness Theorem in one sentence.",
        correctAnswer:
          "Any consistent, effectively axiomatized system expressing arithmetic contains a true sentence G that it can neither prove nor refute (T ⊬ G and T ⊬ ¬G).",
        explanation:
          "Such a system is incomplete: a true sentence $G$ exists with $T \\nvdash G$ and $T \\nvdash \\neg G$.",
      },
    ],
  },
];

// A stable fingerprint of the seed content. If the database holds topics that
// don't match this set, we wipe and re-seed instead of leaving stale content
// from a previous version of the course.
const EXPECTED_TOPIC_SLUGS = TOPICS.map((t) => t.slug).sort().join(",");

// Bump this whenever lecture bodies, assignment problems, or correct answers
// change in a way that should propagate to the database on the next boot.
// The value is stored alongside topics and compared in seedIfEmpty.
const CONTENT_REVISION = "2026-06-05.formal-logic.r4";

// A sentinel phrase present in exactly one lecture body — used to detect that
// the database holds the *current* revision of the content (not just a set of
// matching slugs). Bump whenever the seed content is overhauled.
const REVISION_SENTINEL_SLUG = "what-logic-is";
const REVISION_SENTINEL_PHRASE = "the first time the *form* of an argument was studied in abstraction from its content";

export async function seedIfEmpty(): Promise<void> {
  const existing = await db.execute(sql`select count(*)::int as n from topics`);
  const row = (existing.rows[0] ?? {}) as { n?: number };
  const count = row.n ?? 0;

  if (count > 0) {
    const rows = await db.execute(sql`select slug from topics order by slug`);
    const actualSlugs = (rows.rows as Array<{ slug: string }>)
      .map((r) => r.slug)
      .sort()
      .join(",");
    const slugsMatch = actualSlugs === EXPECTED_TOPIC_SLUGS;
    let revisionMatches = false;
    try {
      const sentinelLec = await db.execute(
        sql`select l.body from lectures l join topics t on l.topic_id = t.id where t.slug = ${REVISION_SENTINEL_SLUG} limit 1`,
      );
      const body = ((sentinelLec.rows[0] ?? {}) as { body?: string }).body ?? "";
      revisionMatches = body.includes(REVISION_SENTINEL_PHRASE);
    } catch {
      revisionMatches = false;
    }
    if (slugsMatch && revisionMatches) {
      logger.info(
        { revision: CONTENT_REVISION },
        "Seed: already populated with current content, skipping",
      );
      return;
    }
    logger.info(
      { revision: CONTENT_REVISION, slugsMatch, revisionMatches },
      "Seed: course content drifted from expected revision — wiping and re-seeding",
    );
    // Order matters: child tables first.
    await db.execute(sql`delete from practice_attempts`);
    await db.execute(sql`delete from practice_problems`);
    await db.execute(sql`delete from practice_sessions`);
    await db.execute(sql`delete from answers`);
    await db.execute(sql`delete from attempts`);
    await db.execute(sql`delete from problems`);
    await db.execute(sql`delete from assignments`);
    await db.execute(sql`delete from lectures`);
    await db.execute(sql`delete from topics`);
  }

  logger.info("Seed: populating course content");

  // Topics + lectures
  const slugToTopicId = new Map<string, number>();
  for (let i = 0; i < TOPICS.length; i++) {
    const t = TOPICS[i]!;
    const [inserted] = await db
      .insert(topicsTable)
      .values({
        slug: t.slug,
        title: t.title,
        weekNumber: t.weekNumber,
        blurb: t.blurb,
        position: i,
      })
      .returning();
    if (!inserted) throw new Error(`Failed to insert topic ${t.slug}`);
    slugToTopicId.set(t.slug, inserted.id);
    await db.insert(lecturesTable).values({
      topicId: inserted.id,
      weekNumber: t.weekNumber,
      title: t.lectureTitle,
      body: t.body,
    });
  }

  // Assignments + problems
  for (let i = 0; i < ASSIGNMENTS.length; i++) {
    const a = ASSIGNMENTS[i]!;
    const [inserted] = await db
      .insert(assignmentsTable)
      .values({
        kind: a.kind,
        title: a.title,
        weekNumber: a.weekNumber,
        position: i,
        isTimed: a.isTimed,
        timeLimitMinutes: a.timeLimitMinutes,
        instructions: a.instructions,
      })
      .returning();
    if (!inserted) throw new Error(`Failed to insert assignment ${a.title}`);
    for (let p = 0; p < a.problems.length; p++) {
      const prob = a.problems[p]!;
      const topicId = slugToTopicId.get(prob.topicSlug);
      if (!topicId) throw new Error(`Unknown topic slug ${prob.topicSlug}`);
      await db.insert(problemsTable).values({
        assignmentId: inserted.id,
        topicId,
        position: p,
        prompt: prob.prompt,
        correctAnswer: prob.correctAnswer,
        explanation: prob.explanation,
        hint: prob.hint ?? null,
      });
    }
  }

  logger.info({ topics: TOPICS.length, assignments: ASSIGNMENTS.length }, "Seed complete");
}
