import { useAppStore } from '@/store/app'
import { Search, Bell, Globe, Clock } from 'lucide-react'
import { cn } from '@/lib/utils'

const VIEW_TITLES: Record<string, string> = {
  overview: 'Operational Overview',
  sti: 'Sectarianism Tension Index',
  signal: 'SIGNAL — Real-Time Monitor',
  terrain: 'TERRAIN — Geospatial Intelligence',
  nexus: 'NEXUS — Actor & Network Analysis',
  lens: 'LENS — Media & Narrative',
  pulse: 'PULSE — Economic Intelligence',
  foresight: 'FORESIGHT — Predictive Analytics',
  forge: 'FORGE — Analyst Workbench',
  press: 'PRESS — Journalist Network',
  alerts: 'Alert Configuration',
  settings: 'Platform Settings',
}

export default function TopBar() {
  const currentView = useAppStore((s) => s.currentView)

  return (
    <header className="h-14 flex items-center justify-between px-6 border-b border-border bg-surface/30 backdrop-blur-xl shrink-0">
      <div className="flex items-center gap-4">
        <h1 className="text-sm font-semibold tracking-wide text-text-primary">
          {VIEW_TITLES[currentView] || 'MERIDIAN'}
        </h1>
        <span className="text-[10px] text-text-muted font-mono tracking-wider">
          v2.0
        </span>
      </div>

      <div className="flex items-center gap-3">
        {/* Time */}
        <div className="flex items-center gap-1.5 text-xs text-text-tertiary font-mono mr-2">
          <Clock size={12} />
          <span>{new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })} UTC+3</span>
        </div>

        {/* Search */}
        <button className="w-8 h-8 flex items-center justify-center rounded-lg text-text-tertiary hover:text-text-primary hover:bg-surface-hover transition-all">
          <Search size={16} />
        </button>

        {/* Notifications */}
        <button className="relative w-8 h-8 flex items-center justify-center rounded-lg text-text-tertiary hover:text-text-primary hover:bg-surface-hover transition-all">
          <Bell size={16} />
          <span className="absolute top-1 right-1 w-2 h-2 bg-alert-red rounded-full" />
        </button>

        {/* Language */}
        <button className="w-8 h-8 flex items-center justify-center rounded-lg text-text-tertiary hover:text-text-primary hover:bg-surface-hover transition-all">
          <Globe size={16} />
        </button>

        {/* User */}
        <div className="flex items-center gap-2 pl-3 border-l border-border">
          <div className="w-7 h-7 rounded-full bg-gold/20 flex items-center justify-center text-gold text-xs font-bold">
            MA
          </div>
          <div className="hidden md:block">
            <div className="text-xs font-medium text-text-primary">Mohammed A.</div>
            <div className="text-[10px] text-gold">Administrator</div>
          </div>
        </div>
      </div>
    </header>
  )
}
