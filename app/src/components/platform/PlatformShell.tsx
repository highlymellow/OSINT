import { useAppStore } from '@/store/app'
import Sidebar from './Sidebar'
import TopBar from './TopBar'
import FloatingDock from './FloatingDock'
import BackgroundShader from './BackgroundShader'
import { DottedSurface } from '@/components/ui/dotted-surface'
import OverviewView from './views/OverviewView'
import STIView from './views/STIView'
import SignalView from './views/SignalView'
import TerrainView from './views/TerrainView'
import NexusView from './views/NexusView'
import PressView from './views/PressView'
import ForesightView from './views/ForesightView'
import LensView from './views/LensView'
import PulseView from './views/PulseView'
import ForgeView from './views/ForgeView'
import CodexView from './views/CodexView'
import ComingSoonView from './views/ComingSoonView'

export default function PlatformShell() {
  const currentView = useAppStore((s) => s.currentView)
  const sidebarCollapsed = useAppStore((s) => s.sidebarCollapsed)

  const renderView = () => {
    switch (currentView) {
      case 'overview': return <OverviewView />
      case 'sti': return <STIView />
      case 'signal': return <SignalView />
      case 'terrain': return <TerrainView />
      case 'nexus': return <NexusView />
      case 'press': return <PressView />
      case 'foresight': return <ForesightView />
      case 'lens': return <LensView />
      case 'pulse': return <PulseView />
      case 'forge': return <ForgeView />
      case 'codex': return <CodexView />
      case 'alerts':
      case 'settings':
        return <ComingSoonView module={currentView} />
      default: return <OverviewView />
    }
  }

  return (
    <div className="h-screen flex bg-transparent overflow-hidden relative">
      <BackgroundShader />
      <DottedSurface className="opacity-30 mix-blend-screen" />
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 relative z-10 bg-[#0A0A0C]/95 backdrop-blur-3xl m-4 ml-0 rounded-[2rem] border border-white/10 shadow-[0_0_60px_rgba(0,0,0,0.8)] overflow-hidden">
        <TopBar />
        <main className="flex-1 overflow-auto pb-32">
          {renderView()}
        </main>
      </div>

      <FloatingDock />
    </div>
  )
}
