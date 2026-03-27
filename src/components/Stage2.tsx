import { useMemo } from "react";
import { useMission } from "../context/useMission";
import { parsePlanetData } from "../utils/parsePlanets";
import { parseRocketData } from "../utils/parseRocket";
import { escapeVelocity, timeToEscape, distanceTravelled, formatTime } from "../utils/physics";
import type { PlanetStage2Result } from "../types/planet";

const PLANET_COLORS: Record<string, string> = {
  Mercury: "text-slate-400", Venus: "text-yellow-400", Earth: "text-cyan-400",
  Mars: "text-red-400", Jupiter: "text-orange-400", Saturn: "text-amber-400",
  Uranus: "text-teal-400", Neptune: "text-blue-400", Pluto: "text-purple-400",
};

const PLANET_ICONS: Record<string, string> = {
  Mercury: "☿", Venus: "♀", Earth: "🌍", Mars: "♂",
  Jupiter: "♃", Saturn: "♄", Uranus: "♅", Neptune: "♆", Pluto: "✦",
};

export default function Stage2() {
  const { planetContent, rocketContent } = useMission();

  const { rocket, results, errors } = useMemo(() => {
    if (!planetContent || !rocketContent) return { rocket: null, results: [], errors: [] };
    const { planets, errors: pErrors } = parsePlanetData(planetContent);
    const { rocket, errors: rErrors } = parseRocketData(rocketContent);
    const errors = [...pErrors, ...rErrors];
    if (!rocket) return { rocket: null, results: [], errors };

    const results: PlanetStage2Result[] = planets.map((p) => {
      const radiusM = (p.diameterKm / 2) * 1000;
      const ev = escapeVelocity(p.massKg, radiusM);
      const t = timeToEscape(ev, rocket.totalAcceleration);
      const d = distanceTravelled(rocket.totalAcceleration, t);
      return { ...p, escapeVelocityMs: ev, timeToEscapeS: t, distanceFromSurfaceM: d, distanceFromCenterM: radiusM + d };
    });
    return { rocket, results, errors };
  }, [planetContent, rocketContent]);

  return (
    <div className="card-glow bg-slate-900/60 backdrop-blur-md border border-purple-500/20 rounded-2xl p-6 relative overflow-hidden">
      <div className="scan-line" />
      <div className="flex items-center gap-3 mb-6">
        <div className="w-8 h-8 rounded-lg bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-400 font-bold text-sm">02</div>
        <div>
          <h2 className="text-xl font-semibold text-white">Launch Parameters</h2>
          <p className="text-slate-500 text-sm">Up, up and away!</p>
        </div>
      </div>

      {(!planetContent || !rocketContent) && (
        <div className="text-center py-10 text-slate-500">
          <p className="text-4xl mb-3">🚀</p>
          <p>Upload <code className="text-cyan-400 bg-slate-800 px-1.5 py-0.5 rounded text-sm">Planetary_Data.txt</code> and <code className="text-cyan-400 bg-slate-800 px-1.5 py-0.5 rounded text-sm">Rocket_Data.txt</code> above</p>
        </div>
      )}

      {rocket && (
        <div className="flex gap-4 mb-6">
          {[
            { label: "Engines", value: rocket.engineCount, unit: "" },
            { label: "Accel / Engine", value: rocket.accelerationPerEngine, unit: "m/s²" },
            { label: "Total Acceleration", value: rocket.totalAcceleration, unit: "m/s²" },
          ].map(({ label, value, unit }) => (
            <div key={label} className="flex-1 bg-slate-800/60 border border-slate-700/50 rounded-xl p-4 text-center">
              <p className="text-slate-400 text-xs uppercase tracking-wider mb-1">{label}</p>
              <p className="text-2xl font-bold text-purple-300">{value}<span className="text-sm text-slate-400 ml-1">{unit}</span></p>
            </div>
          ))}
        </div>
      )}

      {errors.length > 0 && (
        <div className="mb-4 bg-red-950/50 border border-red-500/40 rounded-xl p-4 text-sm">
          <p className="text-red-400 font-semibold mb-1">⚠ Warnings</p>
          <ul className="text-red-300/80 space-y-1">{errors.map((e, i) => <li key={i}>{e}</li>)}</ul>
        </div>
      )}

      {results.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-700/60">
                {["Planet", "Escape Vel.", "Time to Escape", "Dist. from Surface", "Dist. from Center"].map(h => (
                  <th key={h} className="text-left py-3 px-4 text-purple-400 font-semibold tracking-wider uppercase text-xs">{h}</th>
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
                  <td className="py-3 px-4 text-white font-mono">{(p.escapeVelocityMs / 1000).toFixed(2)} km/s</td>
                  <td className="py-3 px-4">
                    <span className="text-cyan-300 font-mono">{Math.round(p.timeToEscapeS).toLocaleString()}s</span>
                    <span className="text-slate-500 text-xs ml-2">({formatTime(p.timeToEscapeS)})</span>
                  </td>
                  <td className="py-3 px-4 text-amber-300 font-mono">{(p.distanceFromSurfaceM / 1000).toFixed(1)} km</td>
                  <td className="py-3 px-4 text-purple-300 font-mono">{(p.distanceFromCenterM / 1000).toFixed(1)} km</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}