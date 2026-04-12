import { Activity, ArrowRight, Database, Globe, Network, ShieldAlert } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';
import { Card } from '@/components/ui/card';

export default function GlobalCoverageSection() {
  const featuredCasestudy = {
    team: 'Tactical Edge',
    tags: 'Declassified',
    title: 'How we intercepted 10,000+ threat signals',
    subtitle: 'without missing a beat, using deep-web cross-referencing and continuous ingestion',
  };

  return (
    <section className="py-40 md:py-56 px-6 md:px-12 lg:px-20 w-full flex flex-col items-center bg-surface-elevated/20 border-y border-white/5">
      <div className="w-full max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 md:grid-rows-2 gap-6">
        
        {/* 1. MAP - Top Left */}
        <div className="relative rounded-2xl overflow-hidden bg-surface/50 border border-border/40 p-6 flex flex-col hover:border-gold/30 transition-colors">
          <div className="flex items-center gap-2 text-xs tracking-widest text-muted-foreground uppercase mb-4 font-bold">
            <Globe className="w-4 h-4 text-gold" />
            Global Telemetry
          </div>
          <h3 className="text-xl md:text-2xl font-bold text-foreground">
            Visualize threat vectors across regions.{" "}
            <span className="text-muted-foreground font-normal">Track, isolate, and triangulate geographically.</span>
          </h3>

          <div className="relative mt-8 flex-grow flex items-center justify-center opacity-70">
            <div className="absolute z-10 px-4 py-1.5 bg-background shadow-[0_0_20px_rgba(201,168,76,0.3)] border border-gold/30 text-gold rounded-md text-[10px] font-mono tracking-widest flex items-center gap-2 animate-pulse">
              <span className="w-2 h-2 rounded-full bg-red-500 blur-[1px]" />
              ALERT TRIPPED: ERBIL
            </div>
            {/* Abstract World/Grid SVG Simulation */}
            <svg viewBox="0 0 100 50" className="w-full h-full text-white/5 opacity-50">
              {Array.from({ length: 400 }).map((_, i) => (
                <circle 
                  key={i} 
                  cx={(i % 20) * 5 + 1} 
                  cy={Math.floor(i / 20) * 2.5 + 1} 
                  r={0.4} 
                  fill="currentColor" 
                  className={Math.random() > 0.9 ? "text-gold/40" : ""}
                />
              ))}
            </svg>
          </div>
        </div>

        {/* 2. FEATURED CASE STUDY BLOCK - Top Right */}
        <div className="flex flex-col justify-between gap-6 p-8 rounded-2xl border border-border/40 bg-surface/50 hover:border-gold/30 transition-colors">
          <div>
            <span className="text-[10px] flex items-center gap-2 text-muted-foreground tracking-widest uppercase font-bold mb-4">
              <Database className="w-4 h-4 text-gold" /> {featuredCasestudy.tags}
            </span>
            <h3 className="text-xl md:text-2xl font-bold text-foreground leading-tight">
              {featuredCasestudy.title}{" "}
              <span className="text-muted-foreground font-normal">{featuredCasestudy.subtitle}</span>
            </h3>
          </div>
          <div className="flex justify-center items-center w-full bg-black/40 rounded-xl p-4 border border-white/5">
            <StreamFeaturedMessageCard />
          </div>
        </div>

        {/* 3. CHART - Bottom Left */}
        <div className="rounded-2xl border border-border/40 bg-surface/50 p-6 flex flex-col hover:border-gold/30 transition-colors">
          <div className="flex items-center gap-2 text-xs text-muted-foreground uppercase tracking-widest mb-4 font-bold">
            <Activity className="w-4 h-4 text-gold" />
            Ingestion Volume
          </div>
          <h3 className="text-xl md:text-2xl font-bold text-foreground mb-6">
            Real-time payload tracking for MERIDIAN.{" "}
            <span className="text-muted-foreground font-normal">Monitor infrastructure strain instantly.</span>
          </h3>
          <div className="flex-grow min-h-[200px]">
             <MonitoringChart />
          </div>
        </div>

        {/* 4. ALL FEATURE CARDS - Bottom Right */}
        <div className="grid sm:grid-cols-2 gap-6 rounded-2xl bg-transparent">
          <FeatureCard
            icon={<Network className="w-5 h-5" />}
            title="Entity Recognition"
            subtitle="Automated Linkages"
            description="Named entities automatically map to existing network graphs."
          />
          <FeatureCard
            icon={<ShieldAlert className="w-5 h-5" />}
            title="Sentiment Flagging"
            subtitle="Predictive Scoring"
            description="Algorithms catch rising tensions before escalation events."
          />
        </div>
      </div>
    </section>
  );
}

// ----------------- Feature Card Component -------------------
function FeatureCard({ icon, title, subtitle, description }: { icon: React.ReactNode, title: string, subtitle: string, description: string }) {
  return (
    <div className="relative flex flex-col gap-3 p-6 border border-border/40 rounded-2xl bg-surface/50 hover:border-gold/30 transition-all duration-300 group overflow-hidden">
      <div className="flex items-center gap-4 z-10 relative">
        <div>
          <span className="text-[10px] flex items-center gap-3 text-muted-foreground uppercase tracking-widest mb-4 font-bold">
            <span className="text-gold">{icon}</span>
            {title}
          </span>
          <h3 className="text-lg font-bold text-foreground mb-1.5 line-clamp-1">
            {subtitle}
          </h3>
          <span className="text-sm text-muted-foreground leading-relaxed block">{description}</span>
        </div>
      </div>

      <div className="absolute bottom-4 right-4 p-3 flex items-center gap-2 border border-border/40 rounded-full group-hover:-rotate-45 group-hover:bg-gold/10 group-hover:border-gold/30 group-hover:text-gold transition-all duration-300 z-10 bg-background text-muted-foreground cursor-pointer">
        <ArrowRight className="w-4 h-4" />
      </div>
    </div>
  );
}

// ----------------- Chart -------------------
const chartData = [
  { month: '0100', encrypted: 56, open: 224 },
  { month: '0200', encrypted: 90, open: 300 },
  { month: '0300', encrypted: 126, open: 252 },
  { month: '0400', encrypted: 205, open: 410 },
  { month: '0500', encrypted: 200, open: 126 },
  { month: '0600', encrypted: 400, open: 800 },
]

function MonitoringChart() {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={chartData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="fillEncrypted" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#C9A84C" stopOpacity={0.5} />
            <stop offset="100%" stopColor="#C9A84C" stopOpacity={0.0} />
          </linearGradient>
          <linearGradient id="fillOpen" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#ef4444" stopOpacity={0.5} />
            <stop offset="100%" stopColor="#ef4444" stopOpacity={0.0} />
          </linearGradient>
        </defs>
        <XAxis dataKey="month" hide />
        <YAxis hide />
        <CartesianGrid strokeDasharray="3 3" vertical={false} horizontal={true} stroke="rgba(255,255,255,0.05)" />
        <Area strokeWidth={2} dataKey="open" type="monotone" fill="url(#fillOpen)" stroke="#ef4444" />
        <Area strokeWidth={2} dataKey="encrypted" type="monotone" fill="url(#fillEncrypted)" stroke="#C9A84C" />
      </AreaChart>
    </ResponsiveContainer>
  )
}

// ----------------- Message Queue -------------------
interface Message {
  title: string;
  time: string;
  content: string;
  color: string;
}

const messages: Message[] = [
    {
      title: "Telecom Intercept",
      time: "T-1m",
      content: "Keyword match detected on external DNS query.",
      color: "from-red-400 to-red-600",
    },
    {
      title: "Entity Extractor",
      time: "T-3m",
      content: "27 new aliases mapped to existing profile networks.",
      color: "from-gold to-orange-500",
    },
    {
      title: "STI Engine",
      time: "T-6m",
      content: "Intra-Shia tension axis spiked by +4 points.",
      color: "from-blue-400 to-indigo-600",
    },
  ];

const StreamFeaturedMessageCard = () => {
  return (
    <div className="w-full h-[220px] bg-transparent overflow-hidden font-sans relative flex flex-col justify-end">
      <div className="absolute inset-x-0 top-0 h-12 bg-gradient-to-b from-black/20 to-transparent z-10 pointer-events-none"></div>
      
      <div className="space-y-3 relative z-0 w-full">
        {messages.map((msg, i) => (
          <div
            key={i}
            className="flex gap-4 items-center p-3 border border-white/5 bg-surface-elevated/40 rounded-xl"
          >
            <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${msg.color} shadow-lg shrink-0`} />
            <div className="flex flex-col flex-1">
              <div className="flex items-center justify-between text-xs font-bold text-foreground">
                <span className="uppercase tracking-widest">{msg.title}</span>
                <span className="text-[10px] text-muted-foreground font-mono">{msg.time}</span>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                {msg.content}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
