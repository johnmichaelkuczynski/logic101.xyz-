import { Router, type IRouter } from "express";
import { and, asc, desc, eq, sql } from "drizzle-orm";
import {
  db,
  topicsTable,
  attemptsTable,
  practiceAttemptsTable,
  assignmentsTable,
  problemsTable,
  practiceAssignmentsTable,
  practiceAssignmentProblemsTable,
  practiceAssignmentAnswersTable,
} from "@workspace/db";
import {
  GetAnalyticsSummaryResponse,
  GetTopicAnalyticsResponse,
  GetRecentActivityResponse,
  GenerateReportResponse,
  GetAssignmentReadinessResponse,
} from "@workspace/api-zod";
import { chatJson } from "../lib/ai";
import { getUserId } from "../auth";

const router: IRouter = Router();

type StrengthLabel = "strong" | "solid" | "developing" | "weak" | "untested";
function labelFor(accuracy: number, attempts: number): StrengthLabel {
  if (attempts === 0) return "untested";
  if (accuracy >= 0.9) return "strong";
  if (accuracy >= 0.75) return "solid";
  if (accuracy >= 0.5) return "developing";
  return "weak";
}

async function topicStats() {
  const topics = await db
    .select()
    .from(topicsTable)
    .orderBy(asc(topicsTable.position));
  const stats = await db.execute(sql`
    select topic_id, count(*)::int as n, avg(case when correct then 1.0 else 0.0 end) as acc
    from practice_attempts group by topic_id
  `);
  const byId = new Map<number, { n: number; acc: number }>();
  for (const r of stats.rows as Array<{ topic_id: number; n: number; acc: number }>) {
    byId.set(Number(r.topic_id), { n: Number(r.n), acc: Number(r.acc) });
  }
  return topics.map((t) => {
    const s = byId.get(t.id);
    const attempts = s?.n ?? 0;
    const accuracy = attempts === 0 ? 0 : s!.acc;
    return {
      topicId: t.id,
      topicTitle: t.title,
      weekNumber: t.weekNumber,
      attempts,
      accuracy: Number(accuracy.toFixed(3)),
      strengthLabel: labelFor(accuracy, attempts),
    };
  });
}

router.get("/analytics/summary", async (_req, res) => {
  const submitted = await db
    .select()
    .from(attemptsTable)
    .where(eq(attemptsTable.status, "submitted"));
  const officialAverage =
    submitted.length === 0
      ? 0
      : submitted.reduce((s, a) => s + (a.scorePercent ?? 0), 0) / submitted.length;

  const practice = await db.select().from(practiceAttemptsTable);
  const practiceCorrect = practice.filter((p) => p.correct).length;
  const practiceAccuracy =
    practice.length === 0 ? 0 : (practiceCorrect / practice.length) * 100;

  const days = new Set<string>();
  for (const p of practice) days.add(new Date(p.createdAt).toISOString().slice(0, 10));
  for (const a of submitted)
    if (a.submittedAt) days.add(new Date(a.submittedAt).toISOString().slice(0, 10));

  // streak: consecutive days ending today
  let streakDays = 0;
  const today = new Date();
  for (let i = 0; i < 60; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    if (days.has(key)) streakDays++;
    else if (i > 0) break;
  }

  const topics = await topicStats();
  const tested = topics.filter((t) => t.attempts > 0);
  tested.sort((a, b) => b.accuracy - a.accuracy);
  const strongest = tested[0]?.topicTitle ?? null;
  const weakest = tested[tested.length - 1]?.topicTitle ?? null;

  res.json(
    GetAnalyticsSummaryResponse.parse({
      officialAverage: Number(officialAverage.toFixed(2)),
      practiceAccuracy: Number(practiceAccuracy.toFixed(2)),
      attemptsCount: submitted.length,
      practiceCount: practice.length,
      streakDays,
      strongestTopic: strongest,
      weakestTopic: weakest,
    }),
  );
});

router.get("/analytics/topics", async (_req, res) => {
  const rows = await topicStats();
  res.json(GetTopicAnalyticsResponse.parse(rows));
});

router.get("/analytics/activity", async (_req, res) => {
  const recentPractice = await db
    .select({
      id: practiceAttemptsTable.id,
      createdAt: practiceAttemptsTable.createdAt,
      correct: practiceAttemptsTable.correct,
      topicId: practiceAttemptsTable.topicId,
    })
    .from(practiceAttemptsTable)
    .orderBy(desc(practiceAttemptsTable.id))
    .limit(20);
  const topics = await db.select().from(topicsTable);
  const topicById = new Map(topics.map((t) => [t.id, t.title]));

  const recentAttempts = await db
    .select({
      id: attemptsTable.id,
      submittedAt: attemptsTable.submittedAt,
      scorePercent: attemptsTable.scorePercent,
      assignmentId: attemptsTable.assignmentId,
    })
    .from(attemptsTable)
    .where(eq(attemptsTable.status, "submitted"))
    .orderBy(desc(attemptsTable.id))
    .limit(20);
  const assignments = await db.select().from(assignmentsTable);
  const aById = new Map(assignments.map((a) => [a.id, a.title]));

  const items = [
    ...recentPractice.map((p) => ({
      id: p.id,
      kind: "practice" as const,
      title: `Practice — ${topicById.get(p.topicId) ?? "Topic"}`,
      at: p.createdAt.toISOString(),
      score: p.correct ? 100 : 0,
      topicTitle: topicById.get(p.topicId) ?? null,
    })),
    ...recentAttempts.map((a) => ({
      id: a.id + 1_000_000,
      kind: "assignment" as const,
      title: aById.get(a.assignmentId) ?? "Assignment",
      at: (a.submittedAt ?? new Date()).toISOString(),
      score: a.scorePercent ?? null,
      topicTitle: null,
    })),
  ].sort((x, y) => y.at.localeCompare(x.at));

  res.json(GetRecentActivityResponse.parse(items.slice(0, 30)));
});

router.post("/analytics/report", async (_req, res) => {
  const topics = await topicStats();
  const submitted = await db
    .select()
    .from(attemptsTable)
    .where(eq(attemptsTable.status, "submitted"));
  const officialAverage =
    submitted.length === 0
      ? 0
      : submitted.reduce((s, a) => s + (a.scorePercent ?? 0), 0) / submitted.length;

  const tested = topics.filter((t) => t.attempts > 0);
  tested.sort((a, b) => a.accuracy - b.accuracy);
  const weakest = tested.slice(0, 3).map((t) => t.topicTitle);
  const strongest = tested.slice(-3).reverse().map((t) => t.topicTitle);

  let narrative = "";
  let recommendations: string[] = [];
  try {
    const out = await chatJson<{ narrative: string; recommendations: string[] }>(
      "You are an academic advisor for a college formal-logic course. Write a 2-paragraph, encouraging but honest narrative summary, then list 3 concrete next-step recommendations. Strict JSON: {\"narrative\": string, \"recommendations\": string[]}.",
      JSON.stringify({
        officialAverage,
        attempts: submitted.length,
        weakestTopics: weakest,
        strongestTopics: strongest,
        perTopic: topics,
      }),
    );
    narrative = out.narrative;
    recommendations = out.recommendations ?? [];
  } catch {
    narrative =
      tested.length === 0
        ? "You haven't accumulated enough graded work yet to draw conclusions. Try a practice session or finish a homework, then regenerate this report."
        : `You're averaging ${officialAverage.toFixed(
            1,
          )}% on official assignments. Your strongest area so far is ${
            strongest[0] ?? "n/a"
          }; your weakest is ${weakest[0] ?? "n/a"}.`;
    recommendations =
      weakest.length > 0
        ? weakest.map((w) => `Run a focused practice session on ${w}.`)
        : ["Open a homework and start with a small set of problems."];
  }

  res.json(
    GenerateReportResponse.parse({
      generatedAt: new Date().toISOString(),
      narrative,
      strengths: strongest,
      weaknesses: weakest,
      recommendations,
    }),
  );
});

// GET /analytics/readiness/:assignmentId — surgical readiness for one assignment,
// computed from the evolving per-topic practice profile for this assignment's topics.
router.get("/analytics/readiness/:assignmentId", async (req, res): Promise<void> => {
  const assignmentId = parseInt(
    Array.isArray(req.params.assignmentId)
      ? req.params.assignmentId[0]!
      : req.params.assignmentId,
    10,
  );
  if (!Number.isFinite(assignmentId)) {
    res.status(400).json({ error: "invalid id" });
    return;
  }
  const userId = getUserId(req);

  // Topics this assignment actually tests.
  const topicRows = await db
    .selectDistinct({
      topicId: problemsTable.topicId,
      topicTitle: topicsTable.title,
    })
    .from(problemsTable)
    .leftJoin(topicsTable, eq(problemsTable.topicId, topicsTable.id))
    .where(eq(problemsTable.assignmentId, assignmentId));

  if (topicRows.length === 0) {
    res.json(
      GetAssignmentReadinessResponse.parse({
        assignmentId,
        readinessPercent: 0,
        readyLabel: "untested",
        summary: "This assignment has no problems yet.",
        recommendedPracticeRuns: 0,
        perTopic: [],
      }),
    );
    return;
  }

  // Per-topic stats from this assignment's own practice runs (most precise),
  // scoped to the current user when available.
  const stats = await db
    .select({
      topicId: practiceAssignmentProblemsTable.topicId,
      correct: practiceAssignmentAnswersTable.correct,
    })
    .from(practiceAssignmentAnswersTable)
    .innerJoin(
      practiceAssignmentProblemsTable,
      eq(
        practiceAssignmentAnswersTable.problemId,
        practiceAssignmentProblemsTable.id,
      ),
    )
    .innerJoin(
      practiceAssignmentsTable,
      eq(
        practiceAssignmentProblemsTable.practiceAssignmentId,
        practiceAssignmentsTable.id,
      ),
    )
    .where(
      userId
        ? and(
            eq(practiceAssignmentsTable.sourceAssignmentId, assignmentId),
            eq(practiceAssignmentsTable.userId, userId),
          )
        : and(
            eq(practiceAssignmentsTable.sourceAssignmentId, assignmentId),
            sql`${practiceAssignmentsTable.userId} is null`,
          ),
    );

  const agg = new Map<number, { correct: number; total: number }>();
  for (const s of stats) {
    if (s.correct == null) continue;
    const a = agg.get(s.topicId) ?? { correct: 0, total: 0 };
    a.total += 1;
    if (s.correct) a.correct += 1;
    agg.set(s.topicId, a);
  }

  const perTopic = topicRows.map((t) => {
    const a = agg.get(t.topicId);
    const attempts = a?.total ?? 0;
    const accuracy = attempts === 0 ? 0 : a!.correct / attempts;
    const label = labelFor(accuracy, attempts);
    let pointer: string;
    if (attempts === 0) {
      pointer = `No practice yet on ${t.topicTitle ?? "this topic"} — run a practice version to gauge where you stand.`;
    } else if (accuracy >= 0.9) {
      pointer = `${t.topicTitle ?? "This topic"} is solid (${a!.correct}/${attempts}). Keep it warm with an occasional rep.`;
    } else if (accuracy >= 0.5) {
      pointer = `${t.topicTitle ?? "This topic"} is developing (${a!.correct}/${attempts}). A couple more practice runs should lock it in.`;
    } else {
      pointer = `${t.topicTitle ?? "This topic"} needs work (${a!.correct}/${attempts}). Drill it before the graded version.`;
    }
    return {
      topicId: t.topicId,
      topicTitle: t.topicTitle ?? "Topic",
      attempts,
      accuracy: Number(accuracy.toFixed(3)),
      masteryLabel: label,
      pointer,
    };
  });

  const testedTopics = perTopic.filter((t) => t.attempts > 0);
  const readinessPercent =
    testedTopics.length === 0
      ? 0
      : Number(
          (
            (testedTopics.reduce((s, t) => s + t.accuracy, 0) /
              perTopic.length) *
            100
          ).toFixed(1),
        );
  const untestedCount = perTopic.length - testedTopics.length;

  let readyLabel: "ready" | "almost" | "not_ready" | "untested";
  if (testedTopics.length === 0) readyLabel = "untested";
  else if (readinessPercent >= 85 && untestedCount === 0) readyLabel = "ready";
  else if (readinessPercent >= 60) readyLabel = "almost";
  else readyLabel = "not_ready";

  const weakCount = perTopic.filter(
    (t) => t.attempts === 0 || t.accuracy < 0.75,
  ).length;
  const recommendedPracticeRuns =
    readyLabel === "ready" ? 0 : Math.max(1, Math.min(5, weakCount));

  const summary =
    readyLabel === "untested"
      ? "You haven't practiced this assignment yet. Generate a practice version to see exactly where you stand."
      : readyLabel === "ready"
      ? `You're ready: ${readinessPercent}% across the topics this assignment tests. Go take it.`
      : readyLabel === "almost"
      ? `Almost there at ${readinessPercent}%. Close the gaps below with ${recommendedPracticeRuns} more practice run(s).`
      : `Not ready yet (${readinessPercent}%). Focus on the weak topics below before attempting the graded version.`;

  res.json(
    GetAssignmentReadinessResponse.parse({
      assignmentId,
      readinessPercent,
      readyLabel,
      summary,
      recommendedPracticeRuns,
      perTopic,
    }),
  );
});

export default router;
