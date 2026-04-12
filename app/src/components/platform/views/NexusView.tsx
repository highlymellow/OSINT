import { useState, useMemo } from 'react'
import { motion } from 'motion/react'
import { useQuery } from '@tanstack/react-query'
import { fetchActors } from '@/lib/api'
import { networkNodes, networkEdges, getNodeConnections, networkStats } from '@/lib/networks'
import {
  Network, Search, Filter, Users, Shield, Crosshair,
  ChevronRight, ExternalLink, AlertTriangle
} from 'lucide-react'
import { getStatusColor, getStatusBg } from '@/lib/utils'

const CATEGORY_COLORS: Record<string, string> = {
  pmf: '#DC2626',
  sunni: '#EAB308',
  kurdish: '#22D3EE',
  government: '#3B82F6',
  external: '#A855F7',
  minority: '#2DD4BF',
  tribal: '#F97316',
}

const CATEGORY_LABELS: Record<string, string> = {
  pmf: 'PMF / Shia Militia',
  sunni: 'Sunni Factions',
  kurdish: 'Kurdish Factions',
  government: 'Government / State',
  external: 'External Patrons',
  minority: 'Minorities',
  tribal: 'Tribal',
}

export default function NexusView() {
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [selectedNode, setSelectedNode] = useState<string | null>(null)

  const filteredNodes = useMemo(() => {
    return networkNodes.filter((n) => {
      if (categoryFilter !== 'all' && n.category !== categoryFilter) return false
      if (search) {
        const q = search.toLowerCase()
        if (!n.name.toLowerCase().includes(q) && !(n.nameAr || '').includes(q)) return false
      }
      return true
    })
  }, [search, categoryFilter])

  const selected = selectedNode ? networkNodes.find((n) => n.id === selectedNode) : null
  const connections = selectedNode ? getNodeConnections(selectedNode) : []

  return (
    <div className="flex h-full animate-fade-in">
      {/* ── Actor List (Left Panel) ── */}
      <div className="w-96 border-r border-border bg-surface/30 flex flex-col shrink-0">
        {/* Search / Filter */}
        <div className="p-4 border-b border-border space-y-3">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
            <input
              type="text"
              placeholder="Search actors..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-surface-elevated border border-border rounded-lg text-sm
                       text-text-primary placeholder:text-text-muted focus:border-gold/50 focus:outline-none transition-colors"
            />
          </div>
          <div className="flex flex-wrap gap-1">
            <button
              onClick={() => setCategoryFilter('all')}
              className={`px-2.5 py-1 rounded-md text-[9px] font-bold tracking-wider uppercase transition-all ${
                categoryFilter === 'all' ? 'bg-gold/15 text-gold' : 'text-text-muted hover:text-text-secondary'
              }`}
            >
              All ({networkNodes.length})
            </button>
            {Object.entries(CATEGORY_LABELS).map(([key, label]) => {
              const count = networkNodes.filter((n) => n.category === key).length
              return (
                <button
                  key={key}
                  onClick={() => setCategoryFilter(key)}
                  className={`px-2.5 py-1 rounded-md text-[9px] font-bold tracking-wider transition-all ${
                    categoryFilter === key
                      ? 'text-white'
                      : 'text-text-muted hover:text-text-secondary'
                  }`}
                  style={categoryFilter === key ? { backgroundColor: CATEGORY_COLORS[key] + '25', color: CATEGORY_COLORS[key] } : {}}
                >
                  {label} ({count})
                </button>
              )
            })}
          </div>
        </div>

        {/* Actor list */}
        <div className="flex-1 overflow-y-auto">
          {filteredNodes.map((node, i) => (
            <motion.button
              key={node.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.02 * i }}
              onClick={() => setSelectedNode(node.id)}
              className={`w-full text-left p-4 border-b border-border transition-all hover:bg-surface-hover ${
                selectedNode === node.id ? 'bg-surface-hover border-l-2 border-l-gold' : ''
              }`}
            >
              <div className="flex items-start gap-3">
                <div
                  className="w-2 h-2 rounded-full mt-1.5 shrink-0"
                  style={{ backgroundColor: CATEGORY_COLORS[node.category] }}
                />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-text-primary truncate">{node.name}</div>
                  {node.nameAr && (
                    <div className="text-[10px] text-text-muted font-mono truncate" dir="rtl">{node.nameAr}</div>
                  )}
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[9px] text-text-tertiary uppercase">{node.type}</span>
                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${getStatusBg(node.riskLevel)} ${getStatusColor(node.riskLevel)} uppercase`}>
                      {node.riskLevel}
                    </span>
                    <span className="text-[9px] text-text-muted">{node.connections} links</span>
                  </div>
                </div>
              </div>
            </motion.button>
          ))}
        </div>

        {/* Stats footer */}
        <div className="p-3 border-t border-border bg-surface/50">
          <div className="grid grid-cols-3 gap-2 text-center">
            <div>
              <div className="text-xs font-mono font-bold text-gold">{networkStats.totalNodes}</div>
              <div className="text-[8px] text-text-muted uppercase">Actors</div>
            </div>
            <div>
              <div className="text-xs font-mono font-bold text-gold">{networkStats.totalEdges}</div>
              <div className="text-[8px] text-text-muted uppercase">Links</div>
            </div>
            <div>
              <div className="text-xs font-mono font-bold text-alert-red">{networkStats.criticalActors}</div>
              <div className="text-[8px] text-text-muted uppercase">Critical</div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Detail Panel (Right) ── */}
      <div className="flex-1 overflow-y-auto p-6">
        {selected ? (
          <motion.div
            key={selected.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Header */}
            <div className="glass-card p-6">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: CATEGORY_COLORS[selected.category] }} />
                    <span className="text-[10px] uppercase tracking-[0.15em] text-text-tertiary font-bold">
                      {CATEGORY_LABELS[selected.category] || selected.category}
                    </span>
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded border ${getStatusBg(selected.riskLevel)} ${getStatusColor(selected.riskLevel)} uppercase`}>
                      {selected.riskLevel} risk
                    </span>
                  </div>
                  <h2 className="text-2xl font-bold text-text-primary">{selected.name}</h2>
                  {selected.nameAr && (
                    <p className="text-lg text-text-muted font-mono mt-1" dir="rtl">{selected.nameAr}</p>
                  )}
                  {selected.nameKu && (
                    <p className="text-sm text-text-muted mt-0.5">{selected.nameKu}</p>
                  )}
                </div>
              </div>

              <p className="text-sm text-text-secondary mt-4 leading-relaxed">
                {selected.description}
              </p>

              {/* Metadata grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6">
                {selected.leader && (
                  <div className="p-3 rounded-lg bg-surface-elevated border border-border">
                    <div className="text-[9px] text-text-muted uppercase mb-1">Leader</div>
                    <div className="text-xs font-medium">{selected.leader}</div>
                  </div>
                )}
                {selected.strength && (
                  <div className="p-3 rounded-lg bg-surface-elevated border border-border">
                    <div className="text-[9px] text-text-muted uppercase mb-1">Strength</div>
                    <div className="text-xs font-medium">{selected.strength}</div>
                  </div>
                )}
                {selected.ideology && (
                  <div className="p-3 rounded-lg bg-surface-elevated border border-border">
                    <div className="text-[9px] text-text-muted uppercase mb-1">Ideology</div>
                    <div className="text-xs font-medium">{selected.ideology}</div>
                  </div>
                )}
                {selected.founded && (
                  <div className="p-3 rounded-lg bg-surface-elevated border border-border">
                    <div className="text-[9px] text-text-muted uppercase mb-1">Founded</div>
                    <div className="text-xs font-medium">{selected.founded}</div>
                  </div>
                )}
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-1.5 mt-4">
                {selected.tags.map((tag) => (
                  <span key={tag} className="text-[9px] text-text-muted border border-border px-2 py-0.5 rounded-full">
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Connections */}
            <div className="glass-card-solid p-6">
              <h3 className="text-xs font-bold tracking-[0.1em] uppercase text-text-secondary mb-4 flex items-center gap-2">
                <Network size={14} className="text-gold" />
                Network Connections ({connections.length})
              </h3>
              <div className="space-y-2">
                {connections.map(({ node: conn, edge }) => (
                  <button
                    key={conn.id}
                    onClick={() => setSelectedNode(conn.id)}
                    className="w-full flex items-center justify-between p-3 rounded-lg bg-surface-elevated/50
                             border border-border hover:border-gold/30 transition-all text-left group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: CATEGORY_COLORS[conn.category] }} />
                      <div>
                        <div className="text-sm font-medium group-hover:text-gold transition-colors">{conn.name}</div>
                        <div className="text-[10px] text-text-muted">{conn.type} · {conn.category}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`text-[9px] font-bold px-2 py-0.5 rounded uppercase ${
                        edge.relationship.includes('rivalry') ? 'bg-red-500/15 text-red-400'
                        : edge.relationship === 'patron' ? 'bg-purple-500/15 text-purple-400'
                        : edge.relationship === 'command' ? 'bg-gold/15 text-gold'
                        : 'bg-blue-500/15 text-blue-400'
                      }`}>
                        {edge.relationship}
                      </div>
                      <div className="text-[9px] text-text-muted mt-1">{edge.strength}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center max-w-md">
              <Network size={48} className="text-text-muted mx-auto mb-4 opacity-30" />
              <h3 className="text-lg font-semibold text-text-secondary mb-2">NEXUS — Actor Network</h3>
              <p className="text-sm text-text-muted">
                Select an actor from the left panel to view their profile,
                metadata, and network connections.
              </p>
              <p className="text-xs text-text-muted mt-4">
                {networkStats.totalNodes} actors · {networkStats.totalEdges} active connections ·
                {networkStats.criticalActors} critical threat entities
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
