/**
 * AdminLayout — Sidebar + TopNavbar layout matching Reference Image 3.
 */
import { useState } from "react";
import { Outlet } from "react-router-dom";
import {
  LayoutDashboard,
  CalendarDays,
  CheckSquare,
  Users,
  Tag,
  BarChart3,
  Settings,
  UserCircle,
} from "lucide-react";
import { Sidebar, type NavItemConfig } from "@/components/shared/Sidebar";
import { TopNavbar } from "@/components/shared/TopNavbar";

const navLinks: NavItemConfig[] = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/leaves", label: "All Leaves", icon: CalendarDays },
  { to: "/approvals", label: "Approvals", icon: CheckSquare },
  { to: "/users", label: "Users", icon: Users },
  { to: "/leave-types", label: "Leave Types", icon: Tag },
  { to: "/reports", label: "Reports", icon: BarChart3 },
  { to: "/settings", label: "Settings", icon: Settings },
  { to: "/profile", label: "Profile", icon: UserCircle, isFilledButton: true },
];

export function AdminLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex h-screen bg-[#F8FAFC] overflow-hidden">
      {/* Sidebar */}
      <Sidebar
        navLinks={navLinks}
        collapsed={collapsed}
        onToggleCollapse={() => setCollapsed((v) => !v)}
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
      />

      {/* Main Container */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top Navbar */}
        <TopNavbar
          sidebarOpen={mobileOpen}
          onToggleSidebar={() => setMobileOpen((v) => !v)}
        />

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8 animate-fade-in">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
