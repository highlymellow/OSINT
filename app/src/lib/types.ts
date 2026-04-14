// ═══════════════════════════════════════════════════════════════════
// MERIDIAN — Type Definitions
// ═══════════════════════════════════════════════════════════════════

export type STIStatus = "STABLE" | "LOW" | "ELEVATED" | "HIGH" | "CRITICAL";

export interface STIAxisScore {
  id: string;
  name: string;
  nameAr?: string;
  score: number;
  previousScore: number;
  weight: number;
  signals: number;
  trend: "up" | "down" | "stable";
  color: string;
}

export interface STIScore {
  composite: number;
  previousComposite: number;
  status: STIStatus;
  confidence: number;
  lastUpdated: string;
  trend: "up" | "down" | "stable";
  axes: STIAxisScore[];
}

export interface Event {
  id: string;
  title: string;
  titleAr?: string;
  type: "conflict" | "political" | "economic" | "social" | "security" | "climate";
  severity: "low" | "medium" | "high" | "critical";
  location: string;
  governorate: string;
  country: string;
  timestamp: string;
  source: string;
  sourceUrl?: string;
  language: string;
  sentiment: number;
  stiRelevance: boolean;
  stiAxes?: string[];
  summary: string;
  entities: string[];
  verified: boolean;
}

export interface Actor {
  id: string;
  name: string;
  nameAr?: string;
  type: "person" | "organization" | "militia" | "party" | "tribe";
  category: string;
  country: string;
  affiliation?: string;
  description: string;
  connections: number;
  riskLevel: "low" | "medium" | "high" | "critical";
  lastActive: string;
}

export interface GovernorateSTI {
  id: string;
  name: string;
  nameAr: string;
  score: number;
  status: STIStatus;
  trend: "up" | "down" | "stable";
  topAxis: string;
}

export interface AlertRule {
  id: string;
  name: string;
  type: "sti" | "event" | "actor" | "region";
  threshold?: number;
  active: boolean;
  triggered: number;
  lastTriggered?: string;
}

export interface TimeSeriesPoint {
  timestamp: string;
  value: number;
  label?: string;
}

export interface ModuleInfo {
  id: string;
  name: string;
  icon: string;
  description: string;
  status: "active" | "beta" | "coming";
  features: string[];
}

// ── Foresight & Forge Types ─────────────────────────────────────────
export interface ConflictForecast {
  id: string;
  region: string;
  scenario: string;
  probability: number;
  horizon: string;
  drivers: string[];
  stiAxis: string;
  confidence: number;
  trend: "rising" | "stable" | "declining";
  impact: "low" | "medium" | "high" | "critical";
}

export interface DisplacementPrediction {
  governorate: string;
  currentIDPs: number;
  predicted30d: number;
  predicted90d: number;
  risk: "low" | "medium" | "high" | "critical";
  driver: string;
}

export interface ScenarioModel {
  id: string;
  name: string;
  description: string;
  probability: number;
  stiProjection: number[];
  color: string;
}

export interface Report {
  id: string;
  title: string;
  classification: string;
  author: string;
  status: "draft" | "review" | "published" | "archived";
  lastModified: string;
  template: string;
  sections: number;
  sources: number;
  wordCount: number;
  stiRelevance: string[];
  collaborators: string[];
}

export interface SatTemplate {
  id: string;
  name: string;
  icon: string;
  count: number;
  description: string;
}

export interface EvidenceItem {
  id: string;
  type: string;
  grade: string;
  source: string;
  date: string;
  relevance: string;
  reliability: string;
}

// ── LENS Types ──────────────────────────────────────────────────────

export interface PlatformStat {
  platform: string;
  posts: string;
  trend: string;
  color: string;
  icon: string;
}

export interface Narrative {
  narrative: string;
  volume: number;
  sentiment: number;
  platforms: string[];
  stiRelevant: boolean;
  disinfoRisk: "NONE" | "LOW" | "MEDIUM" | "HIGH";
}

export interface CoordinatedCampaign {
  name: string;
  accounts: number;
  origin: string;
  confidence: number;
}

export interface MediaCredibility {
  name: string;
  score: number;
  bias: string;
}

// ── PULSE Types ─────────────────────────────────────────────────────

export interface EconomicIndicator {
  name: string;
  value: string;
  change: string;
  trend: "up" | "down";
}

export interface EnergySectorData {
  metric: string;
  value: string;
  target?: string;
  change?: string;
  detail?: string;
  status: "Offline" | "Above Quota" | "Ascending" | "Improving";
}

export interface InvestmentRisk {
  gov: string;
  risk: number;
  grade: string;
  sector: string;
}

export interface TradeFlow {
  country: string;
  volume: string;
  type: "Import" | "Export";
  pct: number;
}

export type NavView =
  | "overview"
  | "sti"
  | "signal"
  | "terrain"
  | "nexus"
  | "lens"
  | "pulse"
  | "foresight"
  | "forge"
  | "press"
  | "codex"
  | "alerts"
  | "settings";
