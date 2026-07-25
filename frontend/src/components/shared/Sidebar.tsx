/**
 * Sidebar — Unified Sidebar component matching Reference Image 3.
 *
 * Specifications:
 * - Width: 280px (expanded), 76px (collapsed)
 * - White background, right border 1px solid #E5E7EB
 * - Header: Technodha Logo (expanded) or LM icon (collapsed)
 * - Navigation item height: 52px, padding: 16px, gap: 12px, icon: 22px, radius: 14px
 * - Active item styling: Light blue background #F4F8FF + left indicator bar or filled blue pill
 */
import { NavLink } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { TechnodhaLogo } from "./TechnodhaLogo";
import { cn } from "@/lib/utils";

export interface NavItemConfig {
  to: string;
  label: string;
  icon: React.ElementType;
  isFilledButton?: boolean;
}

interface SidebarProps {
  navLinks: NavItemConfig[];
  collapsed: boolean;
  onToggleCollapse: () => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

export function Sidebar({
  navLinks,
  collapsed,
  onToggleCollapse,
  mobileOpen,
  onCloseMobile,
}: SidebarProps) {
  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 md:hidden backdrop-blur-xs"
          onClick={onCloseMobile}
        />
      )}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex flex-col border-r border-[#E5E7EB] bg-white transition-all duration-200 ease-out md:relative shrink-0 shadow-xs",
          collapsed ? "w-[76px]" : "w-[280px]",
          mobileOpen ? "translate-x-0 w-[280px]" : "-translate-x-full md:translate-x-0"
        )}
      >
        {/* Sidebar Header with TECHNODHA LEAVEMATE Logo */}
        <div className="flex h-[80px] items-center justify-center border-b border-[#E5E7EB] px-4 shrink-0 relative">
          <TechnodhaLogo collapsed={collapsed} />

          {/* Desktop Collapse Toggle Handle */}
          <button
            onClick={onToggleCollapse}
            className="hidden md:flex absolute -right-3 top-1/2 -translate-y-1/2 h-6 w-6 items-center justify-center rounded-full border border-[#E5E7EB] bg-white text-[#64748B] hover:text-[#111827] hover:bg-[#F3F4F6] shadow-xs transition-colors z-10 cursor-pointer"
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? (
              <ChevronRight className="h-3.5 w-3.5" />
            ) : (
              <ChevronLeft className="h-3.5 w-3.5" />
            )}
          </button>
        </div>

        {/* Navigation List */}
        <nav className="flex-1 space-y-1.5 p-4 overflow-y-auto">
          {navLinks.map(({ to, label, icon: Icon, isFilledButton }) => (
            <NavLink
              key={to}
              to={to}
              onClick={onCloseMobile}
              className={({ isActive }) => {
                // Filled button style (e.g. Profile or primary action button)
                if (isFilledButton) {
                  return cn(
                    "flex h-[52px] items-center gap-3 rounded-[14px] px-4 font-semibold text-sm transition-colors cursor-pointer shadow-xs",
                    isActive
                      ? "bg-[#2563EB] text-white"
                      : "bg-[#2563EB] text-white hover:bg-[#1D4ED8]"
                  );
                }

                // Standard nav item
                return cn(
                  "relative flex h-[52px] items-center gap-3 rounded-[14px] px-4 font-medium text-sm transition-all duration-180 cursor-pointer",
                  isActive
                    ? "bg-[#F4F8FF] text-[#2563EB] font-semibold"
                    : "text-[#475569] hover:bg-[#F3F4F6] hover:text-[#111827]"
                );
              }}
            >
              {({ isActive }) => (
                <>
                  {/* Left Indicator Bar for Active state */}
                  {isActive && !isFilledButton && (
                    <span className="absolute left-0 top-1/2 -translate-y-1/2 h-7 w-1.5 rounded-r-full bg-[#2563EB]" />
                  )}

                  {/* Icon (22px) */}
                  <Icon
                    className={cn(
                      "h-[22px] w-[22px] shrink-0 transition-colors",
                      isActive && !isFilledButton
                        ? "text-[#2563EB]"
                        : isFilledButton
                        ? "text-white"
                        : "text-[#64748B]"
                    )}
                  />

                  {/* Label (hidden when collapsed) */}
                  {!collapsed && (
                    <span className="truncate tracking-tight">{label}</span>
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>
      </aside>
    </>
  );
}
