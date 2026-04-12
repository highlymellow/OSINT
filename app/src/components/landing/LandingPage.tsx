import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { useAppStore } from '@/store/app'
import { Button } from '@/components/ui/button'
import { BorderBeam } from '@/components/ui/border-beam'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Shield, Globe, Activity, Eye, Radar, Network,
  ChevronRight, Zap, Lock, BarChart3, MapPin,
  ArrowRight, Layers, Target, Radio, Newspaper,
  Cpu, Sparkles, FileText, Users, TrendingUp
} from 'lucide-react'

const MODULES = [
  { icon: Activity, name: 'STI', desc: 'Sectarianism Tension Index — 6-axis real-time composite scoring with no global equivalent', accent: '#DC2626' },
  { icon: Radio, name: 'SIGNAL', desc: 'Real-time monitoring across 50,000+ OSINT sources in Arabic, Kurdish, and English', accent: '#C9A84C' },
  { icon: MapPin, name: 'TERRAIN', desc: 'Geospatial intelligence with ACLED overlay, PMF bases, and satellite change detection', accent: '#2DD4BF' },
  { icon: Network, name: 'NEXUS', desc: 'Actor & network analysis with 27 tracked entities and 40+ relationship edges', accent: '#A855F7' },
  { icon: Eye, name: 'LENS', desc: 'Media landscape mapping, disinfo detection, and coordinated inauthentic behavior ID', accent: '#3B82F6' },
  { icon: BarChart3, name: 'PULSE', desc: 'Economic intelligence with sub-national indicators, energy sector, and trade flows', accent: '#EA580C' },
  { icon: Radar, name: 'FORESIGHT', desc: 'Bayesian conflict escalation models, displacement prediction, scenario modeling', accent: '#EAB308' },
  { icon: Layers, name: 'FORGE', desc: 'Analyst workbench with SAT templates, evidence grading, and collaborative authoring', accent: '#16A34A' },
]

const STATS = [
  { label: 'Sources Monitored', value: '50,000+', icon: Radio },
  { label: 'Event Latency', value: '<60s', icon: Zap },
  { label: 'Languages', value: '5', icon: Globe },
  { label: 'STI Axes', value: '6', icon: Activity },
  { label: 'Actor Profiles', value: '27', icon: Users },
  { label: 'Active Alerts', value: '3', icon: Target },
]

const CAPABILITIES = [
  { icon: Zap, title: 'Real-Time Speed', desc: 'Sub-60 second event detection from OSINT sources to analyst dashboard.' },
  { icon: Cpu, title: 'Multilingual NLP', desc: 'Arabic (MSA + Iraqi), Kurdish (Sorani + Kurmanji), English, Farsi, Turkish.' },
  { icon: Lock, title: 'Ethical by Design', desc: 'Structural guardrails against surveillance of individuals or suppression of civil society.' },
  { icon: Sparkles, title: 'AI-Augmented', desc: 'Claude-powered daily briefs, sentiment extraction, and entity resolution.' },
]

export default function LandingPage() {
  const setMode = useAppStore((s) => s.setMode)
  const [revealed, setRevealed] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setRevealed(true), 150)
    return () => clearTimeout(t)
  }, [])

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">

      {/* ═══ HERO ═══════════════════════════════════════════════════ */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 grid-pattern opacity-50" />
        <div className="absolute inset-0" style={{
          background: 'radial-gradient(ellipse 70% 50% at 50% 35%, rgba(201,168,76,0.06) 0%, transparent 70%)'
        }} />

        {/* Floating particles */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {Array.from({ length: 15 }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-px h-px rounded-full bg-gold/40"
              style={{
                left: `${10 + Math.random() * 80}%`,
                top: `${10 + Math.random() * 80}%`,
              }}
              animate={{
                y: [0, -80 - Math.random() * 120],
                opacity: [0, 0.5, 0],
              }}
              transition={{ duration: 5 + Math.random() * 7, repeat: Infinity, delay: Math.random() * 4 }}
            />
          ))}
        </div>

        {/* Scan line */}
        <motion.div
          className="absolute left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/15 to-transparent pointer-events-none"
          animate={{ y: ['-100vh', '100vh'] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
        />

        {/* Content */}
        <div className="relative z-10 text-center max-w-5xl mx-auto px-6">
          <AnimatePresence>
            {revealed && (
              <>
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                  className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-gold/25 bg-gold/5 mb-8"
                >
                  <Shield size={13} className="text-gold" />
                  <span className="text-[11px] font-medium tracking-[0.15em] text-gold uppercase">
                    Geo-Political OSINT Platform
                  </span>
                </motion.div>

                <motion.h1
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.7, delay: 0.25 }}
                  className="text-5xl sm:text-6xl md:text-8xl font-bold tracking-[-0.03em] mb-6"
                >
                  <span className="text-foreground">MERI</span>
                  <span className="text-gold gold-text-glow">DIAN</span>
                </motion.h1>

                <motion.p
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.45 }}
                  className="text-lg text-muted-foreground max-w-2xl mx-auto mb-2 leading-relaxed"
                >
                  The reference point from which MENA intelligence is calibrated.
                </motion.p>

                <motion.p
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.55 }}
                  className="text-sm text-text-tertiary max-w-xl mx-auto mb-10 leading-relaxed"
                >
                  Purpose-built for Iraq. Combining multilingual NLP, militia databases, 
                  a real-time <span className="text-gold font-medium">Sectarianism Tension Index</span>, 
                  and climate-security correlation.
                </motion.p>

                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.7 }}
                  className="flex flex-col sm:flex-row items-center justify-center gap-3"
                >
                  <Button variant="gold" size="lg" onClick={() => setMode('platform')} className="gold-glow">
                    <Zap size={15} />
                    Enter Intelligence Platform
                    <ArrowRight size={15} />
                  </Button>
                  <Button variant="outline" size="lg" asChild>
                    <a href="#capabilities">
                      Explore Capabilities
                      <ChevronRight size={15} />
                    </a>
                  </Button>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>

        {/* Scroll indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
          animate={{ y: [0, 6, 0] }}
          transition={{ duration: 2.5, repeat: Infinity }}
        >
          <div className="w-5 h-8 rounded-full border border-border/60 flex items-start justify-center p-1.5">
            <motion.div
              className="w-1 h-1 rounded-full bg-gold"
              animate={{ y: [0, 12, 0] }}
              transition={{ duration: 2.5, repeat: Infinity }}
            />
          </div>
        </motion.div>
      </section>

      {/* ═══ DASHBOARD PREVIEW — Perspective Tilt ═══════════════════ */}
      <section className="py-24 px-6 overflow-hidden">
        <div className="mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <Badge variant="gold" className="mb-4">Live Preview</Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Intelligence at a <span className="text-gold">Glance</span>
            </h2>
            <p className="text-muted-foreground max-w-lg mx-auto text-sm">
              A unified command center for real-time threat intelligence, 
              predictive analytics, and multilingual OSINT.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 60 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="relative -mx-4 md:-mx-12"
          >
            <div className="perspective-container">
              <div className="perspective-tilt">
                <div className="relative rounded-2xl overflow-hidden border border-border/60 bg-card shadow-2xl">
                  <BorderBeam size={300} duration={12} />
                  {/* Simulated dashboard screenshot */}
                  <div className="p-4 space-y-3">
                    {/* Top bar sim */}
                    <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-surface-elevated/50 border border-border/40">
                      <div className="flex items-center gap-2">
                        <Shield size={14} className="text-gold" />
                        <span className="text-[10px] font-bold tracking-[0.1em]">MERI<span className="text-gold">DIAN</span></span>
                      </div>
                      <div className="flex gap-3">
                        {['Overview', 'STI', 'Signal', 'Terrain', 'Nexus'].map(n => (
                          <span key={n} className={`text-[9px] ${n === 'Overview' ? 'text-gold' : 'text-text-muted'}`}>{n}</span>
                        ))}
                      </div>
                    </div>
                    {/* KPI row sim */}
                    <div className="grid grid-cols-4 gap-2">
                      {[
                        { label: 'STI Score', val: '65', unit: '/ 100', color: 'text-orange-400' },
                        { label: 'Active Events', val: '142', unit: 'today', color: 'text-red-400' },
                        { label: 'Actors Tracked', val: '27', unit: 'entities', color: 'text-purple-400' },
                        { label: 'Confidence', val: '87%', unit: 'avg', color: 'text-gold' },
                      ].map(kpi => (
                        <div key={kpi.label} className="p-3 rounded-lg bg-surface/70 border border-border/30">
                          <div className="text-[8px] text-text-muted uppercase tracking-wider">{kpi.label}</div>
                          <div className={`text-lg font-bold font-mono ${kpi.color}`}>{kpi.val} <span className="text-[9px] text-text-muted font-normal">{kpi.unit}</span></div>
                        </div>
                      ))}
                    </div>
                    {/* Chart sim row */}
                    <div className="grid grid-cols-3 gap-2">
                      <div className="col-span-2 h-32 rounded-lg bg-surface/70 border border-border/30 p-3 overflow-hidden">
                        <div className="text-[8px] text-text-muted uppercase tracking-wider mb-2">STI Trend · 30 Days</div>
                        <svg viewBox="0 0 300 80" className="w-full h-full">
                          <defs>
                            <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="#C9A84C" stopOpacity="0.3" />
                              <stop offset="100%" stopColor="#C9A84C" stopOpacity="0" />
                            </linearGradient>
                          </defs>
                          <path d="M0,60 C20,55 40,50 60,48 C80,46 100,52 120,45 C140,38 160,42 180,35 C200,28 220,30 240,25 C260,20 280,22 300,18" fill="none" stroke="#C9A84C" strokeWidth="1.5" />
                          <path d="M0,60 C20,55 40,50 60,48 C80,46 100,52 120,45 C140,38 160,42 180,35 C200,28 220,30 240,25 C260,20 280,22 300,18 L300,80 L0,80 Z" fill="url(#chartGrad)" />
                        </svg>
                      </div>
                      <div className="h-32 rounded-lg bg-surface/70 border border-border/30 p-3">
                        <div className="text-[8px] text-text-muted uppercase tracking-wider mb-2">Status</div>
                        <div className="space-y-1.5">
                          {['Sunni-Shia: 72', 'Arab-Kurd: 64', 'Intra-Shia: 45', 'KDP-PUK: 61'].map(a => (
                            <div key={a} className="text-[9px] text-text-secondary">{a}</div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                  {/* Fade overlay at bottom */}
                  <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-background to-transparent" />
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ═══ CAPABILITIES — 4-Column Grid ══════════════════════════ */}
      <section id="capabilities" className="py-24 px-6">
        <div className="mx-auto max-w-5xl space-y-12">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.5 }}
            className="grid items-center gap-4 md:grid-cols-2 md:gap-12"
          >
            <h2 className="text-3xl md:text-4xl font-semibold">
              Built for the <span className="text-gold">MENA operating environment</span>
            </h2>
            <p className="text-sm text-muted-foreground sm:ml-auto max-w-sm">
              Every algorithm, pipeline, and feature is optimized for Iraq first — 
              then extensible across the MENA region and beyond.
            </p>
          </motion.div>

          <div className="grid grid-cols-2 gap-x-4 gap-y-8 lg:grid-cols-4">
            {CAPABILITIES.map((cap, i) => (
              <motion.div
                key={cap.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
                className="space-y-2.5"
              >
                <div className="flex items-center gap-2">
                  <cap.icon size={15} className="text-gold" />
                  <h3 className="text-sm font-medium">{cap.title}</h3>
                </div>
                <p className="text-muted-foreground text-xs leading-relaxed">{cap.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ MODULE GRID ═══════════════════════════════════════════ */}
      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.5 }}
            className="text-center mb-14"
          >
            <Badge variant="gold" className="mb-4">8 Interconnected Modules</Badge>
            <h2 className="text-3xl md:text-5xl font-bold mb-4">
              Intelligence <span className="text-gold">Architecture</span>
            </h2>
            <p className="text-muted-foreground max-w-lg mx-auto text-sm">
              Each module functions independently but achieves maximum value
              through the central intelligence fusion engine.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            {MODULES.map((mod, i) => (
              <motion.div
                key={mod.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-30px' }}
                transition={{ duration: 0.4, delay: i * 0.06 }}
              >
                <Card className="group relative p-5 hover:border-gold/25 transition-all duration-500 cursor-default overflow-hidden h-full">
                  <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-transparent to-transparent group-hover:via-gold/30 transition-all duration-700" />
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center mb-3" style={{ backgroundColor: mod.accent + '15' }}>
                    <mod.icon size={16} style={{ color: mod.accent }} />
                  </div>
                  <h3 className="text-xs font-bold tracking-[0.1em] mb-1.5">{mod.name}</h3>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">{mod.desc}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ STI SHOWCASE ═══════════════════════════════════════════ */}
      <section className="py-24 px-6 overflow-hidden">
        <div className="absolute inset-0" style={{
          background: 'radial-gradient(ellipse 50% 30% at 50% 50%, rgba(220,38,38,0.04) 0%, transparent 70%)'
        }} />
        <div className="max-w-5xl mx-auto relative">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-14"
          >
            <h2 className="text-3xl md:text-5xl font-bold mb-4">
              Sectarianism <span className="text-gold">Tension Index</span>
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto text-sm">
              The only real-time, multi-axis, quantified measure of sectarian dynamics in Iraq.
              No comparable instrument exists worldwide.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <Card className="relative p-8 overflow-hidden">
              <BorderBeam size={250} duration={18} colorFrom="#DC2626" colorTo="#C9A84C" />
              <div className="flex items-center justify-between mb-8">
                <div>
                  <div className="text-[10px] text-muted-foreground tracking-[0.2em] uppercase mb-2">
                    Iraq · Composite Score · Real-Time
                  </div>
                  <div className="flex items-end gap-3">
                    <span className="text-6xl font-bold font-mono text-orange-400">65</span>
                    <span className="text-xl text-text-muted font-mono">/ 100</span>
                    <Badge className="bg-orange-400/12 text-orange-400 border-orange-400/25 mb-1">HIGH</Badge>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] text-muted-foreground mb-1">Confidence</div>
                  <div className="text-2xl font-mono text-gold">87%</div>
                </div>
              </div>

              <div className="relative mb-8">
                <div className="h-3 rounded-full sti-gradient opacity-80" />
                <motion.div
                  className="absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-white border-2 border-orange-400 shadow-lg"
                  style={{ left: '65%' }}
                  animate={{ scale: [1, 1.15, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {[
                  { name: 'Sunni-Shia', score: 72, color: '#DC2626' },
                  { name: 'Arab-Kurd-Turkmen', score: 64, color: '#EA580C' },
                  { name: 'Intra-Shia', score: 45, color: '#EAB308' },
                  { name: 'KDP-PUK', score: 61, color: '#EA580C' },
                  { name: 'Tribal', score: 38, color: '#4ADE80' },
                  { name: 'Minorities', score: 46, color: '#EAB308' },
                ].map((axis) => (
                  <div key={axis.name} className="p-3 rounded-lg bg-surface-elevated/40 border border-border/50">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[11px] text-muted-foreground">{axis.name}</span>
                      <span className="text-sm font-mono font-bold" style={{ color: axis.color }}>{axis.score}</span>
                    </div>
                    <div className="h-1.5 bg-surface rounded-full overflow-hidden">
                      <motion.div
                        className="h-full rounded-full"
                        style={{ backgroundColor: axis.color }}
                        initial={{ width: 0 }}
                        whileInView={{ width: `${axis.score}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: 1, delay: 0.2 }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* ═══ STATS ROW ═══════════════════════════════════════════ */}
      <section className="py-20 px-6 border-y border-border/50">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-3 md:grid-cols-6 gap-6">
            {STATS.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.06 }}
                className="text-center"
              >
                <stat.icon size={16} className="text-gold mx-auto mb-2 opacity-60" />
                <div className="text-xl md:text-2xl font-bold font-mono text-foreground">{stat.value}</div>
                <div className="text-[10px] text-text-muted mt-0.5 tracking-wide uppercase">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ VALUE PROPS ═════════════════════════════════════════ */}
      <section className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { icon: Target, title: 'MENA-First, Global-Capable', desc: 'Iraqi dialect, Kurdish political terminology, militia coded language — not translated, but comprehended.' },
              { icon: Lock, title: 'Ethical by Design', desc: 'Structural guardrails against misuse for surveillance, targeting of minorities, or civil society suppression.' },
              { icon: Globe, title: 'Multilingual Intelligence', desc: 'Five languages with dialect awareness. Arabic, Kurdish, English, Farsi, Turkish — true comprehension, not translation.' },
            ].map((prop, i) => (
              <motion.div
                key={prop.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
              >
                <Card className="relative p-6 h-full hover:border-gold/20 transition-all duration-500 overflow-hidden">
                  <prop.icon size={22} className="text-gold mb-4" />
                  <h3 className="text-sm font-semibold mb-2">{prop.title}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{prop.desc}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ FOOTER CTA ══════════════════════════════════════════ */}
      <section className="py-24 px-6 border-t border-border/50">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Ready to access the platform?
            </h2>
            <p className="text-muted-foreground mb-8 max-w-md mx-auto text-sm">
              MERIDIAN transforms open source noise into analytical signal. 
              Enter the intelligence environment.
            </p>
            <Button variant="gold" size="lg" onClick={() => setMode('platform')} className="gold-glow mx-auto">
              <Shield size={16} />
              Launch MERIDIAN
              <ArrowRight size={16} />
            </Button>
          </motion.div>

          <div className="mt-14 pt-6 border-t border-border/30">
            <p className="text-[11px] text-text-muted">
              © 2026 Mohammed Anwer Mohammed · Enlil Center for Environment and Sustainable Development
            </p>
            <p className="text-[11px] text-text-muted mt-0.5">
              Sulaymaniyah / Baghdad, Iraq
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}
