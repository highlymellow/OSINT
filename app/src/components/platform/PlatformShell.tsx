import { useAppStore } from '@/store/app'
import Sidebar from './Sidebar'
import TopBar from './TopBar'
import OverviewView from './views/OverviewView'
import STIView from './views/STIView'
import SignalView from './views/SignalView'
import TerrainView from './views/TerrainView'
import NexusView from './views/NexusView'
import PressView from './views/PressView'
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
      case 'lens':
      case 'pulse':
      case 'foresight':
      case 'forge':
      case 'alerts':
      case 'settings':
        return <ComingSoonView module={currentView} />
      default: return <OverviewView />
    }
  }

  return (
    <div className="h-screen flex bg-deep-black overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <TopBar />
        <main className="flex-1 overflow-auto">
          {renderView()}
        </main>
      </div>
    </div>
  )
}
