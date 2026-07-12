import { GOOGLE_LOGIN_URL, GoogleLoginButton } from "@/lib/auth";

const weeks = [
  {
    n: 1,
    title: "Reasoning & Logical Form",
    blurb: "Statements, validity vs. soundness, fallacies, and translation.",
  },
  {
    n: 2,
    title: "Propositional Logic",
    blurb: "Connectives, truth tables, equivalence, and natural deduction.",
  },
  {
    n: 3,
    title: "Predicate Logic",
    blurb: "Quantifiers, scope, identity, models, and counterexamples.",
  },
  {
    n: 4,
    title: "Metalogic & Beyond",
    blurb: "Soundness, completeness, modal logic, and the limits of decidability.",
  },
];

export default function Landing() {
  return (
    <div className="min-h-[100dvh] bg-background text-foreground">
      <header className="flex items-center justify-between px-6 py-4 max-w-6xl mx-auto w-full">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-primary rounded-md flex items-center justify-center text-primary-foreground font-serif font-bold text-xl">
            ⊢
          </div>
          <span className="font-serif font-semibold text-lg tracking-tight">
            Formal Logic
          </span>
        </div>
        <div className="flex items-center gap-2">
          <a href={GOOGLE_LOGIN_URL}>
            <button className="px-4 py-2 rounded-md text-sm font-medium bg-primary text-primary-foreground hover:opacity-90 transition-opacity">
              Sign in with Google
            </button>
          </a>
        </div>
      </header>

      <main className="max-w-6xl mx-auto w-full px-6">
        <section className="py-20 md:py-28 text-center flex flex-col items-center gap-6">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border bg-secondary text-xs font-medium text-muted-foreground">
            A four-week, self-paced course
          </span>
          <h1 className="text-4xl md:text-6xl font-serif font-bold text-primary max-w-3xl leading-tight">
            Formal Logic
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl">
            From "what makes an argument good?" to soundness, completeness, and
            the limits of decidability. Read the idea, ground it in a real
            argument, then write it in symbols of your own.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 mt-2">
            <GoogleLoginButton label="Continue with Google" />
          </div>
          <p className="font-mono text-sm text-muted-foreground mt-4">
            ∀x (Reasons(x) → Better(x)) &nbsp;·&nbsp; P, P → Q ⊢ Q
          </p>
        </section>

        <section className="pb-24">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {weeks.map((w) => (
              <div
                key={w.n}
                className="rounded-xl border border-card-border bg-card p-6 flex flex-col gap-3"
              >
                <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Week {w.n}
                </span>
                <h3 className="font-serif font-semibold text-lg text-primary">
                  {w.title}
                </h3>
                <p className="text-sm text-muted-foreground">{w.blurb}</p>
              </div>
            ))}
          </div>
        </section>
      </main>

      <footer className="border-t border-border">
        <div className="max-w-6xl mx-auto w-full px-6 py-6 text-sm text-muted-foreground flex items-center justify-between">
          <span>Formal Logic</span>
          <a href={GOOGLE_LOGIN_URL} className="hover:text-foreground">
            Sign in
          </a>
        </div>
      </footer>
    </div>
  );
}
