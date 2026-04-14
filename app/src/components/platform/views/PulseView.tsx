import { useEffect, useState } from 'react'
import { motion } from 'motion/react'
import {
  Activity, TrendingUp, TrendingDown, GasPump, Globe,
  BarChart3, Target, Info
} from '@/lib/icons'

// ── Types ────────────────────────────────────────────────────────
interface EconomicIndicator { name: string; value: string; change: string; trend: 'up' | 'down' }
interface EnergyMetric { metric: string; value: string; target?: string; detail?: string; change?: string; status: string }
interface InvestmentRisk { gov: string; risk: number; grade: string; sector: string }
interface TradeFlow { country: string; volume: string; type: string; pct: number }

const API = '/api/v1/pulse'

function statusColor(status: string) {
  if (status === 'Offline' || status === 'Critical') return 'text-red-400 bg-red-500/10'
  if (status === 'Above Quota' || status === 'Ascending') return 'text-yellow-400 bg-yellow-500/10'
  if (status === 'Improving' || status === 'Stable') return 'text-green-400 bg-green-500/10'
  return 'text-blue-400 bg-blue-500/10'
}

export default function PulseView() {
  const [indicators, setIndicators] = useState<EconomicIndicator[]>([])
  const [energy, setEnergy] = useState<EnergyMetric[]>([])
  const [risks, setRisks] = useState<InvestmentRisk[]>([])
  const [trade, setTrade] = useState<TradeFlow[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      fetch(`${API}/economic-indicators`).then(r => r.json()),
      fetch(`${API}/energy-sector`).then(r => r.json()),
      fetch(`${API}/investment-risks`).then(r => r.json()),
      fetch(`${API}/trade-flows`).then(r => r.json()),
    ]).then(([i, e, r, t]) => {
      setIndicators(i); setEnergy(e); setRisks(r); setTrade(t)
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-text-muted text-sm animate-pulse">Loading PULSE economic intelligence...</div>
      </div>
    )
  }

  return (
    <div className="p-8 space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <BarChart3 size={28} weight="duotone" className="text-orange-400" />
            PULSE — Economic Intelligence
          </h1>
          <p className="text-sm text-text-muted mt-1">
            Sub-national economic indicators, energy sector analytics, and bilateral trade flow monitoring.
          </p>
        </div>
        <div className="flex items-center gap-2 text-[10px] text-green-400 font-mono">
          <Activity size={12} className="animate-pulse" /> LIVE DATA
        </div>
      </div>

      {/* Economic KPIs */}
      <div>
        <h2 className="text-[10px] uppercase tracking-[0.2em] text-text-tertiary font-semibold mb-3">
          Core Economic Indicators
        </h2>
        <div className="grid grid-cols-3 lg:grid-cols-6 gap-3">
          {indicators.map((ind, i) => (
            <motion.div
              key={ind.name}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className="glass-card p-4 border border-white/5"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-[9px] text-text-muted uppercase tracking-wider truncate">{ind.name}</span>
                {ind.trend === 'up' ? (
                  <TrendingUp size={12} className="text-green-400" />
                ) : (
                  <TrendingDown size={12} className="text-red-400" />
                )}
              </div>
              <div className="text-lg font-bold font-mono text-white">{ind.value}</div>
              <div className={`text-[10px] font-mono mt-1 ${ind.trend === 'up' && ind.change.includes('+') ? 'text-green-400' : 'text-red-400'}`}>
                {ind.change}
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Energy Sector */}
        <div>
          <h2 className="text-[10px] uppercase tracking-[0.2em] text-text-tertiary font-semibold mb-3 flex items-center gap-2">
            <GasPump size={12} className="text-yellow-400" />
            Energy Sector
          </h2>
          <div className="space-y-2">
            {energy.map((e, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.06 }}
                className="glass-card p-3 border border-white/5 flex items-center justify-between"
              >
                <div>
                  <p className="text-xs font-semibold text-white">{e.metric}</p>
                  <p className="text-[10px] text-text-muted mt-0.5">
                    {e.target || e.detail || ''}
                  </p>
                </div>
                <div className="text-right flex items-center gap-2">
                  <span className="text-sm font-bold font-mono text-white">{e.value}</span>
                  <span className={`text-[8px] px-1.5 py-0.5 rounded font-mono ${statusColor(e.status)}`}>
                    {e.status.toUpperCase()}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Trade Flows */}
        <div>
          <h2 className="text-[10px] uppercase tracking-[0.2em] text-text-tertiary font-semibold mb-3 flex items-center gap-2">
            <Globe size={12} className="text-blue-400" />
            Bilateral Trade Flows
          </h2>
          <div className="glass-card p-4 border border-white/5 space-y-3">
            {trade.map((t, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.08 }}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-white">{t.country}</span>
                    <span className={`text-[8px] px-1.5 py-0.5 rounded font-mono ${t.type === 'Export' ? 'text-green-400 bg-green-500/10' : 'text-blue-400 bg-blue-500/10'}`}>
                      {t.type}
                    </span>
                  </div>
                  <span className="text-xs font-bold font-mono text-white">{t.volume}</span>
                </div>
                <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${t.pct * 3}%` }}
                    transition={{ delay: i * 0.1, duration: 0.5 }}
                    className="h-full rounded-full"
                    style={{ backgroundColor: t.type === 'Export' ? '#22C55E' : '#3B82F6' }}
                  />
                </div>
              </motion.div>
            ))}
          </div>

          {/* Investment Risk Zones */}
          {risks.length > 0 && (
            <div className="mt-4">
              <h2 className="text-[10px] uppercase tracking-[0.2em] text-text-tertiary font-semibold mb-3 flex items-center gap-2">
                <Target size={12} className="text-red-400" />
                Investment Risk Zones
              </h2>
              <div className="space-y-2">
                {risks.map((r, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.06 }}
                    className="glass-card p-3 border border-white/5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-white">{r.gov}</span>
                      <span className={`text-xs font-bold font-mono ${r.grade.startsWith('A') || r.grade.startsWith('B') ? 'text-green-400' : r.grade.startsWith('C') ? 'text-yellow-400' : 'text-red-400'}`}>
                        {r.grade}
                      </span>
                    </div>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-[9px] text-text-muted">{r.sector}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-1.5 bg-white/5 rounded-full overflow-hidden">
                          <div className="h-full rounded-full" style={{ width: `${r.risk}%`, backgroundColor: r.risk > 60 ? '#EF4444' : r.risk > 40 ? '#F59E0B' : '#22C55E' }} />
                        </div>
                        <span className="text-[9px] font-mono text-text-muted">{r.risk}%</span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
