import { motion } from 'motion/react'
import { Shield, Construction, ArrowRight } from 'lucide-react'

const MODULE_INFO: Record<string, { title: string; desc: string }> = {
  lens: {
    title: 'LENS — Media & Narrative Analysis',
    desc: 'Full-spectrum social media monitoring, disinformation detection, coordinated inauthentic behavior identification, deepfake analysis, and media landscape mapping.',
  },
  pulse: {
    title: 'PULSE — Economic Intelligence',
    desc: 'Macro economic dashboard, sub-national economic proxies, investment risk scoring by governorate, energy sector intelligence, and trade flow analysis.',
  },
  foresight: {
    title: 'FORESIGHT — Predictive Analytics',
    desc: 'Bayesian conflict escalation models, displacement prediction, election forecasting, scenario modeling, and climate-security correlation.',
  },
  forge: {
    title: 'FORGE — Analyst Workbench',
    desc: 'Collaborative document authoring, Structured Analytic Techniques templates, evidence management with Admiralty grading, and AI-assisted report generation.',
  },
  alerts: {
    title: 'Alert Configuration',
    desc: 'Configure custom alert rules with AND/OR logic across geography, actor, topic, keyword, and STI threshold triggers.',
  },
  settings: {
    title: 'Platform Settings',
    desc: 'User management, API configuration, deployment settings, language preferences, and tier access controls.',
  },
}

export default function ComingSoonView({ module }: { module: string }) {
  const info = MODULE_INFO[module] || { title: module.toUpperCase(), desc: 'Module under development.' }

  return (
    <div className="h-full flex items-center justify-center animate-fade-in p-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center max-w-lg"
      >
        <motion.div
          animate={{ rotate: [0, 5, -5, 0] }}
          transition={{ duration: 4, repeat: Infinity }}
          className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gold/10 border border-gold/20 mb-6"
        >
          <Construction size={28} className="text-gold" />
        </motion.div>

        <h2 className="text-2xl font-bold text-text-primary mb-3">{info.title}</h2>
        <p className="text-sm text-text-secondary leading-relaxed mb-6">{info.desc}</p>

        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-gold/30 bg-gold/5">
          <Shield size={14} className="text-gold" />
          <span className="text-xs text-gold font-medium tracking-wide">
            Coming in Phase 2
          </span>
        </div>

        <p className="text-[10px] text-text-muted mt-6">
          This module is under active development and will be available with full
          data integration in the next platform release.
        </p>
      </motion.div>
    </div>
  )
}
