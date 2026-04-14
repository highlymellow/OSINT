import { useState, useEffect } from 'react'
import { motion } from 'motion/react'
import { useQuery } from '@tanstack/react-query'
import { AreaChart, Area, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts'
import {
  Brain, Zap, Globe2, AlertTriangle, TrendingUp, Activity, RefreshCw,
  ExternalLink, ArrowRight, Shield, Target, Waves, Cpu, ScanEye
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

      {/* ── War Probability (Escalation Predictor) ── */}
      <EscalationEnginePanel />
      <PizzaIndexPanel />

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

        {!correlationLoading && correlations.length === 0 && Object.keys(sources).length === 0 && (
          <div className="text-center py-16 bg-surface/30 rounded-xl border border-border">
            <Brain size={32} className="text-purple-400/30 mx-auto mb-4" />
            <h4 className="text-sm font-bold text-white/50 mb-2">Backend Connection Required</h4>
            <p className="text-xs text-white/30 max-w-lg mx-auto leading-relaxed">
              The correlation engine requires the FastAPI backend to be running. Start it with:
            </p>
            <code className="text-[10px] text-purple-400 bg-purple-500/10 px-3 py-1.5 rounded mt-3 inline-block font-mono">
              cd api &amp;&amp; source .venv/bin/activate &amp;&amp; uvicorn main:app --reload --port 8000
            </code>
            <p className="text-[10px] text-white/20 mt-4">
              Once active, this engine will cross-reference GDELT, USGS, GDACS, and ReliefWeb data to find temporal, spatial, and thematic correlations.
            </p>
          </div>
        )}

        {!correlationLoading && correlations.length === 0 && Object.keys(sources).length > 0 && (
          <div className="text-center py-16 bg-surface/30 rounded-xl border border-dashed border-white/10">
            <ScanEye size={32} className="text-white/20 mx-auto mb-4" />
            <h4 className="text-sm font-bold text-white/50 mb-2">No High-Confidence Contexts Found</h4>
            <p className="text-[11px] text-white/40 max-w-md mx-auto leading-relaxed">
              The OSINT engine evaluated the active events but localized no cross-domain chains exceeding the minimum threshold required (<span className="text-white/60 font-mono inline-block ml-1">{minScore}</span>).
            </p>
            <p className="text-[10px] text-white/20 mt-4 uppercase tracking-widest font-mono">
              Adjust thresholds or broaden search window
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

      {/* ── Polymarket Prediction Markets ── */}
      <PolymarketPanel />
    </div>
  )
}

// ── Polymarket Prediction Markets Sub-Component ──────────────────

interface PolyMarket {
  id: string
  title: string
  slug: string
  markets: { question: string; outcomePrices: string; volume: string }[]
  volume24hr?: number
}

function PolymarketPanel() {
  const [predictions, setPredictions] = useState<PolyMarket[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/proxy/polymarket/events?tag_id=100265&closed=false&order=volume24hr&ascending=false&limit=8')
      .then(r => r.json())
      .then(data => {
        setPredictions(Array.isArray(data) ? data : [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="glass-card-solid p-6 text-center">
        <Activity size={20} className="text-purple-400 animate-pulse mx-auto mb-2" />
        <p className="text-xs text-white/40">Loading prediction markets...</p>
      </div>
    )
  }

  if (predictions.length === 0) {
    return (
      <div className="glass-card-solid p-6 text-center">
        <Globe2 size={20} className="text-white/20 mx-auto mb-2" />
        <p className="text-xs text-white/40">Polymarket data unavailable. Check proxy configuration.</p>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <TrendingUp size={14} className="text-green-400" />
        <h3 className="text-sm font-bold text-white uppercase tracking-wider">Prediction Markets — Polymarket</h3>
        <span className="text-[10px] text-white/30 ml-auto font-mono">
          Live geopolitical odds · Top {predictions.length} events
        </span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {predictions.map((event, i) => {
          // Parse the first market's prices
          let probYes = 50
          try {
            const market = event.markets?.[0]
            if (market?.outcomePrices) {
              const prices = JSON.parse(market.outcomePrices)
              probYes = Math.round(parseFloat(prices[0]) * 100)
            }
          } catch {}

          const vol = event.volume24hr ? `$${(event.volume24hr / 1000).toFixed(0)}K` : '—'

          return (
            <motion.div
              key={event.id || i}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className="glass-card-solid p-3 hover:border-green-500/20 transition-all cursor-pointer"
            >
              <p className="text-xs text-white/80 font-medium leading-snug line-clamp-2 mb-2">{event.title}</p>
              <div className="flex items-center gap-2">
                <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${probYes}%` }}
                    transition={{ delay: i * 0.06, duration: 0.5 }}
                    className="h-full rounded-full"
                    style={{
                      backgroundColor: probYes > 70 ? '#EF4444' : probYes > 40 ? '#F59E0B' : '#22C55E'
                    }}
                  />
                </div>
                <span className="text-xs font-mono font-bold text-white w-10 text-right">{probYes}%</span>
              </div>
              <div className="flex items-center justify-between mt-1.5">
                <span className="text-[9px] text-white/30 font-mono">Vol 24h: {vol}</span>
                <span className="text-[9px] text-white/30">{event.markets?.length || 0} outcomes</span>
              </div>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}

// ── Pizza Index Panel ──────────────────────────────────────────

function PizzaIndexPanel() {
  const { data } = useQuery<EscalationData>({
    queryKey: ['escalation-probability'],
  })

  // Foot traffic is extracted from the ML telemetry. If undefined, we baseline at 1.0.
  const currentAnomalyScore = data?.features?.foot_traffic_anomaly || 1.0

  // Mock historical 7-day curve leading up to the live data point
  const graphData = [
    { day: 'T-6', deliveries: 1.02 },
    { day: 'T-5', deliveries: 0.98 },
    { day: 'T-4', deliveries: 1.15 },
    { day: 'T-3', deliveries: 0.95 },
    { day: 'T-2', deliveries: 1.20 },
    { day: 'T-1', deliveries: Math.max(1.45, currentAnomalyScore - 0.5) }, // slight escalation
    { day: 'Today', deliveries: currentAnomalyScore }, // live z-score
  ]

  const isSpiking = currentAnomalyScore > 1.5

  return (
    <div className="glass-card-solid p-6 relative overflow-hidden mb-8 border border-white/5">
      {/* Background glow for anomaly */}
      {isSpiking && (
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 blur-[80px] pointer-events-none" />
      )}
      
      <div className="flex items-center gap-2 mb-6">
        <Target size={16} className={isSpiking ? "text-amber-500 animate-pulse" : "text-amber-500/50"} />
        <h3 className="text-sm font-bold text-white uppercase tracking-wider">Pentagon Pizza Index</h3>
        <span className="text-[10px] bg-amber-500/10 text-amber-500 px-2 py-0.5 rounded ml-auto border border-amber-500/20">
          LATE NIGHT LOGISTICS ANOMALY
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 relative z-10">
        {/* Left Side: Stats */}
        <div className="lg:col-span-1 space-y-4">
          <div>
            <p className="text-[10px] text-white/40 uppercase tracking-wider mb-1">Current Z-Score</p>
            <div className="flex items-baseline gap-2">
              <span className={`text-3xl font-black ${isSpiking ? 'text-amber-400' : 'text-amber-500/50'}`}>
                {currentAnomalyScore.toFixed(2)}
              </span>
              <span className="text-xs text-white/30">σ</span>
            </div>
          </div>
          <div>
            <p className="text-[10px] text-white/40 uppercase tracking-wider mb-1">Assessment</p>
            <p className={`text-xs ${isSpiking ? 'text-amber-400' : 'text-white/60'}`}>
              {isSpiking 
                ? "ELEVATED: Late night deliveries around Pentagon/CIA operating significantly above 30-day baseline. Historic indicator of crisis management."
                : "BASELINE: Nominal logistics activity around key nodes."}
            </p>
          </div>
        </div>

        {/* Right Side: Graph */}
        <div className="lg:col-span-3 h-[140px] w-full mt-auto">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={graphData} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="pizzaWarningColor" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={isSpiking ? '#f59e0b' : '#f59e0b'} stopOpacity={isSpiking ? 0.3 : 0.1}/>
                  <stop offset="95%" stopColor={isSpiking ? '#f59e0b' : '#f59e0b'} stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="day" stroke="#ffffff20" fontSize={10} tickLine={false} axisLine={false} />
              <YAxis domain={['dataMin - 0.2', 'dataMax + 0.5']} hide />
              <RechartsTooltip 
                contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', border: '1px solid rgba(255,255,255,0.1)', fontSize: '12px' }}
                itemStyle={{ color: '#fff' }}
              />
              <Area 
                type="monotone" 
                dataKey="deliveries" 
                stroke={isSpiking ? '#f59e0b' : '#f59e0b50'} 
                strokeWidth={2}
                fillOpacity={1} 
                fill="url(#pizzaWarningColor)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}

// ── War Probability (Escalation Predictor) Sub-Component ────────

interface EscalationData {
  timestamp: string
  escalation_probability: number
  raw_score: number
  status: string
  features: {
    military_flight_surge: number
    tanker_refueler_ratio: number
    foot_traffic_anomaly: number
    gdelt_negative_tone: number
    gdelt_article_spike: number
    oil_price_z: number
    defense_stock_z: number
    gold_price_z: number
  }
}

function EscalationEnginePanel() {
  const { data, isLoading } = useQuery<EscalationData>({
    queryKey: ['escalation-probability'],
    queryFn: async () => {
      const res = await fetch('/api/v1/escalation/probability')
      if (!res.ok) throw new Error('Escalation API failed')
      return res.json()
    },
    refetchInterval: 10000,
  })

  if (isLoading || !data) {
    return (
      <div className="glass-card-solid p-6 border-red-500/20 text-center animate-pulse mt-4 mb-8">
        <Target size={24} className="text-red-500/50 mx-auto mb-2" />
        <p className="text-xs text-white/40">Initializing War Probability Engine...</p>
      </div>
    )
  }

  const probColor = data.escalation_probability > 70 ? 'text-red-500' : data.escalation_probability > 40 ? 'text-orange-500' : 'text-green-500'
  const isElevated = data.escalation_probability > 60

  const featureLabels: Record<string, string> = {
    military_flight_surge: "Mil Flight Surge",
    tanker_refueler_ratio: "Refueler Ratio",
    foot_traffic_anomaly: "Pentagon Foot Traffic",
    gdelt_negative_tone: "GDELT Tone (Negative)",
    gdelt_article_spike: "Conflict Spikes",
    oil_price_z: "Brent Crude",
    defense_stock_z: "Defense Stocks",
    gold_price_z: "Gold Futures"
  }

  return (
    <div className="glass-card-solid overflow-hidden mb-8 border border-white/5 bg-gradient-to-br from-red-900/5 to-black/20">
      <div className="border-b border-white/5 p-4 bg-red-900/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Target className={isElevated ? "text-red-500 animate-pulse" : "text-amber-500"} size={20} />
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">War Probability Engine</h3>
              <p className="text-[10px] text-white/50">8-feature OSINT fusion ML model (Real-time)</p>
            </div>
          </div>
          <div className="text-right flex items-center justify-end gap-3">
            <span className={`block text-[10px] uppercase font-bold px-2 py-0.5 rounded border border-current inline-block ${probColor} bg-current/10`}>
              STATUS: {data.status}
            </span>
            <span className={`text-3xl font-mono font-bold tracking-tighter ${probColor}`}>
              {data.escalation_probability.toFixed(1)}<span className="text-lg opacity-50">%</span>
            </span>
          </div>
        </div>
      </div>
      
      <div className="p-4 grid grid-cols-2 md:grid-cols-4 gap-4">
        {Object.entries(data.features).map(([key, val]) => {
          // Normalize max val for rendering a mini bar
          const barWidth = Math.min(100, Math.max(0, Math.abs(val) * 20))
          const isHigh = Math.abs(val) > 2.0 // threshold for danger
          
          return (
            <div key={key} className="bg-white/5 border border-white/5 p-2.5 rounded-lg relative overflow-hidden">
              <div className="absolute top-0 left-0 h-0.5 bg-red-500/50 transition-all duration-1000" style={{ width: `${barWidth}%`, opacity: isHigh ? 1 : 0.3 }} />
              <p className="text-[9px] text-white/50 uppercase tracking-wider mb-1 line-clamp-1" title={featureLabels[key]}>
                {featureLabels[key]}
              </p>
              <div className="flex items-baseline gap-1.5">
                <span className={`text-sm font-mono font-bold ${isHigh ? 'text-red-400' : 'text-white/80'}`}>
                  {val.toFixed(2)}
                </span>
                <span className="text-[8px] text-white/30">z-score</span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
