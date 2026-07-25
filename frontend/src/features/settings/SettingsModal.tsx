/**
 * SettingsModal — Application settings as a modal popup.
 *
 * Opens from the TopNavbar dropdown → Settings.
 * All preferences stored in localStorage (no backend calls).
 *
 * Tabs: General | Notifications | Appearance | Security
 */
import { useState, useEffect, useCallback } from "react";
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
import { cn } from "@/lib/utils";

// ─────────────────────────────────────────
// Settings persistence helpers
// ─────────────────────────────────────────
const SETTINGS_KEY = "tlm_settings";

interface AppSettings {
  theme: "light" | "dark" | "system";
  language: string;
  timezone: string;
  // Notifications
  emailLeaveApproved: boolean;
  emailLeaveRejected: boolean;
  emailLeaveSubmitted: boolean;
  browserNotifications: boolean;
  // Appearance
  compactMode: boolean;
  animations: boolean;
  sidebarCollapsed: boolean;
  density: "comfortable" | "compact" | "spacious";
}

const DEFAULT_SETTINGS: AppSettings = {
  theme: "system",
  language: "en",
  timezone: "Asia/Kolkata",
  emailLeaveApproved: true,
  emailLeaveRejected: true,
  emailLeaveSubmitted: false,
  browserNotifications: false,
  compactMode: false,
  animations: true,
  sidebarCollapsed: false,
  density: "comfortable",
};

function loadSettings(): AppSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

function saveSettings(s: AppSettings) {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(s));
}

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
          "pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform duration-200 mt-0.5",
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
        <p className="text-sm font-medium text-[#111827]">{label}</p>
        {description && (
          <p className="text-xs text-[#94A3B8] mt-0.5">{description}</p>
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
  const [activeTab, setActiveTab] = useState<TabId>("general");
  const [settings, setSettings] = useState<AppSettings>(loadSettings);

  // Persist on change
  useEffect(() => {
    if (isOpen) {
      setSettings(loadSettings());
    }
  }, [isOpen]);

  const update = useCallback(<K extends keyof AppSettings>(key: K, value: AppSettings[K]) => {
    setSettings((prev) => {
      const next = { ...prev, [key]: value };
      saveSettings(next);
      return next;
    });
  }, []);

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
          className="relative w-full max-w-[520px] rounded-2xl border border-[#E5E7EB] bg-white shadow-2xl animate-slide-up overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-[#E5E7EB] px-6 py-4">
            <div>
              <h2 className="font-heading font-bold text-base text-[#111827]">Settings</h2>
              <p className="text-xs text-[#94A3B8] mt-0.5">Manage your preferences</p>
            </div>
            <button
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-xl text-[#64748B] hover:bg-[#F3F4F6] hover:text-[#111827] transition-colors cursor-pointer"
              aria-label="Close settings"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Tab Bar */}
          <div className="flex border-b border-[#E5E7EB] px-4 bg-[#F8FAFC] overflow-x-auto">
            {TABS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-3 text-xs font-semibold whitespace-nowrap border-b-2 transition-colors cursor-pointer",
                  activeTab === id
                    ? "border-[#2563EB] text-[#2563EB]"
                    : "border-transparent text-[#64748B] hover:text-[#111827]"
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
                  <div className="flex items-center gap-1 rounded-xl border border-[#E5E7EB] p-1">
                    {(["light", "dark", "system"] as const).map((t) => {
                      const Icon = t === "light" ? Sun : t === "dark" ? Moon : Monitor;
                      return (
                        <button
                          key={t}
                          onClick={() => update("theme", t)}
                          className={cn(
                            "flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors cursor-pointer capitalize",
                            settings.theme === t
                              ? "bg-[#2563EB] text-white shadow-sm"
                              : "text-[#64748B] hover:bg-[#F3F4F6]"
                          )}
                        >
                          <Icon className="h-3 w-3" />
                          {t}
                        </button>
                      );
                    })}
                  </div>
                </SettingRow>

                <SettingRow label="Language" description="Interface language (coming soon)">
                  <select
                    value={settings.language}
                    onChange={(e) => update("language", e.target.value)}
                    className="rounded-xl border border-[#E5E7EB] bg-[#F8FAFC] px-3 py-1.5 text-xs text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/30 cursor-pointer"
                  >
                    <option value="en">English</option>
                    <option value="hi">Hindi</option>
                    <option value="ta">Tamil</option>
                  </select>
                </SettingRow>

                <SettingRow label="Timezone" description="Your local timezone">
                  <div className="flex items-center gap-2 text-xs text-[#475569]">
                    <Clock className="h-3.5 w-3.5 text-[#94A3B8]" />
                    {settings.timezone}
                  </div>
                </SettingRow>
              </div>
            )}

            {/* ── Notifications ── */}
            {activeTab === "notifications" && (
              <div className="space-y-1">
                <p className="text-xs font-semibold uppercase tracking-wider text-[#94A3B8] mb-2">
                  Email Notifications
                </p>
                <SettingRow label="Leave Approved" description="When a leave request is approved">
                  <Toggle
                    id="emailApproved"
                    checked={settings.emailLeaveApproved}
                    onChange={(v) => update("emailLeaveApproved", v)}
                  />
                </SettingRow>
                <SettingRow label="Leave Rejected" description="When a leave request is rejected">
                  <Toggle
                    id="emailRejected"
                    checked={settings.emailLeaveRejected}
                    onChange={(v) => update("emailLeaveRejected", v)}
                  />
                </SettingRow>
                <SettingRow label="Leave Submitted" description="When a new leave is submitted">
                  <Toggle
                    id="emailSubmitted"
                    checked={settings.emailLeaveSubmitted}
                    onChange={(v) => update("emailLeaveSubmitted", v)}
                  />
                </SettingRow>
                <div className="pt-2">
                  <p className="text-xs font-semibold uppercase tracking-wider text-[#94A3B8] mb-2">
                    Browser Notifications
                  </p>
                </div>
                <SettingRow label="Browser Notifications" description="Push notifications in browser">
                  <Toggle
                    id="browserNotif"
                    checked={settings.browserNotifications}
                    onChange={(v) => update("browserNotifications", v)}
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
                    onChange={(v) => update("compactMode", v)}
                  />
                </SettingRow>
                <SettingRow label="Animations" description="Enable UI transition animations">
                  <Toggle
                    id="animations"
                    checked={settings.animations}
                    onChange={(v) => update("animations", v)}
                  />
                </SettingRow>
                <SettingRow label="Collapse Sidebar" description="Start with sidebar collapsed">
                  <Toggle
                    id="sidebarCollapsed"
                    checked={settings.sidebarCollapsed}
                    onChange={(v) => update("sidebarCollapsed", v)}
                  />
                </SettingRow>
                <SettingRow label="Density" description="Content density preference">
                  <div className="flex items-center gap-1 rounded-xl border border-[#E5E7EB] p-1">
                    {(["compact", "comfortable", "spacious"] as const).map((d) => (
                      <button
                        key={d}
                        onClick={() => update("density", d)}
                        className={cn(
                          "rounded-lg px-2.5 py-1 text-xs font-medium transition-colors cursor-pointer capitalize",
                          settings.density === d
                            ? "bg-[#2563EB] text-white shadow-sm"
                            : "text-[#64748B] hover:bg-[#F3F4F6]"
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
                  <span className="text-xs font-medium text-[#475569]">{lastLogin}</span>
                </SettingRow>
                <SettingRow label="Current Session" description="Active on this device">
                  <div className="flex items-center gap-1.5 text-xs font-medium text-[#16A34A]">
                    <span className="inline-block h-2 w-2 rounded-full bg-[#22C55E]" />
                    Active
                  </div>
                </SettingRow>
                <SettingRow label="Email" description="Registered email address">
                  <span className="text-xs text-[#64748B] max-w-[160px] truncate">{user?.email}</span>
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
                    <span className="ml-auto text-[10px] font-normal text-[#94A3B8]">Coming soon</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between border-t border-[#E5E7EB] bg-[#F8FAFC] px-6 py-3">
            <p className="text-xs text-[#94A3B8]">Changes saved automatically</p>
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
