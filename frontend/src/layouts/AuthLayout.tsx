/**
 * AuthLayout — centered card layout for login and auth pages.
 */
import { Outlet } from "react-router-dom";

export function AuthLayout() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/20 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Page content injected here */}
        <Outlet />
      </div>
    </div>
  );
}
