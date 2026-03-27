import { useMemo, useState } from "react";
import { useMission } from "../context/useMission";
import { parsePlanetData } from "../utils/parsePlanets";
import { parseRocketData } from "../utils/parseRocket";
import { parseSolarData } from "../utils/parseSolar";
import {
  escapeVelocity, timeToEscape, distanceTravelled, formatTime,
  cruisingVelocity, travelDistance, cruisingDistance, cruisingTime,
} from "../utils/physics";

const PLANET_ICONS: Record<string, string> = {
  Mercury: "☿", Venus: "♀", Earth: "🌍", Mars: "♂",
  Jupiter: "♃", Saturn: "♄", Uranus: "♅", Neptune: "♆", Pluto: "✦",
};

const PLANET_COLORS: Record<string, string> = {
  Mercury: "text-slate-400", Venus: "text-yellow-400", Earth: "text-cyan-400",
  Mars: "text-red-400", Jupiter: "text-orange-400", Saturn: "text-amber-400",
  Uranus: "text-teal-400", Neptune: "text-blue-400", Pluto: "text-purple-400",
};

interface StatCardProps {
  label: string;
  value: string;
  sub?: string;
  color?: string;
}

function StatCard({ label, value, sub, color = "text-cyan-300" }: StatCardProps) {
  return (
    <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-4">
      <p className="text-slate-400 text-xs uppercase tracking-wider mb-1">{label}</p>
      <p className={`text-lg font-bold font-mono ${color}`}>{value}</p>
      {sub && <p className="text-slate-500 text-xs mt-0.5">{sub}</p>}
    </div>
  );
}

export default function Stage3() {
  const { planetContent, rocketContent, solarContent } = useMission();
  const [from, setFrom] = useState<string>("");
  const [to, setTo] = useState<string>("");

  const { planets, rocket, solarBodies } = useMemo(() => {
    if (!planetContent || !rocketContent || !solarContent)
      return { planets: [], rocket: null, solarBodies: [] };
    const { planets } = parsePlanetData(planetContent);
    const { rocket } = parseRocketData(rocketContent);
    const { bodies: solarBodies } = parseSolarData(solarContent);
    return { planets, rocket, solarBodies };
  }, [planetContent, rocketContent, solarContent]);

  const planetNames = planets.map(p => p.name);

  const result = useMemo(() => {
    if (!from || !to || from === to || !rocket) return null;

    const p1 = planets.find(p => p.name === from);
    const p2 = planets.find(p => p.name === to);
    const s1 = solarBodies.find(s => s.name === from);
    const s2 = solarBodies.find(s => s.name === to);
    if (!p1 || !p2 || !s1 || !s2) return null;

    const r1 = (p1.diameterKm / 2) * 1000;
    const r2 = (p2.diameterKm / 2) * 1000;
    const ev1 = escapeVelocity(p1.massKg, r1);
    const ev2 = escapeVelocity(p2.massKg, r2);
    const cruiseVel = cruisingVelocity(ev1, ev2);

    const t1 = timeToEscape(cruiseVel, rocket.totalAcceleration);
    const t2 = t1; // deceleration is symmetric
    const d1 = distanceTravelled(rocket.totalAcceleration, t1);
    const d2 = d1;

    const totalDistKm = travelDistance(s1.orbitalRadiusAU, s2.orbitalRadiusAU);
    const cruiseDistKm = cruisingDistance(
      totalDistKm,
      d1 / 1000,
      d2 / 1000,
      p1.diameterKm / 2,
      p2.diameterKm / 2,
    );
    const cruiseTimeSec = cruisingTime(cruiseDistKm, cruiseVel);
    const totalTimeSec = t1 + cruiseTimeSec + t2;

    return {
      ev1, ev2, cruiseVel,
      accelTimeSec: t1,
      accelDistKm: d1 / 1000,
      cruiseDistKm,
      cruiseTimeSec,
      decelDistKm: d2 / 1000,
      decelTimeSec: t2,
      totalDistKm,
      totalTimeSec,
    };
  }, [from, to, planets, rocket, solarBodies]);

  const allLoaded = !!planetContent && !!rocketContent && !!solarContent;

  return (
    <div className="card-glow bg-slate-900/60 backdrop-blur-md border border-amber-500/20 rounded-2xl p-6 relative overflow-hidden">
      <div className="scan-line" />

      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 font-bold text-sm">03</div>
        <div>
          <h2 className="text-xl font-semibold text-white">Interplanetary Journey</h2>
          <p className="text-slate-500 text-sm">The fun begins</p>
        </div>
      </div>

      {!allLoaded && (
        <div className="text-center py-10 text-slate-500">
          <p className="text-4xl mb-3">🌌</p>
          <p>Upload all three data files in Mission Data above to unlock this stage</p>
        </div>
      )}

      {allLoaded && (
        <>
          {/* Planet selectors */}
          <div className="flex items-center gap-4 mb-6">
            {[
              { label: "From", value: from, set: setFrom, exclude: to },
              { label: "To", value: to, set: setTo, exclude: from },
            ].map(({ label, value, set, exclude }) => (
              <div key={label} className="flex-1">
                <label className="text-xs text-slate-400 uppercase tracking-wider mb-1 block">{label}</label>
                <select
                  value={value}
                  onChange={e => set(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-600 rounded-xl px-4 py-3 text-white
                    focus:outline-none focus:border-amber-500/60 cursor-pointer appearance-none"
                >
                  <option value="">— Select planet —</option>
                  {planetNames.filter(n => n !== exclude).map(n => (
                    <option key={n} value={n}>{PLANET_ICONS[n]} {n}</option>
                  ))}
                </select>
              </div>
            ))}

            {from && to && (
              <div className="flex items-end pb-0.5">
                <div className="text-3xl animate-float">🚀</div>
              </div>
            )}
          </div>

          {/* Route display */}
          {from && to && (
            <div className="flex items-center gap-2 mb-6 p-3 bg-slate-800/40 rounded-xl border border-slate-700/40">
              <span className={`font-semibold ${PLANET_COLORS[from] ?? "text-white"}`}>
                {PLANET_ICONS[from]} {from}
              </span>
              <div className="flex-1 h-px bg-gradient-to-r from-amber-500/60 via-white/20 to-amber-500/60 mx-2" />
              <span className="text-slate-400 text-xs">straight-line journey</span>
              <div className="flex-1 h-px bg-gradient-to-r from-amber-500/60 via-white/20 to-amber-500/60 mx-2" />
              <span className={`font-semibold ${PLANET_COLORS[to] ?? "text-white"}`}>
                {PLANET_ICONS[to]} {to}
              </span>
            </div>
          )}

          {/* Results */}
          {result && (
            <div className="space-y-4">
              {/* Velocity info */}
              <div className="grid grid-cols-3 gap-3">
                <StatCard
                  label={`${from} escape vel.`}
                  value={`${(result.ev1 / 1000).toFixed(2)} km/s`}
                  color={PLANET_COLORS[from]}
                />
                <StatCard
                  label={`${to} escape vel.`}
                  value={`${(result.ev2 / 1000).toFixed(2)} km/s`}
                  color={PLANET_COLORS[to]}
                />
                <StatCard
                  label="Cruising velocity"
                  value={`${(result.cruiseVel / 1000).toFixed(2)} km/s`}
                  color="text-amber-300"
                />
              </div>

              {/* Journey phases */}
              <div className="bg-slate-800/30 border border-slate-700/40 rounded-xl overflow-hidden">
                <div className="px-4 py-2 border-b border-slate-700/40">
                  <p className="text-xs text-slate-400 uppercase tracking-wider">Journey Phases</p>
                </div>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-700/40">
                      <th className="text-left py-2 px-4 text-amber-400 text-xs uppercase tracking-wider">Phase</th>
                      <th className="text-right py-2 px-4 text-amber-400 text-xs uppercase tracking-wider">Duration</th>
                      <th className="text-right py-2 px-4 text-amber-400 text-xs uppercase tracking-wider">Distance</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-slate-800/60 hover:bg-slate-800/30 transition-colors">
                      <td className="py-3 px-4 text-green-400">🔥 Acceleration burn</td>
                      <td className="py-3 px-4 text-right font-mono text-white">
                        {Math.round(result.accelTimeSec).toLocaleString()}s
                        <span className="text-slate-500 text-xs ml-2">({formatTime(result.accelTimeSec)})</span>
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-slate-300">
                        {result.accelDistKm.toFixed(1)} km from surface
                      </td>
                    </tr>
                    <tr className="border-b border-slate-800/60 hover:bg-slate-800/30 transition-colors">
                      <td className="py-3 px-4 text-cyan-400">🛸 Cruising</td>
                      <td className="py-3 px-4 text-right font-mono text-white">
                        {Math.round(result.cruiseTimeSec).toLocaleString()}s
                        <span className="text-slate-500 text-xs ml-2">({formatTime(result.cruiseTimeSec)})</span>
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-slate-300">
                        {result.cruiseDistKm.toLocaleString("en-US", { maximumFractionDigits: 1 })} km
                      </td>
                    </tr>
                    <tr className="hover:bg-slate-800/30 transition-colors">
                      <td className="py-3 px-4 text-red-400">🔥 Deceleration burn</td>
                      <td className="py-3 px-4 text-right font-mono text-white">
                        {Math.round(result.decelTimeSec).toLocaleString()}s
                        <span className="text-slate-500 text-xs ml-2">({formatTime(result.decelTimeSec)})</span>
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-slate-300">
                        starts {result.decelDistKm.toFixed(1)} km from {to} surface
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Total */}
              <div className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/30 rounded-xl p-4 flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-xs uppercase tracking-wider mb-1">Total Distance</p>
                  <p className="text-white font-mono font-bold">{result.totalDistKm.toLocaleString("en-US", { maximumFractionDigits: 1 })} km</p>
                </div>
                <div className="text-4xl animate-float">✨</div>
                <div className="text-right">
                  <p className="text-slate-400 text-xs uppercase tracking-wider mb-1">Total Travel Time</p>
                  <p className="text-amber-300 font-mono font-bold text-lg">{formatTime(result.totalTimeSec)}</p>
                  <p className="text-slate-500 text-xs">{Math.round(result.totalTimeSec).toLocaleString()} seconds</p>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}