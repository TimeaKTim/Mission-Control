import { useMemo } from "react";
import { useMission } from "../context/useMission";
import { parsePlanetData } from "../utils/parsePlanets";
import { escapeVelocity } from "../utils/physics";
import type { PlanetResult } from "../types/planet";

const PLANET_ICONS: Record<string, string> = {
  Mercury: "☿", Venus: "♀", Earth: "🌍", Mars: "♂",
  Jupiter: "♃", Saturn: "♄", Uranus: "♅", Neptune: "♆", Pluto: "✦",
};

const PLANET_COLORS: Record<string, string> = {
  Mercury: "text-slate-400", Venus: "text-yellow-400", Earth: "text-cyan-400",
  Mars: "text-red-400", Jupiter: "text-orange-400", Saturn: "text-amber-400",
  Uranus: "text-teal-400", Neptune: "text-blue-400", Pluto: "text-purple-400",
};

function VelocityBar({ value, max }: { value: number; max: number }) {
  const pct = Math.round((value / max) * 100);
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden">
        <div className="h-full bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full transition-all duration-700"
          style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs text-slate-400 w-10 text-right">{pct}%</span>
    </div>
  );
}

export default function Stage1() {
  const { planetContent } = useMission();

  const { results, errors } = useMemo(() => {
    if (!planetContent) return { results: [], errors: [] };
    const { planets, errors } = parsePlanetData(planetContent);
    const results: PlanetResult[] = planets.map((p) => ({
      ...p,
      escapeVelocityMs: escapeVelocity(p.massKg, (p.diameterKm / 2) * 1000),
    }));
    return { results, errors };
  }, [planetContent]);

  const maxVelocity = results.length ? Math.max(...results.map(r => r.escapeVelocityMs)) : 1;

  return (
    <div className="card-glow bg-slate-900/60 backdrop-blur-md border border-cyan-500/20 rounded-2xl p-6 relative overflow-hidden">
      <div className="scan-line" />
      <div className="flex items-center gap-3 mb-6">
        <div className="w-8 h-8 rounded-lg bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400 font-bold text-sm">01</div>
        <div>
          <h2 className="text-xl font-semibold text-white">Escape Velocities</h2>
          <p className="text-slate-500 text-sm">Perfect spheres in a vacuum</p>
        </div>
      </div>

      {!planetContent && (
        <div className="text-center py-10 text-slate-500">
          <p className="text-4xl mb-3">🪐</p>
          <p>Upload <code className="text-cyan-400 bg-slate-800 px-1.5 py-0.5 rounded text-sm">Planetary_Data.txt</code> in Mission Data above</p>
        </div>
      )}

      {errors.length > 0 && (
        <div className="mb-4 bg-red-950/50 border border-red-500/40 rounded-xl p-4 text-sm">
          <p className="text-red-400 font-semibold mb-1">⚠ Parse Warnings</p>
          <ul className="text-red-300/80 space-y-1">{errors.map((e, i) => <li key={i}>{e}</li>)}</ul>
        </div>
      )}

      {results.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-700/60">
                {["Planet", "Diameter", "Mass (kg)", "m/s", "km/s", "Relative"].map(h => (
                  <th key={h} className="text-left py-3 px-4 text-cyan-400 font-semibold tracking-wider uppercase text-xs">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {results.map((p) => (
                <tr key={p.name} className="border-b border-slate-800/60 hover:bg-slate-800/40 transition-colors">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{PLANET_ICONS[p.name] ?? "●"}</span>
                      <span className={`font-semibold ${PLANET_COLORS[p.name] ?? "text-white"}`}>{p.name}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-slate-300">{p.diameterKm.toLocaleString()} km</td>
                  <td className="py-3 px-4 text-slate-400 font-mono text-xs">{p.massKg.toExponential(2)}</td>
                  <td className="py-3 px-4 text-white font-mono">{Math.round(p.escapeVelocityMs).toLocaleString()}</td>
                  <td className="py-3 px-4 text-purple-300 font-semibold">{(p.escapeVelocityMs / 1000).toFixed(2)}</td>
                  <td className="py-3 px-4 w-40"><VelocityBar value={p.escapeVelocityMs} max={maxVelocity} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}