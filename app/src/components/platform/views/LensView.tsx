import { useEffect, useState } from 'react'
import { motion } from 'motion/react'
import {
  Eye, Newspaper, AlertTriangle, Shield, Target,
  TrendingUp, TrendingDown, Radio, Activity, Binoculars,
  Search, ExternalLink, Info, TerminalSquare, Copy, Crosshair, MapPin, Globe2
} from '@/lib/icons'

// ── Types ────────────────────────────────────────────────────────
interface PlatformStat { platform: string; posts: string; trend: string; color: string; icon: string }
interface Narrative { narrative: string; volume: number; sentiment: number; platforms: string[]; stiRelevant: boolean; disinfoRisk: string }
interface CIBCampaign { name: string; accounts: number; origin: string; confidence: number }
interface MediaSource { name: string; score: number; bias: string }

const API = '/api/v1/lens'

function riskColor(risk: string) {
  if (risk === 'HIGH' || risk === 'CRITICAL') return 'text-red-400'
  if (risk === 'MEDIUM') return 'text-yellow-400'
  return 'text-green-400'
}

function sentimentBar(s: number) {
  const pct = Math.abs(s) * 100
  const color = s < -0.5 ? '#EF4444' : s < 0 ? '#F59E0B' : s > 0.3 ? '#22C55E' : '#3B82F6'
  return (
    <div className="flex items-center gap-2 w-full">
      <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
        <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: color }} />
      </div>
      <span className="text-[10px] font-mono" style={{ color }}>{s.toFixed(2)}</span>
    </div>
  )
}

export default function LensView() {
  const [platforms, setPlatforms] = useState<PlatformStat[]>([])
  const [narratives, setNarratives] = useState<Narrative[]>([])
  const [campaigns, setCampaigns] = useState<CIBCampaign[]>([])
  const [media, setMedia] = useState<MediaSource[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      fetch(`${API}/platform-stats`).then(r => r.json()),
      fetch(`${API}/trending-narratives`).then(r => r.json()),
      fetch(`${API}/coordinated-campaigns`).then(r => r.json()),
      fetch(`${API}/media-credibility`).then(r => r.json()),
    ]).then(([p, n, c, m]) => {
      setPlatforms(p); setNarratives(n); setCampaigns(c); setMedia(m)
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-text-muted text-sm animate-pulse">Loading LENS intelligence...</div>
      </div>
    )
  }

  return (
    <div className="p-8 space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <Eye size={28} weight="duotone" className="text-blue-400" />
            LENS — Media Intelligence
          </h1>
          <p className="text-sm text-text-muted mt-1">
            SOCMINT monitoring, narrative tracking, disinformation detection, and media credibility scoring.
          </p>
        </div>
        <div className="flex items-center gap-2 text-[10px] text-green-400 font-mono">
          <Activity size={12} className="animate-pulse" /> LIVE MONITORING
        </div>
      </div>

      {/* Platform Ingestion Stats */}
      <div>
        <h2 className="text-[10px] uppercase tracking-[0.2em] text-text-tertiary font-semibold mb-3">
          Platform Ingestion (24h)
        </h2>
        <div className="grid grid-cols-3 gap-3">
          {platforms.map((p, i) => (
            <motion.div
              key={p.platform}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="glass-card p-4 border border-white/5"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-white">{p.platform}</span>
                <span className={`text-[10px] font-mono ${p.trend.startsWith('+') ? 'text-green-400' : 'text-red-400'}`}>
                  {p.trend}
                </span>
              </div>
              <div className="text-2xl font-bold font-mono" style={{ color: p.color }}>{p.posts}</div>
              <div className="text-[9px] text-text-muted mt-1 uppercase tracking-wider">Posts ingested</div>
            </motion.div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Trending Narratives */}
        <div>
          <h2 className="text-[10px] uppercase tracking-[0.2em] text-text-tertiary font-semibold mb-3 flex items-center gap-2">
            <Newspaper size={12} />
            Trending Narratives
          </h2>
          <div className="space-y-2">
            {narratives.map((n, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.06 }}
                className="glass-card p-3 border border-white/5"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <p className="text-xs font-medium text-white leading-snug">{n.narrative}</p>
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className="text-[9px] text-text-muted font-mono">{n.volume.toLocaleString()} mentions</span>
                      <span className="text-[9px] text-text-muted">·</span>
                      {n.platforms.map(pl => (
                        <span key={pl} className="text-[9px] px-1.5 py-0.5 rounded bg-white/5 text-text-secondary">{pl}</span>
                      ))}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    {n.stiRelevant && (
                      <span className="text-[8px] px-1.5 py-0.5 rounded bg-red-500/20 text-red-400 font-mono">STI</span>
                    )}
                    <span className={`text-[8px] px-1.5 py-0.5 rounded font-mono ${riskColor(n.disinfoRisk)}`}>
                      {n.disinfoRisk}
                    </span>
                  </div>
                </div>
                <div className="mt-2">{sentimentBar(n.sentiment)}</div>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          {/* Coordinated Inauthentic Behavior */}
          <div>
            <h2 className="text-[10px] uppercase tracking-[0.2em] text-text-tertiary font-semibold mb-3 flex items-center gap-2">
              <AlertTriangle size={12} className="text-red-400" />
              Coordinated Inauthentic Behavior (CIB)
            </h2>
            <div className="space-y-2">
              {campaigns.map((c, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.08 }}
                  className="glass-card p-3 border border-red-500/10"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-semibold text-white">{c.name}</p>
                      <p className="text-[10px] text-text-muted mt-0.5">
                        Origin: <span className="text-yellow-400">{c.origin}</span> · {c.accounts} accounts
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold font-mono text-red-400">{(c.confidence * 100).toFixed(0)}%</div>
                      <div className="text-[8px] text-text-muted uppercase">Confidence</div>
                    </div>
                  </div>
                  <div className="mt-2 h-1 bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-red-500 rounded-full" style={{ width: `${c.confidence * 100}%` }} />
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Media Credibility */}
          <div>
            <h2 className="text-[10px] uppercase tracking-[0.2em] text-text-tertiary font-semibold mb-3 flex items-center gap-2">
              <Shield size={12} className="text-blue-400" />
              Media Credibility Index
            </h2>
            <div className="glass-card p-4 border border-white/5">
              <div className="space-y-3">
                {media.map((m, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <span className="text-[11px] text-white font-medium w-28 truncate">{m.name}</span>
                    <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${m.score}%` }}
                        transition={{ delay: i * 0.1, duration: 0.6 }}
                        className="h-full rounded-full"
                        style={{
                          backgroundColor: m.score >= 75 ? '#22C55E' : m.score >= 65 ? '#3B82F6' : '#F59E0B'
                        }}
                      />
                    </div>
                    <span className="text-xs font-mono text-white w-8 text-right">{m.score}</span>
                    <span className="text-[9px] text-text-muted w-24 truncate text-right">{m.bias}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mt-8">
        {/* Nmap Host Recon */}
        <HostReconPanel />

        {/* Global Entity / Wikipedia Event Stream */}
        <WikipediaStreamPanel />
      </div>

      {/* OSINT Dorking Generator (From Cheat Sheet) */}
      <DorkGeneratorPanel />
    </div>
  )
}

function HostReconPanel() {
  const [ip, setIp] = useState('8.8.8.8')
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<any>(null)

  const handleScan = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/v1/cyber/nmap-scan?ip=${ip}`)
      const data = await res.json()
      setResults(data)
    } catch {
      setResults({ error: "Failed to reach scanning engine" })
    }
    setLoading(false)
  }

  return (
    <div className="glass-card-solid border border-red-500/10">
      <div className="border-b border-red-500/10 p-4 bg-red-500/5">
        <div className="flex items-center gap-3">
          <Crosshair className="text-red-400" size={20} />
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Host Reconnaissance (TCP Connect)</h3>
            <p className="text-[10px] text-white/50">Native fast-port scanner targeting high-value infrastructure ports</p>
          </div>
        </div>
      </div>
      <div className="p-4 space-y-4">
        <div className="flex gap-2">
          <input 
            value={ip}
            onChange={e => setIp(e.target.value)}
            placeholder="IP Address or Domain"
            className="flex-1 bg-surface border border-border rounded p-2 text-xs text-white"
          />
          <button 
            onClick={handleScan}
            disabled={loading}
            className="px-4 py-2 bg-red-500/20 text-red-400 border border-red-500/30 rounded text-xs font-bold hover:bg-red-500/30 transition-colors"
          >
            {loading ? 'Scanning...' : 'Execute Scan'}
          </button>
        </div>
        
        {results?.open_ports && (
          <div className="bg-black/50 p-4 rounded border border-white/5 h-48 overflow-y-auto">
            <div className="text-[10px] text-text-muted mb-2 font-mono">STATUS: {results.status.toUpperCase()}</div>
            <div className="space-y-1">
              {results.open_ports.map((p: any) => (
                <div key={p.port} className="flex justify-between items-center text-xs font-mono">
                  <span className="text-green-400">PORT {p.port}/tcp</span>
                  <span className="text-white/50">OPEN</span>
                  <span className="text-blue-400 w-16 text-right">{p.service}</span>
                </div>
              ))}
              {results.open_ports.length === 0 && (
                <div className="text-xs text-white/50 italic">No open ports found out of {results.total_scanned} scanned.</div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function WikipediaStreamPanel() {
  const [edits, setEdits] = useState<any[]>([])

  useEffect(() => {
    // Wikipedia Server-Sent Events (SSE) Stream
    // Extremely powerful OSINT: Global breaking news hits Wikipedia immediately.
    const url = 'https://stream.wikimedia.org/v2/stream/recentchange'
    const eventSource = new EventSource(url)

    // Keywords of geopolitical interest
    const targets = ['war', 'military', 'attack', 'president', 'election', 'protest', 'diploma', 'sanction', 'crisis']

    eventSource.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data)
        if (data.type === 'edit' && data.server_name === 'en.wikipedia.org') {
          const title = (data.title || '').toLowerCase()
          if (targets.some(t => title.includes(t))) {
            setEdits(prev => [data, ...prev].slice(0, 15)) // Keep last 15
          }
        }
      } catch {}
    }

    return () => eventSource.close()
  }, [])

  return (
    <div className="glass-card-solid border border-blue-500/10">
      <div className="border-b border-blue-500/10 p-4 bg-blue-500/5">
        <div className="flex items-center gap-3">
          <Globe2 className="text-blue-400" size={20} />
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Strategic Entity Stream</h3>
            <p className="text-[10px] text-white/50">Live global Wikipedia edit stream filtered for geopolitical conflict tags</p>
          </div>
        </div>
      </div>
      <div className="p-0">
        <div className="bg-black/20 h-64 overflow-y-auto divide-y divide-white/5">
          {edits.length === 0 && (
            <div className="p-8 text-center text-xs text-white/40 animate-pulse">
              Awaiting next global entity update...
            </div>
          )}
          {edits.map(edit => (
            <a 
              key={edit.meta.id} 
              href={edit.meta.uri} 
              target="_blank" 
              rel="noopener noreferrer"
              className="p-3 block hover:bg-white/5 transition-colors"
            >
              <div className="flex justify-between items-start">
                <div className="text-xs font-bold text-blue-400 truncate w-3/4">{edit.title}</div>
                <div className="text-[9px] text-white/40 font-mono">{new Date(edit.meta.dt).toLocaleTimeString()}</div>
              </div>
              <div className="text-[10px] text-white/60 mt-1 flex justify-between">
                <span>User: {edit.user}</span>
                <span className={edit.length?.new > edit.length?.old ? "text-green-400" : "text-red-400"}>
                  {edit.length?.new > edit.length?.old ? "+" : ""}{(edit.length?.new || 0) - (edit.length?.old || 0)} bytes
                </span>
              </div>
            </a>
          ))}
        </div>
      </div>
    </div>
  )
}

function DorkGeneratorPanel() {
  const [target, setTarget] = useState('example.com')
  const [dorkType, setDorkType] = useState('aws_keys')

  const DORK_TEMPLATES: Record<string, { name: string; query: string; isBash?: boolean }> = {
    aws_keys: { name: 'Exposed AWS Keys', query: `"AWS_DEFAULT_REGION" OR "aws_access_key_id" OR "aws_secret_access_key" site:${target}` },
    db_passwords: { name: 'Database Passwords', query: `"DB_PASSWORD" OR "dbpasswd" OR "root_password" ext:env OR ext:sql site:${target}` },
    ftp_config: { name: 'FTP Configurations', query: `filename:filezilla.xml Pass OR filename:.ftpconfig site:${target}` },
    github_tokens: { name: 'GitHub/GitLab Tokens', query: `"gh_token" OR "github_key" OR "gitlab" ext:yml OR ext:json site:${target}` },
    username_hunt_bash: { 
      name: 'Mass Username Hunt (Bash Script)', 
      isBash: true,
      query: `for ((i=1;1<=10;i++));do curl -i -s -k -L -X GET -H "User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64)" "https://www.google.com/search?q=${target}&start=\${i}0" | grep -Eo 'href="[^\\"]+"' | grep -Po "(http|https)://[a-zA-Z0-9./?=_%:-]*" | sort -u ;done` 
    },
    bing_php_id_bash: {
      name: 'Bing PHP ID Scraper (Bash Script)',
      isBash: true,
      query: `for ((i=1;i<=10;i++));do curl -i -s -k -L -X GET -H "User-Agent: Mozilla/5.0" "https://www.bing.com/search?q=site:${target}+ext:php+inurl:id=" | grep -Eo 'href="[^\\"]+"' | grep -Po "(http|https)://[a-zA-Z0-9./?=_%:-]*" | grep ".php?id" | sort -u ;done`
    }
  }

  const activeDork = DORK_TEMPLATES[dorkType]
  const isBash = activeDork.isBash

  const executeDork = () => {
    if (!isBash) {
      window.open(`https://google.com/search?q=${encodeURIComponent(activeDork.query)}`, '_blank')
    } else {
      navigator.clipboard.writeText(activeDork.query)
      alert("Bash script copied to clipboard! Run this in your local terminal.")
    }
  }

  return (
    <div className="glass-card-solid border border-white/5 mt-8">
      <div className="border-b border-white/5 p-4 bg-white/[0.02]">
        <div className="flex items-center gap-3">
          <TerminalSquare className="text-blue-400" size={20} />
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Automated Dorking Engine</h3>
            <p className="text-[10px] text-white/50">Derived from Jieyab89 OSINT-Cheat-sheet</p>
          </div>
        </div>
      </div>
      <div className="p-4 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-4">
          <div>
            <label className="text-[10px] text-white/40 uppercase tracking-wider font-bold mb-2 block">Target Domain / Username</label>
            <input 
              type="text" 
              value={target}
              onChange={e => setTarget(e.target.value)}
              className="w-full bg-surface-elevated border border-border rounded p-2 text-xs text-white outline-none focus:border-blue-500/50"
            />
          </div>
          <div>
            <label className="text-[10px] text-white/40 uppercase tracking-wider font-bold mb-2 block">Dork Payload</label>
            <select 
              value={dorkType}
              onChange={e => setDorkType(e.target.value)}
              className="w-full bg-surface-elevated border border-border rounded p-2 text-xs text-white outline-none"
            >
              {Object.entries(DORK_TEMPLATES).map(([key, template]) => (
                <option key={key} value={key}>{template.name}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="md:col-span-2">
          <label className="text-[10px] text-white/40 uppercase tracking-wider font-bold mb-2 block flex items-center gap-2">
            Generated {isBash ? 'Bash Script' : 'Search Query'}
          </label>
          <div className="bg-black/50 p-4 rounded border border-white/5 font-mono text-[11px] text-green-400 h-24 overflow-y-auto break-all">
            {activeDork.query}
          </div>
          <div className="mt-3 flex justify-end">
            <button 
              onClick={executeDork}
              className="flex items-center gap-2 px-4 py-2 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded text-xs font-bold transition-colors"
            >
              {isBash ? <Copy size={14} /> : <ExternalLink size={14} />}
              {isBash ? 'Copy Script to Clipboard' : 'Execute Google Search'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
