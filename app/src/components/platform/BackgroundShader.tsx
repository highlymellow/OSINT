import { useState, useEffect } from "react"

export default function BackgroundShader() {
  const [speed] = useState(1.0)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden bg-background">
      {/* ── Dark Mode Shader (Active by default in :root) ── */}
      <div className="w-full h-full absolute inset-0 hidden sm:block dark:opacity-100 opacity-100 bg-[#09090b]">
        {/* Animated Mesh Gradients */}
        <div className="absolute top-[-20%] left-[-10%] w-[70%] h-[70%] rounded-full bg-slate-900/60 blur-[120px] animate-pulse" style={{ animationDuration: `${6 / speed}s` }} />
        <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[80%] rounded-full bg-[#18181c]/80 blur-[150px] animate-pulse" style={{ animationDuration: `${8 / speed}s`, animationDelay: '1s' }} />
        <div className="absolute top-[20%] right-[30%] w-[40%] h-[40%] rounded-full bg-[#1f1f25]/50 blur-[100px] animate-pulse" style={{ animationDuration: `${10 / speed}s`, animationDelay: '2s' }} />
        
        {/* Dot Grain Overlay */}
        <div 
          className="w-full h-full absolute inset-0 opacity-20 mix-blend-overlay"
          style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.15) 1px, transparent 0)', backgroundSize: '32px 32px' }}
        />
      </div>

      {/* ── Light Mode Shader Overlay ── */}
      <div className="w-full h-full absolute inset-0 hidden light:opacity-100 mix-blend-screen transition-opacity bg-[#F8FAFC]">
        <div className="absolute top-[-20%] left-[-10%] w-[70%] h-[70%] rounded-full bg-[#E2E8F0]/80 blur-[120px] animate-pulse" style={{ animationDuration: `${6 / speed}s` }} />
        <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[80%] rounded-full bg-[#F1F5F9] blur-[150px] animate-pulse" style={{ animationDuration: `${8 / speed}s`, animationDelay: '1s' }} />
        
        <div 
          className="w-full h-full absolute inset-0 opacity-10 mix-blend-multiply"
          style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(0,0,0,0.15) 1px, transparent 0)', backgroundSize: '24px 24px' }}
        />
      </div>

      {/* Lighting overlay effects */}
      <div className="absolute inset-0 pointer-events-none mix-blend-screen">
        <div
          className="absolute top-1/4 left-1/3 w-64 h-64 bg-white/2 rounded-full blur-3xl animate-pulse"
          style={{ animationDuration: `${3 / speed}s` }}
        />
        <div
          className="absolute bottom-1/3 right-1/4 w-48 h-48 bg-gold/5 rounded-full blur-3xl animate-pulse"
          style={{ animationDuration: `${2 / speed}s`, animationDelay: "1s" }}
        />
      </div>
    </div>
  )
}
