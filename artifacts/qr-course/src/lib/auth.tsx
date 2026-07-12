import { useQuery } from "@tanstack/react-query";

export type AuthUser = {
  id: number;
  username: string;
  email: string | null;
  displayName: string | null;
};

export type AuthState = {
  authenticated: boolean;
  user: AuthUser | null;
};

// The API server is mounted at the root /api path (not under the app's base
// path), so these URLs are intentionally absolute.
export const GOOGLE_LOGIN_URL = "/api/auth/google";

export function useAuth() {
  return useQuery<AuthState>({
    queryKey: ["auth", "user"],
    queryFn: async () => {
      const res = await fetch("/api/auth/user", { credentials: "include" });
      if (!res.ok) throw new Error("Failed to check authentication");
      return res.json();
    },
    staleTime: 60_000,
    retry: 1,
  });
}

export async function logout(): Promise<void> {
  await fetch("/api/auth/logout", {
    method: "POST",
    credentials: "include",
  });
}

function GoogleGlyph() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}

export function GoogleLoginButton({ label }: { label?: string }) {
  return (
    <a
      href={GOOGLE_LOGIN_URL}
      className="inline-flex items-center justify-center gap-3 px-6 py-3 rounded-md text-base font-medium border border-border bg-white text-[hsl(222_47%_11%)] hover:bg-[hsl(44_20%_96%)] transition-colors shadow-sm"
      data-testid="button-google-login"
    >
      <GoogleGlyph />
      {label ?? "Sign in with Google"}
    </a>
  );
}

/** Full-screen prompt shown when a signed-out visitor hits a protected page. */
export function SignInScreen() {
  return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-background px-4">
      <div className="bg-card border border-border shadow-xl rounded-2xl w-[440px] max-w-full p-8 flex flex-col items-center gap-5 text-center">
        <div className="w-12 h-12 bg-primary rounded-md flex items-center justify-center text-primary-foreground font-serif font-bold text-2xl">
          ⊢
        </div>
        <div>
          <h1 className="font-serif font-semibold text-xl text-primary">
            Welcome to Formal Logic
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Sign in with your Google account to continue the course.
          </p>
        </div>
        <GoogleLoginButton />
      </div>
    </div>
  );
}

export function FullScreenLoader() {
  return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-background">
      <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );
}
