/**
 * SettingsModal — Application settings as a modal popup.
 *
 * Opens from the TopNavbar dropdown → Settings.
 * All preferences stored in localStorage (no backend calls).
 *
 * Tabs: General | Notifications | Appearance | Security
 */
import { useState, useEffect } from "react";
import {
  X,
  Sun,
  Moon,
  Monitor,
  Bell,
  Palette,
  Shield,
  Globe,
  Clock,
  LogOut,
} from "lucide-react";
import { useAuth } from "@/features/auth/store/AuthContext";
import { useSettings } from "./SettingsContext";
import { cn } from "@/lib/utils";

// ─────────────────────────────────────────
// Tab definitions
// ─────────────────────────────────────────
type TabId = "general" | "notifications" | "appearance" | "security";

const TABS: { id: TabId; label: string; icon: React.ElementType }[] = [
  { id: "general", label: "General", icon: Globe },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "appearance", label: "Appearance", icon: Palette },
  { id: "security", label: "Security", icon: Shield },
];

// ─────────────────────────────────────────
// Helper sub-components
// ─────────────────────────────────────────
function Toggle({
  checked,
  onChange,
  id,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  id: string;
}) {
  return (
    <button
      id={id}
      role="switch"
      aria-checked={checked}
      type="button"
      onClick={() => onChange(!checked)}
      className={cn(
        "relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full transition-colors duration-200",
        checked ? "bg-[#2563EB]" : "bg-[#D1D5DB]"
      )}
    >
      <span
        className={cn(
          "pointer-events-none inline-block h-4 w-4 transform rounded-full bg-card shadow-sm transition-transform duration-200 mt-0.5",
          checked ? "translate-x-4.5" : "translate-x-0.5"
        )}
      />
    </button>
  );
}

function SettingRow({
  label,
  description,
  children,
}: {
  label: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-3.5 border-b border-[#F1F5F9] last:border-0">
      <div className="min-w-0">
        <p className="text-sm font-medium text-foreground">{label}</p>
        {description && (
          <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
        )}
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  );
}

// ─────────────────────────────────────────
// Main Modal component
// ─────────────────────────────────────────
interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const { user } = useAuth();
  const { settings, updateSetting } = useSettings();
  const [activeTab, setActiveTab] = useState<TabId>("general");

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const lastLogin = user?.date_joined
    ? new Date(user.date_joined).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "—";

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />

      {/* Modal Card */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className="relative w-full max-w-[520px] rounded-2xl border border-border bg-card shadow-2xl animate-slide-up overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-border px-6 py-4">
            <div>
              <h2 className="font-heading font-bold text-base text-foreground">Settings</h2>
              <p className="text-xs text-muted-foreground mt-0.5">Manage your preferences</p>
            </div>
            <button
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-xl text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer"
              aria-label="Close settings"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Tab Bar */}
          <div className="flex border-b border-border px-4 bg-background overflow-x-auto">
            {TABS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-3 text-xs font-semibold whitespace-nowrap border-b-2 transition-colors cursor-pointer",
                  activeTab === id
                    ? "border-[#2563EB] text-[#2563EB]"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                )}
              >
                <Icon className="h-3.5 w-3.5" />
                {label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="px-6 py-4 max-h-[420px] overflow-y-auto">
            {/* ── General ── */}
            {activeTab === "general" && (
              <div className="space-y-1">
                <SettingRow
                  label="Theme"
                  description="Choose your preferred colour scheme"
                >
                  <div className="flex items-center gap-1 rounded-xl border border-border p-1">
                    {(["light", "dark", "system"] as const).map((t) => {
                      const Icon = t === "light" ? Sun : t === "dark" ? Moon : Monitor;
                      return (
                        <button
                          key={t}
                          onClick={() => updateSetting("theme", t)}
                          className={cn(
                            "flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors cursor-pointer capitalize",
                            settings.theme === t
                              ? "bg-[#2563EB] text-white shadow-sm"
                              : "text-muted-foreground hover:bg-muted"
                          )}
                        >
                          <Icon className="h-3 w-3" />
                          {t}
                        </button>
                      );
                    })}
                  </div>
                </SettingRow>



                <SettingRow label="Timezone" description="Your local timezone">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                    {settings.timezone}
                  </div>
                </SettingRow>
              </div>
            )}

            {/* ── Notifications ── */}
            {activeTab === "notifications" && (
              <div className="space-y-1">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                  Email Notifications
                </p>
                <SettingRow label="Leave Approved" description="When a leave request is approved">
                  <Toggle
                    id="emailApproved"
                    checked={settings.emailLeaveApproved}
                    onChange={(v) => updateSetting("emailLeaveApproved", v)}
                  />
                </SettingRow>
                <SettingRow label="Leave Rejected" description="When a leave request is rejected">
                  <Toggle
                    id="emailRejected"
                    checked={settings.emailLeaveRejected}
                    onChange={(v) => updateSetting("emailLeaveRejected", v)}
                  />
                </SettingRow>
                <SettingRow label="Leave Submitted" description="When a new leave is submitted">
                  <Toggle
                    id="emailSubmitted"
                    checked={settings.emailLeaveSubmitted}
                    onChange={(v) => updateSetting("emailLeaveSubmitted", v)}
                  />
                </SettingRow>
                <div className="pt-2">
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                    Browser Notifications
                  </p>
                </div>
                <SettingRow label="Browser Notifications" description="Push notifications in browser">
                  <Toggle
                    id="browserNotif"
                    checked={settings.browserNotifications}
                    onChange={(v) => updateSetting("browserNotifications", v)}
                  />
                </SettingRow>
              </div>
            )}

            {/* ── Appearance ── */}
            {activeTab === "appearance" && (
              <div className="space-y-1">
                <SettingRow label="Compact Mode" description="Reduce padding and spacing">
                  <Toggle
                    id="compactMode"
                    checked={settings.compactMode}
                    onChange={(v) => updateSetting("compactMode", v)}
                  />
                </SettingRow>
                <SettingRow label="Animations" description="Enable UI transition animations">
                  <Toggle
                    id="animations"
                    checked={settings.animations}
                    onChange={(v) => updateSetting("animations", v)}
                  />
                </SettingRow>
                <SettingRow label="Collapse Sidebar" description="Start with sidebar collapsed">
                  <Toggle
                    id="sidebarCollapsed"
                    checked={settings.sidebarCollapsed}
                    onChange={(v) => updateSetting("sidebarCollapsed", v)}
                  />
                </SettingRow>
                <SettingRow label="Density" description="Content density preference">
                  <div className="flex items-center gap-1 rounded-xl border border-border p-1">
                    {(["compact", "comfortable", "spacious"] as const).map((d) => (
                      <button
                        key={d}
                        onClick={() => updateSetting("density", d)}
                        className={cn(
                          "rounded-lg px-2.5 py-1 text-xs font-medium transition-colors cursor-pointer capitalize",
                          settings.density === d
                            ? "bg-[#2563EB] text-white shadow-sm"
                            : "text-muted-foreground hover:bg-muted"
                        )}
                      >
                        {d}
                      </button>
                    ))}
                  </div>
                </SettingRow>
              </div>
            )}

            {/* ── Security ── */}
            {activeTab === "security" && (
              <div className="space-y-1">
                <SettingRow label="Last Login" description="Your most recent sign-in">
                  <span className="text-xs font-medium text-muted-foreground">{lastLogin}</span>
                </SettingRow>
                <SettingRow label="Current Session" description="Active on this device">
                  <div className="flex items-center gap-1.5 text-xs font-medium text-[#16A34A]">
                    <span className="inline-block h-2 w-2 rounded-full bg-[#22C55E]" />
                    Active
                  </div>
                </SettingRow>
                <SettingRow label="Email" description="Registered email address">
                  <span className="text-xs text-muted-foreground max-w-[160px] truncate">{user?.email}</span>
                </SettingRow>
                <SettingRow label="Role" description="Your access level">
                  <span className="text-xs font-semibold text-[#2563EB]">
                    {user?.role ?? "Employee"}
                  </span>
                </SettingRow>
                <div className="pt-4">
                  <button
                    type="button"
                    disabled
                    className="flex items-center gap-2 rounded-xl border border-[#FECACA] bg-[#FEF2F2] px-4 py-2.5 text-sm font-medium text-[#DC2626] opacity-60 cursor-not-allowed w-full justify-center"
                    title="Coming soon"
                  >
                    <LogOut className="h-4 w-4" />
                    Logout All Devices
                    <span className="ml-auto text-[10px] font-normal text-muted-foreground">Coming soon</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between border-t border-border bg-background px-6 py-3">
            <p className="text-xs text-muted-foreground">Changes saved automatically</p>
            <button
              onClick={onClose}
              className="rounded-xl bg-[#2563EB] px-5 py-2 text-xs font-semibold text-white hover:bg-[#1D4ED8] transition-colors cursor-pointer"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
