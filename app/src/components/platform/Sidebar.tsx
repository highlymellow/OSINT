import { motion } from 'motion/react'
import { useAppStore } from '@/store/app'
import type { NavView } from '@/lib/types'
import {
  LayoutDashboard, Activity, Radio, MapPin, Network,
  Eye, BarChart3, Radar, Layers, Newspaper,
  Bell, Settings, PanelLeftClose, PanelLeft, Shield
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
        "h-full flex flex-col border-r border-border bg-surface/50 backdrop-blur-xl transition-all duration-300",
        collapsed ? "w-16" : "w-56"
      )}
    >
      {/* Logo */}
      <div className="h-14 flex items-center px-4 border-b border-border shrink-0">
        <button
          onClick={() => setMode('landing')}
          className="flex items-center gap-2.5 hover:opacity-80 transition-opacity"
        >
          <Shield size={20} className="text-gold shrink-0" />
          {!collapsed && (
            <span className="text-sm font-bold tracking-[0.15em] text-text-primary">
              MERI<span className="text-gold">DIAN</span>
            </span>
          )}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-3 px-2 overflow-y-auto">
        <div className="space-y-0.5">
          {NAV_ITEMS.map((item) => {
            const isActive = currentView === item.id
            return (
              <button
                key={item.id}
                onClick={() => setView(item.id)}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-200 relative group",
                  isActive
                    ? "bg-gold/10 text-gold"
                    : "text-text-tertiary hover:text-text-primary hover:bg-surface-hover"
                )}
              >
                {isActive && (
                  <motion.div
                    layoutId="nav-active"
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-gold rounded-r"
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  />
                )}
                <item.icon size={18} className="shrink-0" />
                {!collapsed && (
                  <>
                    <span className="font-medium tracking-wide">{item.label}</span>
                    {item.status === 'beta' && (
                      <span className="ml-auto text-[9px] px-1.5 py-0.5 rounded bg-gold/10 text-gold font-bold tracking-wider">
                        BETA
                      </span>
                    )}
                  </>
                )}
              </button>
            )
          })}
        </div>

        <div className="my-4 mx-3 border-t border-border" />

        <div className="space-y-0.5">
          {BOTTOM_ITEMS.map((item) => {
            const isActive = currentView === item.id
            return (
              <button
                key={item.id}
                onClick={() => setView(item.id)}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-200",
                  isActive
                    ? "bg-gold/10 text-gold"
                    : "text-text-tertiary hover:text-text-primary hover:bg-surface-hover"
                )}
              >
                <item.icon size={18} className="shrink-0" />
                {!collapsed && <span className="font-medium tracking-wide">{item.label}</span>}
              </button>
            )
          })}
        </div>
      </nav>

      {/* Collapse toggle */}
      <div className="px-2 py-3 border-t border-border shrink-0">
        <button
          onClick={toggleSidebar}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg
                     text-text-tertiary hover:text-text-primary hover:bg-surface-hover
                     transition-all duration-200 text-sm"
        >
          {collapsed ? <PanelLeft size={18} /> : <PanelLeftClose size={18} />}
          {!collapsed && <span className="font-medium">Collapse</span>}
        </button>
      </div>
    </motion.aside>
  )
}
