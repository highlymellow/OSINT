import { motion } from 'motion/react'
import { useQuery } from '@tanstack/react-query'
import { fetchCurrentSTI, fetchEvents, fetchGovernorateScores } from '@/lib/api'
import { fetchGDELTEvents, fetchEarthquakes, fetchIntelligenceNews, fetchReliefWebReports, fetchSatellitePositions, fetchCarrierPositions, fetchCorrelationSummary } from '@/lib/osint-feeds'
import { modules } from '@/lib/data'
import { useAppStore } from '@/store/app'
import { getStatusColor, getStatusBg, formatTimestamp, getSeverityColor } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { BorderBeam } from '@/components/ui/border-beam'
import { Button } from '@/components/ui/button'
import { 
  Activity, TrendingUp, TrendingDown, Minus, AlertTriangle,
  Fingerprint, RadioTower, Globe2, Workflow, ScanEye, CandlestickChart, Orbit, Cpu,
  ChevronRight, Zap, CheckCircle, FileText, Clock, Target,
  Users, Command, TerminalSquare, Search, Bell, Radio, MapPin
 } from "@/lib/icons"
import type { NavView } from '@/lib/types'
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from 'recharts'
import { fetchSTIHistory } from '@/lib/api'
import IncidentReportCard from '@/components/ui/area-chart-1'

const MODULE_ICONS: Record<string, React.ComponentType<any>> = {
  signal: RadioTower, terrain: Globe2, nexus: Workflow, lens: ScanEye,
  pulse: CandlestickChart, foresight: Orbit, forge: Cpu, sti: Fingerprint,
}

const getHeatColor = (value: number, max: number = 100) => {
  const ratio = Math.min(Math.max(value / max, 0), 1);
  if (ratio >= 0.75) return 'text-red-500 drop-shadow-[0_0_12px_rgba(239,68,68,0.4)]';
  if (ratio >= 0.5) return 'text-orange-400 drop-shadow-[0_0_12px_rgba(251,146,60,0.4)]';
  if (ratio >= 0.25) return 'text-yellow-400';
  return 'text-green-400';
}

const MODULE_COLORS: Record<string, string> = {
  signal: '#C9A84C', terrain: '#2DD4BF', nexus: '#A855F7', lens: '#3B82F6',
  pulse: '#EA580C', foresight: '#EAB308', forge: '#16A34A', sti: '#DC2626',
}

export default function OverviewView() {
  const setView = useAppStore((s) => s.setView)
  const { data: sti } = useQuery({ queryKey: ['sti'], queryFn: () => fetchCurrentSTI() })
  const { data: events } = useQuery({ queryKey: ['events'], queryFn: () => fetchEvents({ limit: 6 }) })
  const { data: govScores } = useQuery({ queryKey: ['govScores'], queryFn: fetchGovernorateScores })
  const { data: history } = useQuery({ queryKey: ['stiHistory', '30d'], queryFn: () => fetchSTIHistory('IQ', '30d') })

  const topGovs = govScores?.sort((a, b) => b.score - a.score).slice(0, 5) ?? []

  // Live OSINT feeds
  const { data: gdeltEvents = [] } = useQuery({
    queryKey: ['gdelt-overview'],
    queryFn: () => fetchGDELTEvents({ maxRecords: 25 }),
    refetchInterval: 300_000,
    staleTime: 120_000,
  })
  const { data: earthquakes = [] } = useQuery({
    queryKey: ['earthquakes-overview'],
    queryFn: () => fetchEarthquakes({ period: '1d' }),
    refetchInterval: 120_000,
    staleTime: 60_000,
  })
  const { data: newsArticles = [] } = useQuery({
    queryKey: ['news-overview'],
    queryFn: () => fetchIntelligenceNews(),
    refetchInterval: 600_000,
    staleTime: 300_000,
  })
  const { data: reliefWebReports = [] } = useQuery({
    queryKey: ['reliefweb-overview'],
    queryFn: () => fetchReliefWebReports({ limit: 15 }),
    refetchInterval: 600_000,
    staleTime: 300_000,
  })
  const { data: satellites = [] } = useQuery({
    queryKey: ['satellites-overview'],
    queryFn: () => fetchSatellitePositions({ groups: ['stations', 'gps-ops', 'military'], limit: 100 }),
    refetchInterval: 120_000,
    staleTime: 60_000,
  })
  const { data: carriers = [] } = useQuery({
    queryKey: ['carriers-overview'],
    queryFn: () => fetchCarrierPositions(),
    refetchInterval: 600_000,
    staleTime: 300_000,
  })
  const { data: correlationSummary } = useQuery({
    queryKey: ['correlation-summary'],
    queryFn: () => fetchCorrelationSummary('iraq'),
    refetchInterval: 600_000,
    staleTime: 300_000,
  })

  const TrendIcon = sti?.trend === 'up' ? TrendingUp : sti?.trend === 'down' ? TrendingDown : Minus
  const trendColor = sti?.trend === 'up' ? 'text-red-400' : sti?.trend === 'down' ? 'text-green-400' : 'text-yellow-400'

  return (
    <div className="p-8 space-y-8 animate-fade-in pb-20">
      {/* ── Welcome Header ── */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white mb-2">Dashboard</h2>
          <p className="text-sm text-white/50">
            Welcome back, Mohammed. Here's your intelligence overview today.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* Notification Action Icons */}
          <div className="flex bg-[#111113] border border-white/5 p-1 rounded-xl mr-2">
			      <Button variant="ghost" size="icon" className="h-8 w-8 text-white/60 hover:text-white rounded-lg">
              <Search size={16} />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-white/60 hover:text-white rounded-lg relative">
              <Bell size={16} />
              <span className="absolute top-2 right-2.5 w-1.5 h-1.5 bg-red-500 rounded-full"></span>
            </Button>
          </div>
          <Button className="bg-[#111113] hover:bg-white/10 text-white border border-white/5 h-10 px-4 rounded-xl gap-2 font-medium">
            <Radio size={14} className="text-white/60" />
            Live Feed
          </Button>
          <Button className="bg-white hover:bg-zinc-200 text-black h-10 px-4 rounded-xl gap-2 font-medium">
            <FileText size={14} className="text-black/60" />
            Daily Brief
          </Button>
        </div>
      </div>

      {/* Dashboard KPI Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {/* STI Score KPI */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0 }}>
          <Card className="rounded-2xl border-white/5 bg-[#111113] p-5 h-[130px] flex flex-col justify-between shadow-[11px_21px_3px_rgba(0,0,0,0.06),14px_27px_7px_rgba(0,0,0,0.10),19px_38px_14px_rgba(0,0,0,0.13),27px_54px_27px_rgba(0,0,0,0.16)] relative overflow-hidden">
            <div className="flex items-start justify-between absolute inset-x-5 top-5">
              <span className="text-[13px] text-white/50 font-medium">Tension Score</span>
              <div className="p-2 rounded-lg bg-[#18181b] border border-white/5 shrink-0">
                <Activity size={16} className="text-red-500" />
              </div>
            </div>
            
            <div className="absolute inset-x-5 bottom-5">
              <div className="flex items-end gap-1 mb-1">
                <span className={`text-[32px] font-bold tracking-tight leading-none ${getHeatColor(sti?.composite ?? 0)}`}>{sti?.composite ?? '—'}</span>
                <span className="text-sm font-medium text-white/30 pb-0.5">/100</span>
              </div>
              <span className="text-xs text-red-500 font-medium tracking-wide">
                +3 from last week
              </span>
            </div>
          </Card>
        </motion.div>

        {/* Events Today */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
          <Card className="rounded-2xl border-white/5 bg-[#111113] p-5 h-[130px] flex flex-col justify-between shadow-[11px_21px_3px_rgba(0,0,0,0.06),14px_27px_7px_rgba(0,0,0,0.10),19px_38px_14px_rgba(0,0,0,0.13),27px_54px_27px_rgba(0,0,0,0.16)] relative overflow-hidden">
            <div className="flex items-start justify-between absolute inset-x-5 top-5">
              <span className="text-[13px] text-white/50 font-medium">Active Events</span>
              <div className="p-2 rounded-lg bg-[#18181b] border border-white/5 shrink-0">
                <Zap size={16} className="text-teal-500" />
              </div>
            </div>
            
            <div className="absolute inset-x-5 bottom-5">
              <div className="text-[32px] font-bold tracking-tight text-white leading-none mb-1">{events?.length ?? 0}</div>
              <span className="text-xs text-teal-500 font-medium tracking-wide">
                +8% from yesterday
              </span>
            </div>
          </Card>
        </motion.div>

        {/* Actors */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="rounded-2xl border-white/5 bg-[#111113] p-5 h-[130px] flex flex-col justify-between shadow-[11px_21px_3px_rgba(0,0,0,0.06),14px_27px_7px_rgba(0,0,0,0.10),19px_38px_14px_rgba(0,0,0,0.13),27px_54px_27px_rgba(0,0,0,0.16)] relative overflow-hidden">
            <div className="flex items-start justify-between absolute inset-x-5 top-5">
              <span className="text-[13px] text-white/50 font-medium">Tracked Actors</span>
              <div className="p-2 rounded-lg bg-[#18181b] border border-white/5 shrink-0">
                <Users size={16} className="text-purple-500" />
              </div>
            </div>
            
            <div className="absolute inset-x-5 bottom-5">
              <div className="text-[32px] font-bold tracking-tight text-white leading-none mb-1">27</div>
              <span className="text-xs text-purple-500 font-medium tracking-wide">
                40 connections mapped
              </span>
            </div>
          </Card>
        </motion.div>

        {/* Confidence */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
           <Card className="rounded-2xl border-white/5 bg-[#111113] p-5 h-[130px] flex flex-col justify-between shadow-[11px_21px_3px_rgba(0,0,0,0.06),14px_27px_7px_rgba(0,0,0,0.10),19px_38px_14px_rgba(0,0,0,0.13),27px_54px_27px_rgba(0,0,0,0.16)] relative overflow-hidden">
            <div className="flex items-start justify-between absolute inset-x-5 top-5">
              <span className="text-[13px] text-white/50 font-medium">Data Confidence</span>
              <div className="p-2 rounded-lg bg-[#18181b] border border-white/5 shrink-0">
                <Target size={16} className="text-orange-500" />
              </div>
            </div>
            
            <div className="absolute inset-x-5 bottom-5">
              <div className="text-[32px] font-bold tracking-tight text-white leading-none mb-1">{sti ? `${Math.round(sti.confidence * 100)}%` : '—'}</div>
              <span className="text-xs text-orange-500 font-medium tracking-wide">
                {sti?.axes.reduce((s, a) => s + a.signals, 0).toLocaleString()} signals
              </span>
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Main Grid: Chart + Feed + Govs */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* STI Mini Chart (New Component) */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-5 h-[580px]"
        >
          <IncidentReportCard />
        </motion.div>

        {/* Recent Events */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="lg:col-span-4"
        >
          <Card className="h-full flex flex-col shadow-[11px_21px_3px_rgba(0,0,0,0.06),14px_27px_7px_rgba(0,0,0,0.10),19px_38px_14px_rgba(0,0,0,0.13),27px_54px_27px_rgba(0,0,0,0.16)] border-white/5 bg-[#111113] rounded-2xl">
            <CardHeader className="pb-0">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-1.5">
                  <Zap size={13} className="text-gold" />
                  Latest Events
                </CardTitle>
                <Button variant="ghost" size="sm" className="text-[10px] h-6 text-gold" onClick={() => setView('signal')}>
                  All <ChevronRight size={12} />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pt-3 flex-1">
              <div className="space-y-1">
                {events?.slice(0, 5).map((evt, i) => (
                  <motion.div
                    key={evt.id}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + 0.04 * i }}
                    className="flex items-start gap-2.5 p-2 rounded-lg hover:bg-accent/50 transition-colors cursor-default group"
                  >
                    {evt.verified ? (
                      <CheckCircle size={12} className="text-green-400 mt-0.5 shrink-0" />
                    ) : (
                      <AlertTriangle size={12} className="text-yellow-400 mt-0.5 shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-medium truncate group-hover:text-gold transition-colors">
                        {evt.title}
                      </div>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className={`text-[9px] font-bold uppercase ${getSeverityColor(evt.severity)}`}>{evt.severity}</span>
                        <span className="text-[9px] text-text-muted">·</span>
                        <span className="text-[9px] text-text-muted truncate">{evt.governorate}</span>
                        <span className="text-[9px] text-text-muted">·</span>
                        <span className="text-[9px] text-text-muted">{formatTimestamp(evt.timestamp)}</span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Top Governorates */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="lg:col-span-3"
        >
          <Card className="h-full shadow-[11px_21px_3px_rgba(0,0,0,0.06),14px_27px_7px_rgba(0,0,0,0.10),19px_38px_14px_rgba(0,0,0,0.13),27px_54px_27px_rgba(0,0,0,0.16)] border-white/5 bg-[#111113] rounded-2xl">
            <CardHeader className="pb-0">
              <CardTitle className="flex items-center gap-1.5">
                <MapPin size={13} className="text-gold" />
                Hotspots
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-3">
              <div className="space-y-2">
                {topGovs.map((gov, i) => (
                  <motion.div
                    key={gov.id}
                    initial={{ opacity: 0, x: 8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.35 + 0.04 * i }}
                    className="flex items-center justify-between p-2.5 rounded-lg bg-accent/30 border border-border/50"
                  >
                    <div>
                      <div className="text-xs font-medium">{gov.name}</div>
                      <div className="text-[9px] text-text-muted">{gov.nameAr}</div>
                    </div>
                    <div className="text-right">
                      <div className={`text-sm font-bold font-mono ${getStatusColor(gov.status)}`}>{gov.score}</div>
                      <Badge className={`${getStatusBg(gov.status)} ${getStatusColor(gov.status)} text-[7px] py-0 px-1`}>
                        {gov.status}
                      </Badge>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* ── Live OSINT Telemetry ── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <Card className="rounded-2xl border-white/5 bg-[#111113] shadow-[11px_21px_3px_rgba(0,0,0,0.06),14px_27px_7px_rgba(0,0,0,0.10)] relative overflow-hidden">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold text-white/80 flex items-center gap-2">
                <Orbit size={16} className="text-gold" />
                Live OSINT Data Sources
              </CardTitle>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-[10px] text-green-400 font-bold tracking-wider uppercase">Online</span>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { name: 'GDELT Events', count: gdeltEvents.length, color: '#3B82F6', desc: 'Real-time conflict intelligence' },
                { name: 'ReliefWeb', count: reliefWebReports.length, color: '#60A5FA', desc: 'UN OCHA humanitarian reports' },
                { name: 'USGS Seismic', count: earthquakes.length, color: '#EAB308', desc: '24h earthquake feed' },
                { name: 'Intel News', count: newsArticles.length, color: '#D4A843', desc: 'Multi-source RSS aggregation' },
                { name: 'Satellites', count: satellites.length, color: '#4FC3F7', desc: 'Orbital asset tracking (SGP4)' },
                { name: 'Carrier Groups', count: carriers.length, color: '#EF5350', desc: 'USN carrier OSINT estimation' },
                { name: 'Correlations', count: correlationSummary?.active_correlations || 0, color: '#AB47BC', desc: 'Cross-domain intel links' },
                { name: 'Internal Events', count: events?.length || 0, color: '#DC2626', desc: 'MERIDIAN event pipeline' },
              ].map((src) => (
                <div key={src.name} className="p-3 rounded-xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition-all">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] text-white/40 font-medium uppercase tracking-wider">{src.name}</span>
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                  </div>
                  <div className="text-xl font-bold font-mono" style={{ color: src.color }}>{src.count}</div>
                  <div className="text-[9px] text-white/25 mt-1">{src.desc}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* ── Global Dock moved to PlatformShell ── */}
    </div>
  )
}
