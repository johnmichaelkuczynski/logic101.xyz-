import type { Request } from "express";

/**
 * Resolve the current user id from the passport session (Google OAuth), or
 * null when no authenticated session is present. Used to scope activity +
 * the evolving per-user profile. Returned as a string because the activity
 * tables store user ids in text columns.
 */
export function getUserId(req: Request): string | null {
  try {
    if (req.isAuthenticated?.() && req.user) {
      return String(req.user.id);
    }
    return null;
  } catch {
    return null;
  }
}
