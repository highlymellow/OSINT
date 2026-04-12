import { motion } from 'motion/react'
import { useAppStore } from '@/store/app'
import type { NavView } from '@/lib/types'
import {
  LayoutDashboard, Activity, Radio, MapPin, Network,
  Eye, BarChart3, Radar, Layers, Newspaper,
  Bell, Settings, PanelLeftClose, PanelLeft, Shield, ChevronRight
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface NavItem {
  id: NavView
  label: string
  icon: React.ComponentType<{ size?: number; className?: string }>
  status?: 'active' | 'beta' | 'coming'
}

const NAV_ITEMS: NavItem[] = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard, status: 'active' },
  { id: 'sti', label: 'STI Index', icon: Activity, status: 'active' },
  { id: 'signal', label: 'Signal', icon: Radio, status: 'active' },
  { id: 'terrain', label: 'Terrain', icon: MapPin, status: 'active' },
  { id: 'nexus', label: 'Nexus', icon: Network, status: 'active' },
  { id: 'lens', label: 'Lens', icon: Eye, status: 'beta' },
  { id: 'pulse', label: 'Pulse', icon: BarChart3, status: 'beta' },
  { id: 'foresight', label: 'Foresight', icon: Radar, status: 'beta' },
  { id: 'forge', label: 'Forge', icon: Layers, status: 'beta' },
  { id: 'press', label: 'Press', icon: Newspaper, status: 'active' },
]

const BOTTOM_ITEMS: NavItem[] = [
  { id: 'alerts', label: 'Alerts', icon: Bell },
  { id: 'settings', label: 'Settings', icon: Settings },
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
          className="flex items-center gap-3 hover:opacity-80 transition-opacity"
        >
          <Shield size={22} className="text-white shrink-0" />
          {!collapsed && (
            <span className="text-lg font-semibold tracking-wide text-white">
              MERIDIAN <span className="text-white/50 text-[10px] uppercase tracking-widest font-normal ml-1 border border-white/20 px-1.5 py-0.5 rounded-md">OSINT</span>
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
                "w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl text-[15px] transition-all duration-200 relative group",
                isActive
                  ? "bg-[#18181b] text-white font-semibold shadow-lg border border-white/5"
                  : "text-white/50 hover:bg-white/5 hover:text-white font-medium"
              )}
            >
              <item.icon
                size={20}
                className={cn(
                  "shrink-0 transition-colors",
                  isActive ? "text-white" : "text-white/40 group-hover:text-white/80"
                )}
              />
              {!collapsed && (
                <div className="flex items-center justify-between flex-1">
                  <span>{item.label}</span>
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
                "w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl text-[15px] transition-all duration-200 group",
                isActive
                  ? "bg-[#18181b] text-white font-semibold shadow-lg border border-white/5"
                  : "text-white/50 hover:bg-white/5 hover:text-white font-medium"
              )}
            >
              <item.icon
                size={20}
                className={cn(
                  "shrink-0 transition-colors",
                  isActive ? "text-white" : "text-white/40 group-hover:text-white/80"
                )}
              />
              {!collapsed && <span>{item.label}</span>}
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
