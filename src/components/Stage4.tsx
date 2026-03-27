import { useMemo, useState, useEffect, useRef } from "react";
import { useMission } from "../context/useMission";
import { parseSolarData } from "../utils/parseSolar";
import { planetAngleDeg } from "../utils/physics";

const PLANET_COLORS: Record<string, string> = {
  Mercury: "#94a3b8",
  Venus:   "#facc15",
  Earth:   "#22d3ee",
  Mars:    "#f87171",
  Jupiter: "#fb923c",
  Saturn:  "#fbbf24",
  Uranus:  "#2dd4bf",
  Neptune: "#60a5fa",
  Pluto:   "#c084fc",
};

const PLANET_ICONS: Record<string, string> = {
  Mercury: "☿", Venus: "♀", Earth: "🌍", Mars: "♂",
  Jupiter: "♃", Saturn: "♄", Uranus: "♅", Neptune: "♆", Pluto: "✦",
};

const PLANET_SIZES: Record<string, number> = {
  Mercury: 3, Venus: 5, Earth: 5, Mars: 4,
  Jupiter: 10, Saturn: 9, Uranus: 7, Neptune: 7, Pluto: 2,
};

export default function Stage4() {
  const { solarContent } = useMission();
  const [days, setDays] = useState(200);
  const [inputVal, setInputVal] = useState("200");
  const [animating, setAnimating] = useState(false);
  const animRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number | null>(null);

  const solarBodies = useMemo(() => {
    if (!solarContent) return [];
    const { bodies } = parseSolarData(solarContent);
    return bodies;
  }, [solarContent]);

  const planetData = useMemo(() => {
    return solarBodies.map(b => ({
      ...b,
      angleDeg: planetAngleDeg(days, b.periodDays),
    }));
  }, [solarBodies, days]);

  // Animation loop — advances 1 day per frame
  useEffect(() => {
    if (!animating) {
      if (animRef.current) cancelAnimationFrame(animRef.current);
      return;
    }
    function tick(timestamp: number) {
      if (lastTimeRef.current === null) lastTimeRef.current = timestamp;
      const delta = timestamp - lastTimeRef.current;
      if (delta > 16) {
        lastTimeRef.current = timestamp;
        setDays(d => {
          const next = d + 1;
          setInputVal(String(next));
          return next;
        });
      }
      animRef.current = requestAnimationFrame(tick);
    }
    animRef.current = requestAnimationFrame(tick);
    return () => { if (animRef.current) cancelAnimationFrame(animRef.current); };
  }, [animating]);

  function handleInput(val: string) {
    setInputVal(val);
    const n = parseFloat(val);
    if (!isNaN(n) && n >= 0) setDays(n);
  }

  // SVG dimensions
  const W = 560;
  const H = 560;
  const cx = W / 2;
  const cy = H / 2;
  const SUN_R = 14;

  // Scale orbital radii to fit SVG
  const maxAU = Math.max(...solarBodies.map(b => b.orbitalRadiusAU));
  const maxOrbitR = (Math.min(W, H) / 2) - 20;
  function orbitR(au: number) {
    return (Math.log(au + 1) / Math.log(maxAU + 1)) * maxOrbitR;
    }

  function planetPos(angleDeg: number, au: number) {
    const r = orbitR(au);
    // clockwise: subtract angle, start from top (−90 deg offset)
    const rad = ((angleDeg - 90) * Math.PI) / 180;
    return {
      x: cx + r * Math.cos(rad),
      y: cy + r * Math.sin(rad),
    };
  }

  return (
    <div className="card-glow bg-slate-900/60 backdrop-blur-md border border-yellow-500/20 rounded-2xl p-6 relative overflow-hidden">
      <div className="scan-line" />

      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-8 h-8 rounded-lg bg-yellow-500/20 border border-yellow-500/40 flex items-center justify-center text-yellow-400 font-bold text-sm">04</div>
        <div>
          <h2 className="text-xl font-semibold text-white">Planetary Simulator</h2>
          <p className="text-slate-500 text-sm">The planets are not stationary</p>
        </div>
      </div>

      {!solarContent && (
        <div className="text-center py-10 text-slate-500">
          <p className="text-4xl mb-3">☀️</p>
          <p>Upload <code className="text-cyan-400 bg-slate-800 px-1.5 py-0.5 rounded text-sm">Solar_System_Data.txt</code> above</p>
        </div>
      )}

      {solarContent && (
        <div className="flex gap-6">
          {/* Left: controls + table */}
          <div className="flex flex-col gap-4 w-64 shrink-0">
            {/* Day input */}
            <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-4">
              <label className="text-xs text-slate-400 uppercase tracking-wider mb-2 block">Day</label>
              <input
                type="number"
                min={0}
                value={inputVal}
                onChange={e => handleInput(e.target.value)}
                className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-white
                  text-lg font-mono focus:outline-none focus:border-yellow-500/60 mb-3"
              />
              <input
                type="range"
                min={0}
                max={3650}
                value={Math.min(days, 3650)}
                onChange={e => { setDays(+e.target.value); setInputVal(e.target.value); }}
                className="w-full accent-yellow-400"
              />
              <div className="flex justify-between text-xs text-slate-500 mt-1">
                <span>Day 0</span>
                <span>Day 3650</span>
              </div>
            </div>

            {/* Animate button */}
            <button
              onClick={() => {
                lastTimeRef.current = null;
                setAnimating(a => !a);
              }}
              className={`w-full py-2.5 rounded-xl font-semibold text-sm border transition-all ${
                animating
                  ? "bg-red-500/20 border-red-500/50 text-red-400 hover:bg-red-500/30"
                  : "bg-yellow-500/20 border-yellow-500/50 text-yellow-400 hover:bg-yellow-500/30"
              }`}
            >
              {animating ? "⏹ Stop" : "▶ Animate"}
            </button>

            {/* Angles table */}
            <div className="bg-slate-800/40 border border-slate-700/40 rounded-xl overflow-hidden">
              <div className="px-3 py-2 border-b border-slate-700/40">
                <p className="text-xs text-slate-400 uppercase tracking-wider">Angular Positions</p>
              </div>
              <div className="divide-y divide-slate-800/60">
                {planetData.map(p => (
                  <div key={p.name} className="flex items-center justify-between px-3 py-2">
                    <span className="text-sm" style={{ color: PLANET_COLORS[p.name] ?? "#fff" }}>
                      {PLANET_ICONS[p.name]} {p.name}
                    </span>
                    <span className="text-xs font-mono text-slate-300">
                      {p.angleDeg.toFixed(2)}°
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right: SVG solar system */}
          <div className="flex-1 flex items-center justify-center">
            <svg
              width={W}
              height={H}
              className="rounded-xl bg-slate-950/80 border border-slate-800/60"
              style={{ maxWidth: "100%" }}
            >
              {/* Orbit rings */}
              {solarBodies.map(b => (
                <circle
                  key={`orbit-${b.name}`}
                  cx={cx} cy={cy}
                  r={orbitR(b.orbitalRadiusAU)}
                  fill="none"
                  stroke="rgba(255,255,255,0.06)"
                  strokeWidth={1}
                />
              ))}

              {/* Sun */}
              <circle cx={cx} cy={cy} r={SUN_R + 8} fill="rgba(251,191,36,0.08)" />
              <circle cx={cx} cy={cy} r={SUN_R + 4} fill="rgba(251,191,36,0.15)" />
              <circle cx={cx} cy={cy} r={SUN_R} fill="#fbbf24" />
              <text x={cx} y={cy + 4} textAnchor="middle" fontSize={12} fill="#fff">☀</text>

              {/* Planets */}
              {planetData.map(p => {
                const pos = planetPos(p.angleDeg, p.orbitalRadiusAU);
                const r = PLANET_SIZES[p.name] ?? 4;
                const color = PLANET_COLORS[p.name] ?? "#fff";
                return (
                  <g key={p.name}>
                    {/* Glow */}
                    <circle cx={pos.x} cy={pos.y} r={r + 4}
                      fill={color} opacity={0.15} />
                    {/* Planet */}
                    <circle cx={pos.x} cy={pos.y} r={r}
                      fill={color} />
                    {/* Label */}
                    <text
                      x={pos.x}
                      y={pos.y - r - 4}
                      textAnchor="middle"
                      fontSize={9}
                      fill={color}
                      opacity={0.85}
                    >
                      {p.name}
                    </text>
                  </g>
                );
              })}

              {/* Day label */}
              <text x={W - 8} y={H - 8} textAnchor="end" fontSize={11}
                fill="rgba(255,255,255,0.3)" fontFamily="monospace">
                Day {Math.round(days)}
              </text>
            </svg>
          </div>
        </div>
      )}
    </div>
  );
}