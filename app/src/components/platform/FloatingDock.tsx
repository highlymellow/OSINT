import { motion } from 'motion/react'
import { useAppStore } from '@/store/app'
import { modules } from '@/lib/data'
import { Activity, Radio, MapPin, Network, Eye, BarChart3, Radar, Layers, Newspaper, LayoutDashboard } from 'lucide-react'
import type { NavView } from '@/lib/types'

const MODULE_ICONS: Record<string, React.ComponentType<any>> = {
  signal: Radio, terrain: MapPin, nexus: Network, lens: Eye,
  pulse: BarChart3, foresight: Radar, forge: Layers, sti: Activity,
}

export default function FloatingDock() {
  const currentView = useAppStore((s) => s.currentView)
  const setView = useAppStore((s) => s.setView)

  const dockItems = [
    { id: 'overview', name: 'OVERVIEW', status: 'active', icon: LayoutDashboard },
    ...modules.map(m => ({ id: m.id, name: m.name, status: m.status, icon: MODULE_ICONS[m.id] || Activity })),
    { id: 'press', name: 'PRESS', status: 'active', icon: Newspaper }
  ]

  return (
    <div className="fixed bottom-8 left-0 right-0 flex justify-center z-50 pointer-events-none px-4">
      <motion.div
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="pointer-events-auto flex items-center p-1.5 rounded-2xl bg-[#1C1C1E] border border-white/5 shadow-2xl overflow-x-auto overflow-y-hidden [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] max-w-full"
      >
        <div className="flex items-center gap-1">
          {dockItems.map((mod) => {
            const Icon = mod.icon
            const isActive = currentView === mod.id
            
            return (
              <button
                key={mod.id}
                onClick={() => setView(mod.id as NavView)}
                className={`shrink-0 relative flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all duration-200 ${
                  isActive 
                    ? 'bg-[#09090B] text-white shadow-sm ring-1 ring-white/10' 
                    : 'text-[#8E8E93] hover:text-[#D1D1D6] hover:bg-white/5'
                }`}
              >
                <Icon size={16} strokeWidth={isActive ? 2.5 : 2} className={isActive ? 'text-white' : ''} />
                <span className={`text-[11px] font-semibold tracking-wide ${isActive ? 'text-white' : ''}`}>
                  {mod.name.charAt(0).toUpperCase() + mod.name.slice(1).toLowerCase()}
                </span>
                
                {mod.status !== 'active' && (
                  <span className="ml-1 text-[8px] uppercase tracking-widest bg-white/10 text-[#8E8E93] px-1.5 py-0.5 rounded font-mono">
                    Beta
                  </span>
                )}
              </button>
            )
          })}
        </div>
      </motion.div>
    </div>
  )
}
