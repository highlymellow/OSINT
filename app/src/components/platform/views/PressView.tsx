import { useState } from 'react'
import { motion } from 'motion/react'
import { useQuery } from '@tanstack/react-query'
import { 
  TerminalSquare, MapPin, Send, Users, FileText,
  AlertTriangle, Phone, RadioTower, CheckCircle,
  Lock, ExternalLink, RefreshCw, Rss, Globe2
 } from "@/lib/icons"
import { fetchIntelligenceNews, type RSSArticle } from '@/lib/osint-feeds'

const SAFETY_ZONES = [
  { gov: 'Baghdad', status: 'ELEVATED', violations: 12, recent: 'PMF checkpoint harassment', color: '#EAB308' },
  { gov: 'Kirkuk', status: 'HIGH', violations: 8, recent: 'Journalist detained at ITF rally', color: '#EA580C' },
  { gov: 'Erbil', status: 'LOW', violations: 2, recent: 'Equipment confiscation', color: '#4ADE80' },
  { gov: 'Basra', status: 'ELEVATED', violations: 5, recent: 'Protest coverage threats', color: '#EAB308' },
  { gov: 'Mosul', status: 'HIGH', violations: 7, recent: 'PMF media blackout zone', color: '#EA580C' },
  { gov: 'Sulaymaniyah', status: 'LOW', violations: 1, recent: 'None recent', color: '#4ADE80' },
]

const JOURNALISTS = [
  { name: 'Ahmed K.', location: 'Kirkuk', beat: 'Disputed Territories', trust: 'A2', reports: 147, lang: 'Ar/Ku' },
  { name: 'Noor F.', location: 'Baghdad', beat: 'PMF / Security', trust: 'B1', reports: 89, lang: 'Ar/En' },
  { name: 'Shelly K.', location: 'Erbil', beat: 'KRI Politics', trust: 'A1', reports: 234, lang: 'En/Ku' },
  { name: 'Hassan M.', location: 'Basra', beat: 'Climate / Protests', trust: 'B2', reports: 56, lang: 'Ar' },
  { name: 'Dina R.', location: 'Sinjar', beat: 'Minorities / Yazidi', trust: 'A2', reports: 112, lang: 'Ku/Ar' },
  { name: 'Omar S.', location: 'Mosul', beat: 'Reconstruction', trust: 'C1', reports: 34, lang: 'Ar' },
]

const TABS = [
  { id: 'brief', label: 'Live Intel Feed', icon: Rss },
  { id: 'safety', label: 'Field Safety', icon: AlertTriangle },
  { id: 'submit', label: 'Submit Report', icon: Send },
  { id: 'network', label: 'Network', icon: Users },
] as const

const SOURCE_COLORS: Record<string, string> = {
  'Al Jazeera': '#D4A843',
  'BBC Middle East': '#BB1919',
  'NYT Middle East': '#1A1A1A',
  'Reuters': '#FF8800',
}

function formatTimeAgo(date: string): string {
  const diff = Date.now() - new Date(date).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  return `${Math.floor(hours / 24)}d ago`
}

export default function PressView() {
  const [activeTab, setActiveTab] = useState<string>('brief')

  // LIVE RSS Intelligence Feed
  const { data: newsArticles = [], isLoading: newsLoading, refetch: refetchNews } = useQuery({
    queryKey: ['intelligence-news'],
    queryFn: () => fetchIntelligenceNews(),
    refetchInterval: 600_000, // 10 minutes
    staleTime: 300_000,
  })

  return (
    <div className="p-6 space-y-4 animate-fade-in">
      {/* Tab navigation */}
      <div className="flex gap-1 p-1 bg-surface rounded-xl border border-border w-fit">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold tracking-wide transition-all ${
              activeTab === tab.id
                ? 'bg-gold/15 text-gold'
                : 'text-text-muted hover:text-text-secondary hover:bg-surface-hover'
            }`}
          >
            <tab.icon size={14} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── Live Intelligence Feed ── */}
      {activeTab === 'brief' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
          {/* Feed header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-[10px] font-bold tracking-widest text-green-400 uppercase">
                LIVE MULTI-SOURCE INTELLIGENCE FEED
              </span>
              <span className="text-[10px] text-text-muted font-mono">
                {newsArticles.length} articles from 4 sources
              </span>
            </div>
            <button
              onClick={() => refetchNews()}
              className="flex items-center gap-1 text-[10px] text-text-muted hover:text-gold transition-colors"
            >
              <RefreshCw size={10} className={newsLoading ? 'animate-spin' : ''} />
              Refresh
            </button>
          </div>

          {/* Articles */}
          <div className="space-y-2">
            {newsArticles.length === 0 && !newsLoading && (
              <div className="glass-card p-8 text-center">
                <Globe2 size={32} className="text-text-muted mx-auto mb-3 opacity-30" />
                <p className="text-sm text-text-muted">Loading intelligence feeds...</p>
                <p className="text-xs text-text-tertiary mt-1">Aggregating from Al Jazeera, BBC, NYT, Reuters</p>
              </div>
            )}
            
            {newsArticles.map((article, i) => (
              <motion.a
                key={article.id}
                href={article.link}
                target="_blank"
                rel="noopener noreferrer"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.02 * Math.min(i, 20) }}
                className="glass-card-solid p-4 hover:border-gold/20 transition-all duration-300 group cursor-pointer block"
              >
                <div className="flex items-start gap-3">
                  {/* Source badge */}
                  <div className="shrink-0">
                    <span
                      className="text-[9px] font-bold px-2 py-1 rounded border uppercase tracking-wider"
                      style={{
                        backgroundColor: (SOURCE_COLORS[article.source] || '#666') + '20',
                        color: SOURCE_COLORS[article.source] || '#999',
                        borderColor: (SOURCE_COLORS[article.source] || '#666') + '40',
                      }}
                    >
                      {article.source.split(' ')[0]}
                    </span>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-semibold text-text-primary group-hover:text-gold transition-colors line-clamp-2">
                      {article.title}
                    </h4>
                    <p className="text-xs text-text-secondary mt-1.5 leading-relaxed line-clamp-2">
                      {article.description}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-[10px] text-text-muted">{formatTimeAgo(article.pubDate)}</span>
                      <span className="text-[10px] text-text-muted">·</span>
                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase ${
                        article.category === 'conflict' ? 'bg-red-500/15 text-red-400'
                        : article.category === 'security' ? 'bg-orange-500/15 text-orange-400'
                        : article.category === 'political' ? 'bg-blue-500/15 text-blue-400'
                        : 'bg-green-500/15 text-green-400'
                      }`}>
                        {article.category}
                      </span>
                    </div>
                  </div>

                  {/* External link */}
                  <ExternalLink size={14} className="shrink-0 text-text-muted group-hover:text-gold transition-colors mt-1" />
                </div>
              </motion.a>
            ))}
          </div>
        </motion.div>
      )}

      {/* ── Field Safety ── */}
      {activeTab === 'safety' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
          <div className="glass-card-solid p-5">
            <h3 className="text-xs font-bold tracking-[0.1em] uppercase text-text-secondary mb-4 flex items-center gap-2">
              <AlertTriangle size={14} className="text-gold" />
              Journalist Safety Dashboard
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {SAFETY_ZONES.map((zone) => (
                <div key={zone.gov} className="p-4 rounded-lg bg-surface-elevated border border-border">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold">{zone.gov}</span>
                    <span className="text-[9px] font-bold px-2 py-0.5 rounded-full" style={{
                      backgroundColor: zone.color + '20', color: zone.color, border: '1px solid ' + zone.color + '40'
                    }}>
                      {zone.status}
                    </span>
                  </div>
                  <div className="text-[10px] text-text-muted mb-1">{zone.violations} violations (2024)</div>
                  <div className="text-[10px] text-text-tertiary">Latest: {zone.recent}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Emergency contacts */}
          <div className="glass-card-solid p-5">
            <h3 className="text-xs font-bold tracking-[0.1em] uppercase text-text-secondary mb-3 flex items-center gap-2">
              <Phone size={14} className="text-alert-red" />
              Emergency Contacts
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {[
                { org: 'JFO Iraq', phone: '+964-XXX-XXXX', desc: 'Legal support & cyber-security' },
                { org: 'UNESCO 5555', phone: '5555', desc: 'Journalist protection hotline' },
                { org: 'PFAA', phone: '+964-XXX-XXXX', desc: 'Press freedom violations' },
              ].map((c) => (
                <div key={c.org} className="p-3 rounded-lg bg-surface-elevated border border-border">
                  <div className="text-xs font-bold text-text-primary">{c.org}</div>
                  <div className="text-sm font-mono text-gold mt-1">{c.phone}</div>
                  <div className="text-[10px] text-text-muted mt-0.5">{c.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {/* ── Submit Report ── */}
      {activeTab === 'submit' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
          <div className="glass-card-solid p-6 max-w-2xl">
            <h3 className="text-xs font-bold tracking-[0.1em] uppercase text-text-secondary mb-4 flex items-center gap-2">
              <Send size={14} className="text-gold" />
              Submit Field Report
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-[10px] text-text-muted uppercase tracking-wide mb-1.5">Location</label>
                <input className="w-full px-4 py-2.5 bg-surface-elevated border border-border rounded-lg text-sm text-text-primary placeholder:text-text-muted focus:border-gold/50 focus:outline-none" placeholder="Governorate / City / District" />
              </div>
              <div>
                <label className="block text-[10px] text-text-muted uppercase tracking-wide mb-1.5">Event Type</label>
                <select className="w-full px-4 py-2.5 bg-surface-elevated border border-border rounded-lg text-sm text-text-secondary focus:border-gold/50 focus:outline-none appearance-none cursor-pointer">
                  <option>Security Incident</option>
                  <option>Political Development</option>
                  <option>Press Violation</option>
                  <option>Displacement / Humanitarian</option>
                  <option>Infrastructure / Economic</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] text-text-muted uppercase tracking-wide mb-1.5">Report Details</label>
                <textarea className="w-full px-4 py-2.5 bg-surface-elevated border border-border rounded-lg text-sm text-text-primary placeholder:text-text-muted focus:border-gold/50 focus:outline-none h-32 resize-none" placeholder="Describe what you observed..." />
              </div>
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" className="w-4 h-4 rounded border-border bg-surface-elevated accent-gold" />
                  <span className="text-xs text-text-secondary">Anonymous submission</span>
                </label>
                <Lock size={12} className="text-text-muted" />
              </div>
              <button className="px-6 py-2.5 bg-gold text-deep-black font-semibold rounded-lg text-sm hover:bg-gold-dim transition-all flex items-center gap-2">
                <Send size={14} />
                Submit Report
              </button>
            </div>
          </div>

          <div className="glass-card-solid p-5 max-w-2xl">
            <h4 className="text-xs font-bold tracking-[0.1em] uppercase text-text-secondary mb-3">Verification Pipeline</h4>
            <div className="flex items-center gap-3">
              {['Submitted', 'Auto-Check', 'Desk Verify', 'Expert Review', 'Published'].map((step, i) => (
                <div key={step} className="flex items-center gap-2">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold ${
                    i === 0 ? 'bg-gold/20 text-gold' : 'bg-surface-elevated text-text-muted border border-border'
                  }`}>
                    {i + 1}
                  </div>
                  <span className="text-[10px] text-text-muted">{step}</span>
                  {i < 4 && <div className="w-6 h-px bg-border" />}
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {/* ── Network ── */}
      {activeTab === 'network' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
          <div className="glass-card-solid p-5">
            <h3 className="text-xs font-bold tracking-[0.1em] uppercase text-text-secondary mb-4 flex items-center gap-2">
              <Users size={14} className="text-gold" />
              Journalist Network
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {JOURNALISTS.map((j) => (
                <div key={j.name} className="p-4 rounded-xl border border-border bg-surface-elevated/50 hover:border-gold/30 transition-all">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div className="text-sm font-semibold">{j.name}</div>
                      <div className="text-[10px] text-text-muted flex items-center gap-1">
                        <MapPin size={10} /> {j.location}
                      </div>
                    </div>
                    <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-gold/15 text-gold font-mono">
                      {j.trust}
                    </span>
                  </div>
                  <div className="text-[10px] text-text-tertiary mb-2">Beat: {j.beat}</div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-text-muted">{j.reports} reports · {j.lang}</span>
                    <button className="text-[9px] text-gold hover:text-gold-dim font-bold transition-colors">
                      Follow
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </div>
  )
}
