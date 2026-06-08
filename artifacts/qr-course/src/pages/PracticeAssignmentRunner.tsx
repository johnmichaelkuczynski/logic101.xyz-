import React, { useState, useEffect, useRef } from "react";
import { Layout } from "@/components/layout/Layout";
import { useParams, Link } from "wouter";
import {
  useGetPracticeAssignment,
  useSavePracticeAssignmentAnswer,
  useSubmitPracticeAssignment,
  useGetPracticeDialogue,
  usePostPracticeDialogue,
  useCreatePracticeAssignment,
  PracticeAssignmentResult,
  KeystrokeTrace,
} from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { AnswerInput } from "@/components/AnswerInput";
import { MarkdownRenderer } from "@/components/MarkdownRenderer";
import { PracticeTutorPanel } from "@/components/PracticeTutorPanel";

export default function PracticeAssignmentRunner() {
  const params = useParams();
  const practiceId = Number(params.id);

  const { data: practice, isLoading } = useGetPracticeAssignment(practiceId, {
    query: { queryKey: ["practiceAssignment", practiceId] },
  });
  const saveAnswer = useSavePracticeAssignmentAnswer();
  const submit = useSubmitPracticeAssignment();
  const createAnother = useCreatePracticeAssignment();

  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [result, setResult] = useState<PracticeAssignmentResult | null>(null);

  useEffect(() => {
    if (practice) {
      const initial: Record<number, string> = {};
      practice.answers.forEach((a) => {
        initial[a.problemId] = a.answer;
      });
      setAnswers((prev) => (Object.keys(prev).length === 0 ? initial : prev));
    }
  }, [practice]);

  const handleAnswerChange = (problemId: number, val: string, trace: KeystrokeTrace) => {
    setAnswers((prev) => ({ ...prev, [problemId]: val }));
    saveAnswer.mutate({ id: practiceId, data: { problemId, answer: val, trace } });
  };

  const handleSubmit = () => {
    submit.mutate(
      { id: practiceId },
      { onSuccess: (data) => setResult(data) },
    );
  };

  const handleGenerateAnother = () => {
    if (!practice) return;
    createAnother.mutate(
      { data: { sourceAssignmentId: practice.sourceAssignmentId } },
      {
        onSuccess: (data) => {
          window.location.href = `${import.meta.env.BASE_URL}practice-assignments/${data.id}`;
        },
      },
    );
  };

  if (isLoading || !practice) {
    return (
      <Layout>
        <div className="p-8 max-w-4xl mx-auto w-full flex flex-col gap-8">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-64 w-full" />
        </div>
      </Layout>
    );
  }

  if (result) {
    return (
      <ResultsView
        practiceId={practiceId}
        title={practice.title}
        sourceAssignmentId={practice.sourceAssignmentId}
        result={result}
        problems={practice.problems}
        onGenerateAnother={handleGenerateAnother}
        generating={createAnother.isPending}
      />
    );
  }

  const currentProblem = practice.problems[currentIdx];

  return (
    <Layout>
      <div className="flex flex-col lg:flex-row gap-6 p-6 max-w-7xl mx-auto w-full h-[calc(100dvh-4rem)]">
        {/* Problem column */}
        <div className="flex-1 flex flex-col gap-6 overflow-y-auto pb-8">
          <div className="flex justify-between items-start border-b pb-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-bold uppercase tracking-wider text-chart-2 bg-chart-2/10 px-2 py-0.5 rounded-full">
                  Practice — ungraded
                </span>
              </div>
              <h1 className="text-2xl font-serif font-bold text-primary">{practice.title}</h1>
              <p className="text-sm text-muted-foreground">
                Problem {currentIdx + 1} of {practice.problems.length} · fresh problems, never repeated
              </p>
            </div>
            <Link href={`/assignments/${practice.sourceAssignmentId}`}>
              <Button variant="outline" size="sm">Back</Button>
            </Link>
          </div>

          {currentProblem ? (
            <div className="flex flex-col gap-6">
              <div className="prose prose-slate dark:prose-invert max-w-none text-lg">
                <MarkdownRenderer content={currentProblem.prompt} />
              </div>
              {currentProblem.hint && (
                <details className="text-sm text-muted-foreground bg-secondary/40 rounded-md p-3">
                  <summary className="cursor-pointer font-medium">Need a hint?</summary>
                  <div className="mt-2">
                    <MarkdownRenderer content={currentProblem.hint} />
                  </div>
                </details>
              )}
              <AnswerInput
                value={answers[currentProblem.id] || ""}
                onChange={(val, trace) => handleAnswerChange(currentProblem.id, val, trace)}
                promptSource={currentProblem.prompt}
              />

              <div className="flex justify-between mt-4 pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={() => setCurrentIdx((p) => Math.max(0, p - 1))}
                  disabled={currentIdx === 0}
                >
                  Previous
                </Button>
                {currentIdx < practice.problems.length - 1 ? (
                  <Button onClick={() => setCurrentIdx((p) => Math.min(practice.problems.length - 1, p + 1))}>
                    Next
                  </Button>
                ) : (
                  <Button
                    onClick={handleSubmit}
                    className="bg-chart-2 hover:bg-chart-2/90 text-white"
                    disabled={submit.isPending}
                  >
                    {submit.isPending ? "Checking…" : "Submit for feedback"}
                  </Button>
                )}
              </div>
            </div>
          ) : (
            <div>Problem not found.</div>
          )}
        </div>

        {/* Live tutor column — always visible during practice */}
        <div className="lg:w-96 flex-shrink-0 h-full">
          <PracticeTutorPanel problemPrompt={currentProblem?.prompt} />
        </div>
      </div>
    </Layout>
  );
}

function ResultsView({
  practiceId,
  title,
  sourceAssignmentId,
  result,
  problems,
  onGenerateAnother,
  generating,
}: {
  practiceId: number;
  title: string;
  sourceAssignmentId: number;
  result: PracticeAssignmentResult;
  problems: { id: number; prompt: string }[];
  onGenerateAnother: () => void;
  generating: boolean;
}) {
  const promptById = new Map(problems.map((p) => [p.id, p.prompt]));
  return (
    <Layout>
      <div className="flex flex-col lg:flex-row gap-6 p-6 max-w-7xl mx-auto w-full">
        <div className="flex-1 flex flex-col gap-6">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-chart-2 bg-chart-2/10 px-2 py-0.5 rounded-full">
                Practice results — ungraded
              </span>
              <h1 className="text-3xl font-serif font-bold text-primary mt-2 mb-1">{title}</h1>
              <p className="text-muted-foreground">
                {Math.round(result.percent)}% ({result.score}/{result.total})
              </p>
            </div>
            <div className="flex flex-col gap-2">
              <Button onClick={onGenerateAnother} disabled={generating}>
                {generating ? "Generating…" : "Generate another practice"}
              </Button>
              <Link href={`/assignments/${sourceAssignmentId}`}>
                <Button variant="outline" className="w-full">Back to assignment</Button>
              </Link>
            </div>
          </div>

          {/* Overall feedback */}
          <div className="p-5 rounded-lg border border-primary/30 bg-primary/5">
            <h2 className="font-serif font-semibold text-primary mb-1">How you did</h2>
            <div className="text-sm">
              <MarkdownRenderer content={result.overallFeedback} />
            </div>
          </div>

          {/* Focus pointers */}
          {result.focusPointers.length > 0 && (
            <div className="p-5 rounded-lg border border-chart-4/40 bg-chart-4/5">
              <h2 className="font-serif font-semibold text-chart-4 mb-2">Where to focus next</h2>
              <ul className="flex flex-col gap-2">
                {result.focusPointers.map((fp, i) => (
                  <li key={i} className="text-sm flex gap-2">
                    <span className="text-chart-4 font-bold">→</span>
                    <span>
                      {fp.topicTitle && <strong>{fp.topicTitle}: </strong>}
                      <MarkdownRenderer content={fp.pointer} />
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Per-problem rich feedback */}
          <div className="flex flex-col gap-4">
            {result.perProblem.map((pr, idx) => (
              <div
                key={pr.problemId}
                className={`p-5 rounded-lg border ${
                  pr.correct ? "border-chart-2/50 bg-chart-2/5" : "border-destructive/40 bg-destructive/5"
                }`}
              >
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-medium">Problem {idx + 1}</h3>
                  <span className={`text-xs font-semibold ${pr.correct ? "text-chart-2" : "text-destructive"}`}>
                    {pr.correct ? "Correct" : "Review"}
                  </span>
                </div>
                {promptById.get(pr.problemId) && (
                  <div className="text-sm text-muted-foreground mb-3">
                    <MarkdownRenderer content={promptById.get(pr.problemId)!} />
                  </div>
                )}
                <div className="mb-2">
                  <span className="text-xs font-semibold uppercase text-muted-foreground">Your answer</span>
                  <div className="font-mono mt-0.5">{pr.userAnswer || "No answer"}</div>
                </div>
                {!pr.correct && pr.correctAnswer && (
                  <div className="mb-2 text-primary">
                    <span className="text-xs font-semibold uppercase">Correct answer</span>
                    <div className="font-mono mt-0.5">{pr.correctAnswer}</div>
                  </div>
                )}
                <div className="mt-3 p-3 rounded-md bg-background/60 border border-border">
                  <span className="text-xs font-semibold uppercase text-muted-foreground">Tutor feedback</span>
                  <div className="text-sm mt-1">
                    <MarkdownRenderer content={pr.feedback} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Dialogue thread about the feedback */}
        <div className="lg:w-96 flex-shrink-0">
          <FeedbackDialogue practiceId={practiceId} />
        </div>
      </div>
    </Layout>
  );
}

function FeedbackDialogue({ practiceId }: { practiceId: number }) {
  const { data: messages } = useGetPracticeDialogue(practiceId, {
    query: { queryKey: ["practiceDialogue", practiceId] },
  });
  const post = usePostPracticeDialogue();
  const [input, setInput] = useState("");
  const [localMsgs, setLocalMsgs] = useState<{ role: string; content: string }[]>([]);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  const all = [
    ...(messages ?? []).map((m) => ({ role: m.role, content: m.content })),
    ...localMsgs,
  ];

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 1e9, behavior: "smooth" });
  }, [all.length, post.isPending]);

  function send() {
    const text = input.trim();
    if (!text) return;
    setInput("");
    setLocalMsgs((m) => [...m, { role: "user", content: text }]);
    post.mutate(
      { id: practiceId, data: { message: text } },
      {
        onSuccess: (res) => {
          setLocalMsgs((m) => [...m, { role: "assistant", content: res.content }]);
        },
        onError: (e) => {
          setLocalMsgs((m) => [
            ...m,
            { role: "assistant", content: `Tutor error: ${(e as Error).message}` },
          ]);
        },
      },
    );
  }

  return (
    <div className="flex flex-col h-[calc(100dvh-7rem)] sticky top-6 border border-border rounded-lg bg-card overflow-hidden">
      <div className="px-4 py-3 border-b border-border bg-secondary/40">
        <h3 className="font-serif font-semibold text-primary">Discuss your feedback</h3>
        <p className="text-xs text-muted-foreground mt-0.5">
          Ask the tutor about anything in your results.
        </p>
      </div>
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 flex flex-col gap-3 min-h-0">
        {all.length === 0 && (
          <p className="text-sm text-muted-foreground">
            Your feedback summary will appear here. Ask a follow-up question to dig deeper.
          </p>
        )}
        {all.map((m, i) => (
          <div
            key={i}
            className={`rounded-lg px-3 py-2 text-sm max-w-[92%] ${
              m.role === "user"
                ? "bg-primary text-primary-foreground self-end"
                : "bg-secondary/60 self-start"
            }`}
          >
            {m.role === "assistant" ? <MarkdownRenderer content={m.content} /> : m.content}
          </div>
        ))}
        {post.isPending && (
          <div className="self-start bg-secondary/60 rounded-lg px-3 py-2 text-sm text-muted-foreground">
            Thinking…
          </div>
        )}
      </div>
      <div className="border-t border-border p-3 flex gap-2 items-end">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              send();
            }
          }}
          placeholder="Ask about your feedback…"
          className="flex-1 resize-none min-h-[44px] max-h-32 p-2 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
          rows={1}
        />
        <Button onClick={send} disabled={post.isPending || !input.trim()} size="sm">
          Send
        </Button>
      </div>
    </div>
  );
}
