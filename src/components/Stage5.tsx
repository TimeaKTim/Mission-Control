import { useState, useMemo } from "react";
import { useMission } from "../context/useMission";
import { parsePlanetData } from "../utils/parsePlanets";
import { parseSolarData } from "../utils/parseSolar";
import { formatTime } from "../utils/physics";
import { useTransferSearch } from "../hooks/useTransferSearch";
import { PLANET_ICONS, PLANET_COLORS } from "../utils/planetConstants";
import StatCard from "./StatCard";
import SearchLoader from "./SearchLoader";
import FrozenJourneyAnimation from "./FrozenJourneyAnimation";

export default function Stage5() {
  const { planetContent, rocketContent, solarContent } = useMission();
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [triggered, setTriggered] = useState(false);

  const solarBodies = useMemo(() => {
    if (!solarContent) return [];
    return parseSolarData(solarContent).bodies;
  }, [solarContent]);

  const planetNames = useMemo(() => {
    if (!planetContent) return [];
    return parsePlanetData(planetContent).planets.map(p => p.name);
  }, [planetContent]);

  const { result, loading, progress } = useTransferSearch(
    planetContent, rocketContent, solarContent, from, to, triggered, "freeze",
  );

  const allLoaded = !!planetContent && !!rocketContent && !!solarContent;

  function handleFind() {
    setTriggered(false);
    setTimeout(() => setTriggered(true), 10);
  }

  return (
    <div className="card-glow bg-slate-900/60 backdrop-blur-md border border-green-500/20 rounded-2xl p-6 relative overflow-hidden">
      <div className="scan-line" />
      <div className="flex items-center gap-3 mb-6">
        <div className="w-8 h-8 rounded-lg bg-green-500/20 border border-green-500/40 flex items-center justify-center text-green-400 font-bold text-sm">05</div>
        <div>
          <h2 className="text-xl font-semibold text-white">Transfer Window Finder</h2>
          <p className="text-slate-500 text-sm">Rocket science is not easy · t₀ + 100 years · Solar system freezes on launch</p>
        </div>
      </div>

      {!allLoaded && (
        <div className="text-center py-10 text-slate-500">
          <p className="text-4xl mb-3">🛸</p>
          <p>Upload all three data files in Mission Data above</p>
        </div>
      )}

      {allLoaded && (
        <>
          <div className="flex items-end gap-4 mb-6">
            {[
              { label: "From", value: from, set: setFrom, exclude: to },
              { label: "To",   value: to,   set: setTo,   exclude: from },
            ].map(({ label, value, set, exclude }) => (
              <div key={label} className="flex-1">
                <label className="text-xs text-slate-400 uppercase tracking-wider mb-1 block">{label}</label>
                <select value={value}
                  onChange={e => { set(e.target.value); setTriggered(false); }}
                  className="w-full bg-slate-800 border border-slate-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-green-500/60 cursor-pointer">
                  <option value="">— Select planet —</option>
                  {planetNames.filter(n => n !== exclude).map(n => (
                    <option key={n} value={n}>{PLANET_ICONS[n]} {n}</option>
                  ))}
                </select>
              </div>
            ))}
            <button disabled={!from || !to || from === to || loading} onClick={handleFind}
              className="px-6 py-3 rounded-xl font-semibold text-sm border transition-all bg-green-500/20 border-green-500/50 text-green-400 hover:bg-green-500/30 disabled:opacity-30 disabled:cursor-not-allowed">
              🔍 Find Window
            </button>
          </div>

          {loading && <SearchLoader from={from} to={to} progress={progress} />}

          {!loading && result && (
            <div className="space-y-4">
              <div className={`rounded-xl p-4 border flex items-center justify-between ${result.noWindowFound ? "bg-yellow-500/10 border-yellow-500/30" : "bg-green-500/10 border-green-500/30"}`}>
                <div>
                  <p className={`text-xs uppercase tracking-wider mb-1 ${result.noWindowFound ? "text-yellow-400" : "text-green-400"}`}>
                    {result.noWindowFound ? "⚠ No clear window — sub-optimal route" : "✅ Optimal transfer window found"}
                  </p>
                  <p className="text-white font-bold text-lg">
                    t₀ + 100 years
                    {result.years > 0 && <span className="text-green-300"> + {result.years}y</span>}
                    {result.remainDays > 0 && <span className="text-cyan-300"> {result.remainDays}d</span>}
                  </p>
                  <p className="text-slate-400 text-xs mt-0.5">Day {result.windowDay.toLocaleString("en-US")} · {result.daysFromStart} days after t₀ + 100yr</p>
                </div>
                <div className="text-4xl animate-float">{result.noWindowFound ? "⚠️" : "🎯"}</div>
              </div>

              <div className="flex gap-4">
                <div className="flex-1 space-y-4">
                  <div className="grid grid-cols-3 gap-3">
                    <StatCard label={`${from} escape vel.`} value={`${(result.ev1/1000).toFixed(2)} km/s`} color={PLANET_COLORS[from]} />
                    <StatCard label={`${to} escape vel.`}   value={`${(result.ev2/1000).toFixed(2)} km/s`} color={PLANET_COLORS[to]} />
                    <StatCard label="Cruising velocity"     value={`${(result.cruiseVel/1000).toFixed(2)} km/s`} color="text-green-300" />
                  </div>

                  <div className="bg-slate-800/30 border border-slate-700/40 rounded-xl overflow-hidden">
                    <div className="px-4 py-2 border-b border-slate-700/40">
                      <p className="text-xs text-slate-400 uppercase tracking-wider">Journey Phases</p>
                    </div>
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-slate-700/40">
                          <th className="text-left py-2 px-4 text-green-400 text-xs uppercase tracking-wider">Phase</th>
                          <th className="text-right py-2 px-4 text-green-400 text-xs uppercase tracking-wider">Duration</th>
                          <th className="text-right py-2 px-4 text-green-400 text-xs uppercase tracking-wider">Distance</th>
                        </tr>
                      </thead>
                      <tbody>
                        {[
                          { phase: "🔥 Acceleration", color: "text-green-400", time: result.accelTimeSec, dist: `${result.accelDistKm.toFixed(1)} km from surface` },
                          { phase: "🛸 Cruising",     color: "text-cyan-400",  time: result.cruiseTimeSec, dist: `${result.cruiseDistKm.toLocaleString("en-US", { maximumFractionDigits: 1 })} km` },
                          { phase: "🔥 Deceleration", color: "text-red-400",   time: result.decelTimeSec, dist: `starts ${result.decelDistKm.toFixed(1)} km from ${to}` },
                        ].map(row => (
                          <tr key={row.phase} className="border-b border-slate-800/60 hover:bg-slate-800/30">
                            <td className={`py-3 px-4 ${row.color}`}>{row.phase}</td>
                            <td className="py-3 px-4 text-right font-mono text-white">
                              {Math.round(row.time).toLocaleString("en-US")}s
                              <span className="text-slate-500 text-xs ml-2">({formatTime(row.time)})</span>
                            </td>
                            <td className="py-3 px-4 text-right font-mono text-slate-300">{row.dist}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="bg-gradient-to-r from-green-500/10 to-cyan-500/10 border border-green-500/30 rounded-xl p-4 flex items-center justify-between">
                    <div>
                      <p className="text-slate-400 text-xs uppercase tracking-wider mb-1">Actual Distance</p>
                      <p className="text-white font-mono font-bold">{result.actualDistKm.toLocaleString("en-US", { maximumFractionDigits: 1 })} km</p>
                    </div>
                    <div className="text-right">
                      <p className="text-slate-400 text-xs uppercase tracking-wider mb-1">Total Travel Time</p>
                      <p className="text-green-300 font-mono font-bold text-lg">{formatTime(result.totalTimeSec)}</p>
                      <p className="text-slate-500 text-xs">{Math.round(result.totalTimeSec).toLocaleString("en-US")} seconds</p>
                    </div>
                  </div>
                </div>

                <FrozenJourneyAnimation planetPositions={result.planetPositions} from={from} to={to} solarBodies={solarBodies} />
              </div>

              <div className="bg-slate-800/30 border border-slate-700/40 rounded-xl overflow-hidden">
                <div className="px-4 py-2 border-b border-slate-700/40">
                  <p className="text-xs text-slate-400 uppercase tracking-wider">All Planet Positions at Transfer Window</p>
                </div>
                <div className="grid grid-cols-3">
                  {result.planetPositions.map(p => (
                    <div key={p.name} className={`flex items-center justify-between px-4 py-2.5 border-b border-slate-800/40 ${p.name === from || p.name === to ? "bg-green-500/5" : ""}`}>
                      <span className={`text-sm font-medium ${PLANET_COLORS[p.name] ?? "text-white"}`}>{PLANET_ICONS[p.name]} {p.name}</span>
                      <span className="text-xs font-mono text-slate-300">{p.angleDeg.toFixed(2)}°</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
