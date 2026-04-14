import { useState } from 'react'
import { motion } from 'motion/react'
import { useQuery } from '@tanstack/react-query'
import { 
  TerminalSquare, MapPin, Send, Users, FileText,
  AlertTriangle, Phone, RadioTower, CheckCircle,
  Lock, ExternalLink, RefreshCw, Rss, Globe2, Crosshair, Skull
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
  { id: 'noosphere', label: 'Noosphere Dispatch', icon: Globe2 },
  { id: 'safety', label: 'Field Safety', icon: AlertTriangle },
  { id: 'submit', label: 'Submit Report', icon: Send },
  { id: 'network', label: 'Safety Networks', icon: Users },
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
  const [burnerOs, setBurnerOs] = useState(false)
  
  // Noosphere Posting State
  const [postText, setPostText] = useState('')
  const [noospherePosts, setNoospherePosts] = useState<{text: string, id: string, signature: string, time: string}[]>([])

  const handlePost = () => {
    if (!postText.trim()) return
    setNoospherePosts([
      { text: postText, id: `NOO-${Math.floor(Math.random()*9000)+1000}`, signature: `0x${Math.random().toString(16).slice(2, 10).toUpperCase()}`, time: new Date().toLocaleTimeString() },
      ...noospherePosts
    ])
    setPostText('')
  }

  // LIVE RSS Intelligence Feed
  const { data: newsArticles = [], isLoading: newsLoading, refetch: refetchNews } = useQuery({
    queryKey: ['intelligence-news'],
    queryFn: () => fetchIntelligenceNews(),
    refetchInterval: 600_000, // 10 minutes
    staleTime: 300_000,
  })

  return (
    <>
    <div className="p-6 space-y-4 animate-fade-in">
      {/* Tab navigation & Burner OS Toggle */}
      <div className="flex items-center justify-between p-1">
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
        
        {/* Burner OS Killswitch */}
        <button 
           onClick={() => setBurnerOs(true)}
           className="flex items-center gap-2 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-500 rounded-lg text-xs font-bold uppercase transition-colors shadow-[0_0_15px_rgba(239,68,68,0.2)]"
        >
          <Skull size={14} />
          Burner OS Access
        </button>
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

          {/* Shelly Kittleson Act - Geolocation Tracker */}
          <div className="glass-card-solid border-alert-red/30 p-5 mt-4">
            <h3 className="text-xs font-bold tracking-[0.1em] uppercase text-alert-red mb-4 flex items-center gap-2">
              <Crosshair size={14} className="text-alert-red" />
              Shelly Kittleson Act — Embedded Geolocation Trackers
            </h3>
            <div className="bg-deep-black/50 border border-border rounded-lg p-4 font-mono text-[10px] text-text-secondary space-y-3">
              <div className="flex items-center justify-between border-b border-white/5 pb-2">
                <span className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.6)]"></div> S. Kittleson (Beacon #4928)</span>
                <span className="text-green-400">LAT: 36.1901 LON: 43.9930 (ERBIL SECURE)</span>
              </div>
              <div className="flex items-center justify-between border-b border-white/5 pb-2">
                <span className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-gold animate-pulse shadow-[0_0_8px_rgba(234,179,8,0.6)]"></div> N. Fares (Beacon #1102)</span>
                <span className="text-gold">LAT: 33.3128 LON: 44.3615 (BAGHDAD ELEVATED)</span>
              </div>
              <div className="flex items-center justify-between border-b border-white/5 pb-2">
                <span className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-alert-red animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.6)]"></div> A. Khalil (Beacon #8831)</span>
                <span className="text-alert-red">LAT: 35.4670 LON: 44.3831 (KIRKUK CRITICAL)</span>
              </div>
              <div className="pt-2 text-[9px] text-text-tertiary">
                TRACKING ENABLED PURSUANT TO THE SHELLY KITTLESON JOURNALIST SAFETY PROTOCOL. ZERO CLOUD EXFILTRATION.
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* ── Noosphere Dispatch ── */}
      {activeTab === 'noosphere' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
          <div className="glass-card-solid p-6 max-w-2xl border-purple-500/30">
            <h3 className="text-xs font-bold tracking-[0.1em] uppercase text-purple-400 mb-4 flex items-center gap-2">
              <Globe2 size={14} className="text-purple-400" />
              Noosphere Global Dispatch
            </h3>
            <p className="text-[11px] text-text-muted mb-4">
              Inject raw, encrypted geopolitical hypothesis or on-the-ground intelligence directly into the Spatio-Temporal Noosphere. Posts are strictly peer-to-peer and mathematically signed.
            </p>
            <div className="space-y-4">
              <textarea 
                value={postText}
                onChange={(e) => setPostText(e.target.value)}
                className="w-full px-4 py-3 bg-surface-elevated border border-purple-500/20 rounded-lg text-sm text-text-primary placeholder:text-text-muted focus:border-purple-500/50 focus:outline-none h-24 resize-none shadow-inner" 
                placeholder="Declare intelligence sequence logic..." 
              />
              <div className="flex items-center justify-between">
                 <div className="flex items-center gap-2 text-[10px] text-purple-400/50 font-mono">
                    <Lock size={10} /> END-TO-END NOOSPHERE ENCRYPTION
                 </div>
                 <button onClick={handlePost} className="px-6 py-2 bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 border border-purple-500/30 font-bold rounded-lg text-xs uppercase transition-all flex items-center gap-2 shadow-[0_0_15px_rgba(168,85,247,0.15)]">
                    <Send size={12} /> Sync to Noosphere
                 </button>
              </div>
            </div>
            
            {/* Live Feed Feedbacks */}
            {noospherePosts.length > 0 && (
              <div className="mt-8 pt-6 border-t border-purple-500/20 space-y-3">
                {noospherePosts.map((post) => (
                  <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} key={post.id} className="text-left bg-deep-black/50 border border-purple-500/10 rounded-lg p-4">
                    <div className="flex items-center justify-between text-[10px] font-mono text-purple-400/70 mb-2">
                       <span>{post.id} / SIG: {post.signature}</span>
                       <span>{post.time}</span>
                    </div>
                    <p className="text-sm text-text-secondary">{post.text}</p>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      )}
    </div>

    {/* ── BURNS OS OVERLAY ── */}
    {burnerOs && (
      <div className="fixed inset-0 z-[9999] bg-black flex flex-col font-mono text-green-500 p-8 cursor-text selection:bg-green-500 selection:text-black">
         <div className="flex-1 space-y-2 text-sm opacity-90">
            <p className="text-red-500 border border-red-500 px-4 py-1 text-xs shrink-0 w-max mb-4 uppercase tracking-widest font-bold">EMERGENCY PROTOCOL — Tails AMNESIC OS ACTIVATED</p>
            <p>Initializing secure boot sequence ... [OK]</p>
            <p>Disconnecting external networking hardware ... [OK]</p>
            <p>Mounting encrypted volatile RAM payload ... [OK]</p>
            <p>Loading Tor network protocols ... [WAIT]</p>
            <p className="mt-4 animate-pulse">Waiting for PGP Decryption Key from master token...</p>
            <p className="mt-8 text-neutral-500">// ALL TRACES OF SPATIO-TEMPORAL ANALYTICS ARE NOW OBFUSCATED IN RAM.</p>
         </div>
         <button onClick={() => setBurnerOs(false)} className="mt-auto self-start text-xs text-green-500/50 hover:text-green-500 border border-green-500/30 px-4 py-2 hover:bg-green-500/10 transition-colors uppercase">
            ABORT / RETURN TO TERMINAL
         </button>
      </div>
    )}
    </>
  )
}
