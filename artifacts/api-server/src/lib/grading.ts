import { chatJson } from "./ai";

function normalize(s: string): string {
  return s
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ")
    .replace(/[\u2212\u2010-\u2015]/g, "-")
    .replace(/[$,]/g, "")
    .replace(/[)(\[\]{}]/g, "")
    .replace(/\s*=\s*/g, "=");
}

function asNumber(s: string): number | null {
  const cleaned = s.replace(/[$,%\s]/g, "").replace(/[\u2212]/g, "-");
  if (/^-?\d+(\.\d+)?$/.test(cleaned)) return parseFloat(cleaned);
  const frac = cleaned.match(/^(-?\d+(?:\.\d+)?)\/(\d+(?:\.\d+)?)$/);
  if (frac) {
    const n = parseFloat(frac[1]!);
    const d = parseFloat(frac[2]!);
    if (d !== 0) return n / d;
  }
  return null;
}

export async function gradeAnswer(opts: {
  prompt: string;
  correctAnswer: string;
  userAnswer: string;
}): Promise<{ correct: boolean; explanation: string }> {
  const user = opts.userAnswer ?? "";
  const correct = opts.correctAnswer ?? "";

  if (normalize(user) === normalize(correct)) {
    return {
      correct: true,
      explanation: `Correct. ${correct}`,
    };
  }

  const u = asNumber(user);
  const c = asNumber(correct);
  if (u != null && c != null) {
    const tol = Math.max(0.01, Math.abs(c) * 0.01);
    if (Math.abs(u - c) <= tol) {
      return { correct: true, explanation: `Correct. The expected answer is ${correct}.` };
    }
  }

  try {
    const out = await chatJson<{ correct: boolean; explanation: string }>(
      "You grade short formal-logic answers written in symbolic notation. Decide if the student's answer is LOGICALLY EQUIVALENT to the correct answer, accepting any equivalent symbolic form. Accept: LaTeX vs unicode (\\forall vs ∀, \\to vs →, \\neg vs ¬, \\wedge vs ∧, \\vee vs ∨, \\vdash vs ⊢, \\models vs ⊨, \\Box vs □, \\Diamond vs ◇, etc.); ASCII renderings (-> for →, ~ or ! for ¬, & for ∧, | for ∨, A for ∀, E for ∃); bound-variable renaming (∀x P(x) = ∀y P(y)); commuted conjuncts/disjuncts; logically equivalent rewrites (p→q vs ¬p∨q vs ¬q→¬p; De Morgan'd forms; double negation); equivalent quantifier-duality forms; and harmless differences in spacing, parentheses, or brackets. Mark WRONG only if the student's statement is not logically equivalent (wrong connective, wrong quantifier order when order matters, wrong arrow direction, missing a conjunct, etc.). Output strict JSON {\"correct\": boolean, \"explanation\": string} where explanation is 1-3 short sentences and includes the correct answer.",
      JSON.stringify({
        prompt: opts.prompt,
        correct_answer: correct,
        student_answer: user,
      }),
    );
    return {
      correct: !!out.correct,
      explanation: out.explanation || `The correct answer is ${correct}.`,
    };
  } catch {
    return {
      correct: false,
      explanation: `The correct answer is ${correct}.`,
    };
  }
}
