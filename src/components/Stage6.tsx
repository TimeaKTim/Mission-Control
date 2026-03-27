import { useState, useMemo } from "react";
import { useMission } from "../context/useMission";
import { parsePlanetData } from "../utils/parsePlanets";
import { parseSolarData } from "../utils/parseSolar";
import { formatTime, planetAngleDeg } from "../utils/physics";
import { useTransferSearch } from "../hooks/useTransferSearch";
import { PLANET_ICONS, PLANET_COLORS } from "../utils/planetConstants";
import StatCard from "./StatCard";
import SearchLoader from "./SearchLoader";
import LiveJourneyAnimation from "./LiveJourneyAnimation";

export default function Stage6() {
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
    planetContent, rocketContent, solarContent, from, to, triggered, "live",
  );

  const allLoaded = !!planetContent && !!rocketContent && !!solarContent;

  function handleFind() {
    setTriggered(false);
    setTimeout(() => setTriggered(true), 10);
  }

  // Arrival planet positions (shown in table)
  const arrivalPositions = useMemo(() => {
    if (!result || !solarBodies.length) return [];
    const arrivalDay = result.windowDay + result.ttDays;
    return solarBodies.map(b => ({
      name: b.name,
      angleDeg: planetAngleDeg(arrivalDay, b.periodDays),
    }));
  }, [result, solarBodies]);

  return (
    <div className="card-glow bg-slate-900/60 backdrop-blur-md border border-pink-500/20 rounded-2xl p-6 relative overflow-hidden">
      <div className="scan-line" />
      <div className="flex items-center gap-3 mb-6">
        <div className="w-8 h-8 rounded-lg bg-pink-500/20 border border-pink-500/40 flex items-center justify-center text-pink-400 font-bold text-sm">06</div>
        <div>
          <h2 className="text-xl font-semibold text-white">Dynamic Transfer Window</h2>
          <p className="text-slate-500 text-sm">Rocket science is really hard · Planets keep moving during flight</p>
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
                  className="w-full bg-slate-800 border border-slate-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-pink-500/60 cursor-pointer">
                  <option value="">— Select planet —</option>
                  {planetNames.filter(n => n !== exclude).map(n => (
                    <option key={n} value={n}>{PLANET_ICONS[n]} {n}</option>
                  ))}
                </select>
              </div>
            ))}
            <button disabled={!from || !to || from === to || loading} onClick={handleFind}
              className="px-6 py-3 rounded-xl font-semibold text-sm border transition-all bg-pink-500/20 border-pink-500/50 text-pink-400 hover:bg-pink-500/30 disabled:opacity-30 disabled:cursor-not-allowed">
              🔍 Find Window
            </button>
          </div>

          {loading && <SearchLoader from={from} to={to} progress={progress} />}

          {!loading && result && (
            <div className="space-y-4">
              <div className={`rounded-xl p-4 border flex items-center justify-between ${result.noWindowFound ? "bg-yellow-500/10 border-yellow-500/30" : "bg-pink-500/10 border-pink-500/30"}`}>
                <div>
                  <p className={`text-xs uppercase tracking-wider mb-1 ${result.noWindowFound ? "text-yellow-400" : "text-pink-400"}`}>
                    {result.noWindowFound ? "⚠ No clear window — sub-optimal" : "✅ Dynamic transfer window found"}
                  </p>
                  <p className="text-white font-bold text-lg">
                    t₀ + 100 years
                    {result.years > 0 && <span className="text-pink-300"> + {result.years}y</span>}
                    {result.remainDays > 0 && <span className="text-cyan-300"> {result.remainDays}d</span>}
                  </p>
                  <p className="text-slate-400 text-xs mt-0.5">Day {result.windowDay.toLocaleString("en-US")} · Journey: {formatTime(result.totalTimeSec)}</p>
                </div>
                <div className="text-right text-xs text-slate-400 space-y-1">
                  <p>Intercept in <span className="text-pink-300 font-mono">{result.ttDays.toFixed(1)} days</span></p>
                  <p className="text-slate-500">Destination planet keeps moving</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-1 space-y-4">
                  <div className="grid grid-cols-3 gap-3">
                    <StatCard label={`${from} escape vel.`} value={`${(result.ev1/1000).toFixed(2)} km/s`} color={PLANET_COLORS[from]} />
                    <StatCard label={`${to} escape vel.`}   value={`${(result.ev2/1000).toFixed(2)} km/s`} color={PLANET_COLORS[to]} />
                    <StatCard label="Cruising velocity"     value={`${(result.cruiseVel/1000).toFixed(2)} km/s`} color="text-pink-300" />
                  </div>

                  <div className="bg-slate-800/30 border border-slate-700/40 rounded-xl overflow-hidden">
                    <div className="px-4 py-2 border-b border-slate-700/40">
                      <p className="text-xs text-slate-400 uppercase tracking-wider">Journey Phases</p>
                    </div>
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-slate-700/40">
                          <th className="text-left py-2 px-4 text-pink-400 text-xs uppercase tracking-wider">Phase</th>
                          <th className="text-right py-2 px-4 text-pink-400 text-xs uppercase tracking-wider">Duration</th>
                          <th className="text-right py-2 px-4 text-pink-400 text-xs uppercase tracking-wider">Distance</th>
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

                  <div className="bg-gradient-to-r from-pink-500/10 to-purple-500/10 border border-pink-500/30 rounded-xl p-4 flex items-center justify-between">
                    <div>
                      <p className="text-slate-400 text-xs uppercase tracking-wider mb-1">Intercept Distance</p>
                      <p className="text-white font-mono font-bold">{result.actualDistKm.toLocaleString("en-US", { maximumFractionDigits: 1 })} km</p>
                    </div>
                    <div className="text-right">
                      <p className="text-slate-400 text-xs uppercase tracking-wider mb-1">Total Travel Time</p>
                      <p className="text-pink-300 font-mono font-bold text-lg">{formatTime(result.totalTimeSec)}</p>
                      <p className="text-slate-500 text-xs">{Math.round(result.totalTimeSec).toLocaleString("en-US")} seconds</p>
                    </div>
                  </div>

                  <div className="bg-slate-800/30 border border-slate-700/40 rounded-xl overflow-hidden">
                    <div className="px-4 py-2 border-b border-slate-700/40">
                      <p className="text-xs text-slate-400 uppercase tracking-wider">Planet Positions at Arrival</p>
                    </div>
                    <div className="grid grid-cols-3">
                      {arrivalPositions.map(p => (
                        <div key={p.name} className={`flex items-center justify-between px-4 py-2.5 border-b border-slate-800/40 ${p.name === from || p.name === to ? "bg-pink-500/5" : ""}`}>
                          <span className={`text-sm font-medium ${PLANET_COLORS[p.name] ?? "text-white"}`}>{PLANET_ICONS[p.name]} {p.name}</span>
                          <span className="text-xs font-mono text-slate-300">{p.angleDeg.toFixed(2)}°</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <LiveJourneyAnimation
                  launchDay={result.windowDay}
                  travelTimeDays={result.ttDays}
                  sourcePos={result.sourcePos}
                  interceptPos={result.interceptPos}
                  from={from}
                  to={to}
                  solarBodies={solarBodies}
                />
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
