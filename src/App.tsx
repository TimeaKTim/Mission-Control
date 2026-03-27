import { useEffect, useRef, useState } from "react";
import { MissionProvider } from "./context/MissionProvider";
import MissionDataPanel from "./components/MissionDataPanel";
import Stage1 from "./components/Stage1";
import Stage2 from "./components/Stage2";
import Stage3 from "./components/Stage3";
import Stage4 from "./components/Stage4";
import Stage5 from "./components/Stage5";
import Stage6 from "./components/Stage6";
import About from "./components/About";

const TABS = [
  { id: 1, label: "Escape Velocities",      icon: "🪐", sub: "Stage 01" },
  { id: 2, label: "Launch Parameters",      icon: "🚀", sub: "Stage 02" },
  { id: 3, label: "Interplanetary Journey", icon: "🌌", sub: "Stage 03" },
  { id: 4, label: "Planetary Simulator",    icon: "☀️", sub: "Stage 04" },
  { id: 5, label: "Transfer Window",        icon: "🎯", sub: "Stage 05" },
  { id: 6, label: "Dynamic Transfer",       icon: "🛸", sub: "Stage 06" },
  { id: 7, label: "About",                  icon: "📡", sub: "Info" },
];

function StarField() {
  const containerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const stars = Array.from({ length: 200 }, () => {
      const star = document.createElement("div");
      star.className = "star";
      const size = Math.random() * 2.5 + 0.5;
      star.style.cssText = `
        width: ${size}px; height: ${size}px;
        left: ${Math.random() * 100}vw; top: ${Math.random() * 100}vh;
        --duration: ${Math.random() * 4 + 2}s; --delay: ${Math.random() * 4}s;
        opacity: ${Math.random() * 0.7 + 0.1};
      `;
      return star;
    });
    stars.forEach(s => container.appendChild(s));
    return () => stars.forEach(s => s.remove());
  }, []);
  return <div ref={containerRef} className="fixed inset-0 pointer-events-none z-0" />;
}

// Mini animated solar system for the landing page
function MiniSolarSystem() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frameRef = useRef<number>(0);
  const dayRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const W = 400; const H = 400;
    const cx = W / 2; const cy = H / 2;

    const planets = [
      { name: "Mercury", period: 88,   au: 0.39, color: "#94a3b8", r: 3 },
      { name: "Venus",   period: 225,  au: 0.72, color: "#facc15", r: 5 },
      { name: "Earth",   period: 365,  au: 1.00, color: "#22d3ee", r: 5 },
      { name: "Mars",    period: 687,  au: 1.52, color: "#f87171", r: 4 },
      { name: "Jupiter", period: 4329, au: 2.4,  color: "#fb923c", r: 9 },
      { name: "Saturn",  period: 10753,au: 3.0,  color: "#fbbf24", r: 7 },
    ];

    const maxAU = 3.0;
    const maxR = (Math.min(W, H) / 2) - 20;

    function orbitR(au: number) {
      return (Math.log(au + 1) / Math.log(maxAU + 1)) * maxR;
    }

    function draw() {
      ctx.clearRect(0, 0, W, H);

      // Orbit rings
      planets.forEach(p => {
        ctx.beginPath();
        ctx.arc(cx, cy, orbitR(p.au), 0, Math.PI * 2);
        ctx.strokeStyle = "rgba(255,255,255,0.04)";
        ctx.lineWidth = 1;
        ctx.stroke();
      });

      // Sun
      const sunGlow = ctx.createRadialGradient(cx, cy, 0, cx, cy, 30);
      sunGlow.addColorStop(0, "rgba(251,191,36,1)");
      sunGlow.addColorStop(0.4, "rgba(251,191,36,0.4)");
      sunGlow.addColorStop(1, "rgba(251,191,36,0)");
      ctx.beginPath();
      ctx.arc(cx, cy, 30, 0, Math.PI * 2);
      ctx.fillStyle = sunGlow;
      ctx.fill();
      ctx.beginPath();
      ctx.arc(cx, cy, 10, 0, Math.PI * 2);
      ctx.fillStyle = "#fbbf24";
      ctx.fill();

      // Planets
      planets.forEach(p => {
        const angle = ((dayRef.current / p.period) * 360 - 90) * (Math.PI / 180);
        const r = orbitR(p.au);
        const x = cx + r * Math.cos(angle);
        const y = cy + r * Math.sin(angle);

        // Glow
        const glow = ctx.createRadialGradient(x, y, 0, x, y, p.r + 5);
        glow.addColorStop(0, p.color + "66");
        glow.addColorStop(1, p.color + "00");
        ctx.beginPath();
        ctx.arc(x, y, p.r + 5, 0, Math.PI * 2);
        ctx.fillStyle = glow;
        ctx.fill();

        ctx.beginPath();
        ctx.arc(x, y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.fill();
      });

      dayRef.current += 0.8;
      frameRef.current = requestAnimationFrame(draw);
    }

    frameRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(frameRef.current);
  }, []);

  return (
    <canvas
      ref={canvasRef}
      width={400}
      height={400}
      className="opacity-80"
    />
  );
}

// Landing hero page
function LandingPage({ onLaunch }: { onLaunch: () => void }) {
  return (
    <div className="min-h-screen bg-[#04040f] text-white relative overflow-hidden flex flex-col">
      <StarField />
      <div className="fixed top-[-20%] left-[-10%] w-[600px] h-[600px] bg-purple-900/20 rounded-full blur-[120px] pointer-events-none z-0" />
      <div className="fixed bottom-[-20%] right-[-10%] w-[700px] h-[700px] bg-cyan-900/15 rounded-full blur-[120px] pointer-events-none z-0" />
      <div className="fixed top-[30%] right-[10%] w-[300px] h-[300px] bg-blue-900/20 rounded-full blur-[80px] pointer-events-none z-0" />

      <div className="relative z-10 flex-1 flex items-center">
        <div className="max-w-6xl mx-auto px-8 py-16 w-full">
          <div className="flex items-center gap-16">

            {/* Left: text */}
            <div className="flex-1">
              {/* Badge */}
              <h1 className="text-6xl font-bold leading-tight mb-4">
                <span className="text-white">Mission</span>
                <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400">
                  Control
                </span>
              </h1>

              <p className="text-slate-400 text-lg leading-relaxed mb-8 max-w-lg">
                A full solar system simulator built as a software challenge.
                Calculate escape velocities, plan interplanetary journeys,
                simulate orbital mechanics, and find optimal transfer windows
                — all in real time.
              </p>

              {/* Feature pills */}
              <div className="flex flex-wrap gap-2 mb-10">
                {[
                  "Escape Velocity Calculator",
                  "Launch Parameter Solver",
                  "Interplanetary Navigation",
                  "Orbital Simulator",
                  "Transfer Window Finder",
                  "Live Journey Animation",
                ].map(f => (
                  <span key={f} className="text-xs bg-slate-800/80 border border-slate-700/60 text-slate-300 px-3 py-1 rounded-full">
                    {f}
                  </span>
                ))}
              </div>

              {/* CTA */}
              <div className="flex items-center gap-4">
                <button
                  onClick={onLaunch}
                  className="group relative px-8 py-4 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-xl font-bold text-white text-lg overflow-hidden transition-all hover:scale-105 hover:shadow-[0_0_40px_rgba(6,182,212,0.4)]"
                >
                  <span className="relative z-10 flex items-center gap-2">
                    🚀 Launch Mission Control
                  </span>
                </button>
              </div>

              {/* Tech stack */}
              <div className="mt-10 flex items-center gap-3">
                <span className="text-slate-600 text-xs uppercase tracking-wider">Built with</span>
                {["React", "TypeScript", "Tailwind CSS", "Vite", "Canvas API"].map(t => (
                  <span key={t} className="text-xs text-slate-400 bg-slate-800/60 px-2.5 py-1 rounded-md border border-slate-700/40">
                    {t}
                  </span>
                ))}
              </div>
            </div>

            {/* Right: solar system */}
            <div className="shrink-0 flex flex-col items-center gap-4">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-radial from-cyan-500/10 to-transparent rounded-full" />
                <MiniSolarSystem />
              </div>
              <p className="text-slate-600 text-xs tracking-widest uppercase">Live Simulation</p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="relative z-10 border-t border-slate-800/60 py-4 px-8">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <p className="text-slate-600 text-xs">Solar System Simulator · 7 Stages · React + TypeScript</p>
          <div className="flex items-center gap-6 text-xs text-slate-600">
            <span>React + TypeScript</span>
            <span>·</span>
            <span>Canvas API</span>
            <span>·</span>
            <span>Orbital Mechanics</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// Main app
function MissionApp() {
  const [activeTab, setActiveTab] = useState(1);

  return (
    <MissionProvider>
      <div className="min-h-screen bg-[#04040f] text-white relative overflow-x-hidden">
        <StarField />
        <div className="fixed top-[-20%] left-[-10%] w-[600px] h-[600px] bg-purple-900/20 rounded-full blur-[120px] pointer-events-none z-0" />
        <div className="fixed bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-cyan-900/20 rounded-full blur-[120px] pointer-events-none z-0" />

        <div className="relative z-10 max-w-5xl mx-auto px-6 py-10">
          <div className="text-center mb-8">
            <div className="text-6xl mb-4 animate-float inline-block">🚀</div>
            <h1 className="text-5xl font-bold tracking-tight mb-2">
              <span className="text-cyan-400 glow-cyan">SPACE</span>
              <span className="text-white"> CHALLENGE</span>
            </h1>
            <p className="text-slate-400 text-lg tracking-widest uppercase">
              Mission Control
            </p>
            <div className="mt-4 h-px bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent" />
          </div>

          <MissionDataPanel />

          <div className="flex gap-2 mb-6 bg-slate-900/60 border border-slate-700/50 rounded-2xl p-2">
            {TABS.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  flex-1 flex flex-col items-center gap-1 py-3 px-2 rounded-xl text-center
                  transition-all duration-200 cursor-pointer
                  ${activeTab === tab.id
                    ? "bg-slate-700/80 text-white shadow-lg"
                    : "text-slate-500 hover:text-slate-300 hover:bg-slate-800/50"
                  }
                `}
              >
                <span className="text-xl">{tab.icon}</span>
                <span className="text-xs font-semibold leading-tight hidden sm:block">{tab.label}</span>
                <span className={`text-xs font-mono ${activeTab === tab.id ? "text-cyan-400" : "text-slate-600"}`}>
                  {tab.sub}
                </span>
              </button>
            ))}
          </div>

          <div className="tab-content" key={activeTab}>
            {activeTab === 1 && <Stage1 />}
            {activeTab === 2 && <Stage2 />}
            {activeTab === 3 && <Stage3 />}
            {activeTab === 4 && <Stage4 />}
            {activeTab === 5 && <Stage5 />}
            {activeTab === 6 && <Stage6 />}
            {activeTab === 7 && <About />}
          </div>
        </div>
      </div>
    </MissionProvider>
  );
}

export default function App() {
  const [launched, setLaunched] = useState(false);

  if (!launched) {
    return <LandingPage onLaunch={() => setLaunched(true)} />;
  }

  return <MissionApp />;
}