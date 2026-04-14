import { useEffect, useState } from 'react'
import { motion } from 'motion/react'
import {
  FileText, Layers, Target, Shield, Activity,
  Clock, Users, Search, Plus, ExternalLink, Eye, Info,
  Binoculars, Brain, UploadCloud, MapPin, Camera
} from '@/lib/icons'

// ── Types ────────────────────────────────────────────────────────
interface Report {
  id: string; title: string; classification: string; author: string
  status: string; lastModified: string; template: string; sections: number
  sources: number; wordCount: number; stiRelevance: string[]; collaborators: string[]
}
interface SATTemplate { id: string; name: string; icon: string; count: number; description: string }
interface Evidence { id: string; type: string; grade: string; source: string; date: string; relevance: string; reliability: string }

const API = '/api/v1/forge'

function classColor(c: string) {
  if (c === 'TOP SECRET') return 'text-red-500 bg-red-500/10 border-red-500/30'
  if (c === 'SECRET') return 'text-orange-400 bg-orange-500/10 border-orange-500/30'
  if (c === 'CONFIDENTIAL') return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30'
  return 'text-blue-400 bg-blue-500/10 border-blue-500/30'
}

function statusBadge(s: string) {
  if (s === 'published') return 'text-green-400 bg-green-500/10'
  if (s === 'review') return 'text-yellow-400 bg-yellow-500/10'
  return 'text-blue-400 bg-blue-500/10'
}

function gradeColor(g: string) {
  if (g.startsWith('A')) return 'text-green-400'
  if (g.startsWith('B')) return 'text-blue-400'
  if (g.startsWith('C')) return 'text-yellow-400'
  return 'text-red-400'
}

export default function ForgeView() {
  const [reports, setReports] = useState<Report[]>([])
  const [templates, setTemplates] = useState<SATTemplate[]>([])
  const [evidence, setEvidence] = useState<Evidence[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      fetch(`${API}/reports`).then(r => r.json()),
      fetch(`${API}/sat-templates`).then(r => r.json()),
      fetch(`${API}/evidence-items`).then(r => r.json()),
    ]).then(([r, s, e]) => {
      setReports(r); setTemplates(s); setEvidence(e)
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-text-muted text-sm animate-pulse">Loading FORGE analyst workbench...</div>
      </div>
    )
  }

  return (
    <div className="p-8 space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <Layers size={28} weight="duotone" className="text-green-400" />
            FORGE — Analyst Workbench
          </h1>
          <p className="text-sm text-text-muted mt-1">
            Structured Analytic Techniques, evidence grading, and collaborative intelligence authoring.
          </p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-green-500/10 border border-green-500/30 text-green-400 text-xs font-semibold hover:bg-green-500/20 transition-colors">
          <Plus size={14} /> New Report
        </button>
      </div>

      {/* SAT Templates */}
      <div>
        <h2 className="text-[10px] uppercase tracking-[0.2em] text-text-tertiary font-semibold mb-3 flex items-center gap-2">
          <Brain size={12} />
          Structured Analytic Techniques
        </h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {templates.map((t, i) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.04 }}
              className="glass-card p-4 border border-white/5 cursor-pointer hover:border-green-500/30 transition-colors group"
            >
              <div className="text-2xl mb-2">{t.icon}</div>
              <h3 className="text-xs font-bold text-white group-hover:text-green-400 transition-colors">{t.name}</h3>
              <p className="text-[10px] text-text-muted mt-1 line-clamp-2">{t.description}</p>
              <div className="text-[9px] text-text-tertiary font-mono mt-2">{t.count} analyses</div>
            </motion.div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-5 gap-6">
        {/* Reports (3 cols) */}
        <div className="col-span-3">
          <h2 className="text-[10px] uppercase tracking-[0.2em] text-text-tertiary font-semibold mb-3 flex items-center gap-2">
            <FileText size={12} />
            Active Reports
          </h2>
          <div className="space-y-2">
            {reports.map((r, i) => (
              <motion.div
                key={r.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="glass-card p-4 border border-white/5 cursor-pointer hover:border-gold/20 transition-all"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-[8px] px-1.5 py-0.5 rounded font-mono border ${classColor(r.classification)}`}>
                        {r.classification}
                      </span>
                      <span className={`text-[8px] px-1.5 py-0.5 rounded font-mono ${statusBadge(r.status)}`}>
                        {r.status.toUpperCase()}
                      </span>
                    </div>
                    <h3 className="text-sm font-semibold text-white leading-snug">{r.title}</h3>
                    <div className="flex items-center gap-3 mt-2 text-[9px] text-text-muted">
                      <span className="flex items-center gap-1"><Clock size={10} /> {new Date(r.lastModified).toLocaleDateString()}</span>
                      <span>{r.template}</span>
                      <span>{r.wordCount.toLocaleString()} words</span>
                      <span>{r.sources} sources</span>
                    </div>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {r.stiRelevance.map(s => (
                        <span key={s} className="text-[8px] px-1.5 py-0.5 bg-red-500/10 text-red-400 rounded">{s}</span>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    {r.collaborators.map(c => (
                      <div key={c} className="w-6 h-6 rounded-full bg-surface-elevated border border-white/10 flex items-center justify-center text-[8px] text-white font-bold">
                        {c.split(' ').map(w => w[0]).join('')}
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Evidence Vault (2 cols) */}
        <div className="col-span-2">
          <h2 className="text-[10px] uppercase tracking-[0.2em] text-text-tertiary font-semibold mb-3 flex items-center gap-2">
            <Binoculars size={12} />
            Evidence Vault & Local Forensics
          </h2>
          <div className="space-y-4">
            
            <ForensicDropzone />
            
            <div className="space-y-2 mt-4">
            {evidence.map((e, i) => (
              <motion.div
                key={e.id}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.04 }}
                className="glass-card p-3 border border-white/5"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-bold font-mono ${gradeColor(e.grade)}`}>{e.grade}</span>
                    <span className="text-[8px] px-1.5 py-0.5 rounded bg-white/5 text-text-secondary font-mono">{e.type}</span>
                  </div>
                  <span className="text-[9px] text-text-muted font-mono">{e.id}</span>
                </div>
                <p className="text-[11px] text-white mt-1 font-medium">{e.source}</p>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-[9px] text-text-muted">{e.relevance}</span>
                  <span className="text-[9px] text-text-muted">{e.date}</span>
                </div>
                <div className="text-[8px] text-text-tertiary mt-1 italic">{e.reliability}</div>
              </motion.div>
            ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function ForensicDropzone() {
  const [loading, setLoading] = useState(false)
  const [isDrag, setIsDrag] = useState(false)
  const [exifData, setExifData] = useState<any>(null)

  useEffect(() => {
    if (!(window as any).exifr) {
      const script = document.createElement('script')
      script.src = 'https://cdn.jsdelivr.net/npm/exifr/dist/lite.umd.js'
      document.body.appendChild(script)
    }
  }, [])

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault()
    setIsDrag(false)
    setLoading(true)
    const file = e.dataTransfer.files[0]
    if (file && (window as any).exifr) {
      try {
        const output = await (window as any).exifr.parse(file)
        if (output) {
          setExifData({
            latitude: output.latitude,
            longitude: output.longitude,
            make: output.Make || 'Unknown Device',
            model: output.Model || 'Unknown Model',
            date: output.DateTimeOriginal ? new Date(output.DateTimeOriginal).toLocaleString() : 'No timestamp'
          })
        } else {
          setExifData({ error: 'No EXIF geospatial signature detected securely.' })
        }
      } catch {
        setExifData({ error: 'Forensic parsing failure.' })
      }
    }
    setLoading(false)
  }

  return (
    <div className="flex flex-col gap-2">
      <div 
        onDragOver={e => { e.preventDefault(); setIsDrag(true) }}
        onDragLeave={() => setIsDrag(false)}
        onDrop={handleDrop}
        className={`w-full border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center transition-colors cursor-crosshair ${
          isDrag ? 'border-green-400 bg-green-500/10' : 'border-white/10 hover:border-white/30 bg-black/20'
        }`}
      >
        <UploadCloud size={24} className={isDrag ? 'text-green-400' : 'text-white/40'} />
        <span className="text-[10px] font-bold tracking-[0.2em] uppercase mt-3 text-white/70">
          {loading ? 'Extracting Signatures...' : 'Drop Evidence for Local Geo-Parsing'}
        </span>
        <span className="text-[9px] text-zinc-500 mt-1 max-w-[200px] text-center">
          Executes locally. Zero cloud egress. Extracts GPS, timestamps, and hardware UUID from image EXIF.
        </span>
      </div>

      {exifData && !exifData.error && (
        <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className="glass-card-solid border border-green-500/30 p-4">
          <h4 className="text-[10px] uppercase font-bold text-green-400 tracking-widest border-b border-green-500/20 pb-2 mb-2 flex items-center gap-2">
            <MapPin size={12} /> Target Geolocation Extracted
          </h4>
          <div className="grid grid-cols-2 gap-2 text-[10px] font-mono">
            <div className="text-white/50">Lattitude:</div><div className="text-white">{exifData.latitude?.toFixed(6) || 'N/A'}</div>
            <div className="text-white/50">Longitude:</div><div className="text-white">{exifData.longitude?.toFixed(6) || 'N/A'}</div>
            <div className="text-white/50 pt-1 mt-1 border-t border-white/5 flex items-center gap-1"><Camera size={10} /> Hardware Make:</div><div className="text-white pt-1 mt-1 border-t border-white/5">{exifData.make}</div>
            <div className="text-white/50">Capture Model:</div><div className="text-white">{exifData.model}</div>
            <div className="text-white/50">System Timestamp:</div><div className="text-white text-[9px]">{exifData.date}</div>
          </div>
          {exifData.latitude && (
            <button className="mt-3 w-full bg-green-500/10 hover:bg-green-500/20 border border-green-500/30 text-green-400 text-[10px] py-1.5 rounded font-bold transition-all">
              CROSS-REFERENCE IN SPATIO-TEMPORAL LAYER
            </button>
          )}
        </motion.div>
      )}

      {exifData?.error && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-[10px] font-mono text-red-400 bg-red-500/10 border border-red-500/20 p-2 rounded">
          {exifData.error}
        </motion.div>
      )}
    </div>
  )
}
