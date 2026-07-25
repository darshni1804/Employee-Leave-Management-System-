import { createContext, useContext, useEffect, useState } from "react";

const SETTINGS_KEY = "tlm_settings";

export interface AppSettings {
  theme: "light" | "dark" | "system";
  timezone: string;
  emailLeaveApproved: boolean;
  emailLeaveRejected: boolean;
  emailLeaveSubmitted: boolean;
  browserNotifications: boolean;
  compactMode: boolean;
  animations: boolean;
  sidebarCollapsed: boolean;
  density: "comfortable" | "compact" | "spacious";
}

const DEFAULT_SETTINGS: AppSettings = {
  theme: "system",
  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "Asia/Kolkata",
  emailLeaveApproved: true,
  emailLeaveRejected: true,
  emailLeaveSubmitted: false,
  browserNotifications: false,
  compactMode: false,
  animations: true,
  sidebarCollapsed: false,
  density: "comfortable",
};

interface SettingsContextType {
  settings: AppSettings;
  updateSetting: <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<AppSettings>(() => {
    try {
      const raw = localStorage.getItem(SETTINGS_KEY);
      if (!raw) return DEFAULT_SETTINGS;
      return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
    } catch {
      return DEFAULT_SETTINGS;
    }
  });

  const updateSetting = <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => {
    setSettings((prev) => {
      const next = { ...prev, [key]: value };
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(next));
      return next;
    });
  };

  // Sync settings with DOM
  useEffect(() => {
    const root = document.documentElement;
    
    // Theme
    if (
      settings.theme === "dark" ||
      (settings.theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches)
    ) {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }

    // Density / Compact Mode
    root.classList.remove("density-compact", "density-spacious", "density-comfortable");
    if (settings.compactMode) {
      root.classList.add("density-compact");
    } else {
      root.classList.add(`density-${settings.density}`);
    }

    // Animations
    if (!settings.animations) {
      root.classList.add("no-animations");
    } else {
      root.classList.remove("no-animations");
    }
  }, [settings]);

  // Request browser notifications permission if enabled
  useEffect(() => {
    if (settings.browserNotifications && "Notification" in window) {
      if (Notification.permission !== "granted" && Notification.permission !== "denied") {
        Notification.requestPermission().then((perm) => {
          if (perm !== "granted") {
            updateSetting("browserNotifications", false);
          }
        });
      } else if (Notification.permission === "denied") {
        // Fallback to false if user had denied it before
        updateSetting("browserNotifications", false);
      }
    }
  }, [settings.browserNotifications]);

  return (
    <SettingsContext.Provider value={{ settings, updateSetting }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error("useSettings must be used within a SettingsProvider");
  }
  return context;
}
