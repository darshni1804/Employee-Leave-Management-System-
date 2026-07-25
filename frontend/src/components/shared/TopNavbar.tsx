/**
 * TopNavbar — Shared top navigation bar matching Reference Image 3.
 *
 * Specifications:
 * - Height: 72px
 * - Background: White (#FFFFFF)
 * - Bottom border: 1px solid #E5E7EB
 * - Right aligned: Notification Bell (with red badge), User Avatar, User Name, User Role, Dropdown Arrow
 */
import { useState } from "react";
import { Bell, ChevronDown, LogOut, Menu, X } from "lucide-react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { useAuth } from "@/features/auth/store/AuthContext";
import { useNavigate } from "react-router-dom";

interface TopNavbarProps {
  onToggleSidebar?: () => void;
  sidebarOpen?: boolean;
}

export function TopNavbar({ onToggleSidebar, sidebarOpen }: TopNavbarProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [notificationCount] = useState(3);

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

  const roleDisplay =
    user?.role === "ADMIN"
      ? "Admin"
      : user?.role === "MANAGER"
      ? "Manager"
      : "Employee";

  return (
    <header className="flex h-[72px] items-center justify-between border-b border-[#E5E7EB] bg-white px-6 shrink-0 z-30">
      {/* Mobile Toggle Button */}
      <button
        onClick={onToggleSidebar}
        className="md:hidden text-[#64748B] hover:text-[#111827] transition-colors p-1"
        aria-label="Toggle sidebar"
      >
        {sidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </button>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Right Aligned Items */}
      <div className="flex items-center gap-5">
        {/* Notification Bell with Badge */}
        <div className="relative cursor-pointer p-2 rounded-xl text-[#64748B] hover:text-[#111827] hover:bg-[#F3F4F6] transition-colors">
          <Bell className="h-5 w-5" />
          {notificationCount > 0 && (
            <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#EF4444] text-[10px] font-bold text-white shadow-sm">
              {notificationCount}
            </span>
          )}
        </div>

        {/* User Profile Dropdown Menu */}
        <DropdownMenu.Root>
          <DropdownMenu.Trigger asChild>
            <button className="flex items-center gap-3 rounded-xl p-1.5 hover:bg-[#F3F4F6] transition-colors outline-none cursor-pointer">
              {/* User Avatar */}
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#E2E8F0] text-sm font-semibold text-[#1E293B] shadow-xs">
                {initial}
              </div>

              {/* User Name & Role */}
              <div className="hidden sm:flex flex-col text-left leading-tight">
                <span className="text-sm font-semibold text-[#111827] tracking-tight">
                  {displayName}
                </span>
                <span className="text-xs text-[#64748B] font-normal">
                  {roleDisplay}
                </span>
              </div>

              {/* Dropdown Chevron */}
              <ChevronDown className="h-4 w-4 text-[#64748B] ml-0.5" />
            </button>
          </DropdownMenu.Trigger>

          <DropdownMenu.Portal>
            <DropdownMenu.Content
              className="z-50 min-w-[200px] rounded-xl border border-[#E5E7EB] bg-white p-1.5 shadow-lg animate-fade-in data-[side=bottom]:slide-in-from-top-2"
              sideOffset={6}
              align="end"
            >
              <div className="px-3 py-2 border-b border-[#E5E7EB] mb-1">
                <p className="text-sm font-semibold text-[#111827]">{displayName}</p>
                <p className="text-xs text-[#64748B] truncate">{user?.email}</p>
              </div>

              <DropdownMenu.Item
                onClick={handleLogout}
                className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-[#EF4444] hover:bg-[#FEF2F2] cursor-pointer outline-none transition-colors"
              >
                <LogOut className="h-4 w-4" />
                Sign out
              </DropdownMenu.Item>
            </DropdownMenu.Content>
          </DropdownMenu.Portal>
        </DropdownMenu.Root>
      </div>
    </header>
  );
}
