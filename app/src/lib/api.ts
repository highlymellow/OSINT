// ═══════════════════════════════════════════════════════════════════
// MERIDIAN — API Client Layer
// src/lib/api.ts
// ═══════════════════════════════════════════════════════════════════
// Bridge between UI components and backend.
// When VITE_API_URL is set → fetches from FastAPI
// When not set → falls back to simulated data in data.ts
// ═══════════════════════════════════════════════════════════════════

import type { STIScore, Event, Actor, GovernorateSTI, TimeSeriesPoint, ConflictForecast, DisplacementPrediction, ScenarioModel, Report, SatTemplate, EvidenceItem, PlatformStat, Narrative, CoordinatedCampaign, MediaCredibility, EconomicIndicator, EnergySectorData, InvestmentRisk, TradeFlow } from "./types";
import {
  currentSTI,
  recentEvents,
  governorateScores,
  stiTimeSeries,
  conflictForecasts,
  displacementPredictions,
  scenarioModels,
  reports,
  satTemplates,
  evidenceItems,
  platformStats,
  trendingNarratives,
  coordinatedCampaigns,
  mediaCredibility,
  economicIndicators,
  energySectorData,
  investmentRisks,
  tradeFlows,
} from "./data";

// ── Configuration ───────────────────────────────────────────────
const API_BASE = import.meta.env.VITE_API_URL || "";
const IS_LIVE = !!API_BASE;

// ── Fetch Wrapper ───────────────────────────────────────────────
async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  if (!IS_LIVE) {
    throw new Error("API not live — use simulated fallback");
  }

  const url = `${API_BASE}${path}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });

  if (!res.ok) {
    throw new Error(`API error: ${res.status} ${res.statusText}`);
  }

  return res.json();
}

// ── STI API ─────────────────────────────────────────────────────

export async function fetchCurrentSTI(location: string = "IQ"): Promise<STIScore> {
  try {
    if (IS_LIVE) {
      const data = await apiFetch<STIScore>(`/api/v1/sti/current?location=${location}`);
      return data;
    }
  } catch {
    // Fall through to simulated
  }
  return currentSTI;
}

export async function fetchGovernorateScores(): Promise<GovernorateSTI[]> {
  try {
    if (IS_LIVE) {
      return await apiFetch<GovernorateSTI[]>("/api/v1/sti/governorates");
    }
  } catch {
    // Fall through
  }
  return governorateScores;
}

export async function fetchSTIHistory(
  location: string = "IQ",
  period: string = "30d"
): Promise<TimeSeriesPoint[]> {
  try {
    if (IS_LIVE) {
      const data = await apiFetch<{ points: TimeSeriesPoint[] }>(
        `/api/v1/sti/history?location=${location}&period=${period}`
      );
      return data.points;
    }
  } catch {
    // Fall through
  }
  return stiTimeSeries;
}

// ── Events API ──────────────────────────────────────────────────

export async function fetchEvents(params?: {
  limit?: number;
  type?: string;
  severity?: string;
  governorate?: string;
  stiOnly?: boolean;
  verifiedOnly?: boolean;
}): Promise<Event[]> {
  try {
    if (IS_LIVE) {
      const searchParams = new URLSearchParams();
      if (params?.limit) searchParams.set("limit", String(params.limit));
      if (params?.type) searchParams.set("type", params.type);
      if (params?.severity) searchParams.set("severity", params.severity);
      if (params?.governorate) searchParams.set("governorate", params.governorate);
      if (params?.stiOnly) searchParams.set("sti_only", "true");
      if (params?.verifiedOnly) searchParams.set("verified_only", "true");

      return await apiFetch<Event[]>(`/api/v1/events?${searchParams.toString()}`);
    }
  } catch {
    // Fall through
  }
  return recentEvents;
}

// ── Actors API ──────────────────────────────────────────────────

export async function fetchActors(params?: {
  search?: string;
  type?: string;
  risk?: string;
}): Promise<Actor[]> {
  try {
    if (IS_LIVE) {
      const searchParams = new URLSearchParams();
      if (params?.search) searchParams.set("search", params.search);
      if (params?.type) searchParams.set("type", params.type);
      if (params?.risk) searchParams.set("risk", params.risk);
      return await apiFetch<Actor[]>(`/api/v1/actors?${searchParams.toString()}`);
    }
  } catch {
    // Fall through to real local data
  }

  // Real Iraqi armed groups network data (from lib/networks.ts)
  const { networkNodes } = await import("./networks");
  const mapped: Actor[] = networkNodes.map(n => ({
    id: n.id,
    name: n.name,
    nameAr: n.nameAr as string | undefined,
    type: n.type as any,
    category: n.category as any,
    riskLevel: n.riskLevel as any,
    description: n.description,
    connections: n.connections,
    affiliation: n.category,
    lastActive: n.lastActive || "2026-04",
    country: "IQ",
  }));

  return mapped.filter(a => {
    if (params?.search) {
      const q = params.search.toLowerCase();
      if (!a.name.toLowerCase().includes(q) && !(a.nameAr || "").includes(q)) return false;
    }
    if (params?.type && a.type !== params.type) return false;
    if (params?.risk && a.riskLevel !== params.risk) return false;
    return true;
  });
}

// ── Foresight API ───────────────────────────────────────────────

export async function fetchConflictForecasts(): Promise<ConflictForecast[]> {
  try {
    if (IS_LIVE) return await apiFetch<ConflictForecast[]>("/api/v1/foresight/conflict-forecasts");
  } catch {}
  return conflictForecasts;
}

export async function fetchDisplacementPredictions(): Promise<DisplacementPrediction[]> {
  try {
    if (IS_LIVE) return await apiFetch<DisplacementPrediction[]>("/api/v1/foresight/displacement-predictions");
  } catch {}
  return displacementPredictions;
}

export async function fetchScenarioModels(): Promise<ScenarioModel[]> {
  try {
    if (IS_LIVE) return await apiFetch<ScenarioModel[]>("/api/v1/foresight/scenario-models");
  } catch {}
  return scenarioModels;
}

// ── Forge API ───────────────────────────────────────────────────

export async function fetchReports(): Promise<Report[]> {
  try {
    if (IS_LIVE) return await apiFetch<Report[]>("/api/v1/forge/reports");
  } catch {}
  return reports;
}

export async function fetchSatTemplates(): Promise<SatTemplate[]> {
  try {
    if (IS_LIVE) return await apiFetch<SatTemplate[]>("/api/v1/forge/sat-templates");
  } catch {}
  return satTemplates;
}

export async function fetchEvidenceItems(): Promise<EvidenceItem[]> {
  try {
    if (IS_LIVE) return await apiFetch<EvidenceItem[]>("/api/v1/forge/evidence-items");
  } catch {}
  return evidenceItems;
}

// ── LENS API ────────────────────────────────────────────────────

export async function fetchPlatformStats(): Promise<PlatformStat[]> {
  try {
    if (IS_LIVE) return await apiFetch<PlatformStat[]>("/api/v1/lens/platform-stats");
  } catch {}
  return platformStats;
}

export async function fetchTrendingNarratives(): Promise<Narrative[]> {
  try {
    if (IS_LIVE) return await apiFetch<Narrative[]>("/api/v1/lens/trending-narratives");
  } catch {}
  return trendingNarratives;
}

export async function fetchCoordinatedCampaigns(): Promise<CoordinatedCampaign[]> {
  try {
    if (IS_LIVE) return await apiFetch<CoordinatedCampaign[]>("/api/v1/lens/coordinated-campaigns");
  } catch {}
  return coordinatedCampaigns;
}

export async function fetchMediaCredibility(): Promise<MediaCredibility[]> {
  try {
    if (IS_LIVE) return await apiFetch<MediaCredibility[]>("/api/v1/lens/media-credibility");
  } catch {}
  return mediaCredibility;
}

// ── PULSE API ───────────────────────────────────────────────────

export async function fetchEconomicIndicators(): Promise<EconomicIndicator[]> {
  try {
    if (IS_LIVE) return await apiFetch<EconomicIndicator[]>("/api/v1/pulse/economic-indicators");
  } catch {}
  return economicIndicators;
}

export async function fetchEnergySectorData(): Promise<EnergySectorData[]> {
  try {
    if (IS_LIVE) return await apiFetch<EnergySectorData[]>("/api/v1/pulse/energy-sector");
  } catch {}
  return energySectorData;
}

export async function fetchInvestmentRisks(): Promise<InvestmentRisk[]> {
  try {
    if (IS_LIVE) return await apiFetch<InvestmentRisk[]>("/api/v1/pulse/investment-risks");
  } catch {}
  return investmentRisks;
}

export async function fetchTradeFlows(): Promise<TradeFlow[]> {
  try {
    if (IS_LIVE) return await apiFetch<TradeFlow[]>("/api/v1/pulse/trade-flows");
  } catch {}
  return tradeFlows;
}

// ── Health Check ────────────────────────────────────────────────

export async function checkBackendHealth(): Promise<{
  live: boolean;
  services: Record<string, string>;
}> {
  try {
    if (API_BASE) {
      const data = await apiFetch<{ services: Record<string, string> }>("/health");
      return { live: true, services: data.services };
    }
  } catch {
    // Backend not available
  }
  return {
    live: false,
    services: {
      api: "simulated",
      database: "simulated",
      redis: "simulated",
    },
  };
}

// ── Mode Detection ──────────────────────────────────────────────

export function isBackendLive(): boolean {
  return IS_LIVE;
}

export function getApiUrl(): string {
  return API_BASE || "(simulated — no backend)";
}
