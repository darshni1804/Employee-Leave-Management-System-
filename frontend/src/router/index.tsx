/**
 * Application router — React Router createBrowserRouter config.
 *
 * Role-Based Route Hierarchy:
 *  /                     → Redirect to /dashboard
 *  /login                → AuthLayout > LoginPage (Public)
 *  /dashboard            → Protected (All authenticated) > RoleBasedDashboardPage
 *  /leaves               → Protected (All authenticated) > LeavesPage (Employee leaves)
 *  /balances             → Protected (All authenticated) > LeavesPage (alias)
 *  /profile              → Protected (All authenticated) > ProfilePage
 *  /approvals, /team/*   → Protected (Manager, Admin only) > ManagerDashboardPage
 *  /users, /reports      → Protected (Admin only) > AdminLayout
 *  /unauthorized         → UnauthorizedPage
 *  *                     → NotFoundPage
 */
import { createBrowserRouter, Navigate } from "react-router-dom";

import { AuthLayout } from "@/layouts/AuthLayout";
import { EmployeeLayout } from "@/layouts/EmployeeLayout";
import { ManagerLayout } from "@/layouts/ManagerLayout";
import { AdminLayout } from "@/layouts/AdminLayout";

import { ProtectedRoute } from "@/components/shared/ProtectedRoute";
import { useAuth } from "@/features/auth/store/AuthContext";

import { LoginPage } from "@/pages/auth/LoginPage";
import { DashboardPage } from "@/pages/dashboard/DashboardPage";
import { ManagerDashboardPage } from "@/pages/manager/ManagerDashboardPage";
import { ManagerTeamLeavesPage } from "@/pages/manager/ManagerTeamLeavesPage";
import { LeavesPage } from "@/pages/leaves/LeavesPage";
import { ProfilePage } from "@/pages/profile/ProfilePage";
import { NotFoundPage } from "@/pages/NotFoundPage";
import { UnauthorizedPage } from "@/pages/UnauthorizedPage";

/**
 * Dynamic layout component that renders the layout matching the authenticated user's role.
 */
function RoleBasedLayout() {
  const { user } = useAuth();

  if (user?.role === "ADMIN") {
    return <AdminLayout />;
  }
  if (user?.role === "MANAGER") {
    return <ManagerLayout />;
  }
  return <EmployeeLayout />;
}

/**
 * Dynamic dashboard component that renders ManagerDashboardPage for MANAGER/ADMIN
 * and DashboardPage for EMPLOYEE.
 */
function RoleBasedDashboardPage() {
  const { user } = useAuth();

  if (user?.role === "MANAGER" || user?.role === "ADMIN") {
    return <ManagerDashboardPage />;
  }
  return <DashboardPage />;
}

export const router = createBrowserRouter([
  // ─────────────────────────────────────────
  // Root redirect
  // ─────────────────────────────────────────
  {
    path: "/",
    element: <Navigate to="/dashboard" replace />,
  },

  // ─────────────────────────────────────────
  // Public auth routes
  // ─────────────────────────────────────────
  {
    element: <AuthLayout />,
    children: [
      { path: "/login", element: <LoginPage /> },
    ],
  },

  // ─────────────────────────────────────────
  // Protected: General Authenticated Routes (Role-based shell)
  // ─────────────────────────────────────────
  {
    element: <ProtectedRoute allowedRoles={["EMPLOYEE", "MANAGER", "ADMIN"]} />,
    children: [
      {
        element: <RoleBasedLayout />,
        children: [
          { path: "/dashboard", element: <RoleBasedDashboardPage /> },
          { path: "/leaves", element: <LeavesPage /> },
          { path: "/balances", element: <LeavesPage /> },
          { path: "/profile", element: <ProfilePage /> },
        ],
      },
    ],
  },

  // ─────────────────────────────────────────
  // Protected: Manager-only Routes (Restricted from Employees)
  // ─────────────────────────────────────────
  {
    element: <ProtectedRoute allowedRoles={["MANAGER", "ADMIN"]} />,
    children: [
      {
        element: <ManagerLayout />,
        children: [
          { path: "/approvals", element: <ManagerDashboardPage /> },
          { path: "/manager/leaves", element: <ManagerTeamLeavesPage /> },
        ],
      },
    ],
  },

  // ─────────────────────────────────────────
  // Protected: Admin-only Routes
  // ─────────────────────────────────────────
  {
    element: <ProtectedRoute allowedRoles={["ADMIN"]} />,
    children: [
      {
        element: <AdminLayout />,
        children: [
          { path: "/users", element: <ManagerDashboardPage /> },
          { path: "/leave-types", element: <LeavesPage /> },
          { path: "/reports", element: <ManagerDashboardPage /> },
          { path: "/settings", element: <ManagerDashboardPage /> },
        ],
      },
    ],
  },

  // ─────────────────────────────────────────
  // Utility pages
  // ─────────────────────────────────────────
  { path: "/unauthorized", element: <UnauthorizedPage /> },
  { path: "*", element: <NotFoundPage /> },
]);
