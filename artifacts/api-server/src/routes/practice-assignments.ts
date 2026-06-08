import { Router, type IRouter } from "express";
import { and, asc, desc, eq, sql } from "drizzle-orm";
import {
  db,
  assignmentsTable,
  problemsTable,
  topicsTable,
  practiceAssignmentsTable,
  practiceAssignmentProblemsTable,
  practiceAssignmentAnswersTable,
  feedbackMessagesTable,
  userTopicProfileTable,
} from "@workspace/db";
import {
  ListPracticeAssignmentsResponse,
  ListAllPracticeAssignmentsResponse,
  CreatePracticeAssignmentBody,
  CreatePracticeAssignmentResponse,
  GetPracticeAssignmentResponse,
  SavePracticeAssignmentAnswerBody,
  SavePracticeAssignmentAnswerResponse,
  SubmitPracticeAssignmentResponse,
  GetPracticeDialogueResponse,
  PostPracticeDialogueBody,
  PostPracticeDialogueResponse,
} from "@workspace/api-zod";
import { chatJson, chatText } from "../lib/ai";
import { gradeAnswer } from "../lib/grading";
import { getUserId } from "../lib/auth";
import { recordTopicResult } from "../lib/profile";

const router: IRouter = Router();

function parseIdParam(raw: unknown): number {
  const s = Array.isArray(raw) ? raw[0] : (raw as string);
  return parseInt(s ?? "", 10);
}

/** True when the practice run belongs to the requesting user (null === null in dev). */
function owns(
  pa: { userId: string | null },
  userId: string | null,
): boolean {
  return (pa.userId ?? null) === (userId ?? null);
}

type Kind = "homework" | "test" | "midterm" | "final";

async function buildDetail(practiceAssignmentId: number, userId: string | null) {
  const [pa] = await db
    .select()
    .from(practiceAssignmentsTable)
    .where(eq(practiceAssignmentsTable.id, practiceAssignmentId));
  if (!pa) return null;
  if (!owns(pa, userId)) return null;
  const problems = await db
    .select({
      id: practiceAssignmentProblemsTable.id,
      position: practiceAssignmentProblemsTable.position,
      prompt: practiceAssignmentProblemsTable.prompt,
      topicId: practiceAssignmentProblemsTable.topicId,
      topicTitle: topicsTable.title,
      hint: practiceAssignmentProblemsTable.hint,
    })
    .from(practiceAssignmentProblemsTable)
    .leftJoin(
      topicsTable,
      eq(practiceAssignmentProblemsTable.topicId, topicsTable.id),
    )
    .where(eq(practiceAssignmentProblemsTable.practiceAssignmentId, practiceAssignmentId))
    .orderBy(asc(practiceAssignmentProblemsTable.position));
  const answers = await db
    .select()
    .from(practiceAssignmentAnswersTable)
    .where(
      eq(practiceAssignmentAnswersTable.practiceAssignmentId, practiceAssignmentId),
    );
  return {
    id: pa.id,
    sourceAssignmentId: pa.sourceAssignmentId,
    kind: pa.kind as Kind,
    title: pa.title,
    weekNumber: pa.weekNumber,
    instructions: null as string | null,
    status: pa.status as "in_progress" | "submitted",
    scorePercent: pa.scorePercent ?? null,
    problems: problems.map((p) => ({
      id: p.id,
      position: p.position,
      prompt: p.prompt,
      topicId: p.topicId,
      topicTitle: p.topicTitle ?? null,
      hint: p.hint ?? null,
    })),
    answers: answers.map((a) => ({
      problemId: a.problemId,
      answer: a.answer,
      keystrokeCount: a.keystrokeCount,
      eraseCount: a.eraseCount,
    })),
  };
}

// GET /practice-assignments/source/:assignmentId — list prior practice runs
router.get(
  "/practice-assignments/source/:assignmentId",
  async (req, res): Promise<void> => {
    const sourceId = parseIdParam(req.params.assignmentId);
    if (!Number.isFinite(sourceId)) {
      res.status(400).json({ error: "invalid id" });
      return;
    }
    const userId = getUserId(req);
    const rows = await db
      .select()
      .from(practiceAssignmentsTable)
      .where(
        userId
          ? and(
              eq(practiceAssignmentsTable.sourceAssignmentId, sourceId),
              eq(practiceAssignmentsTable.userId, userId),
            )
          : and(
              eq(practiceAssignmentsTable.sourceAssignmentId, sourceId),
              sql`${practiceAssignmentsTable.userId} is null`,
            ),
      )
      .orderBy(desc(practiceAssignmentsTable.id));

    const result = await Promise.all(
      rows.map(async (pa) => {
        const counts = await db.execute(
          sql`select count(*)::int as n from practice_assignment_problems where practice_assignment_id = ${pa.id}`,
        );
        const n = (counts.rows[0] as { n?: number } | undefined)?.n ?? 0;
        return {
          id: pa.id,
          sourceAssignmentId: pa.sourceAssignmentId,
          kind: pa.kind as Kind,
          title: pa.title,
          weekNumber: pa.weekNumber,
          status: pa.status as "in_progress" | "submitted",
          scorePercent: pa.scorePercent ?? null,
          problemCount: n,
          createdAt: pa.createdAt.toISOString(),
        };
      }),
    );
    res.json(ListPracticeAssignmentsResponse.parse(result));
  },
);

// POST /practice-assignments — generate a fresh practice version
router.post("/practice-assignments", async (req, res): Promise<void> => {
  const parsed = CreatePracticeAssignmentBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const userId = getUserId(req);
  const sourceId = parsed.data.sourceAssignmentId;

  const [source] = await db
    .select()
    .from(assignmentsTable)
    .where(eq(assignmentsTable.id, sourceId));
  if (!source) {
    res.status(404).json({ error: "source assignment not found" });
    return;
  }

  // Real graded problems — the practice must never duplicate these.
  const gradedProblems = await db
    .select({
      id: problemsTable.id,
      position: problemsTable.position,
      prompt: problemsTable.prompt,
      topicId: problemsTable.topicId,
      topicTitle: topicsTable.title,
      hint: problemsTable.hint,
    })
    .from(problemsTable)
    .leftJoin(topicsTable, eq(problemsTable.topicId, topicsTable.id))
    .where(eq(problemsTable.assignmentId, sourceId))
    .orderBy(asc(problemsTable.position));

  if (gradedProblems.length === 0) {
    res.status(400).json({ error: "source assignment has no problems" });
    return;
  }

  // All prompts already used (graded + every prior practice run for this source)
  // so the generator never repeats a problem.
  const priorPracticeRows = await db
    .select({ prompt: practiceAssignmentProblemsTable.prompt })
    .from(practiceAssignmentProblemsTable)
    .innerJoin(
      practiceAssignmentsTable,
      eq(
        practiceAssignmentProblemsTable.practiceAssignmentId,
        practiceAssignmentsTable.id,
      ),
    )
    .where(eq(practiceAssignmentsTable.sourceAssignmentId, sourceId));

  const usedPrompts = [
    ...gradedProblems.map((p) => p.prompt),
    ...priorPracticeRows.map((p) => p.prompt),
  ];

  const priorCount = await db.execute(
    sql`select count(*)::int as n from practice_assignments where source_assignment_id = ${sourceId}`,
  );
  const runNumber =
    ((priorCount.rows[0] as { n?: number } | undefined)?.n ?? 0) + 1;

  const [created] = await db
    .insert(practiceAssignmentsTable)
    .values({
      userId,
      sourceAssignmentId: sourceId,
      kind: source.kind,
      title: `${source.title} — Practice #${runNumber}`,
      weekNumber: source.weekNumber,
      status: "in_progress",
    })
    .returning();
  if (!created) {
    res.status(500).json({ error: "failed to create practice assignment" });
    return;
  }

  // Generate one fresh problem per graded problem, on the same topic, never
  // duplicating any used prompt. Accumulate as we go to avoid intra-run dupes.
  const generatedSoFar: string[] = [];
  for (const gp of gradedProblems) {
    const topicTitle = gp.topicTitle ?? "formal logic";
    let generated: {
      prompt: string;
      correctAnswer: string;
      explanation: string;
      hint: string;
    };
    try {
      generated = await chatJson<{
        prompt: string;
        correctAnswer: string;
        explanation: string;
        hint: string;
      }>(
        `You generate a single fresh formal-logic practice problem that mirrors a graded problem for a college logic student. It MUST be on the topic "${topicTitle}", at a comparable difficulty and style to the reference graded problem, and MUST require the student to WRITE THE KEY STATEMENT IN SYMBOLS (translate an English sentence into propositional/predicate logic, write a quantified statement, an equivalence, a sequent with ⊢ or ⊨, or a modal formula). Use $...$ for inline LaTeX and proper logic commands ($\\to$, $\\neg$, $\\wedge$, $\\vee$, $\\leftrightarrow$, $\\forall$, $\\exists$, $\\vdash$, $\\models$, $\\Box$, $\\Diamond$). The correctAnswer must be a short symbolic string (a formula or sequent) — never multi-paragraph. The problem MUST NOT duplicate or trivially reword any of these already-used prompts: ${JSON.stringify(
          [...usedPrompts, ...generatedSoFar],
        )}. Respond as strict JSON: {"prompt": string, "correctAnswer": string, "explanation": string, "hint": string}.`,
        `Reference graded problem (do NOT reuse it, write a genuinely different one on the same topic): ${gp.prompt}`,
      );
    } catch {
      // Fallback when the generator is unavailable. Tag it with the run number
      // and position so it never collides with a graded prompt or a prior run.
      generated = {
        prompt: `Practice #${runNumber}.${gp.position} (${topicTitle}): Translate "If the switch is on, the light is lit; the switch is on; therefore the light is lit" into a propositional sequent using $\\to$ and $\\vdash$.`,
        correctAnswer: "P \\to Q, P \\vdash Q",
        explanation:
          "Let $P$ = \"the switch is on\" and $Q$ = \"the light is lit\". This is modus ponens.",
        hint: "Name each simple statement with a letter, then connect them.",
      };
    }
    // Guard against any duplicate (graded, prior practice, or intra-run) — if the
    // generated prompt collides, disambiguate it so dedup always holds.
    if ([...usedPrompts, ...generatedSoFar].includes(generated.prompt)) {
      generated.prompt = `${generated.prompt} (variation ${runNumber}.${gp.position})`;
    }
    generatedSoFar.push(generated.prompt);
    await db.insert(practiceAssignmentProblemsTable).values({
      practiceAssignmentId: created.id,
      topicId: gp.topicId,
      position: gp.position,
      prompt: generated.prompt,
      correctAnswer: generated.correctAnswer,
      explanation: generated.explanation,
      hint: generated.hint ?? null,
    });
  }

  const detail = await buildDetail(created.id, userId);
  res.json(CreatePracticeAssignmentResponse.parse(detail));
});

// GET /practice-assignments/mine — every practice run by this user.
// MUST be registered before "/practice-assignments/:id" or ":id" captures "mine".
router.get("/practice-assignments/mine", async (req, res): Promise<void> => {
  const userId = getUserId(req);
  const rows = await db
    .select()
    .from(practiceAssignmentsTable)
    .where(
      userId
        ? eq(practiceAssignmentsTable.userId, userId)
        : sql`${practiceAssignmentsTable.userId} is null`,
    )
    .orderBy(desc(practiceAssignmentsTable.id));

  const result = await Promise.all(
    rows.map(async (pa) => {
      const counts = await db.execute(
        sql`select count(*)::int as n from practice_assignment_problems where practice_assignment_id = ${pa.id}`,
      );
      const n = (counts.rows[0] as { n?: number } | undefined)?.n ?? 0;
      return {
        id: pa.id,
        sourceAssignmentId: pa.sourceAssignmentId,
        kind: pa.kind as Kind,
        title: pa.title,
        weekNumber: pa.weekNumber,
        status: pa.status as "in_progress" | "submitted",
        scorePercent: pa.scorePercent ?? null,
        problemCount: n,
        createdAt: pa.createdAt.toISOString(),
      };
    }),
  );
  res.json(ListAllPracticeAssignmentsResponse.parse(result));
});

// GET /practice-assignments/:id
router.get("/practice-assignments/:id", async (req, res): Promise<void> => {
  const id = parseIdParam(req.params.id);
  if (!Number.isFinite(id)) {
    res.status(400).json({ error: "invalid id" });
    return;
  }
  const userId = getUserId(req);
  const detail = await buildDetail(id, userId);
  if (!detail) {
    res.status(404).json({ error: "not found" });
    return;
  }
  res.json(GetPracticeAssignmentResponse.parse(detail));
});

// PUT /practice-assignments/:id/answer
router.put(
  "/practice-assignments/:id/answer",
  async (req, res): Promise<void> => {
    const id = parseIdParam(req.params.id);
    if (!Number.isFinite(id)) {
      res.status(400).json({ error: "invalid id" });
      return;
    }
    const parsed = SavePracticeAssignmentAnswerBody.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.message });
      return;
    }
    const { problemId, answer, trace } = parsed.data;
    const userId = getUserId(req);

    const [pa] = await db
      .select()
      .from(practiceAssignmentsTable)
      .where(eq(practiceAssignmentsTable.id, id));
    if (!pa) {
      res.status(404).json({ error: "practice assignment not found" });
      return;
    }
    if (!owns(pa, userId)) {
      res.status(403).json({ error: "forbidden" });
      return;
    }
    if (pa.status !== "in_progress") {
      res.status(400).json({ error: "practice already submitted" });
      return;
    }
    const [problem] = await db
      .select()
      .from(practiceAssignmentProblemsTable)
      .where(
        and(
          eq(practiceAssignmentProblemsTable.id, problemId),
          eq(practiceAssignmentProblemsTable.practiceAssignmentId, id),
        ),
      );
    if (!problem) {
      res.status(404).json({ error: "problem not in this practice assignment" });
      return;
    }

    const [existing] = await db
      .select()
      .from(practiceAssignmentAnswersTable)
      .where(
        and(
          eq(practiceAssignmentAnswersTable.practiceAssignmentId, id),
          eq(practiceAssignmentAnswersTable.problemId, problemId),
        ),
      );
    const values = {
      practiceAssignmentId: id,
      problemId,
      answer,
      keystrokeCount: trace.keystrokeCount,
      eraseCount: trace.eraseCount,
      bulkInsertCount: trace.bulkInsertCount ?? 0,
      longestBulkInsertChars: trace.longestBulkInsertChars ?? 0,
      rewriteSegments: trace.rewriteSegments ?? 0,
      durationMs: trace.durationMs,
      updatedAt: new Date(),
    };
    if (existing) {
      await db
        .update(practiceAssignmentAnswersTable)
        .set(values)
        .where(eq(practiceAssignmentAnswersTable.id, existing.id));
    } else {
      await db.insert(practiceAssignmentAnswersTable).values(values);
    }
    res.json(SavePracticeAssignmentAnswerResponse.parse({ ok: true }));
  },
);

// POST /practice-assignments/:id/submit — grade + rich feedback + focus pointers
router.post(
  "/practice-assignments/:id/submit",
  async (req, res): Promise<void> => {
    const id = parseIdParam(req.params.id);
    if (!Number.isFinite(id)) {
      res.status(400).json({ error: "invalid id" });
      return;
    }
    const userId = getUserId(req);
    const [pa] = await db
      .select()
      .from(practiceAssignmentsTable)
      .where(eq(practiceAssignmentsTable.id, id));
    if (!pa) {
      res.status(404).json({ error: "practice assignment not found" });
      return;
    }
    if (!owns(pa, userId)) {
      res.status(403).json({ error: "forbidden" });
      return;
    }
    if (pa.status !== "in_progress") {
      res.status(400).json({ error: "practice already submitted" });
      return;
    }

    const problems = await db
      .select({
        id: practiceAssignmentProblemsTable.id,
        prompt: practiceAssignmentProblemsTable.prompt,
        correctAnswer: practiceAssignmentProblemsTable.correctAnswer,
        explanation: practiceAssignmentProblemsTable.explanation,
        topicId: practiceAssignmentProblemsTable.topicId,
        topicTitle: topicsTable.title,
      })
      .from(practiceAssignmentProblemsTable)
      .leftJoin(
        topicsTable,
        eq(practiceAssignmentProblemsTable.topicId, topicsTable.id),
      )
      .where(eq(practiceAssignmentProblemsTable.practiceAssignmentId, id))
      .orderBy(asc(practiceAssignmentProblemsTable.position));

    const answers = await db
      .select()
      .from(practiceAssignmentAnswersTable)
      .where(eq(practiceAssignmentAnswersTable.practiceAssignmentId, id));
    const byProblem = new Map(answers.map((a) => [a.problemId, a]));

    const perProblem = [];
    const topicAgg = new Map<
      number,
      { title: string; correct: number; total: number }
    >();
    let score = 0;
    for (const p of problems) {
      const a = byProblem.get(p.id);
      const userAnswer = a?.answer ?? "";
      const graded = await gradeAnswer({
        prompt: p.prompt,
        correctAnswer: p.correctAnswer,
        userAnswer,
      });
      if (graded.correct) score += 1;

      // Rich, encouraging, specific feedback for this problem.
      let feedback = "";
      try {
        feedback = await chatText(
          "You are a warm, specific formal-logic tutor giving feedback on ONE practice answer. In 2-4 sentences: name exactly what the student did well or where the reasoning broke down, point to the precise logical move to focus on next, and stay encouraging. Do not restate the whole problem. Use $...$ for any symbols.",
          JSON.stringify({
            prompt: p.prompt,
            correctAnswer: p.correctAnswer,
            studentAnswer: userAnswer,
            wasCorrect: graded.correct,
          }),
        );
      } catch {
        feedback = graded.correct
          ? "Nicely done — your symbolic statement matches the intended form. Keep this momentum going."
          : `Not quite yet. Compare your answer to $${p.correctAnswer}$ and check each connective and quantifier carefully.`;
      }

      perProblem.push({
        problemId: p.id,
        correct: graded.correct,
        userAnswer,
        correctAnswer: p.correctAnswer,
        explanation: graded.explanation || p.explanation,
        feedback: feedback || graded.explanation,
      });

      const agg = topicAgg.get(p.topicId) ?? {
        title: p.topicTitle ?? "Topic",
        correct: 0,
        total: 0,
      };
      agg.total += 1;
      if (graded.correct) agg.correct += 1;
      topicAgg.set(p.topicId, agg);

      // Persist correctness + roll into the evolving per-topic profile.
      if (a) {
        await db
          .update(practiceAssignmentAnswersTable)
          .set({ correct: graded.correct, feedback })
          .where(eq(practiceAssignmentAnswersTable.id, a.id));
      }
      await recordTopicResult({
        userId,
        topicId: p.topicId,
        correct: graded.correct,
      });
    }

    const total = problems.length;
    const percent = total === 0 ? 0 : (score / total) * 100;

    // Surgically precise focus pointers from the weakest topics this run.
    const focusPointers: Array<{
      topicId: number | null;
      topicTitle: string | null;
      pointer: string;
    }> = [];
    const weakTopics = [...topicAgg.entries()]
      .map(([topicId, v]) => ({
        topicId,
        title: v.title,
        accuracy: v.total === 0 ? 0 : v.correct / v.total,
        total: v.total,
        correct: v.correct,
      }))
      .filter((t) => t.accuracy < 1)
      .sort((a, b) => a.accuracy - b.accuracy)
      .slice(0, 3);

    let overallFeedback = "";
    try {
      const out = await chatJson<{
        overallFeedback: string;
        pointers: Array<{ topicTitle: string; pointer: string }>;
      }>(
        "You are an academic advisor for a formal-logic course summarizing one practice run. Write an encouraging 2-3 sentence overall note, then give surgical, specific next-step pointers for the weak topics (one per topic, naming the exact skill to drill). Strict JSON: {\"overallFeedback\": string, \"pointers\": [{\"topicTitle\": string, \"pointer\": string}]}.",
        JSON.stringify({
          scorePercent: percent,
          totalProblems: total,
          correct: score,
          perTopic: [...topicAgg.entries()].map(([topicId, v]) => ({
            topicId,
            topicTitle: v.title,
            correct: v.correct,
            total: v.total,
          })),
          weakTopics: weakTopics.map((t) => t.title),
        }),
      );
      overallFeedback = out.overallFeedback;
      const titleToId = new Map(
        [...topicAgg.entries()].map(([topicId, v]) => [v.title, topicId]),
      );
      for (const ptr of out.pointers ?? []) {
        focusPointers.push({
          topicId: titleToId.get(ptr.topicTitle) ?? null,
          topicTitle: ptr.topicTitle,
          pointer: ptr.pointer,
        });
      }
    } catch {
      overallFeedback =
        percent >= 80
          ? `Strong run — ${score}/${total} correct. You're tracking well toward the graded version.`
          : `You scored ${score}/${total}. That's exactly what practice is for — review the pointers below and run another version.`;
      for (const t of weakTopics) {
        focusPointers.push({
          topicId: t.topicId,
          topicTitle: t.title,
          pointer: `Drill ${t.title}: you got ${t.correct}/${t.total}. Redo these in symbols and check each connective.`,
        });
      }
    }

    await db
      .update(practiceAssignmentsTable)
      .set({
        status: "submitted",
        submittedAt: new Date(),
        scorePercent: percent,
        overallFeedback,
        focusPointers,
      })
      .where(eq(practiceAssignmentsTable.id, id));

    // Seed the dialogue thread with the overall feedback so the student can
    // immediately discuss it.
    await db.insert(feedbackMessagesTable).values({
      userId,
      practiceAssignmentId: id,
      role: "assistant",
      content: overallFeedback,
    });

    res.json(
      SubmitPracticeAssignmentResponse.parse({
        id,
        score,
        total,
        percent,
        perProblem,
        overallFeedback,
        focusPointers,
      }),
    );
  },
);

// GET /practice-assignments/:id/dialogue
router.get(
  "/practice-assignments/:id/dialogue",
  async (req, res): Promise<void> => {
    const id = parseIdParam(req.params.id);
    if (!Number.isFinite(id)) {
      res.status(400).json({ error: "invalid id" });
      return;
    }
    const userId = getUserId(req);
    const [pa] = await db
      .select()
      .from(practiceAssignmentsTable)
      .where(eq(practiceAssignmentsTable.id, id));
    if (!pa) {
      res.status(404).json({ error: "practice assignment not found" });
      return;
    }
    if (!owns(pa, userId)) {
      res.status(403).json({ error: "forbidden" });
      return;
    }
    const rows = await db
      .select()
      .from(feedbackMessagesTable)
      .where(eq(feedbackMessagesTable.practiceAssignmentId, id))
      .orderBy(asc(feedbackMessagesTable.id));
    res.json(
      GetPracticeDialogueResponse.parse(
        rows.map((m) => ({
          id: m.id,
          role: m.role as "user" | "assistant",
          content: m.content,
          createdAt: m.createdAt.toISOString(),
        })),
      ),
    );
  },
);

// POST /practice-assignments/:id/dialogue — discuss the feedback
router.post(
  "/practice-assignments/:id/dialogue",
  async (req, res): Promise<void> => {
    const id = parseIdParam(req.params.id);
    if (!Number.isFinite(id)) {
      res.status(400).json({ error: "invalid id" });
      return;
    }
    const parsed = PostPracticeDialogueBody.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.message });
      return;
    }
    const userId = getUserId(req);
    const [pa] = await db
      .select()
      .from(practiceAssignmentsTable)
      .where(eq(practiceAssignmentsTable.id, id));
    if (!pa) {
      res.status(404).json({ error: "practice assignment not found" });
      return;
    }
    if (!owns(pa, userId)) {
      res.status(403).json({ error: "forbidden" });
      return;
    }

    await db.insert(feedbackMessagesTable).values({
      userId,
      practiceAssignmentId: id,
      role: "user",
      content: parsed.data.message,
    });

    // Ground the tutor in this practice run: problems, the student's answers,
    // correctness, and the running thread.
    const problems = await db
      .select({
        position: practiceAssignmentProblemsTable.position,
        prompt: practiceAssignmentProblemsTable.prompt,
        correctAnswer: practiceAssignmentProblemsTable.correctAnswer,
        id: practiceAssignmentProblemsTable.id,
      })
      .from(practiceAssignmentProblemsTable)
      .where(eq(practiceAssignmentProblemsTable.practiceAssignmentId, id))
      .orderBy(asc(practiceAssignmentProblemsTable.position));
    const answers = await db
      .select()
      .from(practiceAssignmentAnswersTable)
      .where(eq(practiceAssignmentAnswersTable.practiceAssignmentId, id));
    const ansByProblem = new Map(answers.map((a) => [a.problemId, a]));
    const thread = await db
      .select()
      .from(feedbackMessagesTable)
      .where(eq(feedbackMessagesTable.practiceAssignmentId, id))
      .orderBy(asc(feedbackMessagesTable.id));

    const context = {
      title: pa.title,
      scorePercent: pa.scorePercent,
      overallFeedback: pa.overallFeedback,
      problems: problems.map((p) => ({
        position: p.position,
        prompt: p.prompt,
        correctAnswer: p.correctAnswer,
        studentAnswer: ansByProblem.get(p.id)?.answer ?? "",
        correct: ansByProblem.get(p.id)?.correct ?? null,
      })),
    };
    const history = thread
      .slice(-10)
      .map((m) => `${m.role.toUpperCase()}: ${m.content}`)
      .join("\n");

    let replyText = "";
    try {
      replyText = await chatText(
        `You are a warm, precise formal-logic tutor helping a student understand the feedback on their practice run. Ground every answer in the student's actual problems and answers. Be specific and encouraging, push them to write things in symbols, and keep replies focused (under ~6 sentences). Use $...$ for symbols. Practice context: ${JSON.stringify(
          context,
        )}.`,
        `Conversation so far:\n${history}\n\nReply to the student's latest message.`,
      );
    } catch {
      replyText =
        "I'm having trouble reaching the tutor right now — try again in a moment. In the meantime, compare your answer symbol by symbol with the correct form and check each connective and quantifier.";
    }

    const [saved] = await db
      .insert(feedbackMessagesTable)
      .values({
        userId,
        practiceAssignmentId: id,
        role: "assistant",
        content: replyText,
      })
      .returning();
    if (!saved) {
      res.status(500).json({ error: "failed to save reply" });
      return;
    }
    res.json(
      PostPracticeDialogueResponse.parse({
        id: saved.id,
        role: "assistant",
        content: saved.content,
        createdAt: saved.createdAt.toISOString(),
      }),
    );
  },
);

export default router;
