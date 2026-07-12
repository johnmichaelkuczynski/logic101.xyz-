import {
  Switch,
  Route,
  Redirect,
  Router as WouterRouter,
} from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import { useAuth, SignInScreen, FullScreenLoader } from "@/lib/auth";

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

const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");

// "/" — signed-in users land in the course (the portal); signed-out see the landing page.
function HomeRoute() {
  const { data, isLoading } = useAuth();
  if (isLoading) return <FullScreenLoader />;
  return data?.authenticated ? <Dashboard /> : <Landing />;
}

// Wrap an authenticated-only page; signed-out users get the Google sign-in screen.
function Protected({ children }: { children: React.ReactNode }) {
  const { data, isLoading } = useAuth();
  if (isLoading) return <FullScreenLoader />;
  if (!data?.authenticated) return <SignInScreen />;
  return <>{children}</>;
}

function Routes() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Switch>
          <Route path="/" component={HomeRoute} />
          {/* Legacy auth URLs from the old provider — send them home. */}
          <Route path="/sign-in/*?">
            <Redirect to="/" />
          </Route>
          <Route path="/sign-up/*?">
            <Redirect to="/" />
          </Route>
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
  );
}

function App() {
  return (
    <WouterRouter base={basePath}>
      <Routes />
    </WouterRouter>
  );
}

export default App;
