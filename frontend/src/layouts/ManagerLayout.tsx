/**
 * ManagerLayout — Sidebar + TopNavbar layout matching Reference Image 3.
 */
import { useState } from "react";
import { Outlet } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  CheckSquare,
  UserCircle,
} from "lucide-react";
import { Sidebar, type NavItemConfig } from "@/components/shared/Sidebar";
import { TopNavbar } from "@/components/shared/TopNavbar";

const navLinks: NavItemConfig[] = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/team/leaves", label: "Team Leaves", icon: Users },
  { to: "/approvals", label: "Approvals", icon: CheckSquare },
  { to: "/profile", label: "Profile", icon: UserCircle, isFilledButton: true },
];

export function ManagerLayout() {
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
