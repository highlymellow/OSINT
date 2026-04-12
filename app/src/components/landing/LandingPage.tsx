import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { useAppStore } from '@/store/app'
import {
  Shield, Globe, Activity, Eye, Radar, Network,
  ChevronRight, Zap, Lock, BarChart3, MapPin,
  ArrowRight, Layers, Target, Radio
} from 'lucide-react'

const MODULES = [
  { icon: Radio, name: 'SIGNAL', desc: 'Real-time monitoring across 50,000+ sources' },
  { icon: MapPin, name: 'TERRAIN', desc: 'Geospatial intelligence with satellite overlays' },
  { icon: Network, name: 'NEXUS', desc: 'Actor network analysis & relationship mapping' },
  { icon: Eye, name: 'LENS', desc: 'Media & narrative analysis with disinfo detection' },
  { icon: BarChart3, name: 'PULSE', desc: 'Economic intelligence & investment risk scoring' },
  { icon: Radar, name: 'FORESIGHT', desc: 'Predictive analytics & scenario modeling' },
  { icon: Layers, name: 'FORGE', desc: 'Analyst workbench with SAT templates' },
  { icon: Activity, name: 'STI', desc: 'Sectarianism Tension Index — no equivalent exists' },
]

const STATS = [
  { label: 'Sources Monitored', value: '50,000+' },
  { label: 'Event Latency', value: '<60s' },
  { label: 'Languages', value: '5' },
  { label: 'STI Axes', value: '6' },
]

export default function LandingPage() {
  const setMode = useAppStore((s) => s.setMode)
  const [scrollY, setScrollY] = useState(0)
  const [revealed, setRevealed] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setRevealed(true), 200)
    const handleScroll = () => setScrollY(window.scrollY)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => {
      clearTimeout(t)
      window.removeEventListener('scroll', handleScroll)
    }
  }, [])

  return (
    <div className="min-h-screen bg-deep-black text-text-primary overflow-x-hidden">

      {/* ═══ HERO SECTION ═══════════════════════════════════════════ */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">

        {/* Animated grid background */}
        <div className="absolute inset-0 grid-pattern opacity-60" />

        {/* Radial gradient overlay */}
        <div className="absolute inset-0"
          style={{
            background: 'radial-gradient(ellipse 80% 60% at 50% 40%, rgba(201,168,76,0.08) 0%, transparent 70%)'
          }}
        />

        {/* Floating particles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {Array.from({ length: 20 }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 rounded-full bg-gold/30"
              initial={{
                x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1400),
                y: Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 900),
                opacity: 0,
              }}
              animate={{
                y: [null, Math.random() * -200 - 100],
                opacity: [0, 0.6, 0],
              }}
              transition={{
                duration: 6 + Math.random() * 8,
                repeat: Infinity,
                delay: Math.random() * 5,
                ease: 'linear',
              }}
            />
          ))}
        </div>

        {/* Scan line effect */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div
            className="absolute left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/20 to-transparent"
            animate={{ y: ['-100vh', '100vh'] }}
            transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
          />
        </div>

        {/* Hero content */}
        <div className="relative z-10 text-center max-w-5xl mx-auto px-6">
          <AnimatePresence>
            {revealed && (
              <>
                {/* Classification badge */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.1 }}
                  className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-gold/30 bg-gold/5 mb-8"
                >
                  <Shield size={14} className="text-gold" />
                  <span className="text-xs font-medium tracking-[0.15em] text-gold uppercase">
                    Geo-Political OSINT Platform
                  </span>
                </motion.div>

                {/* Main title */}
                <motion.h1
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.3 }}
                  className="text-6xl md:text-8xl font-bold tracking-[-0.02em] mb-6"
                >
                  <span className="text-text-primary">MERI</span>
                  <span className="text-gold gold-text-glow">DIAN</span>
                </motion.h1>

                {/* Subtitle */}
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.5 }}
                  className="text-lg md:text-xl text-text-secondary max-w-3xl mx-auto mb-4 leading-relaxed"
                >
                  The reference point from which MENA intelligence is calibrated.
                </motion.p>

                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.65 }}
                  className="text-sm text-text-tertiary max-w-2xl mx-auto mb-12 leading-relaxed"
                >
                  Purpose-built for Iraq & the MENA region. Combining Arabic/Kurdish NLP,
                  militia & non-state actor databases, tribal mapping, a real-time{' '}
                  <span className="text-gold">Sectarianism Tension Index</span>,
                  oil infrastructure monitoring, and climate-security correlation in one environment.
                </motion.p>

                {/* CTA Buttons */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.8 }}
                  className="flex flex-col sm:flex-row items-center justify-center gap-4"
                >
                  <button
                    onClick={() => setMode('platform')}
                    className="group relative px-8 py-3.5 bg-gold text-deep-black font-semibold rounded-xl
                             hover:bg-gold-dim transition-all duration-300 text-sm tracking-wide
                             flex items-center gap-3 gold-glow"
                  >
                    <Zap size={16} />
                    Enter Intelligence Platform
                    <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                  </button>

                  <a
                    href="#capabilities"
                    className="px-8 py-3.5 border border-border rounded-xl text-text-secondary
                             hover:border-gold/50 hover:text-text-primary transition-all duration-300
                             text-sm tracking-wide flex items-center gap-2"
                  >
                    Explore Capabilities
                    <ChevronRight size={16} />
                  </a>
                </motion.div>

                {/* Stats bar */}
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 1 }}
                  className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto"
                >
                  {STATS.map((stat, i) => (
                    <div key={i} className="text-center">
                      <div className="text-2xl md:text-3xl font-bold font-mono text-gold">
                        {stat.value}
                      </div>
                      <div className="text-xs text-text-tertiary mt-1 tracking-wide uppercase">
                        {stat.label}
                      </div>
                    </div>
                  ))}
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>

        {/* Scroll indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <div className="w-6 h-10 rounded-full border border-border flex items-start justify-center p-1.5">
            <motion.div
              className="w-1.5 h-1.5 rounded-full bg-gold"
              animate={{ y: [0, 16, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </div>
        </motion.div>
      </section>

      {/* ═══ CAPABILITIES SECTION ═══════════════════════════════════ */}
      <section id="capabilities" className="relative py-32 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.6 }}
            className="text-center mb-20"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border bg-surface-elevated/50 mb-6">
              <Globe size={12} className="text-gold" />
              <span className="text-xs tracking-[0.15em] text-text-tertiary uppercase">
                Eight Interconnected Modules
              </span>
            </div>
            <h2 className="text-3xl md:text-5xl font-bold mb-6">
              Intelligence{' '}
              <span className="text-gold">Architecture</span>
            </h2>
            <p className="text-text-secondary max-w-2xl mx-auto">
              Each module functions independently but achieves maximum value
              through the central intelligence fusion engine.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {MODULES.map((mod, i) => (
              <motion.div
                key={mod.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                className="group relative p-6 rounded-xl border border-border bg-surface/50
                           hover:border-gold/30 hover:bg-surface-elevated/50
                           transition-all duration-500 cursor-default"
              >
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/0 to-transparent
                              group-hover:via-gold/40 transition-all duration-500" />
                <mod.icon size={24} className="text-gold mb-4 group-hover:scale-110 transition-transform" />
                <h3 className="text-sm font-bold tracking-[0.1em] mb-2">{mod.name}</h3>
                <p className="text-xs text-text-tertiary leading-relaxed">{mod.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ STI SHOWCASE ═══════════════════════════════════════════ */}
      <section className="relative py-32 px-6 overflow-hidden">
        <div className="absolute inset-0"
          style={{
            background: 'radial-gradient(ellipse 60% 40% at 50% 50%, rgba(220,38,38,0.06) 0%, transparent 70%)'
          }}
        />
        <div className="max-w-5xl mx-auto relative">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-5xl font-bold mb-6">
              Sectarianism{' '}
              <span className="text-gold">Tension Index</span>
            </h2>
            <p className="text-text-secondary max-w-2xl mx-auto">
              The only real-time, multi-axis, quantified measure of sectarian dynamics in Iraq.
              No comparable instrument exists in any OSINT platform, academic dataset, or government framework worldwide.
            </p>
          </motion.div>

          {/* STI Preview Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="glass-card p-8 gold-glow"
          >
            <div className="flex items-center justify-between mb-8">
              <div>
                <div className="text-xs text-text-tertiary tracking-[0.2em] uppercase mb-2">
                  Iraq · Composite Score · Real-Time
                </div>
                <div className="flex items-end gap-4">
                  <span className="text-6xl font-bold font-mono text-orange-400">65</span>
                  <span className="text-xl text-text-tertiary font-mono">/ 100</span>
                  <span className="text-sm font-bold text-orange-400 border border-orange-400/30 bg-orange-400/10 px-3 py-1 rounded-full">
                    HIGH
                  </span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs text-text-tertiary mb-1">Confidence</div>
                <div className="text-lg font-mono text-gold">87%</div>
              </div>
            </div>

            {/* Gradient bar */}
            <div className="relative mb-8">
              <div className="h-3 rounded-full sti-gradient opacity-80" />
              <motion.div
                className="absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-white border-2 border-orange-400 shadow-lg"
                style={{ left: '65%' }}
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            </div>

            {/* Axis breakdown */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {[
                { name: 'Sunni-Shia', score: 72, color: '#DC2626' },
                { name: 'Arab-Kurd', score: 64, color: '#EA580C' },
                { name: 'Intra-Shia', score: 45, color: '#EAB308' },
                { name: 'KDP-PUK', score: 61, color: '#EA580C' },
                { name: 'Tribal', score: 38, color: '#4ADE80' },
                { name: 'Minorities', score: 46, color: '#EAB308' },
              ].map((axis) => (
                <div key={axis.name} className="p-3 rounded-lg bg-surface-elevated/50 border border-border">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-text-tertiary">{axis.name}</span>
                    <span className="text-sm font-mono font-bold" style={{ color: axis.color }}>
                      {axis.score}
                    </span>
                  </div>
                  <div className="h-1.5 bg-surface rounded-full overflow-hidden">
                    <motion.div
                      className="h-full rounded-full"
                      style={{ backgroundColor: axis.color }}
                      initial={{ width: 0 }}
                      whileInView={{ width: `${axis.score}%` }}
                      viewport={{ once: true }}
                      transition={{ duration: 1, delay: 0.3 }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ═══ VALUE PROPS ═════════════════════════════════════════════ */}
      <section className="py-32 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: Target,
                title: 'MENA-First, Global-Capable',
                desc: 'Every algorithm, data pipeline, and feature is optimized for the MENA operating environment first. Iraqi dialect, Kurdish political terminology, militia coded language.',
              },
              {
                icon: Lock,
                title: 'Ethical by Design',
                desc: 'Structural guardrails against misuse for surveillance of individuals, targeting of minorities, or suppression of civil society.',
              },
              {
                icon: Globe,
                title: 'Multilingual Intelligence',
                desc: 'Arabic (MSA + Iraqi dialect), Kurdish (Sorani + Kurmanji), English, Farsi, Turkish — not translation, but comprehension.',
              },
            ].map((prop, i) => (
              <motion.div
                key={prop.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.15 }}
                className="p-8 rounded-xl border border-border bg-surface/30 hover:border-gold/20 transition-all duration-500"
              >
                <prop.icon size={28} className="text-gold mb-5" />
                <h3 className="text-lg font-bold mb-3">{prop.title}</h3>
                <p className="text-sm text-text-tertiary leading-relaxed">{prop.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ FOOTER / CTA ════════════════════════════════════════════ */}
      <section className="py-24 px-6 border-t border-border">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Ready to access the platform?
            </h2>
            <p className="text-text-secondary mb-10 max-w-xl mx-auto">
              MERIDIAN transforms open source noise into analytical signal.
              Enter the intelligence environment.
            </p>
            <button
              onClick={() => setMode('platform')}
              className="group px-10 py-4 bg-gold text-deep-black font-semibold rounded-xl
                       hover:bg-gold-dim transition-all duration-300 text-sm tracking-wide
                       flex items-center gap-3 mx-auto gold-glow"
            >
              <Shield size={18} />
              Launch MERIDIAN
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </motion.div>

          <div className="mt-16 pt-8 border-t border-border">
            <p className="text-xs text-text-muted">
              © 2026 Mohammed Anwer Mohammed · Enlil Center for Environment and Sustainable Development
            </p>
            <p className="text-xs text-text-muted mt-1">
              Sulaymaniyah / Baghdad, Iraq · CONFIDENTIAL
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}
