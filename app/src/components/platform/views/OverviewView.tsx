import { motion } from 'motion/react'
import { useQuery } from '@tanstack/react-query'
import { fetchCurrentSTI, fetchEvents, fetchGovernorateScores } from '@/lib/api'
import { modules } from '@/lib/data'
import { useAppStore } from '@/store/app'
import { getStatusColor, getStatusBg, formatTimestamp, getSeverityColor } from '@/lib/utils'
import {
  Activity, TrendingUp, TrendingDown, Minus, AlertTriangle,
  Shield, Radio, MapPin, Network, Eye, BarChart3, Radar, Layers, Newspaper,
  ChevronRight, Zap, CheckCircle, XCircle
} from 'lucide-react'
import type { NavView } from '@/lib/types'

const MODULE_ICONS: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  signal: Radio, terrain: MapPin, nexus: Network, lens: Eye,
  pulse: BarChart3, foresight: Radar, forge: Layers, sti: Activity,
}

export default function OverviewView() {
  const setView = useAppStore((s) => s.setView)
  const { data: sti } = useQuery({ queryKey: ['sti'], queryFn: () => fetchCurrentSTI() })
  const { data: events } = useQuery({ queryKey: ['events'], queryFn: () => fetchEvents({ limit: 5 }) })
  const { data: govScores } = useQuery({ queryKey: ['govScores'], queryFn: fetchGovernorateScores })

  const topGovs = govScores?.sort((a, b) => b.score - a.score).slice(0, 5) ?? []

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      {/* ── STI Summary Banner ── */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-6 gold-glow"
      >
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Activity size={16} className="text-gold" />
              <span className="text-[10px] text-text-tertiary tracking-[0.2em] uppercase font-semibold">
                Sectarianism Tension Index · Iraq
              </span>
            </div>
            <div className="flex items-end gap-4">
              <span className="text-5xl font-bold font-mono text-text-primary">
                {sti?.composite ?? '—'}
              </span>
              <span className="text-lg text-text-muted font-mono mb-1">/ 100</span>
              <span className={`text-sm font-bold px-3 py-1 rounded-full border ${getStatusBg(sti?.status ?? '')} ${getStatusColor(sti?.status ?? '')}`}>
                {sti?.status ?? '—'}
              </span>
              {sti?.trend === 'up' && <TrendingUp size={20} className="text-red-400 mb-1" />}
              {sti?.trend === 'down' && <TrendingDown size={20} className="text-green-400 mb-1" />}
              {sti?.trend === 'stable' && <Minus size={20} className="text-yellow-400 mb-1" />}
            </div>
          </div>
          <div className="text-right">
            <div className="text-[10px] text-text-tertiary uppercase tracking-wide mb-1">Confidence</div>
            <div className="text-xl font-mono text-gold">{sti ? `${Math.round(sti.confidence * 100)}%` : '—'}</div>
            <div className="text-[10px] text-text-muted mt-1">
              {sti?.lastUpdated ? formatTimestamp(sti.lastUpdated) : '—'}
            </div>
          </div>
        </div>

        {/* STI gradient bar */}
        <div className="relative mt-5 mb-4">
          <div className="h-2 rounded-full sti-gradient opacity-70" />
          <div
            className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-white shadow-lg border-2 border-orange-400"
            style={{ left: `${sti?.composite ?? 50}%` }}
          />
        </div>

        {/* Axis mini-bars */}
        <div className="grid grid-cols-3 md:grid-cols-6 gap-3 mt-4">
          {sti?.axes.map((axis) => (
            <div key={axis.id} className="text-center">
              <div className="text-[10px] text-text-tertiary mb-1 truncate">{axis.name}</div>
              <div className="text-sm font-mono font-bold" style={{ color: axis.color }}>
                {axis.score}
              </div>
              <div className="h-1 bg-surface-elevated rounded-full mt-1 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{ width: `${axis.score}%`, backgroundColor: axis.color }}
                />
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ── Recent Events ── */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-2 glass-card-solid p-5"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Zap size={14} className="text-gold" />
              <h3 className="text-xs font-bold tracking-[0.1em] uppercase text-text-secondary">Latest Events</h3>
            </div>
            <button
              onClick={() => setView('signal')}
              className="text-[10px] text-gold hover:text-gold-dim flex items-center gap-1 transition-colors"
            >
              View All <ChevronRight size={12} />
            </button>
          </div>
          <div className="space-y-2">
            {events?.slice(0, 5).map((evt, i) => (
              <motion.div
                key={evt.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.05 * i }}
                className="flex items-start gap-3 p-3 rounded-lg hover:bg-surface-hover transition-colors group cursor-default"
              >
                <div className="shrink-0 mt-0.5">
                  {evt.verified ? (
                    <CheckCircle size={14} className="text-green-400" />
                  ) : (
                    <AlertTriangle size={14} className="text-yellow-400" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-text-primary truncate group-hover:text-gold transition-colors">
                    {evt.title}
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`text-[10px] font-bold uppercase ${getSeverityColor(evt.severity)}`}>
                      {evt.severity}
                    </span>
                    <span className="text-[10px] text-text-muted">·</span>
                    <span className="text-[10px] text-text-muted">{evt.governorate}</span>
                    <span className="text-[10px] text-text-muted">·</span>
                    <span className="text-[10px] text-text-muted">{formatTimestamp(evt.timestamp)}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* ── Top Governorates ── */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card-solid p-5"
        >
          <div className="flex items-center gap-2 mb-4">
            <MapPin size={14} className="text-gold" />
            <h3 className="text-xs font-bold tracking-[0.1em] uppercase text-text-secondary">Hottest Governorates</h3>
          </div>
          <div className="space-y-3">
            {topGovs.map((gov, i) => (
              <motion.div
                key={gov.id}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.05 * i }}
                className="flex items-center justify-between p-3 rounded-lg bg-surface-elevated/50 border border-border"
              >
                <div>
                  <div className="text-sm font-medium">{gov.name}</div>
                  <div className="text-[10px] text-text-muted">{gov.nameAr}</div>
                </div>
                <div className="text-right">
                  <div className={`text-lg font-bold font-mono ${getStatusColor(gov.status)}`}>
                    {gov.score}
                  </div>
                  <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${getStatusBg(gov.status)} ${getStatusColor(gov.status)}`}>
                    {gov.status}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* ── Module Grid ── */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <div className="flex items-center gap-2 mb-4">
          <Shield size={14} className="text-gold" />
          <h3 className="text-xs font-bold tracking-[0.1em] uppercase text-text-secondary">Intelligence Modules</h3>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {modules.map((mod, i) => {
            const Icon = MODULE_ICONS[mod.id] || Activity
            return (
              <motion.button
                key={mod.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.03 * i }}
                onClick={() => setView(mod.id as NavView)}
                className="group p-4 rounded-xl border border-border bg-surface/50
                         hover:border-gold/30 hover:bg-surface-elevated/50
                         transition-all duration-300 text-left"
              >
                <Icon size={20} className="text-gold mb-3 group-hover:scale-110 transition-transform" />
                <div className="text-xs font-bold tracking-[0.1em] mb-1">{mod.name}</div>
                <div className="text-[10px] text-text-muted leading-relaxed line-clamp-2">{mod.description}</div>
                {mod.status !== 'active' && (
                  <span className="inline-block mt-2 text-[8px] px-1.5 py-0.5 rounded bg-gold/10 text-gold font-bold tracking-wider uppercase">
                    {mod.status}
                  </span>
                )}
              </motion.button>
            )
          })}
        </div>
      </motion.div>
    </div>
  )
}
