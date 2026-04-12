import { motion } from 'motion/react'
import { useQuery } from '@tanstack/react-query'
import { fetchCurrentSTI, fetchSTIHistory, fetchGovernorateScores } from '@/lib/api'
import { getStatusColor, getStatusBg } from '@/lib/utils'
import { Activity, TrendingUp, TrendingDown, Minus, Info } from 'lucide-react'
import {
  AreaChart, LinearXAxis, LinearXAxisTickSeries, LinearXAxisTickLabel,
  LinearYAxis, LinearYAxisTickSeries, AreaSeries, Area, Gradient, GradientStop,
  GridlineSeries, Gridline
} from 'reaviz'
import { useState } from 'react'

const PERIODS = ['7d', '30d', '90d', '1yr'] as const

export default function STIView() {
  const [period, setPeriod] = useState<string>('30d')
  const { data: sti } = useQuery({ queryKey: ['sti'], queryFn: () => fetchCurrentSTI() })
  const { data: history } = useQuery({ queryKey: ['stiHistory', period], queryFn: () => fetchSTIHistory('IQ', period) })
  const { data: govScores } = useQuery({ queryKey: ['govScores'], queryFn: fetchGovernorateScores })

  const TrendIcon = sti?.trend === 'up' ? TrendingUp : sti?.trend === 'down' ? TrendingDown : Minus

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      {/* ── Main STI Display ── */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-8 gold-glow"
      >
        <div className="flex items-center gap-2 mb-6">
          <Activity size={18} className="text-gold" />
          <span className="text-[10px] text-text-tertiary tracking-[0.2em] uppercase font-semibold">
            Sectarianism Tension Index · Iraq · Real-Time
          </span>
        </div>

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
          <div>
            <div className="flex items-end gap-4">
              <span className="text-7xl font-bold font-mono text-text-primary">{sti?.composite ?? '—'}</span>
              <span className="text-2xl text-text-muted font-mono mb-2">/ 100</span>
            </div>
            <div className="flex items-center gap-3 mt-2">
              <span className={`text-sm font-bold px-4 py-1.5 rounded-full border ${getStatusBg(sti?.status ?? '')} ${getStatusColor(sti?.status ?? '')}`}>
                {sti?.status ?? '—'}
              </span>
              <TrendIcon size={18} className={sti?.trend === 'up' ? 'text-red-400' : sti?.trend === 'down' ? 'text-green-400' : 'text-yellow-400'} />
              <span className="text-sm text-text-tertiary">
                {sti ? `${sti.composite > sti.previousComposite ? '+' : ''}${sti.composite - sti.previousComposite}` : ''} from previous
              </span>
            </div>
          </div>
          <div className="text-right space-y-1">
            <div className="text-xs text-text-tertiary">Confidence</div>
            <div className="text-2xl font-mono text-gold">{sti ? `${Math.round(sti.confidence * 100)}%` : '—'}</div>
            <div className="text-xs text-text-muted">
              {sti?.axes.reduce((s, a) => s + a.signals, 0).toLocaleString()} signals analyzed
            </div>
          </div>
        </div>

        {/* STI gradient bar */}
        <div className="relative mb-2">
          <div className="h-4 rounded-full sti-gradient" />
          <motion.div
            className="absolute top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-white shadow-xl border-2 border-orange-400"
            style={{ left: `${sti?.composite ?? 50}%` }}
            animate={{ scale: [1, 1.15, 1] }}
            transition={{ duration: 2.5, repeat: Infinity }}
          />
        </div>
        <div className="flex justify-between text-[9px] text-text-muted font-mono tracking-wider mt-1">
          <span>STABLE</span><span>LOW</span><span>ELEVATED</span><span>HIGH</span><span>CRITICAL</span>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ── Axis Breakdown ── */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card-solid p-6"
        >
          <h3 className="text-xs font-bold tracking-[0.1em] uppercase text-text-secondary mb-5">
            Component Axes
          </h3>
          <div className="space-y-4">
            {sti?.axes.map((axis) => (
              <div key={axis.id}>
                <div className="flex items-center justify-between mb-1.5">
                  <div>
                    <span className="text-sm font-medium text-text-primary">{axis.name}</span>
                    {axis.nameAr && <span className="text-xs text-text-muted ml-2 font-mono">{axis.nameAr}</span>}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold font-mono" style={{ color: axis.color }}>{axis.score}</span>
                    {axis.trend === 'up' && <TrendingUp size={12} className="text-red-400" />}
                    {axis.trend === 'down' && <TrendingDown size={12} className="text-green-400" />}
                    {axis.trend === 'stable' && <Minus size={12} className="text-yellow-400" />}
                  </div>
                </div>
                <div className="h-2 bg-surface-elevated rounded-full overflow-hidden">
                  <motion.div
                    className="h-full rounded-full"
                    style={{ backgroundColor: axis.color }}
                    initial={{ width: 0 }}
                    animate={{ width: `${axis.score}%` }}
                    transition={{ duration: 1, delay: 0.2 }}
                  />
                </div>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-[9px] text-text-muted">Weight: {(axis.weight * 100).toFixed(0)}%</span>
                  <span className="text-[9px] text-text-muted">{axis.signals} signals</span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* ── Time Series Chart ── */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-2 glass-card-solid p-6 relative shadow-[11px_21px_3px_rgba(0,0,0,0.06),14px_27px_7px_rgba(0,0,0,0.10),19px_38px_14px_rgba(0,0,0,0.13),27px_54px_27px_rgba(0,0,0,0.16)]"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-bold tracking-[0.1em] uppercase text-text-secondary">
              STI Trend Matrix
            </h3>
            <div className="flex gap-1 z-10">
              {PERIODS.map((p) => (
                <button
                  key={p}
                  onClick={() => setPeriod(p)}
                  className={`px-3 py-1 rounded-md text-[10px] font-bold tracking-wider transition-all ${
                    period === p
                      ? 'bg-gold/15 text-gold'
                      : 'text-text-muted hover:text-text-secondary'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
          <div className="h-64 mt-4 w-full">
            <AreaChart
              data={[{
                key: 'Composite Tension',
                data: (history ?? []).map((h: any) => ({
                  key: new Date(h.timestamp),
                  data: h.value
                }))
              }]}
              xAxis={
                <LinearXAxis
                  type="time"
                  tickSeries={
                    <LinearXAxisTickSeries
                      label={
                        <LinearXAxisTickLabel
                          format={(v: any) => new Date(v).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          fill="#A0AEC0"
                        />
                      }
                      tickSize={10}
                    />
                  }
                />
              }
              yAxis={
                <LinearYAxis
                  axisLine={null}
                  tickSeries={<LinearYAxisTickSeries line={null} label={null} tickSize={10} />}
                />
              }
              series={
                <AreaSeries
                  type="grouped"
                  interpolation="smooth"
                  area={
                    <Area
                      gradient={
                        <Gradient
                          stops={[
                            <GradientStop key={1} stopOpacity={0} />,
                            <GradientStop key={2} offset="100%" stopOpacity={0.4} />,
                          ]}
                        />
                      }
                    />
                  }
                  colorScheme={['#DC2626']}
                />
              }
              gridlines={<GridlineSeries line={<Gridline strokeColor="rgba(255, 255, 255, 0.05)" />} />}
            />
          </div>
        </motion.div>
      </div>

      {/* ── Governorate Scores ── */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="glass-card-solid p-6"
      >
        <h3 className="text-xs font-bold tracking-[0.1em] uppercase text-text-secondary mb-4">
          Governorate-Level Scores
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {govScores?.sort((a, b) => b.score - a.score).map((gov) => (
            <div key={gov.id} className="p-3 rounded-lg bg-surface-elevated/50 border border-border">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-medium truncate">{gov.name}</span>
                <span className={`text-sm font-bold font-mono ${getStatusColor(gov.status)}`}>{gov.score}</span>
              </div>
              <div className="text-[9px] text-text-muted">{gov.nameAr} · {gov.topAxis}</div>
              <div className="h-1 bg-surface rounded-full mt-2 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${gov.score}%`,
                    backgroundColor: gov.status === 'CRITICAL' ? '#DC2626' : gov.status === 'HIGH' ? '#EA580C' : gov.status === 'ELEVATED' ? '#EAB308' : '#4ADE80'
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  )
}
