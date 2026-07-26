/**
 * ManagerLayout — Sidebar + TopNavbar layout matching Reference Image 3.
 * Nav: Dashboard | Leave Requests | Profile
 */
import { useState } from "react";
import { Outlet } from "react-router-dom";
import {
  LayoutDashboard,
  ClipboardList,
  UserCircle,
} from "lucide-react";
import { Sidebar } from "@/components/shared/Sidebar";
import { TopNavbar } from "@/components/shared/TopNavbar";
import { useSettings } from "@/features/settings/SettingsContext";

export function ManagerLayout() {
  const { settings, updateSetting } = useSettings();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navLinks = [
    { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { to: "/manager/leaves", label: "Team Leave Requests", icon: ClipboardList },
    { to: "/profile", label: "Profile", icon: UserCircle, isFilledButton: true },
  ];

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Sidebar */}
      <Sidebar
        navLinks={navLinks}
        collapsed={settings.sidebarCollapsed}
        onToggleCollapse={() => updateSetting("sidebarCollapsed", !settings.sidebarCollapsed)}
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

        <main className="flex-1 overflow-y-auto p-4 md:p-6 animate-fade-in">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
