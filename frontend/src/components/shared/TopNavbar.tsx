/**
 * TopNavbar — Shared top navigation bar matching Reference Image 3.
 *
 * Specifications:
 * - Height: 72px
 * - Background: White (#FFFFFF)
 * - Bottom border: 1px solid #E5E7EB
 * - Right aligned: Notification Bell (with red badge), User Avatar, User Name, User Role, Dropdown Arrow
 *
 * Dropdown items:
 *   - Profile  → navigate /profile
 *   - Settings → open SettingsModal
 *   - Sign out → logout
 */
import { useState } from "react";
import { LogOut, Menu, Search, Settings, User } from "lucide-react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { useAuth } from "@/features/auth/store/AuthContext";
import { useNavigate } from "react-router-dom";
import { SettingsModal } from "@/features/settings/SettingsModal";
import { NotificationDropdown } from "./NotificationDropdown";

interface TopNavbarProps {
  onToggleSidebar?: () => void;
  sidebarOpen?: boolean;
}

export function TopNavbar({ onToggleSidebar }: TopNavbarProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [settingsOpen, setSettingsOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate("/login", { replace: true });
  };

  const displayName =
    user?.name ||
    (user?.first_name ? `${user.first_name} ${user.last_name}`.trim() : user?.email) ||
    "User";

  const initial =
    user?.first_name?.charAt(0) || user?.email?.charAt(0)?.toUpperCase() || "U";

  return (
    <>
      <header className="sticky top-0 z-30 flex h-[80px] w-full items-center justify-between border-b border-border bg-card/80 px-4 md:px-8 backdrop-blur-md shadow-xs">
        {/* Left Side: Mobile Menu & Search */}
        <div className="flex items-center gap-4 flex-1">
          <button
            onClick={onToggleSidebar}
            className="md:hidden p-2 rounded-xl text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer"
            aria-label="Toggle sidebar"
          >
            <Menu className="h-6 w-6" />
          </button>

          <div className="hidden md:flex max-w-md w-full relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search..."
              className="w-full rounded-[14px] border border-border bg-background pl-10 pr-4 py-2.5 text-sm font-medium text-foreground placeholder:text-muted-foreground focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] focus:outline-none transition-all placeholder:font-normal shadow-xs"
            />
          </div>
        </div>

        {/* Right Side: Actions & Profile */}
        <div className="flex items-center gap-3">
          <NotificationDropdown />

          <div className="h-8 w-px bg-border mx-1 hidden sm:block" />

          {/* Profile Dropdown */}
          <DropdownMenu.Root>
            <DropdownMenu.Trigger asChild>
              <button className="flex items-center gap-3 p-1.5 rounded-full hover:bg-muted transition-colors outline-none cursor-pointer">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#2563EB] to-[#1D4ED8] text-sm font-bold text-white shadow-sm ring-2 ring-white">
                  {initial}
                </div>
                <div className="hidden md:flex flex-col items-start min-w-[100px]">
                  <span className="text-sm font-bold text-foreground leading-tight">
                    {displayName}
                  </span>
                  <span className="text-xs font-semibold text-muted-foreground tracking-wide">
                    {user?.role}
                  </span>
                </div>
              </button>
            </DropdownMenu.Trigger>

            <DropdownMenu.Portal>
              <DropdownMenu.Content
                className="z-50 min-w-[240px] rounded-2xl border border-border bg-card p-2 shadow-xl animate-in fade-in zoom-in-95 data-[side=bottom]:slide-in-from-top-2"
                align="end"
                sideOffset={8}
              >
                {/* Mobile User Info */}
                <div className="md:hidden flex flex-col px-3 py-2 border-b border-border mb-2">
                  <span className="text-sm font-bold text-foreground">
                    {displayName}
                  </span>
                  <span className="text-xs font-semibold text-muted-foreground">
                    {user?.role}
                  </span>
                </div>

                <DropdownMenu.Item
                  onClick={() => navigate("/profile")}
                  className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-semibold text-muted-foreground hover:bg-background hover:text-foreground outline-none cursor-pointer transition-colors"
                >
                  <User className="h-4 w-4" />
                  Profile
                </DropdownMenu.Item>

                <DropdownMenu.Item
                  onClick={() => setSettingsOpen(true)}
                  className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-semibold text-muted-foreground hover:bg-background hover:text-foreground outline-none cursor-pointer transition-colors"
                >
                  <Settings className="h-4 w-4" />
                  Settings
                </DropdownMenu.Item>

                <DropdownMenu.Separator className="my-1.5 h-px bg-muted" />
                
                <DropdownMenu.Item
                  onClick={handleLogout}
                  className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-semibold text-[#EF4444] hover:bg-[#FEF2F2] hover:text-[#DC2626] outline-none cursor-pointer transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                  Sign out
                </DropdownMenu.Item>
              </DropdownMenu.Content>
            </DropdownMenu.Portal>
          </DropdownMenu.Root>
        </div>
      </header>

      {/* Settings Modal */}
      <SettingsModal isOpen={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </>
  );
}
