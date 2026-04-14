import { motion } from 'motion/react'
import { useAppStore } from '@/store/app'
import type { NavView } from '@/lib/types'
import { 
  Command, Fingerprint, RadioTower, Globe2, Workflow,
  ScanEye, CandlestickChart, Orbit, Cpu, TerminalSquare,
  BellRing, Settings2, ChevronRight, BookOpen
 } from "@/lib/icons"
import { cn } from '@/lib/utils'

interface NavItem {
  id: NavView
  label: string
  icon: React.ComponentType<{ size?: number; className?: string; strokeWidth?: number }>
  status?: 'active' | 'beta' | 'coming'
}

const MeridianLogo = ({ size = 24, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="currentColor" fillOpacity="0.2" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
    <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
    <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
    <circle cx="12" cy="12" r="2" fill="currentColor" />
  </svg>
)

const NAV_ITEMS: NavItem[] = [
  { id: 'overview', label: 'Overview', icon: Command, status: 'active' },
  { id: 'sti', label: 'STI Index', icon: Fingerprint, status: 'active' },
  { id: 'signal', label: 'Signal', icon: RadioTower, status: 'active' },
  { id: 'terrain', label: 'Terrain', icon: Globe2, status: 'active' },
  { id: 'nexus', label: 'Nexus', icon: Workflow, status: 'active' },
  { id: 'lens', label: 'Lens', icon: ScanEye, status: 'beta' },
  { id: 'pulse', label: 'Pulse', icon: CandlestickChart, status: 'beta' },
  { id: 'foresight', label: 'Foresight', icon: Orbit, status: 'beta' },
  { id: 'forge', label: 'Forge', icon: Cpu, status: 'beta' },
  { id: 'codex', label: 'Codex', icon: BookOpen, status: 'active' },
  { id: 'press', label: 'Press', icon: TerminalSquare, status: 'active' },
]

const BOTTOM_ITEMS: NavItem[] = [
  { id: 'alerts', label: 'Alerts', icon: BellRing },
  { id: 'settings', label: 'Settings', icon: Settings2 },
]

export default function Sidebar() {
  const currentView = useAppStore((s) => s.currentView)
  const setView = useAppStore((s) => s.setView)
  const collapsed = useAppStore((s) => s.sidebarCollapsed)
  const toggleSidebar = useAppStore((s) => s.toggleSidebar)
  const setMode = useAppStore((s) => s.setMode)

  return (
    <motion.aside
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      className={cn(
        "h-full flex flex-col border-r border-[#1e1e21] bg-[#09090b] transition-all duration-300",
        collapsed ? "w-20" : "w-64"
      )}
    >
      {/* Logo */}
      <div className="h-[72px] flex items-center px-5 border-b border-[#1e1e21] shrink-0">
        <button
          onClick={() => setMode('landing')}
          className="flex items-center gap-3 w-full group"
        >
          <div className="p-1.5 rounded-lg bg-white/5 border border-white/10 group-hover:bg-white/10 transition-colors">
            <MeridianLogo size={24} className="text-white shrink-0" />
          </div>
          {!collapsed && (
            <span className="text-[13px] font-bold tracking-[0.15em] text-white drop-shadow-md">
              SPATIO-TEMPORAL <span className="text-white/50 text-[9px] uppercase tracking-widest font-normal ml-0.5 border border-white/20 px-1 py-0.5 rounded-md">ANALYTICS</span>
            </span>
          )}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-6 px-4 overflow-y-auto space-y-3">
        {NAV_ITEMS.map((item) => {
          const isActive = currentView === item.id
          return (
            <button
              key={item.id}
              onClick={() => setView(item.id)}
              className={cn(
                "w-full flex items-center gap-4 p-2.5 rounded-2xl transition-all duration-300 relative group",
                isActive
                  ? "bg-[#1C1C1E] text-white shadow-xl ring-1 ring-white/10"
                  : "text-[#8E8E93] hover:bg-[#1C1C1E]/50 hover:text-white"
              )}
            >
              <div className={cn(
                "w-11 h-11 rounded-xl flex items-center justify-center shrink-0 transition-all duration-300",
                isActive ? "bg-white/10 text-white shadow-inner" : "bg-transparent text-white/40 group-hover:bg-white/5 group-hover:text-white/80"
              )}>
                <item.icon size={22} strokeWidth={isActive ? 2.5 : 2} />
              </div>
              {!collapsed && (
                <div className="flex items-center justify-between flex-1">
                  <span className="text-[15px] font-semibold tracking-wide">{item.label}</span>
                  {item.status === 'beta' && (
                    <span className="text-[10px] font-bold tracking-wider uppercase text-zinc-500 bg-white/5 border border-white/10 px-2 py-0.5 rounded-md">
                      BETA
                    </span>
                  )}
                </div>
              )}
            </button>
          )
        })}

        <div className="pt-8 pb-3 px-4">
          <div className="w-full h-px bg-white/5" />
        </div>

        {BOTTOM_ITEMS.map((item) => {
          const isActive = currentView === item.id
          return (
            <button
              key={item.id}
              onClick={() => setView(item.id)}
              className={cn(
                "w-full flex items-center gap-4 p-2.5 rounded-2xl transition-all duration-300 relative group",
                isActive
                  ? "bg-[#1C1C1E] text-white shadow-xl ring-1 ring-white/10"
                  : "text-[#8E8E93] hover:bg-[#1C1C1E]/50 hover:text-white"
              )}
            >
              <div className={cn(
                "w-11 h-11 rounded-xl flex items-center justify-center shrink-0 transition-all duration-300",
                isActive ? "bg-white/10 text-white shadow-inner" : "bg-transparent text-white/40 group-hover:bg-white/5 group-hover:text-white/80"
              )}>
                <item.icon size={22} strokeWidth={isActive ? 2.5 : 2} />
              </div>
              {!collapsed && <span className="text-[15px] font-semibold tracking-wide flex-1 text-left">{item.label}</span>}
            </button>
          )
        })}
      </nav>

      {/* User Profile Footer */}
      <div className="p-4 border-t border-[#1e1e21] shrink-0">
        <div className="flex items-center gap-3 w-full hover:bg-white/5 p-2 rounded-xl cursor-pointer transition-colors group">
          <div className="w-9 h-9 rounded-full overflow-hidden flex items-center justify-center shrink-0 border border-white/10">
            <img src="https://i.postimg.cc/qM3vCWz9/user.jpg" alt="User" className="w-full h-full object-cover" onError={(e) => e.currentTarget.style.display = 'none'} />
            <div className="absolute font-bold text-white tracking-widest text-[10px]">MA</div>
          </div>
          {!collapsed && (
            <div className="flex flex-col items-start flex-1 text-left">
              <span className="text-sm font-medium text-white group-hover:text-gold transition-colors">Mohammed A.</span>
              <span className="text-[11px] text-white/50 font-medium leading-none mt-1">Administrator</span>
            </div>
          )}
          {!collapsed && <ChevronRight size={14} className="text-white/30" />}
        </div>
      </div>
    </motion.aside>
  )
}
