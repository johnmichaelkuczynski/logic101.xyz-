import React from "react";
import {
  useListAssignments,
  useGetAssignmentReadiness,
  useCreatePracticeAssignment,
} from "@workspace/api-client-react";
import { Layout } from "@/components/layout/Layout";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Link } from "wouter";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

const READY_STYLES: Record<string, { label: string; cls: string }> = {
  ready: { label: "Ready", cls: "bg-chart-2/15 text-chart-2" },
  almost: { label: "Almost ready", cls: "bg-chart-4/20 text-chart-4" },
  not_ready: { label: "Keep practicing", cls: "bg-destructive/10 text-destructive" },
  untested: { label: "Not yet practiced", cls: "bg-secondary text-secondary-foreground" },
};

function ReadinessRow({ assignmentId }: { assignmentId: number }) {
  const { data } = useGetAssignmentReadiness(assignmentId, {
    query: { queryKey: ["readiness", assignmentId] },
  });
  if (!data) return null;
  const style = READY_STYLES[data.readyLabel] ?? READY_STYLES.untested;
  return (
    <div className="flex flex-col gap-2 rounded-md bg-secondary/30 p-3">
      <div className="flex items-center justify-between">
        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${style.cls}`}>
          {style.label}
        </span>
        <span className="text-xs text-muted-foreground">{data.readinessPercent}% ready</span>
      </div>
      <p className="text-xs text-muted-foreground leading-snug">{data.summary}</p>
      {data.perTopic.filter((t) => t.pointer).slice(0, 2).map((t) => (
        <div key={t.topicId} className="text-xs flex gap-1.5">
          <span className="text-chart-4 font-bold">→</span>
          <span>
            <strong>{t.topicTitle}:</strong> {t.pointer}
          </span>
        </div>
      ))}
    </div>
  );
}

function PracticeButton({ assignmentId, submitted }: { assignmentId: number; submitted: boolean }) {
  const create = useCreatePracticeAssignment();
  const handleClick = () => {
    create.mutate(
      { data: { sourceAssignmentId: assignmentId } },
      {
        onSuccess: (data) => {
          window.location.href = `${import.meta.env.BASE_URL}practice-assignments/${data.id}`;
        },
      },
    );
  };
  return (
    <Button
      variant={submitted ? "default" : "outline"}
      className="w-full border-chart-2/60 text-chart-2 hover:bg-chart-2/10"
      onClick={handleClick}
      disabled={create.isPending}
    >
      {create.isPending ? "Generating…" : submitted ? "Generate another practice" : "Practice first (unlimited)"}
    </Button>
  );
}

export default function Assignments() {
  const { data: assignments, isLoading } = useListAssignments();

  // Group by week
  const grouped = assignments?.reduce((acc, a) => {
    if (!acc[a.weekNumber]) acc[a.weekNumber] = [];
    acc[a.weekNumber].push(a);
    return acc;
  }, {} as Record<number, typeof assignments>);

  return (
    <Layout>
      <div className="p-8 max-w-4xl mx-auto w-full flex flex-col gap-8">
        <div>
          <h1 className="text-3xl font-serif font-bold text-primary mb-2">Assignments</h1>
          <p className="text-muted-foreground">Complete your homework, tests, midterm, and final exams.</p>
        </div>

        <div className="rounded-lg border border-chart-2/40 bg-chart-2/5 p-4 flex items-start gap-3">
          <span className="text-2xl leading-none">✍️</span>
          <div>
            <h2 className="font-serif font-semibold text-foreground">Practice as much as you want</h2>
            <p className="text-sm text-muted-foreground">
              Before each graded assignment, generate unlimited practice versions — fresh problems on the same
              topics, never repeated. You get rich feedback, a live tutor, and a dialogue to discuss your results.
              The more you practice, the more your readiness pointers sharpen.
            </p>
          </div>
        </div>

        {isLoading ? (
          <div className="flex flex-col gap-6">
            <Skeleton className="h-8 w-32" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
        ) : (
          <div className="flex flex-col gap-10">
            {Object.entries(grouped || {}).map(([week, items]) => (
              <div key={week} className="flex flex-col gap-4">
                <h2 className="text-2xl font-serif font-semibold border-b pb-2">Week {week}</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {items.map((item) => (
                    <Card key={item.id} className="flex flex-col justify-between">
                      <CardHeader>
                        <div className="flex justify-between items-start mb-2">
                          <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                            {item.kind}
                          </span>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${
                            item.status === 'submitted' ? 'bg-primary/10 text-primary' :
                            item.status === 'in_progress' ? 'bg-chart-4/20 text-chart-4' :
                            'bg-secondary text-secondary-foreground'
                          }`}>
                            {item.status.replace('_', ' ')}
                          </span>
                        </div>
                        <CardTitle className="text-lg">{item.title}</CardTitle>
                      </CardHeader>
                      <CardContent className="flex flex-col gap-4">
                        <div className="text-sm text-muted-foreground flex gap-4">
                          <span>{item.problemCount} problems</span>
                          {item.isTimed && <span>⏱️ {item.timeLimitMinutes} min</span>}
                          {item.bestScore !== undefined && item.bestScore !== null && (
                            <span className="font-semibold text-foreground">Score: {item.bestScore}%</span>
                          )}
                        </div>
                        <ReadinessRow assignmentId={item.id} />
                        <div className="flex flex-col gap-2">
                          <PracticeButton assignmentId={item.id} submitted={item.status === 'submitted'} />
                          <Link href={`/assignments/${item.id}`}>
                            <Button className="w-full" variant={item.status === 'submitted' ? "outline" : "default"}>
                              {item.status === 'submitted' ? 'Review Results' :
                               item.status === 'in_progress' ? 'Resume graded' : 'Start graded'}
                            </Button>
                          </Link>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
