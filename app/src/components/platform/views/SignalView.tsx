import { motion } from 'motion/react'
import { useQuery } from '@tanstack/react-query'
import { fetchEvents } from '@/lib/api'
import {
  fetchGDELTEvents,
  fetchReliefWebReports,
  fetchGDACSAlerts,
  type GDELTEvent,
  type ReliefWebReport,
  type GDACSAlert,
} from '@/lib/osint-feeds'
import { formatTimestamp, getSeverityColor, getStatusColor, getStatusBg } from '@/lib/utils'
import { useState, useMemo } from 'react'
import { 
  RadioTower, CheckCircle, AlertTriangle, Search,
  ExternalLink, Globe2, Zap, TrendingDown, Rss, RefreshCw, Shield
 } from "@/lib/icons"

const SEVERITY_LEVELS = ['all', 'critical', 'high', 'medium', 'low'] as const
const EVENT_TYPES = ['all', 'conflict', 'political', 'economic', 'social', 'security', 'climate', 'humanitarian'] as const
const FEED_SOURCES = ['all', 'meridian', 'gdelt', 'reliefweb', 'gdacs'] as const

type FeedBadge = 'internal' | 'gdelt' | 'reliefweb' | 'gdacs'

const SOURCE_BADGE_STYLES: Record<FeedBadge, { bg: string; text: string; label: string }> = {
  internal: { bg: 'bg-green-500/15', text: 'text-green-400', label: 'MERIDIAN' },
  gdelt:    { bg: 'bg-cyan-500/15',  text: 'text-cyan-400',  label: 'GDELT' },
  reliefweb:{ bg: 'bg-blue-500/15',  text: 'text-blue-400',  label: 'RELIEFWEB' },
  gdacs:    { bg: 'bg-orange-500/15',text: 'text-orange-400',label: 'GDACS' },
}

export default function SignalView() {
  const [severityFilter, setSeverityFilter] = useState('all')
  const [typeFilter, setTypeFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [stiOnly, setStiOnly] = useState(false)
  const [feedSource, setFeedSource] = useState<string>('all')

  // MERIDIAN internal events (mock/backend)
  const { data: events } = useQuery({ queryKey: ['events'], queryFn: () => fetchEvents() })

  // LIVE GDELT events — real-time conflict intelligence
  const { data: gdeltEvents = [], isLoading: gdeltLoading, refetch: refetchGdelt } = useQuery({
    queryKey: ['gdelt-events'],
    queryFn: () => fetchGDELTEvents({ query: 'iraq OR baghdad OR kirkuk OR mosul OR basra OR erbil OR kurdistan', maxRecords: 50 }),
    refetchInterval: 300_000,
    staleTime: 120_000,
  })

  // LIVE ReliefWeb reports — UN OCHA humanitarian/conflict reports (NO rate limits)
  const { data: reliefWebReports = [], isLoading: rwLoading } = useQuery({
    queryKey: ['reliefweb-events'],
    queryFn: () => fetchReliefWebReports({ country: 'Iraq', limit: 30 }),
    refetchInterval: 600_000, // 10 minutes
    staleTime: 300_000,
  })

  // LIVE GDACS alerts — UN disaster alerts (NO rate limits)
  const { data: gdacsAlerts = [], isLoading: gdacsLoading } = useQuery({
    queryKey: ['gdacs-alerts'],
    queryFn: () => fetchGDACSAlerts(),
    refetchInterval: 600_000,
    staleTime: 300_000,
  })

  // Transform GDELT events into unified event schema
  const gdeltMapped = useMemo(() => {
    return gdeltEvents.map((g) => ({
      id: g.id,
      title: g.title,
      titleAr: undefined as string | undefined,
      summary: `Source: ${g.domain} | Tone: ${g.tone.toFixed(1)} | Goldstein: ${g.goldsteinScale.toFixed(1)} | Mentions: ${g.numMentions}`,
      type: classifyGDELTEvent(g),
      severity: gdeltSeverity(g),
      timestamp: g.timestamp,
      source: g.domain,
      governorate: g.sourcecountry || 'Iraq',
      country: g.sourcecountry || 'IQ',
      verified: true,
      sentiment: g.tone / 10,
      entities: [g.actor1, g.actor2].filter(Boolean),
      stiRelevance: Math.abs(g.goldsteinScale) > 5,
      stiAxes: [] as string[],
      url: g.url,
      feedBadge: 'gdelt' as FeedBadge,
    }))
  }, [gdeltEvents])

  // Transform ReliefWeb reports into unified event schema
  const rwMapped = useMemo(() => {
    return reliefWebReports.map((r) => ({
      id: r.id,
      title: r.title,
      titleAr: undefined as string | undefined,
      summary: r.body || `${r.theme} — ${r.source}`,
      type: classifyRWReport(r.theme),
      severity: r.theme.toLowerCase().includes('flash') || r.theme.toLowerCase().includes('emergency') ? 'critical' : 'medium',
      timestamp: r.date,
      source: r.source,
      governorate: r.country,
      country: r.country,
      verified: true,
      sentiment: -0.3,
      entities: [r.source],
      stiRelevance: true,
      stiAxes: [r.theme] as string[],
      url: r.url,
      feedBadge: 'reliefweb' as FeedBadge,
    }))
  }, [reliefWebReports])

  // Transform GDACS alerts into unified event schema
  const gdacsMapped = useMemo(() => {
    return gdacsAlerts.map((a) => ({
      id: a.id,
      title: a.title,
      titleAr: undefined as string | undefined,
      summary: a.description,
      type: a.eventType === 'earthquake' ? 'security' : a.eventType === 'flood' ? 'climate' : 'security',
      severity: a.severity,
      timestamp: a.date,
      source: 'GDACS / UN',
      governorate: a.country,
      country: a.country,
      verified: true,
      sentiment: -0.6,
      entities: ['GDACS', a.country],
      stiRelevance: a.severity === 'critical' || a.severity === 'high',
      stiAxes: [a.eventType] as string[],
      url: a.url,
      feedBadge: 'gdacs' as FeedBadge,
    }))
  }, [gdacsAlerts])

  // Merge ALL event streams
  const allEvents = useMemo(() => {
    const internal = (events || []).map(e => ({ ...e, feedBadge: 'internal' as FeedBadge, url: '' }))
    
    if (feedSource === 'meridian') return internal
    if (feedSource === 'gdelt') return gdeltMapped
    if (feedSource === 'reliefweb') return rwMapped
    if (feedSource === 'gdacs') return gdacsMapped
    
    // Merge ALL and sort by timestamp (NaN-safe)
    const merged = [...internal, ...gdeltMapped, ...rwMapped, ...gdacsMapped]
    return merged.sort((a, b) => {
      const ta = new Date(a.timestamp).getTime() || 0
      const tb = new Date(b.timestamp).getTime() || 0
      return tb - ta
    })
  }, [events, gdeltMapped, rwMapped, gdacsMapped, feedSource])

  const filtered = allEvents.filter((evt) => {
    if (severityFilter !== 'all' && evt.severity !== severityFilter) return false
    if (typeFilter !== 'all' && evt.type !== typeFilter) return false
    if (stiOnly && !evt.stiRelevance) return false
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      if (!(evt.title || '').toLowerCase().includes(q) && !(evt.summary || '').toLowerCase().includes(q)) return false
    }
    return true
  })

  const liveCount = gdeltEvents.length + reliefWebReports.length + gdacsAlerts.length
  const isAnyLiveLoading = gdeltLoading || rwLoading || gdacsLoading

  return (
    <div className="p-6 space-y-4 animate-fade-in">
      {/* ── Live Status Banner ── */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between px-4 py-2 rounded-xl bg-surface border border-border"
      >
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${liveCount > 0 ? 'bg-green-500' : 'bg-yellow-500'} animate-pulse`} />
            <span className={`text-[10px] font-bold tracking-widest uppercase ${liveCount > 0 ? 'text-green-400' : 'text-yellow-400'}`}>
              {liveCount > 0 ? 'LIVE FEED' : 'CONNECTING...'}
            </span>
          </div>
          <span className="text-[10px] text-text-muted font-mono">
            {(events?.length || 0)} internal · {gdeltEvents.length} GDELT · {reliefWebReports.length} ReliefWeb · {gdacsAlerts.length} GDACS · {filtered.length} visible
          </span>
        </div>
        <div className="flex items-center gap-2">
          {gdeltLoading && (
            <RefreshCw size={12} className="text-gold animate-spin" />
          )}
          <button
            onClick={() => refetchGdelt()}
            className="text-[10px] text-text-muted hover:text-gold transition-colors flex items-center gap-1 font-mono"
          >
            <Rss size={10} />
            Refresh GDELT
          </button>
        </div>
      </motion.div>

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

          {/* Feed source filter */}
          <div className="flex gap-1 border border-border rounded-lg p-0.5">
            {FEED_SOURCES.map((s) => (
              <button
                key={s}
                onClick={() => setFeedSource(s)}
                className={`px-3 py-1.5 rounded-md text-[10px] font-bold tracking-wider uppercase transition-all ${
                  feedSource === s
                    ? 'bg-gold/15 text-gold'
                    : 'text-text-muted hover:text-text-secondary'
                }`}
              >
                {s === 'all' ? 'All Sources' : s === 'gdelt' ? '🛰 GDELT' : s === 'reliefweb' ? '🇺🇳 ReliefWeb' : s === 'gdacs' ? '⚠️ GDACS' : '📡 Internal'}
              </button>
            ))}
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
            <RadioTower size={12} />
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
            transition={{ delay: 0.02 * Math.min(i, 20) }}
            className="glass-card-solid p-5 hover:border-gold/20 transition-all duration-300 group cursor-default"
          >
            <div className="flex items-start gap-4">
              {/* Severity + Source Badge */}
              <div className="shrink-0 flex flex-col items-center gap-1.5 pt-0.5">
                <span className={`text-[9px] font-bold px-2 py-0.5 rounded border ${getStatusBg(evt.severity)} ${getSeverityColor(evt.severity)} uppercase`}>
                  {evt.severity}
                </span>
                {(() => {
                  const badge = SOURCE_BADGE_STYLES[(evt as any).feedBadge as FeedBadge] || SOURCE_BADGE_STYLES.internal
                  return (evt as any).feedBadge !== 'internal' ? (
                    <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded ${badge.bg} ${badge.text} border border-current/20`}>
                      {badge.label}
                    </span>
                  ) : evt.verified ? (
                    <CheckCircle size={14} className="text-green-400" />
                  ) : (
                    <AlertTriangle size={14} className="text-yellow-400" />
                  )
                })()}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <h4 className="text-sm font-semibold text-text-primary group-hover:text-gold transition-colors">
                    {evt.title}
                  </h4>
                  {(evt as any).url && (
                    <a
                      href={(evt as any).url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="shrink-0 text-text-muted hover:text-gold transition-colors"
                    >
                      <ExternalLink size={14} />
                    </a>
                  )}
                </div>
                {evt.titleAr && (
                  <p className="text-xs text-text-muted mt-0.5 font-mono" dir="rtl">{evt.titleAr}</p>
                )}
                <p className="text-xs text-text-secondary mt-2 leading-relaxed line-clamp-2">
                  {evt.summary}
                </p>

                <div className="flex flex-wrap items-center gap-2 mt-3">
                  <span className="text-[10px] text-text-muted">{evt.governorate || 'Unknown'}{evt.country ? `, ${evt.country}` : ''}</span>
                  <span className="text-[10px] text-text-muted">·</span>
                  <span className="text-[10px] text-text-muted">{safeFormatTimestamp(evt.timestamp)}</span>
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
                  {(evt.entities || []).filter(Boolean).map((e) => (
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

// ── GDELT Classification Helpers ────────────────────────────────

function classifyGDELTEvent(g: GDELTEvent): string {
  const title = g.title.toLowerCase()
  if (title.includes('attack') || title.includes('kill') || title.includes('bomb') || title.includes('strike') || title.includes('war') || title.includes('militia'))
    return 'conflict'
  if (title.includes('elect') || title.includes('parliament') || title.includes('president') || title.includes('government') || title.includes('vote'))
    return 'political'
  if (title.includes('oil') || title.includes('trade') || title.includes('economy') || title.includes('invest') || title.includes('sanction'))
    return 'economic'
  if (title.includes('army') || title.includes('military') || title.includes('police') || title.includes('isis') || title.includes('terror'))
    return 'security'
  if (title.includes('refugee') || title.includes('displac') || title.includes('aid') || title.includes('humanitarian'))
    return 'social'
  return 'political'
}

function gdeltSeverity(g: GDELTEvent): string {
  const absGoldstein = Math.abs(g.goldsteinScale)
  if (absGoldstein >= 8) return 'critical'
  if (absGoldstein >= 5) return 'high'
  if (absGoldstein >= 3) return 'medium'
  return 'low'
}

function classifyRWReport(theme: string): string {
  const t = theme.toLowerCase()
  if (t.includes('conflict') || t.includes('protection') || t.includes('security')) return 'conflict'
  if (t.includes('food') || t.includes('nutrition') || t.includes('health')) return 'humanitarian'
  if (t.includes('disaster') || t.includes('climate') || t.includes('flood') || t.includes('drought')) return 'climate'
  if (t.includes('displace') || t.includes('refugee') || t.includes('migration')) return 'social'
  if (t.includes('govern') || t.includes('election') || t.includes('law')) return 'political'
  if (t.includes('economy') || t.includes('trade') || t.includes('market')) return 'economic'
  return 'humanitarian'
}

function safeFormatTimestamp(ts: string | undefined): string {
  if (!ts) return 'Unknown'
  try {
    return formatTimestamp(ts)
  } catch {
    // GDACS dates like "Sun, 12 Apr 2026 23:00:08 GMT" are standard RFC 2822 — Date() handles them
    try {
      const d = new Date(ts)
      if (isNaN(d.getTime())) return ts.slice(0, 20)
      return formatTimestamp(d.toISOString())
    } catch {
      return ts.slice(0, 20)
    }
  }
}
