import { motion } from 'motion/react'
import { useQuery } from '@tanstack/react-query'
import { fetchEvents } from '@/lib/api'
import { formatTimestamp, getSeverityColor, getStatusColor, getStatusBg } from '@/lib/utils'
import { useState } from 'react'
import {
  Radio, Filter, CheckCircle, AlertTriangle, Search,
  ChevronDown, Eye, ExternalLink
} from 'lucide-react'

const SEVERITY_LEVELS = ['all', 'critical', 'high', 'medium', 'low'] as const
const EVENT_TYPES = ['all', 'conflict', 'political', 'economic', 'social', 'security', 'climate'] as const

export default function SignalView() {
  const [severityFilter, setSeverityFilter] = useState('all')
  const [typeFilter, setTypeFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [stiOnly, setStiOnly] = useState(false)

  const { data: events } = useQuery({ queryKey: ['events'], queryFn: () => fetchEvents() })

  const filtered = events?.filter((evt) => {
    if (severityFilter !== 'all' && evt.severity !== severityFilter) return false
    if (typeFilter !== 'all' && evt.type !== typeFilter) return false
    if (stiOnly && !evt.stiRelevance) return false
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      if (!evt.title.toLowerCase().includes(q) && !evt.summary.toLowerCase().includes(q)) return false
    }
    return true
  }) ?? []

  return (
    <div className="p-6 space-y-4 animate-fade-in">
      {/* ── Filters ── */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card-solid p-4"
      >
        <div className="flex flex-wrap items-center gap-3">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px]">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
            <input
              type="text"
              placeholder="Search events..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-surface-elevated border border-border rounded-lg text-sm
                       text-text-primary placeholder:text-text-muted focus:border-gold/50 focus:outline-none transition-colors"
            />
          </div>

          {/* Severity filter */}
          <div className="flex gap-1">
            {SEVERITY_LEVELS.map((s) => (
              <button
                key={s}
                onClick={() => setSeverityFilter(s)}
                className={`px-3 py-1.5 rounded-md text-[10px] font-bold tracking-wider uppercase transition-all ${
                  severityFilter === s
                    ? s === 'all' ? 'bg-gold/15 text-gold' : `${getStatusBg(s)} ${getStatusColor(s)}`
                    : 'text-text-muted hover:text-text-secondary hover:bg-surface-hover'
                }`}
              >
                {s}
              </button>
            ))}
          </div>

          {/* Type filter */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-1.5 bg-surface-elevated border border-border rounded-md text-xs text-text-secondary
                     focus:border-gold/50 focus:outline-none appearance-none cursor-pointer"
          >
            {EVENT_TYPES.map((t) => (
              <option key={t} value={t}>{t === 'all' ? 'All Types' : t}</option>
            ))}
          </select>

          {/* STI toggle */}
          <button
            onClick={() => setStiOnly(!stiOnly)}
            className={`px-3 py-1.5 rounded-md text-[10px] font-bold tracking-wider transition-all flex items-center gap-1.5 ${
              stiOnly ? 'bg-gold/15 text-gold' : 'text-text-muted hover:text-text-secondary'
            }`}
          >
            <Radio size={12} />
            STI Only
          </button>

          <div className="text-[10px] text-text-muted font-mono">
            {filtered.length} events
          </div>
        </div>
      </motion.div>

      {/* ── Events Feed ── */}
      <div className="space-y-2">
        {filtered.map((evt, i) => (
          <motion.div
            key={evt.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.03 * i }}
            className="glass-card-solid p-5 hover:border-gold/20 transition-all duration-300 group cursor-default"
          >
            <div className="flex items-start gap-4">
              {/* Severity + Verification */}
              <div className="shrink-0 flex flex-col items-center gap-1.5 pt-0.5">
                <span className={`text-[9px] font-bold px-2 py-0.5 rounded border ${getStatusBg(evt.severity)} ${getSeverityColor(evt.severity)} uppercase`}>
                  {evt.severity}
                </span>
                {evt.verified ? (
                  <CheckCircle size={14} className="text-green-400" />
                ) : (
                  <AlertTriangle size={14} className="text-yellow-400" />
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-semibold text-text-primary group-hover:text-gold transition-colors">
                  {evt.title}
                </h4>
                {evt.titleAr && (
                  <p className="text-xs text-text-muted mt-0.5 font-mono" dir="rtl">{evt.titleAr}</p>
                )}
                <p className="text-xs text-text-secondary mt-2 leading-relaxed line-clamp-2">
                  {evt.summary}
                </p>

                <div className="flex flex-wrap items-center gap-2 mt-3">
                  <span className="text-[10px] text-text-muted">{evt.governorate}, {evt.country}</span>
                  <span className="text-[10px] text-text-muted">·</span>
                  <span className="text-[10px] text-text-muted">{formatTimestamp(evt.timestamp)}</span>
                  <span className="text-[10px] text-text-muted">·</span>
                  <span className="text-[10px] text-text-muted">{evt.source}</span>

                  {evt.stiRelevance && (
                    <>
                      <span className="text-[10px] text-text-muted">·</span>
                      <span className="text-[9px] text-gold bg-gold/10 px-1.5 py-0.5 rounded font-bold">
                        STI
                      </span>
                    </>
                  )}

                  {evt.stiAxes?.map((axis) => (
                    <span key={axis} className="text-[9px] text-text-tertiary bg-surface-elevated px-1.5 py-0.5 rounded">
                      {axis}
                    </span>
                  ))}
                </div>

                {/* Entities */}
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {evt.entities.map((e) => (
                    <span key={e} className="text-[9px] text-text-muted border border-border px-2 py-0.5 rounded-full">
                      {e}
                    </span>
                  ))}
                </div>
              </div>

              {/* Sentiment */}
              <div className="shrink-0 text-right">
                <div className="text-[9px] text-text-muted uppercase mb-1">Sentiment</div>
                <div className={`text-sm font-mono font-bold ${evt.sentiment < -0.5 ? 'text-red-400' : evt.sentiment < 0 ? 'text-orange-400' : 'text-green-400'}`}>
                  {evt.sentiment > 0 ? '+' : ''}{evt.sentiment.toFixed(2)}
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
