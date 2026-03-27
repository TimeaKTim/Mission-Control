const STAGES = [
  {
    num: "01", title: "Escape Velocities", icon: "🪐", color: "border-cyan-500/30 bg-cyan-500/5",
    desc: "Parses planetary data and computes escape velocity for all 9 planets using v = √(2GM/r). Earth yields ~11.18 km/s.",
  },
  {
    num: "02", title: "Launch Parameters", icon: "🚀", color: "border-purple-500/30 bg-purple-500/5",
    desc: "Calculates time and distance to reach escape velocity given rocket engine count and acceleration. Accounts for constant planetary gravity.",
  },
  {
    num: "03", title: "Interplanetary Journey", icon: "🌌", color: "border-amber-500/30 bg-amber-500/5",
    desc: "Computes straight-line travel between any two planets: acceleration burn, cruise phase at max escape velocity, and deceleration burn.",
  },
  {
    num: "04", title: "Planetary Simulator", icon: "☀️", color: "border-yellow-500/30 bg-yellow-500/5",
    desc: "Simulates all planet positions at any given day using angular velocity from orbital periods. Animated with real-time canvas rendering.",
  },
  {
    num: "05", title: "Transfer Window Finder", icon: "🎯", color: "border-green-500/30 bg-green-500/5",
    desc: "Searches 3,650 days from t₀+100yr for the optimal launch window. Checks planet proximity and collision detection. Solar system freezes on launch.",
  },
  {
    num: "06", title: "Dynamic Transfer", icon: "🛸", color: "border-pink-500/30 bg-pink-500/5",
    desc: "Like Stage 5 but planets keep moving during flight. Uses iterative intercept calculation to aim for where the destination will be on arrival.",
  },
];

const TECH = [
  { name: "React 19", desc: "UI framework", icon: "⚛️" },
  { name: "TypeScript", desc: "Type safety", icon: "🔷" },
  { name: "Tailwind CSS", desc: "Styling", icon: "🎨" },
  { name: "Vite", desc: "Build tool", icon: "⚡" },
  { name: "Canvas API", desc: "Animations", icon: "🖼️" },
  { name: "React Hooks", desc: "State management", icon: "🪝" },
];

export default function About() {
  return (
    <div className="space-y-6">
      {/* Hero card */}
      <div className="card-glow bg-slate-900/60 backdrop-blur-md border border-slate-700/40 rounded-2xl p-8 relative overflow-hidden">
        <div className="scan-line" />
        <div className="flex items-start justify-between gap-8">
          <div className="flex-1">
            <h2 className="text-3xl font-bold text-white mb-3">
                Mission Control
                <span className="text-cyan-400 ml-2 glow-cyan">Space Simulator</span>
                </h2>
                <p className="text-slate-400 leading-relaxed max-w-2xl">
                A full-stack solar system simulator covering planetary physics, orbital mechanics,
                rocket propulsion, and optimal trajectory planning — all computed in real time in the browser.
                </p>
          </div>
          <div className="text-6xl animate-float shrink-0">🚀</div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-4 gap-4 mt-8 pt-6 border-t border-slate-800/60">
          {[
            { label: "Stages Completed", value: "7 / 7", color: "text-green-400" },
            { label: "Planets Simulated", value: "9", color: "text-cyan-400" },
            { label: "Search Window", value: "10 years", color: "text-purple-400" },
            { label: "Lines of Code", value: "~2,500", color: "text-amber-400" },
          ].map(s => (
            <div key={s.label} className="text-center">
              <p className={`text-2xl font-bold font-mono ${s.color}`}>{s.value}</p>
              <p className="text-slate-500 text-xs mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Stages */}
      <div className="card-glow bg-slate-900/60 backdrop-blur-md border border-slate-700/40 rounded-2xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <span className="text-cyan-400">📋</span> Challenge Stages
        </h3>
        <div className="grid grid-cols-2 gap-3">
          {STAGES.map(s => (
            <div key={s.num} className={`border rounded-xl p-4 ${s.color}`}>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-slate-500 font-mono text-xs">{s.num}</span>
                <span className="text-lg">{s.icon}</span>
                <span className="text-white font-semibold text-sm">{s.title}</span>
              </div>
              <p className="text-slate-400 text-xs leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Tech stack */}
      <div className="card-glow bg-slate-900/60 backdrop-blur-md border border-slate-700/40 rounded-2xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <span className="text-purple-400">⚙️</span> Tech Stack
        </h3>
        <div className="grid grid-cols-3 gap-3">
          {TECH.map(t => (
            <div key={t.name} className="flex items-center gap-3 bg-slate-800/50 border border-slate-700/40 rounded-xl p-3">
              <span className="text-2xl">{t.icon}</span>
              <div>
                <p className="text-white font-semibold text-sm">{t.name}</p>
                <p className="text-slate-500 text-xs">{t.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Architecture */}
      <div className="card-glow bg-slate-900/60 backdrop-blur-md border border-slate-700/40 rounded-2xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <span className="text-amber-400">🏗️</span> Architecture Highlights
        </h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          {[
            { title: "Separation of Concerns", desc: "Physics logic lives in pure utility functions (physics.ts, orbitGeometry.ts) completely separate from UI components.", icon: "📐" },
            { title: "Shared Context", desc: "MissionContext provides parsed file data to all stages — upload once, use everywhere across all 6 stages.", icon: "🔗" },
            { title: "Async Search", desc: "Transfer window search runs asynchronously with a 50ms defer so the browser renders the loading state before the heavy loop starts.", icon: "⚡" },
            { title: "Canvas Rendering", desc: "All animations use the browser Canvas API with requestAnimationFrame — no animation libraries needed.", icon: "🎬" },
            { title: "Iterative Intercept", desc: "Stage 6 uses a convergent iterative algorithm to find where the destination planet will be when the rocket arrives.", icon: "🎯" },
            { title: "Log-scale Orbits", desc: "Orbital radii are rendered on a logarithmic scale so both inner and outer planets are visible simultaneously.", icon: "📊" },
          ].map(a => (
            <div key={a.title} className="flex gap-3 bg-slate-800/30 border border-slate-700/30 rounded-xl p-4">
              <span className="text-xl shrink-0">{a.icon}</span>
              <div>
                <p className="text-white font-semibold mb-1">{a.title}</p>
                <p className="text-slate-400 text-xs leading-relaxed">{a.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}