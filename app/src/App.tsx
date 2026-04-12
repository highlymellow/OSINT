import { useAppStore } from '@/store/app'
import LandingPage from '@/components/landing/LandingPage'
import PlatformShell from '@/components/platform/PlatformShell'

export default function App() {
  const mode = useAppStore((s) => s.mode)

  if (mode === 'landing') {
    return <LandingPage />
  }

  return <PlatformShell />
}
