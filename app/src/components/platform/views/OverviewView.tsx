import { motion } from 'motion/react'
import { useQuery } from '@tanstack/react-query'
import { fetchCurrentSTI, fetchEvents, fetchGovernorateScores } from '@/lib/api'
import { modules } from '@/lib/data'
import { useAppStore } from '@/store/app'
import { getStatusColor, getStatusBg, formatTimestamp, getSeverityColor } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { BorderBeam } from '@/components/ui/border-beam'
import { Button } from '@/components/ui/button'
import {
  Activity, TrendingUp, TrendingDown, Minus, AlertTriangle,
  Shield, Radio, MapPin, Network, Eye, BarChart3, Radar, Layers,
  ChevronRight, Zap, CheckCircle, FileText, Clock, Target,
  Users, Globe, Newspaper
} from 'lucide-react'
import type { NavView } from '@/lib/types'
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from 'recharts'
import { fetchSTIHistory } from '@/lib/api'

const MODULE_ICONS: Record<string, React.ComponentType<any>> = {
  signal: Radio, terrain: MapPin, nexus: Network, lens: Eye,
  pulse: BarChart3, foresight: Radar, forge: Layers, sti: Activity,
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

  const TrendIcon = sti?.trend === 'up' ? TrendingUp : sti?.trend === 'down' ? TrendingDown : Minus
  const trendColor = sti?.trend === 'up' ? 'text-red-400' : sti?.trend === 'down' ? 'text-green-400' : 'text-yellow-400'

  return (
    <div className="p-5 space-y-4 animate-fade-in">
      {/* ── Welcome Header ── */}
      <div className="flex items-center justify-between mb-1">
        <div>
          <h2 className="text-lg font-semibold">Welcome back, Mohammed</h2>
          <p className="text-xs text-muted-foreground">
            Iraq intelligence overview · {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setView('signal')}>
            <Radio size={13} />
            Live Feed
          </Button>
          <Button variant="gold" size="sm" onClick={() => setView('press' as NavView)}>
            <FileText size={13} />
            Daily Brief
          </Button>
        </div>
      </div>

      {/* ── KPI Row ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {/* STI Score KPI */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0 }}>
          <Card className="relative overflow-hidden group hover:border-white/10 transition-all duration-300 bg-surface/50">
            <BorderBeam size={120} duration={20} delay={0} />
            <div className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Activity size={14} className="text-muted-foreground" />
                  <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">STI Score</span>
                </div>
                <TrendIcon size={14} className={trendColor} />
              </div>
              <div className="flex items-end gap-1.5 mb-2">
                <span className={`text-4xl font-bold font-mono leading-none ${getHeatColor(sti?.composite ?? 0)}`}>{sti?.composite ?? '—'}</span>
                <span className="text-sm text-muted-foreground font-mono mb-1">/ 100</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge className={`${getStatusBg(sti?.status ?? '')} ${getStatusColor(sti?.status ?? '')} text-[9px] font-bold tracking-widest px-2 py-0.5 uppercase`}>
                  {sti?.status ?? '—'}
                </Badge>
                <span className="text-xs font-mono font-medium text-muted-foreground">
                  {sti && sti.composite > sti.previousComposite ? '+' : ''}{sti ? sti.composite - sti.previousComposite : 0}
                </span>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Events Today */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
          <Card className="p-4 hover:border-white/10 transition-all bg-surface/50 h-full flex flex-col justify-between">
            <div className="flex items-center gap-2 mb-3">
              <Zap size={14} className="text-muted-foreground" />
              <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">Active Events</span>
            </div>
            <div className={`text-4xl font-bold font-mono leading-none mb-2 ${getHeatColor(events?.length ?? 0, 20)}`}>{events?.length ?? 0}</div>
            <div className="flex items-center gap-1.5 opacity-80">
              <span className="text-[10px] text-red-500 font-medium">{events?.filter(e => e.severity === 'critical').length ?? 0} critical</span>
              <span className="text-[10px] text-muted-foreground">·</span>
              <span className="text-[10px] text-orange-400 font-medium">{events?.filter(e => e.severity === 'high').length ?? 0} high</span>
            </div>
          </Card>
        </motion.div>

        {/* Actors */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="p-4 hover:border-white/10 transition-all bg-surface/50 h-full flex flex-col justify-between">
            <div className="flex items-center gap-2 mb-3">
              <Users size={14} className="text-muted-foreground" />
              <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">Tracked Actors</span>
            </div>
            <div className={`text-4xl font-bold font-mono leading-none mb-2 ${getHeatColor(27, 50)}`}>27</div>
            <div className="flex items-center gap-1.5 opacity-80">
              <span className="text-[10px] text-red-500 font-medium">5 critical</span>
              <span className="text-[10px] text-muted-foreground">·</span>
              <span className="text-[10px] text-muted-foreground font-medium">40 connections</span>
            </div>
          </Card>
        </motion.div>

        {/* Confidence */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <Card className="p-4 hover:border-white/10 transition-all bg-surface/50 h-full flex flex-col justify-between">
            <div className="flex items-center gap-2 mb-3">
              <Target size={14} className="text-muted-foreground" />
              <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">Confidence</span>
            </div>
            <div className={`text-4xl font-bold font-mono leading-none mb-2 ${getHeatColor((sti?.confidence ?? 0) * 100)}`}>{sti ? `${Math.round(sti.confidence * 100)}%` : '—'}</div>
            <div className="flex items-center gap-1.5 opacity-80">
              <span className="text-[10px] text-muted-foreground font-medium">{sti?.axes.reduce((s, a) => s + a.signals, 0).toLocaleString()} signals</span>
            </div>
          </Card>
        </motion.div>
      </div>

      {/* ── Main Grid: Chart + Feed + Govs ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
        {/* STI Mini Chart */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-5"
        >
          <Card className="h-full">
            <CardHeader className="pb-0">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-1.5">
                  <Activity size={13} className="text-gold" />
                  STI Trend
                </CardTitle>
                <Button variant="ghost" size="sm" className="text-[10px] h-6 text-gold" onClick={() => setView('sti')}>
                  Full View <ChevronRight size={12} />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pt-3">
              {/* STI gradient bar */}
              <div className="relative mb-3">
                <div className="h-1.5 rounded-full sti-gradient opacity-70" />
                <div
                  className="absolute top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-white shadow border-2 border-orange-400"
                  style={{ left: `${sti?.composite ?? 50}%` }}
                />
              </div>
              {/* Axis mini */}
              <div className="grid grid-cols-3 gap-2 mb-3">
                {sti?.axes.slice(0, 6).map((axis) => (
                  <div key={axis.id} className="text-center">
                    <div className="text-[9px] text-muted-foreground truncate">{axis.name}</div>
                    <div className="text-xs font-mono font-bold" style={{ color: axis.color }}>{axis.score}</div>
                  </div>
                ))}
              </div>
              {/* Chart */}
              <div className="h-36">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={history ?? []}>
                    <defs>
                      <linearGradient id="overviewGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#C9A84C" stopOpacity={0.2} />
                        <stop offset="95%" stopColor="#C9A84C" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="timestamp" tick={false} axisLine={false} tickLine={false} />
                    <YAxis domain={[0, 100]} tick={false} axisLine={false} tickLine={false} width={0} />
                    <Tooltip
                      contentStyle={{ background: '#0F0F12', border: '1px solid #27272A', borderRadius: 8, fontSize: 11 }}
                      labelStyle={{ color: '#A1A1AA' }}
                    />
                    <Area type="monotone" dataKey="value" stroke="#C9A84C" strokeWidth={1.5} fill="url(#overviewGrad)" dot={false} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Recent Events */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="lg:col-span-4"
        >
          <Card className="h-full flex flex-col">
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
          <Card className="h-full">
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

      {/* ── Global Dock moved to PlatformShell ── */}
    </div>
  )
}
