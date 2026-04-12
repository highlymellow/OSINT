import { Card, CardContent } from "@/components/ui/card";
import { useState } from "react";
import { PlayCircle } from "lucide-react";

export default function AnalystWorkspaceDemo() {
  const [isPlaying, setIsPlaying] = useState(false);
  const intelligenceFeatures = [
    {
      title: "Real-Time Pipeline Tracking",
      subtitle:
        "Easily monitor every OSINT lead from first detection to final intelligence briefing with a visual fusion pipeline."
    },
    {
      title: "Automated Triggers",
      subtitle:
        "Use ML-powered alerts to instantly flag pattern anomalies, helping analysts maintain focus during critical escalations."
    },
    {
      title: "Custom Topologies",
      subtitle:
        "Quickly generate tailored, data-rich topological maps to measure actor relationships and uncover covert networks."
    },
    {
      title: "Encrypted Collaboration",
      subtitle:
        "Share situational updates securely, grade evidence efficiently, and align your entire analytical cell."
    }
  ];

  return (
    <div className="w-full max-w-7xl mx-auto rounded-3xl pb-16">
      {/* Header */}
      <header className="text-left py-14">
        <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-4">
          Empowering intelligence <br />with AI-driven <span className="text-gold">workflows.</span>
        </h2>
        <p className="text-muted-foreground text-lg max-w-2xl">
          Experience the analytical workbench designed for high-stakes operational environments.
        </p>
      </header>

      {/* Templates Grid */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-full">
        {/* Main video/image card */}
        <Card className="lg:col-span-2 bg-surface/40 border-border/40 p-3 overflow-hidden relative mb-4 lg:mb-0 flex flex-col min-h-[400px] md:min-h-[500px]">
          <CardContent className="p-0 relative flex-grow group rounded-xl overflow-hidden border border-border/30 bg-black/50 shadow-2xl">
            {isPlaying ? (
              <div className="flex items-center justify-center w-full h-full bg-surface-elevated text-muted-foreground">
                <span className="animate-pulse">Live Feed Initializing...</span>
              </div>
            ) : (
              <>
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(201,168,76,0.15)_0%,transparent_70%)] pointer-events-none" />
                <div className="w-full h-full flex flex-col items-center justify-center bg-black/40 text-center p-8">
                  <span className="text-gold font-mono tracking-[0.2em] mb-4 text-sm bg-gold/10 px-4 py-1.5 rounded-full border border-gold/20">MERIDIAN TERMINAL</span>
                  <div className="h-px w-32 bg-gradient-to-r from-transparent via-gold/50 to-transparent mb-8" />
                  <div className="text-3xl font-bold tracking-wider blur-[2px] opacity-20">ENCRYPTED STREAM</div>
                </div>

                {/* Play button overlay */}
                <button
                  onClick={() => setIsPlaying(true)}
                  className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 bg-black/40 backdrop-blur-sm"
                >
                  <PlayCircle className="w-16 h-16 text-gold drop-shadow-[0_0_15px_rgba(201,168,76,0.5)] group-hover:scale-110 transition-transform duration-300" />
                </button>
              </>
            )}
          </CardContent>
        </Card>

        {/* Feature cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4 h-full">
          {intelligenceFeatures.map((feature, i) => (
            <div
              key={i}
              className="flex flex-col border border-border/40 bg-surface/20 rounded-2xl p-4 hover:border-gold/30 hover:bg-surface/40 cursor-pointer transition-all duration-300"
            >
              {/* Card */}
              <div className="bg-surface/50 border border-white/5 flex-grow rounded-xl p-0 mb-3 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-white/[0.04] to-transparent pointer-events-none" />
              </div>

              {/* Title + Subtitle */}
              <div className="mt-1">
                <h3 className="text-[13px] md:text-sm font-bold text-foreground mb-1.5 uppercase tracking-wide">
                  {feature.title}
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {feature.subtitle}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
        {[
          { name: "Palantir Foundry", subtitle: "Ontology integration" },
          { name: "Global Database", subtitle: "Entity resolution matching" },
          { name: "ACLED Feed", subtitle: "Conflict event syncing" },
          { name: "Maltego", subtitle: "Graph link exporting" },
          { name: "Elasticsearch", subtitle: "Distributed telemetry" },
          { name: "Kibana", subtitle: "Visual index mapping" },
          { name: "Splunk", subtitle: "Machine data logging" },
          { name: "Jupyter", subtitle: "Analyst notebook hook" },
        ].map((integration) => (
          <div
            key={integration.name}
            className="p-4 flex items-center justify-between gap-3 hover:bg-surface-elevated/40 border border-transparent hover:border-border/50 rounded-xl transition-all duration-300"
          >
            <div>
              <div className="font-semibold text-foreground mb-0.5">{integration.name}</div>
              <div className="text-[10px] text-muted-foreground uppercase tracking-widest">{integration.subtitle}</div>
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}
