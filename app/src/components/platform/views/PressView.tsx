import { useState } from 'react'
import { motion } from 'motion/react'
import {
  Newspaper, MapPin, Send, Users, FileText,
  Shield, AlertTriangle, Phone, Radio, CheckCircle,
  Eye, MessageCircle, Lock
} from 'lucide-react'

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
  { id: 'brief', label: 'Daily Brief', icon: FileText },
  { id: 'safety', label: 'Field Safety', icon: Shield },
  { id: 'submit', label: 'Submit Report', icon: Send },
  { id: 'network', label: 'Network', icon: Users },
] as const

export default function PressView() {
  const [activeTab, setActiveTab] = useState<string>('brief')

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

      {/* ── Daily Brief ── */}
      {activeTab === 'brief' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
          <div className="glass-card p-6 gold-glow">
            <div className="flex items-center gap-2 mb-4">
              <Newspaper size={16} className="text-gold" />
              <span className="text-xs font-bold tracking-[0.15em] text-gold uppercase">
                MERIDIAN Daily Intelligence Brief
              </span>
            </div>
            <div className="text-[10px] text-text-muted font-mono mb-4">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} | 0600 UTC+3 | Iraq + MENA
            </div>

            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-surface-elevated border border-border">
                <h4 className="text-xs font-bold text-gold uppercase tracking-wide mb-2">Situation Overview</h4>
                <p className="text-sm text-text-secondary leading-relaxed">
                  Iraq's sectarian tension index holds at 65 (HIGH), driven by escalating Arab-Kurd-Turkmen friction
                  in Kirkuk following property seizures and the Peshmerga-ISF standoff near Makhmur. The Sadrist
                  movement's planned Najaf rally adds intra-Shia uncertainty. Southern marshland drought displaces
                  200+ families, activating tribal axis. Cross-sectarian electoral reform proposal offers rare
                  de-escalation signal.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="p-4 rounded-lg bg-surface-elevated border border-border">
                  <h4 className="text-xs font-bold text-text-secondary uppercase tracking-wide mb-2">STI Status</h4>
                  <div className="text-3xl font-bold font-mono text-orange-400">65 <span className="text-sm text-text-muted">/ 100</span></div>
                  <div className="text-[10px] text-text-muted mt-1">Hotspots: Kirkuk 82, Tuz Khurmatu 76, Diyala 73</div>
                </div>
                <div className="p-4 rounded-lg bg-surface-elevated border border-border">
                  <h4 className="text-xs font-bold text-text-secondary uppercase tracking-wide mb-2">Risk Indicators</h4>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div><span className="text-red-400">●</span> Security: SEVERE</div>
                    <div><span className="text-orange-400">●</span> Aviation: HIGH</div>
                    <div><span className="text-red-400">●</span> Maritime: CRITICAL</div>
                    <div><span className="text-orange-400">●</span> Energy: HIGH</div>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-lg bg-surface-elevated border border-border">
                <h4 className="text-xs font-bold text-gold uppercase tracking-wide mb-2">72-Hour Outlook</h4>
                <p className="text-sm text-text-secondary leading-relaxed">
                  Sadrist rally in Najaf (Friday) likely to draw 50,000+. Coordination Framework may deploy
                  counter-mobilization. STI Intra-Shia axis expected to spike 5-8 points. Kirkuk property dispute
                  escalation continues — ITF delegation to Baghdad Monday may de-escalate or harden positions.
                  Southern drought displacement trend accelerating.
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* ── Field Safety ── */}
      {activeTab === 'safety' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
          <div className="glass-card-solid p-5">
            <h3 className="text-xs font-bold tracking-[0.1em] uppercase text-text-secondary mb-4 flex items-center gap-2">
              <Shield size={14} className="text-gold" />
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
