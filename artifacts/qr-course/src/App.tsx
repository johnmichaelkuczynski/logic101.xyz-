import { useEffect, useRef } from "react";
import {
  ClerkProvider,
  SignIn,
  SignUp,
  Show,
  RedirectToSignIn,
} from "@clerk/react";
import { publishableKeyFromHost } from "@clerk/react/internal";
import { shadcn } from "@clerk/themes";
import {
  Switch,
  Route,
  Redirect,
  useLocation,
  Router as WouterRouter,
} from "wouter";
import { QueryClient, QueryClientProvider, useQueryClient } from "@tanstack/react-query";
import { useClerk } from "@clerk/react";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";

import Landing from "@/pages/Landing";
import Dashboard from "@/pages/Dashboard";
import Assignments from "@/pages/Assignments";
import Analytics from "@/pages/Analytics";
import WeekView from "@/pages/WeekView";
import LectureView from "@/pages/LectureView";
import AssignmentRunner from "@/pages/AssignmentRunner";
import Diagnostics from "@/pages/Diagnostics";
import TopicPractice from "@/pages/TopicPractice";
import PracticeAssignmentRunner from "@/pages/PracticeAssignmentRunner";
import PracticeAssignments from "@/pages/PracticeAssignments";

const queryClient = new QueryClient();

// REQUIRED — resolves the key from window.location.hostname so the same build
// serves multiple Clerk custom domains. Do not inline the env var.
const clerkPubKey = publishableKeyFromHost(
  window.location.hostname,
  import.meta.env.VITE_CLERK_PUBLISHABLE_KEY,
);

// REQUIRED — empty in dev (Clerk hits dev FAPI directly), auto-set in prod.
const clerkProxyUrl = import.meta.env.VITE_CLERK_PROXY_URL;

const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");

function stripBase(path: string): string {
  return basePath && path.startsWith(basePath)
    ? path.slice(basePath.length) || "/"
    : path;
}

if (!clerkPubKey) {
  throw new Error("Missing VITE_CLERK_PUBLISHABLE_KEY in .env file");
}

const clerkAppearance = {
  theme: shadcn,
  cssLayerName: "clerk",
  options: {
    logoPlacement: "inside" as const,
    logoLinkUrl: basePath || "/",
    logoImageUrl: `${window.location.origin}${basePath}/logo.svg`,
    socialButtonsPlacement: "top" as const,
    socialButtonsVariant: "blockButton" as const,
  },
  variables: {
    colorPrimary: "hsl(222 47% 20%)",
    colorForeground: "hsl(222 47% 11%)",
    colorMutedForeground: "hsl(215.4 16.3% 46.9%)",
    colorDanger: "hsl(0 84.2% 60.2%)",
    colorBackground: "hsl(0 0% 100%)",
    colorInput: "hsl(0 0% 100%)",
    colorInputForeground: "hsl(222 47% 11%)",
    colorNeutral: "hsl(214 32% 91%)",
    fontFamily: "'Inter', sans-serif",
    borderRadius: "0.375rem",
  },
  elements: {
    rootBox: "w-full flex justify-center",
    cardBox:
      "bg-white border border-[hsl(214_32%_91%)] shadow-xl rounded-2xl w-[440px] max-w-full overflow-hidden",
    card: "!shadow-none !border-0 !bg-transparent !rounded-none",
    footer: "!shadow-none !border-0 !bg-transparent !rounded-none",
    headerTitle: "text-[hsl(222_47%_11%)] font-serif",
    headerSubtitle: "text-[hsl(215.4_16.3%_46.9%)]",
    socialButtonsBlockButton:
      "border border-[hsl(214_32%_91%)] hover:bg-[hsl(44_20%_96%)]",
    socialButtonsBlockButtonText: "text-[hsl(222_47%_11%)] font-medium",
    dividerLine: "bg-[hsl(214_32%_91%)]",
    dividerText: "text-[hsl(215.4_16.3%_46.9%)]",
    formFieldLabel: "text-[hsl(222_47%_11%)] font-medium",
    formFieldInput:
      "bg-white border border-[hsl(214_32%_88%)] text-[hsl(222_47%_11%)]",
    formButtonPrimary:
      "bg-[hsl(222_47%_20%)] hover:bg-[hsl(222_47%_26%)] text-[hsl(210_40%_98%)] font-medium",
    footerAction: "",
    footerActionText: "text-[hsl(215.4_16.3%_46.9%)]",
    footerActionLink:
      "text-[hsl(222_47%_20%)] hover:text-[hsl(222_47%_30%)] font-medium",
    identityPreviewEditButton: "text-[hsl(222_47%_20%)]",
    formFieldSuccessText: "text-[hsl(222_47%_20%)]",
    alert: "border border-[hsl(214_32%_91%)]",
    alertText: "text-[hsl(222_47%_11%)]",
    otpCodeFieldInput:
      "border border-[hsl(214_32%_88%)] text-[hsl(222_47%_11%)]",
    logoImage: "h-10 w-auto",
  },
};

function SignInPage() {
  return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-background px-4">
      <SignIn
        routing="path"
        path={`${basePath}/sign-in`}
        signUpUrl={`${basePath}/sign-up`}
      />
    </div>
  );
}

function SignUpPage() {
  return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-background px-4">
      <SignUp
        routing="path"
        path={`${basePath}/sign-up`}
        signInUrl={`${basePath}/sign-in`}
      />
    </div>
  );
}

// "/" — signed-in users land in the course (the portal); signed-out see the landing page.
function HomeRoute() {
  return (
    <>
      <Show when="signed-in">
        <Dashboard />
      </Show>
      <Show when="signed-out">
        <Landing />
      </Show>
    </>
  );
}

// Wrap an authenticated-only page; signed-out users are sent to sign-in.
function Protected({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Show when="signed-in">{children}</Show>
      <Show when="signed-out">
        <RedirectToSignIn />
      </Show>
    </>
  );
}

// Invalidate cached queries whenever the signed-in user changes.
function ClerkQueryClientCacheInvalidator() {
  const { addListener } = useClerk();
  const qc = useQueryClient();
  const prevUserIdRef = useRef<string | null | undefined>(undefined);

  useEffect(() => {
    const unsubscribe = addListener(({ user }) => {
      const userId = user?.id ?? null;
      if (
        prevUserIdRef.current !== undefined &&
        prevUserIdRef.current !== userId
      ) {
        qc.clear();
      }
      prevUserIdRef.current = userId;
    });
    return unsubscribe;
  }, [addListener, qc]);

  return null;
}

function ClerkProviderWithRoutes() {
  const [, setLocation] = useLocation();

  return (
    <ClerkProvider
      publishableKey={clerkPubKey}
      proxyUrl={clerkProxyUrl}
      appearance={clerkAppearance}
      signInUrl={`${basePath}/sign-in`}
      signUpUrl={`${basePath}/sign-up`}
      localization={{
        signIn: {
          start: {
            title: "Welcome back",
            subtitle: "Sign in to continue your logic course",
          },
        },
        signUp: {
          start: {
            title: "Create your account",
            subtitle: "Start teaching yourself formal logic",
          },
        },
      }}
      routerPush={(to) => setLocation(stripBase(to))}
      routerReplace={(to) => setLocation(stripBase(to), { replace: true })}
    >
      <QueryClientProvider client={queryClient}>
        <ClerkQueryClientCacheInvalidator />
        <TooltipProvider>
          <Switch>
            <Route path="/" component={HomeRoute} />
            <Route path="/sign-in/*?" component={SignInPage} />
            <Route path="/sign-up/*?" component={SignUpPage} />
            <Route path="/assignments">
              <Protected>
                <Assignments />
              </Protected>
            </Route>
            <Route path="/assignments/:id">
              <Protected>
                <AssignmentRunner />
              </Protected>
            </Route>
            <Route path="/analytics">
              <Protected>
                <Analytics />
              </Protected>
            </Route>
            <Route path="/diagnostics">
              <Protected>
                <Diagnostics />
              </Protected>
            </Route>
            <Route path="/weeks/:weekNumber">
              <Protected>
                <WeekView />
              </Protected>
            </Route>
            <Route path="/lectures/:lectureId">
              <Protected>
                <LectureView />
              </Protected>
            </Route>
            <Route path="/practice/topic/:topicId">
              <Protected>
                <TopicPractice />
              </Protected>
            </Route>
            <Route path="/practice-assignments">
              <Protected>
                <PracticeAssignments />
              </Protected>
            </Route>
            <Route path="/practice-assignments/:id">
              <Protected>
                <PracticeAssignmentRunner />
              </Protected>
            </Route>
            <Route component={NotFound} />
          </Switch>
          <Toaster />
        </TooltipProvider>
      </QueryClientProvider>
    </ClerkProvider>
  );
}

function App() {
  return (
    <WouterRouter base={basePath}>
      <ClerkProviderWithRoutes />
    </WouterRouter>
  );
}

export default App;
