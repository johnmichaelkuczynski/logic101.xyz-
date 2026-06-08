import { and, eq, sql } from "drizzle-orm";
import { db, userTopicProfileTable } from "@workspace/db";

export function masteryLabel(accuracy: number, attempts: number): string {
  if (attempts === 0) return "untested";
  if (accuracy >= 0.9) return "strong";
  if (accuracy >= 0.75) return "solid";
  if (accuracy >= 0.5) return "developing";
  return "weak";
}

/**
 * Record a single graded result into the evolving per-user, per-topic profile.
 * Upserts the running tally and recomputes accuracy + mastery label.
 * No-ops when there is no authenticated user.
 */
export async function recordTopicResult(opts: {
  userId: string | null;
  topicId: number;
  correct: boolean;
  difficulty?: number | null;
}): Promise<void> {
  const { userId, topicId, correct } = opts;
  if (!userId) return;

  const [existing] = await db
    .select()
    .from(userTopicProfileTable)
    .where(
      and(
        eq(userTopicProfileTable.userId, userId),
        eq(userTopicProfileTable.topicId, topicId),
      ),
    );

  const attempts = (existing?.attempts ?? 0) + 1;
  const correctCount = (existing?.correctCount ?? 0) + (correct ? 1 : 0);
  const accuracy = correctCount / attempts;
  const label = masteryLabel(accuracy, attempts);

  if (existing) {
    await db
      .update(userTopicProfileTable)
      .set({
        attempts,
        correctCount,
        accuracy,
        masteryLabel: label,
        lastDifficulty: opts.difficulty ?? existing.lastDifficulty ?? null,
        updatedAt: sql`now()`,
      })
      .where(eq(userTopicProfileTable.id, existing.id));
  } else {
    await db.insert(userTopicProfileTable).values({
      userId,
      topicId,
      attempts,
      correctCount,
      accuracy,
      masteryLabel: label,
      lastDifficulty: opts.difficulty ?? null,
    });
  }
}

export async function recordTopicResults(
  userId: string | null,
  results: Array<{ topicId: number; correct: boolean; difficulty?: number | null }>,
): Promise<void> {
  for (const r of results) {
    await recordTopicResult({ userId, ...r });
  }
}
