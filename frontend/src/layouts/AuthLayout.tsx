/**
 * AuthLayout — centered card layout for login and auth pages.
 */
import { Outlet } from "react-router-dom";

export function AuthLayout() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/20 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo / Branding */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground text-xl font-bold shadow-lg">
            E
          </div>
          <h1 className="text-2xl font-bold tracking-tight">ELMS</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Employee Leave Management System
          </p>
        </div>

        {/* Page content injected here */}
        <Outlet />
      </div>
    </div>
  );
}
