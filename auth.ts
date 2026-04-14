// ═══════════════════════════════════════════════════════════════════
// Auth Types & Utilities — MERIDIAN OSINT
// User hierarchy, session management, role-based access
// ═══════════════════════════════════════════════════════════════════

export type UserTier = "admin" | "analyst" | "observer" | "guest" | "journalist";

export interface MeridianUser {
  id: string;
  name: string;
  email: string;
  tier: UserTier;
  avatar?: string;
  organization?: string;
  createdAt: string;
  lastLogin: string;
}

// Module access by tier
export const TIER_ACCESS: Record<UserTier, string[]> = {
  admin: ["overview", "sti", "signal", "terrain", "nexus", "lens", "pulse", "foresight", "forge", "press", "alerts", "settings"],
  analyst: ["overview", "sti", "signal", "terrain", "nexus", "lens", "pulse", "foresight", "forge", "press", "alerts"],
  observer: ["overview", "sti", "signal", "terrain", "press"],
  journalist: ["press", "alerts", "terrain"],
  guest: ["overview"],
};

export const TIER_LABELS: Record<UserTier, { label: string; color: string; description: string }> = {
  admin: {
    label: "Administrator",
    color: "#c9a84c",
    description: "Full platform access including settings, user management, and API configuration",
  },
  analyst: {
    label: "Intelligence Analyst",
    color: "#2dd4bf",
    description: "Access to all intelligence modules, report generation, and alert configuration",
  },
  observer: {
    label: "Observer",
    color: "#3a5a7c",
    description: "Read-only access to overview, STI index, signal monitoring, and terrain mapping",
  },
  guest: {
    label: "Guest",
    color: "#71717a",
    description: "Limited access to the operational overview dashboard only",
  },
  journalist: {
    label: "Field Journalist",
    color: "#ef4444",
    description: "Access to field safety dashboard, extraction tools, and geofencing limits",
  },
};

const STORAGE_KEY = "meridian_session";

export function getStoredSession(): MeridianUser | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as MeridianUser;
  } catch {
    return null;
  }
}

export function storeSession(user: MeridianUser): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
}

export function clearSession(): void {
  localStorage.removeItem(STORAGE_KEY);
}

export function canAccessModule(tier: UserTier, moduleId: string): boolean {
  return TIER_ACCESS[tier]?.includes(moduleId) ?? false;
}

// Demo accounts for development
export const DEMO_ACCOUNTS: Record<string, { password: string; user: MeridianUser }> = {
  "admin@meridian.iq": {
    password: import.meta.env.VITE_ADMIN_PASSWORD || "ENCRYPTED_ADMIN_KEY",
    user: {
      id: "usr_001",
      name: "Mohammed Anwer",
      email: "admin@meridian.iq",
      tier: "admin",
      organization: "MERIDIAN Intelligence",
      createdAt: "2026-01-15T00:00:00Z",
      lastLogin: new Date().toISOString(),
    },
  },
  "analyst@meridian.iq": {
    password: import.meta.env.VITE_ANALYST_PASSWORD || "ENCRYPTED_ANALYST_KEY",
    user: {
      id: "usr_002",
      name: "Sara Al-Rashid",
      email: "analyst@meridian.iq",
      tier: "analyst",
      organization: "MERIDIAN Intelligence",
      createdAt: "2026-02-20T00:00:00Z",
      lastLogin: new Date().toISOString(),
    },
  },
  "observer@meridian.iq": {
    password: import.meta.env.VITE_OBSERVER_PASSWORD || "ENCRYPTED_OBSERVER_KEY",
    user: {
      id: "usr_003",
      name: "James Chen",
      email: "observer@meridian.iq",
      tier: "observer",
      organization: "External Affairs",
      createdAt: "2026-03-10T00:00:00Z",
      lastLogin: new Date().toISOString(),
    },
  },
  "press@meridian.iq": {
    password: import.meta.env.VITE_PRESS_PASSWORD || "ENCRYPTED_PRESS_KEY",
    user: {
      id: "usr_004",
      name: "Shelly Kittleson",
      email: "press@meridian.iq",
      tier: "journalist",
      organization: "Independent Press",
      createdAt: "2026-04-10T00:00:00Z",
      lastLogin: new Date().toISOString(),
    },
  },
};
