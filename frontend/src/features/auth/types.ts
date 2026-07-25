/**
 * Re-exports global auth-related types from the global types module.
 * Add feature-specific types here as needed.
 */
export type { User, AuthTokens, UserRole } from "@/types";

// ─────────────────────────────────────────
// Local types
// ─────────────────────────────────────────
export interface LoginResponse {
  access: string;
  refresh: string;
}

export interface AuthState {
  user: import("@/types").User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}
