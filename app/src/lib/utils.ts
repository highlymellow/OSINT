import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getStatusColor(status: string): string {
  switch (status?.toUpperCase()) {
    case "STABLE": return "text-green-500";
    case "LOW": return "text-emerald-400";
    case "ELEVATED": return "text-yellow-500";
    case "HIGH": return "text-orange-500";
    case "CRITICAL": return "text-red-500";
    default: return "text-gray-400";
  }
}

export function getStatusBg(status: string): string {
  switch (status?.toUpperCase()) {
    case "STABLE": return "bg-green-500/10 border-green-500/30";
    case "LOW": return "bg-emerald-400/10 border-emerald-400/30";
    case "ELEVATED": return "bg-yellow-500/10 border-yellow-500/30";
    case "HIGH": return "bg-orange-500/10 border-orange-500/30";
    case "CRITICAL": return "bg-red-500/10 border-red-500/30";
    default: return "bg-gray-500/10 border-gray-500/30";
  }
}

export function formatTimestamp(ts: string): string {
  const d = new Date(ts);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  const hours = Math.floor(diff / (1000 * 60 * 60));
  if (hours < 1) return `${Math.floor(diff / (1000 * 60))}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (hours < 48) return "Yesterday";
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function getSeverityColor(sev: string): string {
  switch (sev) {
    case "critical": return "text-red-400";
    case "high": return "text-orange-400";
    case "medium": return "text-yellow-400";
    case "low": return "text-emerald-400";
    default: return "text-gray-400";
  }
}
