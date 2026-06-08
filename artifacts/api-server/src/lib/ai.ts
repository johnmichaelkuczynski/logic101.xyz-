import { openai } from "@workspace/integrations-openai-ai-server";

export const TEXT_MODEL = "gpt-5.4";
export const FAST_MODEL = "gpt-5-mini";

export async function chatText(
  system: string,
  user: string,
  model: string = TEXT_MODEL,
): Promise<string> {
  const resp = await openai.chat.completions.create({
    model,
    max_completion_tokens: 4096,
    messages: [
      { role: "system", content: system },
      { role: "user", content: user },
    ],
  });
  return resp.choices[0]?.message?.content?.trim() ?? "";
}

export function buildExpandLecturePrompt(level: "medium" | "long"): string {
  const ratio =
    level === "long"
      ? "roughly 2x to 3x the length of the SHORT version"
      : "roughly 1.5x to 2x the length of the SHORT version";
  const moreExamples =
    level === "long"
      ? "At least TWO additional fully worked examples for every concept beyond what the short version has — pick contrasting cases (edge cases, common mistakes, larger numbers, real-world framings)."
      : "At least ONE additional fully worked example for every concept beyond what the short version has.";
  const moreExplanation =
    level === "long"
      ? "Considerably more explanation: motivate every rule, explain WHY it works, name common pitfalls, and add brief 'sanity check' notes after computations."
      : "Noticeably more explanation: clarify each definition, motivate each rule, and add a short 'why this works' note where useful.";

  return (
    `You are a college formal-logic lecturer producing the ${level.toUpperCase()} version of a lecture. ` +
    "You are given the SHORT version of the lecture. Rewrite it as a longer teaching version. RULES, no exceptions:\n" +
    "1. KEEP every heading and every concept from the SHORT version, in the same order, with the same names. You may add new sub-sections only when needed to introduce additional examples — but no new top-level topics.\n" +
    `2. ${moreExplanation}\n` +
    `3. ${moreExamples} Use \`## Example\` / \`### Example 1\`, \`### Example 2\` headings, with numbered steps. Inline math \`$...$\`, display math \`$$...$$\` (escape backslashes in LaTeX commands).\n` +
    `4. Length target: ${ratio}.\n` +
    "5. Friendly, plain English. No filler, no hedging, no 'in conclusion'. Examples carry the load.\n" +
    "6. Return ONLY the rewritten Markdown lecture body. No preface, no commentary, no code fences around the whole thing."
  );
}

export async function expandLectureBody(
  level: "medium" | "long",
  title: string,
  shortBody: string,
): Promise<string> {
  const sys = buildExpandLecturePrompt(level);
  const user = `LECTURE TITLE: ${title}\n\nSHORT VERSION:\n"""\n${shortBody}\n"""`;
  const expanded = await chatText(sys, user);
  if (!expanded || expanded.trim().length < shortBody.length * 0.85) {
    throw new Error("expansion produced insufficient content");
  }
  return expanded.trim();
}

export async function chatJson<T = unknown>(
  system: string,
  user: string,
  model: string = TEXT_MODEL,
): Promise<T> {
  const resp = await openai.chat.completions.create({
    model,
    max_completion_tokens: 4096,
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: system },
      { role: "user", content: user },
    ],
  });
  const raw = resp.choices[0]?.message?.content?.trim() ?? "{}";
  return JSON.parse(raw) as T;
}
