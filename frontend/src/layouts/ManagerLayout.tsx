/**
 * ManagerLayout — sidebar + topbar layout for manager role.
 *
 * Extra nav: Team Leaves, Approvals
 */
import { Outlet, NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  CalendarDays,
  Users,
  CheckSquare,
  Wallet,
  UserCircle,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/features/auth/store/AuthContext";
import { TechnodhaLogo } from "@/components/shared/TechnodhaLogo";
import { cn } from "@/lib/utils";

const navLinks = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/leaves", label: "My Leaves", icon: CalendarDays },
  { to: "/team/leaves", label: "Team Leaves", icon: Users },
  { to: "/approvals", label: "Approvals", icon: CheckSquare },
  { to: "/balances", label: "Balances", icon: Wallet },
  { to: "/profile", label: "Profile", icon: UserCircle },
];

export function ManagerLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate("/login", { replace: true });
  };

  const displayName = user?.name || (user?.first_name ? `${user.first_name} ${user.last_name}`.trim() : user?.email) || "Manager";

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r bg-card shadow-sm transition-transform duration-300 md:relative md:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-16 items-center border-b px-5">
          <TechnodhaLogo size="md" />
        </div>

        <nav className="flex-1 space-y-1 p-4">
          {navLinks.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 rounded-lg px-3.5 py-2.5 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                )
              }
              onClick={() => setSidebarOpen(false)}
            >
              <Icon className="h-4 w-4" />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="border-t p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary text-sm font-semibold">
              {user?.first_name?.charAt(0) || user?.email?.charAt(0) || "M"}
              {user?.last_name?.charAt(0) || ""}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{displayName}</p>
              <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </button>
        </div>
      </aside>

      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black/40 md:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex h-16 items-center gap-4 border-b bg-card px-6">
          <button className="md:hidden text-muted-foreground hover:text-foreground" onClick={() => setSidebarOpen((v) => !v)} aria-label="Toggle sidebar">
            {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
          
          <div className="flex-1" />

          {/* User Name, Role Badge, Logout */}
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex flex-col items-end">
              <span className="text-sm font-semibold">{displayName}</span>
              <span className="text-xs text-muted-foreground">{user?.email}</span>
            </div>

            <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary uppercase tracking-wider">
              {user?.role || "MANAGER"}
            </span>

            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30 transition-colors"
              title="Sign out"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6 animate-fade-in">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
