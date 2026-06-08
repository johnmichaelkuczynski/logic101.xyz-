import {
  useListAllPracticeAssignments,
  type PracticeAssignmentSummary,
} from "@workspace/api-client-react";
import { Layout } from "@/components/layout/Layout";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Link } from "wouter";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

function statusStyle(status: string) {
  return status === "submitted"
    ? "bg-primary/10 text-primary"
    : "bg-chart-4/20 text-chart-4";
}

export default function PracticeAssignments() {
  const { data, isLoading } = useListAllPracticeAssignments();

  const grouped = (data ?? []).reduce(
    (acc, p) => {
      (acc[p.weekNumber] ??= []).push(p);
      return acc;
    },
    {} as Record<number, PracticeAssignmentSummary[]>,
  );
  const weeks = Object.keys(grouped)
    .map(Number)
    .sort((a, b) => a - b);

  return (
    <Layout>
      <div className="p-8 max-w-4xl mx-auto w-full flex flex-col gap-8">
        <div>
          <h1 className="text-3xl font-serif font-bold text-primary mb-2">Practice</h1>
          <p className="text-muted-foreground">
            Every practice run you've generated. Resume one in progress, or review the feedback on a
            completed one. Generate new practice from any assignment on the{" "}
            <Link href="/assignments">
              <span className="text-primary underline cursor-pointer">Assignments</span>
            </Link>{" "}
            page.
          </p>
        </div>

        {isLoading ? (
          <div className="flex flex-col gap-4">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
        ) : (data ?? []).length === 0 ? (
          <div className="rounded-lg border border-chart-2/40 bg-chart-2/5 p-8 text-center flex flex-col items-center gap-3">
            <span className="text-4xl">✍️</span>
            <h2 className="font-serif font-semibold text-lg text-foreground">
              No practice runs yet
            </h2>
            <p className="text-sm text-muted-foreground max-w-md">
              Practice versions are fresh, AI-generated problems on the same topics as a graded
              assignment — never repeating the real problems or your past practice. Generate as many
              as you want; each one gives rich feedback and a tutor to talk it through.
            </p>
            <Link href="/assignments">
              <Button className="mt-2">Go to Assignments to start practicing</Button>
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-10">
            {weeks.map((week) => (
              <div key={week} className="flex flex-col gap-4">
                <h2 className="text-2xl font-serif font-semibold border-b pb-2">Week {week}</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {grouped[week].map((p) => (
                    <Card key={p.id} className="flex flex-col justify-between">
                      <CardHeader>
                        <div className="flex justify-between items-start mb-2">
                          <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                            {p.kind} · practice
                          </span>
                          <span
                            className={`text-xs px-2 py-0.5 rounded-full ${statusStyle(p.status)}`}
                          >
                            {p.status.replace("_", " ")}
                          </span>
                        </div>
                        <CardTitle className="text-lg">{p.title}</CardTitle>
                      </CardHeader>
                      <CardContent className="flex flex-col gap-4">
                        <div className="text-sm text-muted-foreground flex gap-4 flex-wrap">
                          <span>{p.problemCount} problems</span>
                          {p.scorePercent !== undefined && p.scorePercent !== null && (
                            <span className="font-semibold text-foreground">
                              Score: {Math.round(p.scorePercent)}%
                            </span>
                          )}
                          <span>{new Date(p.createdAt).toLocaleDateString()}</span>
                        </div>
                        <Link href={`/practice-assignments/${p.id}`}>
                          <Button
                            className="w-full"
                            variant={p.status === "submitted" ? "outline" : "default"}
                          >
                            {p.status === "submitted" ? "Review feedback" : "Resume practice"}
                          </Button>
                        </Link>
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
