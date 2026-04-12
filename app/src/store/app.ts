import { create } from 'zustand'
import type { NavView } from '@/lib/types'
import type { MeridianUser } from '@/lib/auth'

interface AppState {
  // Navigation
  currentView: NavView
  setView: (view: NavView) => void

  // Mode
  mode: 'landing' | 'platform'
  setMode: (mode: 'landing' | 'platform') => void

  // Auth
  user: MeridianUser | null
  setUser: (user: MeridianUser | null) => void

  // Sidebar
  sidebarCollapsed: boolean
  toggleSidebar: () => void

  // Command palette
  commandOpen: boolean
  setCommandOpen: (open: boolean) => void
}

export const useAppStore = create<AppState>((set) => ({
  currentView: 'overview',
  setView: (view) => set({ currentView: view }),

  mode: 'landing',
  setMode: (mode) => set({ mode }),

  user: null,
  setUser: (user) => set({ user }),

  sidebarCollapsed: false,
  toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),

  commandOpen: false,
  setCommandOpen: (open) => set({ commandOpen: open }),
}))
