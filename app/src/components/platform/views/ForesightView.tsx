import { useState } from 'react'
import { motion } from 'motion/react'
import { useQuery } from '@tanstack/react-query'
import { 
  Brain, Zap, Globe2, AlertTriangle, TrendingUp, Activity, RefreshCw,
  ExternalLink, ArrowRight, Shield, Target, Waves, Cpu
 } from "@/lib/icons"
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  fetchCorrelations,
  fetchCorrelationSummary,
  type CorrelationResult,
} from '@/lib/osint-feeds'

// ── Correlation Styling ────────────────────────────────────────

const DOMAIN_COLORS: Record<string, string> = {
  conflict: '#EF4444',
  political: '#8B5CF6',
  humanitarian: '#3B82F6',
  economic: '#F59E0B',
  seismic: '#EAB308',
  environmental: '#10B981',
  maritime: '#06B6D4',
  cyber: '#EC4899',
  general: '#6B7280',
}

const DOMAIN_ICONS: Record<string, typeof Shield> = {
  conflict: Target,
  political: Globe2,
  humanitarian: Shield,
  economic: TrendingUp,
  seismic: Activity,
  environmental: Waves,
  maritime: Waves,
  cyber: Cpu,
  general: Zap,
}

const INTEL_VALUE_COLORS: Record<string, string> = {
  CRITICAL: 'text-red-400 bg-red-500/10 border-red-500/20',
  HIGH: 'text-orange-400 bg-orange-500/10 border-orange-500/20',
  NOTABLE: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20',
  MEDIUM: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
  LOW: 'text-gray-400 bg-gray-500/10 border-gray-500/20',
}

function getIntelLevel(value: string): string {
  if (value.startsWith('CRITICAL')) return 'CRITICAL'
  if (value.startsWith('HIGH')) return 'HIGH'
  if (value.startsWith('NOTABLE')) return 'NOTABLE'
  if (value.startsWith('MEDIUM')) return 'MEDIUM'
  return 'LOW'
}

// ── Component ──────────────────────────────────────────────────

export default function ForesightView() {
  const [region, setRegion] = useState('iraq')
  const [timeWindow, setTimeWindow] = useState(72)
  const [minScore, setMinScore] = useState(0.3)

  const { data: correlationData, isLoading: correlationLoading, refetch } = useQuery({
    queryKey: ['correlations', region, timeWindow, minScore],
    queryFn: () => fetchCorrelations({ region, hours: timeWindow, minScore }),
    refetchInterval: 600_000,
    staleTime: 300_000,
  })

  const { data: summary } = useQuery({
    queryKey: ['correlation-summary', region],
    queryFn: () => fetchCorrelationSummary(region),
    refetchInterval: 600_000,
    staleTime: 300_000,
  })

  const correlations = correlationData?.correlations || []
  const sources = correlationData?.sources || {}
  const domainDist = correlationData?.domain_distribution || {}

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      {/* ── Header ── */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-purple-500/10 border border-purple-500/20">
            <Brain size={20} className="text-purple-400" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white tracking-tight">
              FORESIGHT — Cross-Domain Correlation Engine
            </h2>
            <p className="text-xs text-white/40">
              Automated intelligence linking across GDELT, USGS, GDACS, and ReliefWeb
            </p>
          </div>
        </div>
        <button
          onClick={() => refetch()}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface border border-border text-xs text-white/60 hover:text-gold hover:border-gold/30 transition-all"
        >
          <RefreshCw size={12} className={correlationLoading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </motion.div>

      {/* ── Controls Bar ── */}
      <div className="flex items-center gap-4 p-3 rounded-xl bg-surface border border-border">
        <div className="flex items-center gap-2">
          <label className="text-[10px] text-white/40 uppercase tracking-wider font-bold">Region</label>
          <select
            value={region}
            onChange={(e) => setRegion(e.target.value)}
            className="bg-surface-elevated border border-border rounded px-2 py-1 text-xs text-white"
          >
            <option value="iraq">Iraq</option>
            <option value="syria">Syria</option>
            <option value="iran">Iran</option>
            <option value="yemen">Yemen</option>
            <option value="lebanon">Lebanon</option>
            <option value="middle east">Middle East</option>
            <option value="ukraine">Ukraine</option>
          </select>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-[10px] text-white/40 uppercase tracking-wider font-bold">Window</label>
          <select
            value={timeWindow}
            onChange={(e) => setTimeWindow(Number(e.target.value))}
            className="bg-surface-elevated border border-border rounded px-2 py-1 text-xs text-white"
          >
            <option value={24}>24 hours</option>
            <option value={72}>72 hours</option>
            <option value={168}>7 days</option>
          </select>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-[10px] text-white/40 uppercase tracking-wider font-bold">Min Score</label>
          <select
            value={minScore}
            onChange={(e) => setMinScore(Number(e.target.value))}
            className="bg-surface-elevated border border-border rounded px-2 py-1 text-xs text-white"
          >
            <option value={0.2}>0.2 (Broad)</option>
            <option value={0.3}>0.3 (Standard)</option>
            <option value={0.5}>0.5 (Focused)</option>
            <option value={0.7}>0.7 (High Only)</option>
          </select>
        </div>
        <div className="ml-auto text-[10px] text-white/30 font-mono">
          {correlations.length} correlations found
        </div>
      </div>

      {/* ── Summary Cards ── */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Top Finding */}
        <Card className="md:col-span-2 glass-card-solid border-purple-500/10">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs text-purple-400 flex items-center gap-2">
              <Brain size={14} /> Top Intelligence Finding
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-white/80 leading-relaxed">
              {summary?.top_finding || 'Analyzing cross-domain intelligence streams...'}
            </p>
            {summary?.threat_domains && summary.threat_domains.length > 0 && (
              <div className="flex gap-1.5 mt-3">
                {summary.threat_domains.map(d => (
                  <span key={d} className="text-[9px] px-2 py-0.5 rounded-full border" style={{
                    color: DOMAIN_COLORS[d] || '#6B7280',
                    borderColor: `${DOMAIN_COLORS[d] || '#6B7280'}40`,
                    backgroundColor: `${DOMAIN_COLORS[d] || '#6B7280'}10`,
                  }}>
                    {d.toUpperCase()}
                  </span>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Source Counts */}
        <Card className="glass-card-solid">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs text-white/50">Active Sources</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {Object.entries(sources).map(([src, count]) => (
                <div key={src} className="flex items-center justify-between">
                  <span className="text-[10px] text-white/50 uppercase">{src}</span>
                  <span className="text-sm font-mono text-white font-bold">{count as number}</span>
                </div>
              ))}
              {Object.keys(sources).length === 0 && (
                <p className="text-[10px] text-white/30 italic">Start FastAPI backend for live data</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Domain Distribution */}
        <Card className="glass-card-solid">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs text-white/50">Domain Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {Object.entries(domainDist).map(([domain, count]) => (
                <div key={domain} className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: DOMAIN_COLORS[domain] || '#6B7280' }} />
                    <span className="text-[10px] text-white/50 capitalize">{domain}</span>
                  </div>
                  <span className="text-sm font-mono text-white font-bold">{count as number}</span>
                </div>
              ))}
              {Object.keys(domainDist).length === 0 && (
                <p className="text-[10px] text-white/30 italic">No domain data yet</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── Correlation Cards ── */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Zap size={14} className="text-gold" />
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">Cross-Domain Correlations</h3>
          <span className="text-[10px] text-white/30 ml-auto font-mono">
            Sorted by correlation score (highest first)
          </span>
        </div>

        {correlationLoading && (
          <div className="text-center py-12">
            <RefreshCw size={24} className="text-purple-400 animate-spin mx-auto mb-3" />
            <p className="text-xs text-white/40">Analyzing intelligence streams...</p>
          </div>
        )}

        {!correlationLoading && correlations.length === 0 && (
          <div className="text-center py-16 bg-surface/30 rounded-xl border border-border">
            <Brain size={32} className="text-purple-400/30 mx-auto mb-4" />
            <h4 className="text-sm font-bold text-white/50 mb-2">No Correlations Detected</h4>
            <p className="text-xs text-white/30 max-w-lg mx-auto leading-relaxed">
              The correlation engine requires the FastAPI backend to be running. Start it with:
            </p>
            <code className="text-[10px] text-purple-400 bg-purple-500/10 px-3 py-1.5 rounded mt-3 inline-block font-mono">
              uvicorn apps.api.main:app --reload --port 8000
            </code>
            <p className="text-[10px] text-white/20 mt-4">
              Once active, this engine will cross-reference GDELT, USGS, GDACS, and ReliefWeb data to find temporal, spatial, and thematic correlations.
            </p>
          </div>
        )}

        <div className="space-y-3">
          {correlations.map((corr, i) => {
            const intelLevel = getIntelLevel(corr.intelligence_value)
            const intelStyle = INTEL_VALUE_COLORS[intelLevel] || INTEL_VALUE_COLORS.LOW
            return (
              <motion.div
                key={corr.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                className="glass-card-solid p-4 hover:border-purple-500/20 transition-all group"
              >
                {/* Score + Intel Value */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5 bg-purple-500/10 px-2.5 py-1 rounded-lg border border-purple-500/20">
                      <Zap size={10} className="text-purple-400" />
                      <span className="text-sm font-mono font-bold text-purple-300">{(corr.score * 100).toFixed(0)}%</span>
                    </div>
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded border uppercase ${intelStyle}`}>
                      {intelLevel}
                    </span>
                  </div>
                  <span className="text-[9px] text-white/25 font-mono">{corr.correlation_type}</span>
                </div>

                {/* Event A ↔ Event B */}
                <div className="flex items-start gap-3">
                  {/* Event A */}
                  <div className="flex-1 p-3 rounded-lg bg-white/[0.02] border border-white/5">
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <span className="text-[8px] font-bold px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
                        {corr.event_a.source}
                      </span>
                      {corr.event_a.domains.map(d => (
                        <span key={d} className="w-2 h-2 rounded-full" style={{ backgroundColor: DOMAIN_COLORS[d] }} />
                      ))}
                    </div>
                    <p className="text-xs text-white/80 line-clamp-2">{corr.event_a.title}</p>
                    <p className="text-[9px] text-white/30 mt-1 capitalize">{corr.event_a.country}</p>
                  </div>

                  {/* Arrow */}
                  <div className="shrink-0 flex flex-col items-center justify-center gap-1 pt-4">
                    <ArrowRight size={16} className="text-purple-400" />
                    <span className="text-[8px] text-purple-300/50">LINK</span>
                  </div>

                  {/* Event B */}
                  <div className="flex-1 p-3 rounded-lg bg-white/[0.02] border border-white/5">
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <span className="text-[8px] font-bold px-1.5 py-0.5 rounded bg-green-500/10 text-green-400 border border-green-500/20">
                        {corr.event_b.source}
                      </span>
                      {corr.event_b.domains.map(d => (
                        <span key={d} className="w-2 h-2 rounded-full" style={{ backgroundColor: DOMAIN_COLORS[d] }} />
                      ))}
                    </div>
                    <p className="text-xs text-white/80 line-clamp-2">{corr.event_b.title}</p>
                    <p className="text-[9px] text-white/30 mt-1 capitalize">{corr.event_b.country}</p>
                  </div>
                </div>

                {/* Intel Assessment */}
                <p className="text-[10px] text-white/30 mt-3 italic">{corr.intelligence_value}</p>
              </motion.div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
