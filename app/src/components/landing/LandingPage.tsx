import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence, useScroll, useTransform } from 'motion/react'
import { useAppStore } from '@/store/app'
import { Button } from '@/components/ui/button'
import { BorderBeam } from '@/components/ui/border-beam'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Shield, Globe, Activity, Eye, Radar as RadarIcon, Network,
  ChevronRight, Zap, Lock, BarChart3, MapPin,
  ArrowRight, Layers, Target, Radio, Newspaper,
  Cpu, Sparkles, FileText, Users, TrendingUp
} from 'lucide-react'
import { GLSLHills } from '@/components/ui/glsl-hills'
import { Radar, IconContainer } from '@/components/ui/radar-effect'
import { GradientBars } from '@/components/ui/gradient-bars-background'

const MODULES = [
  { icon: Activity, name: 'STI', desc: 'Sectarianism Tension Index — 6-axis real-time composite scoring with no global equivalent', accent: '#DC2626' },
  { icon: Radio, name: 'SIGNAL', desc: 'Real-time monitoring across 50,000+ OSINT sources in Arabic, Kurdish, and English', accent: '#C9A84C' },
  { icon: MapPin, name: 'TERRAIN', desc: 'Geospatial intelligence with ACLED overlay, PMF bases, and satellite change detection', accent: '#2DD4BF' },
  { icon: Network, name: 'NEXUS', desc: 'Actor & network analysis with 27 tracked entities and 40+ relationship edges', accent: '#A855F7' },
  { icon: Eye, name: 'LENS', desc: 'Media landscape mapping, disinfo detection, and coordinated inauthentic behavior ID', accent: '#3B82F6' },
  { icon: BarChart3, name: 'PULSE', desc: 'Economic intelligence with sub-national indicators, energy sector, and trade flows', accent: '#EA580C' },
  { icon: RadarIcon, name: 'FORESIGHT', desc: 'Bayesian conflict escalation models, displacement prediction, scenario modeling', accent: '#EAB308' },
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
  
  const previewRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: previewRef,
    offset: ["start end", "center center"]
  })
  
  const previewScale = useTransform(scrollYProgress, [0, 1], [0.85, 1])
  const previewOpacity = useTransform(scrollYProgress, [0, 1], [0.2, 1])
  const previewRotateX = useTransform(scrollYProgress, [0, 1], [15, 0])

  useEffect(() => {
    const t = setTimeout(() => setRevealed(true), 150)
    return () => clearTimeout(t)
  }, [])

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">

      {/* ═══ HERO ═══════════════════════════════════════════════════ */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Animated Hills Background */}
        <div className="absolute inset-0 z-0">
          <GLSLHills cameraZ={130} speed={0.45} planeSize={300} />
          {/* Subtle gradient overlays to ensure text readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent z-10" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(10,10,11,0.85)_100%)] z-10" />
        </div>

        {/* Floating particles over the hills */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-20">
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

      {/* ═══ DASHBOARD PREVIEW ══════════════════════════════════════ */}
      <section className="py-24 px-6 md:px-12 lg:px-16 w-full flex flex-col items-center">
        <div className="w-full max-w-6xl flex flex-col items-center">
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
            ref={previewRef}
            style={{
              scale: previewScale,
              opacity: previewOpacity,
              rotateX: previewRotateX,
              transformPerspective: 1200,
            }}
            className="relative mx-auto max-w-4xl will-change-transform"
          >
            <div className="relative rounded-2xl overflow-hidden border border-border/60 bg-card shadow-2xl">
              <BorderBeam size={300} duration={12} />
              {/* Simulated dashboard screenshot */}
              <div className="p-5 space-y-3">
                {/* Top bar sim */}
                <div className="flex items-center justify-between px-3 py-2.5 rounded-lg bg-surface-elevated/50 border border-border/40">
                  <div className="flex items-center gap-2">
                    <Shield size={14} className="text-gold" />
                    <span className="text-[10px] font-bold tracking-[0.1em]">MERI<span className="text-gold">DIAN</span></span>
                  </div>
                  <div className="flex gap-4">
                    {['Overview', 'STI', 'Signal', 'Terrain', 'Nexus'].map(n => (
                      <span key={n} className={`text-[10px] ${n === 'Overview' ? 'text-gold font-medium' : 'text-text-muted'}`}>{n}</span>
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
                    <div key={kpi.label} className="p-3 rounded-lg bg-surface/60 border border-border/30">
                      <div className="text-[8px] text-text-muted uppercase tracking-wider mb-1">{kpi.label}</div>
                      <div className={`text-xl font-bold font-mono ${kpi.color}`}>{kpi.val} <span className="text-[9px] text-text-muted font-normal">{kpi.unit}</span></div>
                    </div>
                  ))}
                </div>
                {/* Chart sim row */}
                <div className="grid grid-cols-3 gap-2">
                  <div className="col-span-2 h-36 rounded-lg bg-surface/60 border border-border/30 p-4 overflow-hidden">
                    <div className="text-[8px] text-text-muted uppercase tracking-wider mb-3">STI Trend · 30 Days</div>
                    <svg viewBox="0 0 300 80" className="w-full h-20">
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
                  <div className="h-36 rounded-lg bg-surface/60 border border-border/30 p-4">
                    <div className="text-[8px] text-text-muted uppercase tracking-wider mb-3">Axis Status</div>
                    <div className="space-y-2">
                      {[
                        { name: 'Sunni-Shia', score: 72, color: '#DC2626' },
                        { name: 'Arab-Kurd', score: 64, color: '#EA580C' },
                        { name: 'Intra-Shia', score: 45, color: '#EAB308' },
                        { name: 'KDP-PUK', score: 61, color: '#EA580C' },
                      ].map(a => (
                        <div key={a.name} className="flex items-center justify-between">
                          <span className="text-[9px] text-text-secondary">{a.name}</span>
                          <span className="text-[10px] font-mono font-bold" style={{ color: a.color }}>{a.score}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              {/* Fade overlay at bottom */}
              <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-background to-transparent" />
            </div>
          </motion.div>
        </div>
      </section>

      {/* ═══ CAPABILITIES — 4-Column Grid ══════════════════════════ */}
      <section id="capabilities" className="py-24 px-6 md:px-12 lg:px-20 w-full flex flex-col items-center justify-center">
        <div className="w-full max-w-6xl flex flex-col items-center space-y-12">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.5 }}
            className="text-center md:mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Built for the <span className="text-gold">MENA operating environment</span>
            </h2>
            <p className="text-sm text-muted-foreground max-w-lg mx-auto leading-relaxed">
              Every algorithm, pipeline, and feature is optimized for Iraq first — 
              then extensible across the MENA region and beyond.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12 w-full max-w-5xl mx-auto">
            {CAPABILITIES.map((cap, i) => (
              <motion.div
                key={cap.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
                className="space-y-4 flex flex-col items-center text-center p-4"
              >
                <div className="w-12 h-12 flex items-center justify-center rounded-full bg-gold/10 border border-gold/25">
                  <cap.icon size={20} className="text-gold" />
                </div>
                <h3 className="text-base font-semibold">{cap.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{cap.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ OSINT RADAR INGESTION ══════════════════════════════════ */}
      <section className="py-24 md:py-32 px-6 md:px-12 lg:px-20 w-full flex flex-col items-center justify-center bg-surface-elevated/20 border-y border-border/40 overflow-hidden relative">
        <div className="w-full max-w-5xl flex flex-col items-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.5 }}
            className="text-center mb-16 md:mb-24 relative z-50 text-shadow-md"
          >
            <Badge variant="gold" className="mb-4">Data Ingestion Pipeline</Badge>
            <h2 className="text-3xl md:text-5xl font-bold mb-4">
              Real-Time <span className="text-gold">Signal Processing</span>
            </h2>
            <p className="text-sm text-muted-foreground max-w-xl mx-auto leading-relaxed">
              Continuous monitoring across tens of thousands of unstructured channels, instantly triaged by the fusion engine.
            </p>
          </motion.div>

          <div className="relative flex h-[350px] w-full flex-col items-center justify-center space-y-6 md:space-y-12">
            <div className="mx-auto w-full max-w-4xl z-50">
              <div className="flex w-full items-center justify-center space-x-8 md:justify-between md:space-x-0">
                <IconContainer text="OSINT Media" delay={0.2} icon={<Newspaper className="h-6 w-6 text-gold/80" />} />
                <IconContainer text="Deep Web" delay={0.4} icon={<Globe className="h-6 w-6 text-gold/80" />} />
                <IconContainer text="Telecom Data" delay={0.3} icon={<Radio className="h-6 w-6 text-gold/80" />} />
              </div>
            </div>
            <div className="mx-auto w-full max-w-xl z-50">
              <div className="flex w-full items-center justify-center space-x-12 md:justify-between md:space-x-0">
                <IconContainer text="Satellites" delay={0.5} icon={<MapPin className="h-6 w-6 text-gold/80" />} />
                <IconContainer text="Financial Ledgers" delay={0.8} icon={<FileText className="h-6 w-6 text-gold/80" />} />
              </div>
            </div>
            <div className="mx-auto w-full max-w-4xl z-50">
              <div className="flex w-full items-center justify-center space-x-8 md:justify-between md:space-x-0">
                <IconContainer text="Entity Records" delay={0.6} icon={<Users className="h-6 w-6 text-gold/80" />} />
                <IconContainer text="Intercepts" delay={0.7} icon={<Zap className="h-6 w-6 text-gold/80" />} />
              </div>
            </div>

            <Radar className="absolute bottom-12 md:bottom-20 scale-[1.8] md:scale-[3] opacity-80" />
            <div className="absolute -bottom-10 z-[60] h-32 w-full bg-gradient-to-t from-surface-elevated via-background/80 to-transparent" />
          </div>
        </div>
      </section>

      {/* ═══ MODULE GRID ═══════════════════════════════════════════ */}
      <section className="py-24 px-6 md:px-12 lg:px-20 w-full flex flex-col items-center justify-center">
        <div className="w-full max-w-6xl flex flex-col items-center text-center">
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

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 text-left w-full">
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
      <section className="py-24 px-6 md:px-12 lg:px-20 overflow-hidden relative w-full flex flex-col items-center justify-center">
        <div className="absolute inset-0 pointer-events-none" style={{
          background: 'radial-gradient(ellipse 50% 30% at 50% 50%, rgba(220,38,38,0.04) 0%, transparent 70%)'
        }} />
        <div className="w-full max-w-6xl relative flex flex-col items-center">
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
            className="w-full"
          >
            <Card className="relative p-8 overflow-hidden text-left">
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

      {/* ═══ RAPID STATS ═══════════════════════════════════════════ */}
      <section className="py-20 px-6 md:px-12 lg:px-20 border-y border-border/40 bg-surface-elevated/30 w-full flex flex-col items-center">
        <div className="w-full max-w-6xl grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-4 divide-x-0 md:divide-x divide-border/40">
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
      </section>

      {/* ═══ VALUE PROPS ═════════════════════════════════════════ */}
      <section className="py-24 px-6 md:px-12 lg:px-20 w-full flex flex-col items-center">
        <div className="w-full max-w-5xl text-left">
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

      {/* ═══ BOTTOM CTA ══════════════════════════════════════════════ */}
      <section className="py-48 px-6 md:px-12 lg:px-20 relative overflow-hidden w-full flex flex-col items-center bg-black min-h-[60vh] justify-center">
        {/* Expanded, brilliant Gradient Bars */}
        <GradientBars 
          numBars={25} 
          gradientFrom="#C9A84C" 
          gradientTo="rgba(0,0,0,0)" 
          className="opacity-70 scale-y-[1.3] translate-y-12" 
        />
        
        {/* Soft radial overlay just so text is readable, but the bars shine on the sides */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(9,9,11,0.6)_0%,transparent_100%)] z-0 pointer-events-none" />
        
        <div className="w-full max-w-4xl text-center relative z-10 space-y-10 mt-12 bg-black/40 backdrop-blur-sm p-12 rounded-3xl border border-gold/10 shadow-2xl">
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
