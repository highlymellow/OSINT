import { useEffect, useState } from 'react'
import { motion } from 'motion/react'
import {
  Activity, TrendingUp, TrendingDown, GasPump, Globe,
  BarChart3, Target, Info, Search, ShieldAlert,
  Bitcoin, Coins
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
  const [activeTab, setActiveTab] = useState<'macro' | 'crypto'>('macro')
  const [cryptoSearch, setCryptoSearch] = useState('')

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
      </div>

      {/* Tabs */}
      <div className="flex gap-2 p-1 bg-surface rounded-xl w-fit border border-border">
        <button
           onClick={() => setActiveTab('macro')}
           className={`px-6 py-2.5 rounded-lg text-xs font-semibold tracking-wide transition-all ${activeTab === 'macro' ? 'bg-gold/15 text-gold' : 'text-text-muted hover:text-white'}`}
        >
          Macro-Economics
        </button>
        <button
           onClick={() => setActiveTab('crypto')}
           className={`px-6 py-2.5 rounded-lg text-xs font-semibold tracking-wide transition-all flex items-center gap-2 ${activeTab === 'crypto' ? 'bg-gold/15 text-gold' : 'text-text-muted hover:text-white'}`}
        >
          OFAC Sanctions Tracker
        </button>
      </div>

      {activeTab === 'macro' && (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
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
      </motion.div>
      )}

      {/* ── Blockchain OSINT ── */}
      {activeTab === 'crypto' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex-1 flex flex-col items-center justify-center p-8 text-center border-2 border-dashed border-red-500/30 rounded-2xl bg-red-500/5 max-w-4xl mx-auto w-full">
           <ShieldAlert size={48} className="text-red-400 mb-4" />
           <h2 className="text-lg font-bold text-red-500 tracking-widest uppercase mb-2">Targeted Sanctions & Blockchain OSINT</h2>
           <p className="text-sm text-red-400/80 max-w-lg mx-auto mb-8">
             Perform cross-chain analysis against the OFAC Specially Designated Nationals (SDN) lists. Intercept automated routing to terror-financing syndicates.
           </p>

           <div className="w-full bg-deep-black rounded-xl p-6 border border-red-500/20 shadow-[0_0_30px_rgba(239,68,68,0.1)] text-left flex flex-col gap-6">
             <div className="relative">
                <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-red-400" />
                <input 
                  type="text" 
                  value={cryptoSearch}
                  onChange={(e) => setCryptoSearch(e.target.value)}
                  placeholder="Enter BTC, ETH, TRX or Monero wallet to scan against OFAC Database..."
                  className="w-full pl-11 pr-4 py-3 bg-red-500/10 border border-red-500/30 rounded-lg text-sm text-white placeholder:text-red-400/50 focus:outline-none focus:border-red-400 font-mono"
                  disabled
                />
             </div>
             
             <div className="flex gap-4">
               {/* Pre-cached SDN Nodes */}
               <div className="w-1/2 space-y-3">
                 <h4 className="text-[10px] text-red-400 uppercase tracking-widest font-bold">LATEST HIGHLIGHTED SDN ADDITIONS</h4>
                 
                 <div className="p-3 bg-red-500/10 rounded-lg border border-red-500/30">
                    <div className="flex justify-between items-start mb-2">
                       <div>
                         <span className="text-xs font-bold text-white block">TG8Xm1...9sMk</span>
                         <span className="text-[10px] text-red-400 block mt-0.5">TRON (TRC20)</span>
                       </div>
                       <span className="px-1.5 py-0.5 bg-red-500 text-white font-bold text-[9px] rounded">Quds Force / Hezbollah</span>
                    </div>
                    <div className="text-[10px] text-text-muted mt-2 border-t border-red-500/20 pt-2 flex justify-between">
                       <span>Total Flow: <span className="text-white">$14.2M USD</span></span>
                       <span>289 Txns</span>
                    </div>
                 </div>

                 <div className="p-3 bg-red-500/10 rounded-lg border border-red-500/30">
                    <div className="flex justify-between items-start mb-2">
                       <div>
                         <span className="text-xs font-bold text-white block">1FzWLk...y49P</span>
                         <span className="text-[10px] text-orange-400 block mt-0.5">BITCOIN (BTC)</span>
                       </div>
                       <span className="px-1.5 py-0.5 bg-orange-500 text-white font-bold text-[9px] rounded">PMC Wagner Group</span>
                    </div>
                    <div className="text-[10px] text-text-muted mt-2 border-t border-red-500/20 pt-2 flex justify-between">
                       <span>Total Flow: <span className="text-white">840.5 BTC</span></span>
                       <span>12 Txns</span>
                    </div>
                 </div>
               </div>

               {/* Threat Graph Simulation */}
               <div className="w-1/2 bg-red-500/5 rounded-lg border border-red-500/20 p-4 flex flex-col items-center justify-center relative overflow-hidden">
                 <div className="absolute inset-0 bg-[linear-gradient(rgba(239,68,68,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(239,68,68,0.05)_1px,transparent_1px)] bg-[size:20px_20px]" />
                 <div className="relative z-10 w-24 h-24 rounded-full border border-red-500/50 flex items-center justify-center shadow-[0_0_20px_rgba(239,68,68,0.2)]">
                    <ShieldAlert size={32} className="text-red-500 animate-pulse" />
                 </div>
                 <span className="relative z-10 text-[10px] font-bold text-red-400 uppercase mt-4 text-center">
                    CHAINALYSIS ENGINE HOOKED.<br/>AWAITING WALLET INPUT.
                 </span>
                 
                 {/* Fake nodes */}
                 <div className="absolute top-1/4 left-1/4 w-3 h-3 bg-red-400 rounded-full animate-pulse shadow-[0_0_10px_red]"></div>
                 <div className="absolute bottom-1/4 right-1/4 w-3 h-3 bg-orange-400 rounded-full animate-pulse shadow-[0_0_10px_orange]"></div>
               </div>
             </div>
           </div>
        </motion.div>
      )}

    </div>
  )
}
