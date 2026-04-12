import { motion } from 'motion/react'
import { useAppStore } from '@/store/app'
import { modules } from '@/lib/data'
import { Command, Fingerprint, RadioTower, Globe2, Workflow, ScanEye, CandlestickChart, Orbit, Cpu, TerminalSquare } from 'lucide-react'
import type { NavView } from '@/lib/types'

const MODULE_ICONS: Record<string, React.ComponentType<any>> = {
  signal: RadioTower, terrain: Globe2, nexus: Workflow, lens: ScanEye,
  pulse: CandlestickChart, foresight: Orbit, forge: Cpu, sti: Fingerprint,
}

export default function FloatingDock() {
  const currentView = useAppStore((s) => s.currentView)
  const setView = useAppStore((s) => s.setView)

  const dockItems = [
    { id: 'overview', name: 'OVERVIEW', status: 'active', icon: Command },
    ...modules.map(m => ({ id: m.id, name: m.name, status: m.status, icon: MODULE_ICONS[m.id] || Fingerprint })),
    { id: 'press', name: 'PRESS', status: 'active', icon: TerminalSquare }
  ]

  return (
    <div className="fixed bottom-10 left-0 right-0 flex justify-center z-50 pointer-events-none px-4">
      <motion.div
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="pointer-events-auto flex items-center p-2 rounded-[2rem] bg-[#0F0F12]/95 backdrop-blur-2xl border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] max-w-full"
      >
        <div className="flex items-center gap-2 px-2">
          {dockItems.map((mod) => {
            const Icon = mod.icon
            const isActive = currentView === mod.id
            
            return (
              <button
                key={mod.id}
                onClick={() => setView(mod.id as NavView)}
                className={`shrink-0 relative flex flex-col items-center justify-center gap-2 h-[84px] min-w-[84px] px-3 rounded-2xl transition-all duration-300 ${
                  isActive 
                    ? 'bg-white/10 text-white shadow-lg ring-1 ring-white/20' 
                    : 'text-[#8E8E93] hover:text-white hover:bg-[#1C1C1E]/80 hover:scale-105'
                }`}
              >
                <div className={isActive ? "bg-black/40 p-2.5 rounded-xl shadow-inner" : "p-2.5"}>
                  <Icon size={24} strokeWidth={isActive ? 2.5 : 2} className={isActive ? 'text-white drop-shadow-md' : ''} />
                </div>
                <span className={`text-[10px] font-bold tracking-widest ${isActive ? 'text-white' : ''}`}>
                  {mod.name.toUpperCase()}
                </span>
                
                {mod.status !== 'active' && (
                  <span className="absolute top-2 right-2 text-[8px] uppercase tracking-widest bg-white/10 text-[#8E8E93] px-1.5 py-0.5 rounded font-mono">
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
