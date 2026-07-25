/**
 * ProtectedRoute — Route guard with authentication and role checking.
 *
 * Usage:
 *   <ProtectedRoute>                          // any authenticated user
 *   <ProtectedRoute allowedRoles={["ADMIN"]}> // admins only
 */
import { Navigate, Outlet, useLocation } from "react-router-dom";
import type { UserRole } from "@/types";
import { useAuth } from "@/features/auth/store/AuthContext";
import { FullPageLoader } from "./LoadingSpinner";

interface ProtectedRouteProps {
  /** If provided, only users with these roles can access */
  allowedRoles?: UserRole[];
  /** Redirect path when unauthenticated (default: /login) */
  redirectTo?: string;
  /** Redirect path when authenticated but unauthorised (default: /unauthorized) */
  unauthorizedRedirectTo?: string;
}

export function ProtectedRoute({
  allowedRoles,
  redirectTo = "/login",
  unauthorizedRedirectTo = "/unauthorized",
}: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, user } = useAuth();
  const location = useLocation();

  // Show spinner while checking auth state
  if (isLoading) {
    return <FullPageLoader />;
  }

  // Not authenticated → redirect to login
  if (!isAuthenticated) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  // Role check — if roles specified, verify the user has one of them
  if (allowedRoles && allowedRoles.length > 0 && user) {
    if (!allowedRoles.includes(user.role)) {
      return <Navigate to={unauthorizedRedirectTo} replace />;
    }
  }

  return <Outlet />;
}
