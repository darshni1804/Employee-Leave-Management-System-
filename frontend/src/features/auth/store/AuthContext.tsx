/**
 * AuthContext — React Context providing auth state and actions.
 *
 * Wraps the entire application to allow any component to:
 * - Read the current user and loading state
 * - Call login(), logout(), and refreshUser()
 */
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { User } from "@/types";
import { authService } from "../services/authService";
import { TokenStorage } from "../services/tokenStorage";
import type { AuthState } from "../types";

// ─────────────────────────────────────────
// Context shape
// ─────────────────────────────────────────
interface AuthContextValue extends AuthState {
  login: (email_or_employee_id: string, password: string) => Promise<User>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

// ─────────────────────────────────────────
// Provider
// ─────────────────────────────────────────
interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // On mount, try to restore the session from stored tokens
  useEffect(() => {
    const restoreSession = async () => {
      if (TokenStorage.hasTokens()) {
        try {
          const currentUser = await authService.getMe();
          setUser(currentUser);
        } catch {
          TokenStorage.clear();
          setUser(null);
        }
      }
      setIsLoading(false);
    };

    restoreSession();
  }, []);

  const login = useCallback(async (email_or_employee_id: string, password: string) => {
    const payload = await authService.login({ email_or_employee_id, password });
    TokenStorage.setTokens(payload.access, payload.refresh);
    
    // If backend returns user directly in login payload, set it, else fetch via getMe()
    let currentUser = payload.user;
    if (!currentUser) {
      currentUser = await authService.getMe();
    }
    setUser(currentUser);
    return currentUser;
  }, []);

  const logout = useCallback(async () => {
    const refresh = TokenStorage.getRefreshToken();
    await authService.logout(refresh);
    TokenStorage.clear();
    setUser(null);
  }, []);

  const refreshUser = useCallback(async () => {
    const currentUser = await authService.getMe();
    setUser(currentUser);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated: !!user,
      isLoading,
      login,
      logout,
      refreshUser,
    }),
    [user, isLoading, login, logout, refreshUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// ─────────────────────────────────────────
// Hook
// ─────────────────────────────────────────
export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within <AuthProvider>");
  }
  return context;
}
