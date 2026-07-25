/**
 * Application router — React Router createBrowserRouter config.
 *
 * Role-Based Route Hierarchy:
 *  /                     → Redirect to /dashboard
 *  /login                → AuthLayout > LoginPage (Public)
 *  /dashboard, /leaves   → Protected (All authenticated) > RoleBasedLayout (Employee/Manager/Admin)
 *  /approvals, /team/*   → Protected (Manager, Admin only) > ManagerLayout
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
import { LeavesPage } from "@/pages/leaves/LeavesPage";
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
          { path: "/dashboard", element: <DashboardPage /> },
          { path: "/leaves", element: <LeavesPage /> },
          { path: "/balances", element: <LeavesPage /> },
          { path: "/profile", element: <DashboardPage /> },
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
          { path: "/approvals", element: <LeavesPage /> },
          { path: "/team/leaves", element: <LeavesPage /> },
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
          { path: "/users", element: <DashboardPage /> },
          { path: "/leave-types", element: <LeavesPage /> },
          { path: "/reports", element: <DashboardPage /> },
          { path: "/settings", element: <DashboardPage /> },
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
