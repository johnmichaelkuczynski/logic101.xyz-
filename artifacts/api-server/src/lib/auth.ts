import { getAuth } from "@clerk/express";
import type { Request } from "express";

/**
 * Resolve the current Clerk user id from the request, or null when no
 * authenticated session is present. Used to scope activity + the evolving
 * per-user profile.
 */
export function getUserId(req: Request): string | null {
  try {
    return getAuth(req).userId ?? null;
  } catch {
    return null;
  }
}
