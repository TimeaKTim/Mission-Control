import { useState, useEffect } from "react";
import { parsePlanetData } from "../utils/parsePlanets";
import { parseRocketData } from "../utils/parseRocket";
import { parseSolarData } from "../utils/parseSolar";
import {
  escapeVelocity, timeToEscape, distanceTravelled,
  cruisingVelocity, AU_TO_KM, planetAngleDeg,
} from "../utils/physics";
import { planetPos2D, distanceBetween, isPlanetInPath } from "../utils/orbitGeometry";

const START_DAY = 36500;
const MAX_SEARCH = 3650;

export interface TransferResult {
  noWindowFound: boolean;
  windowDay: number;
  daysFromStart: number;
  years: number;
  remainDays: number;
  ev1: number;
  ev2: number;
  cruiseVel: number;
  accelTimeSec: number;
  accelDistKm: number;
  cruiseDistKm: number;
  cruiseTimeSec: number;
  decelTimeSec: number;
  decelDistKm: number;
  actualDistKm: number;
  totalTimeSec: number;
  ttDays: number;
  planetPositions: { name: string; angleDeg: number; orbitalRadiusAU: number }[];
  sourcePos: { x: number; y: number };
  interceptPos: { x: number; y: number };
}

export function useTransferSearch(
  planetContent: string | null,
  rocketContent: string | null,
  solarContent: string | null,
  from: string,
  to: string,
  triggered: boolean,
  mode: "freeze" | "live",
) {
  const [result, setResult] = useState<TransferResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!triggered || !from || !to || from === to) return;
    if (!planetContent || !rocketContent || !solarContent) return;

    setLoading(true);
    setResult(null);
    setProgress(0);

    const timeout = setTimeout(() => {
      const { planets } = parsePlanetData(planetContent);
      const { rocket } = parseRocketData(rocketContent);
      const { bodies: solarBodies } = parseSolarData(solarContent);
      if (!rocket) { setLoading(false); return; }

      const p1 = planets.find(p => p.name === from)!;
      const p2 = planets.find(p => p.name === to)!;
      const s1 = solarBodies.find(s => s.name === from)!;
      const s2 = solarBodies.find(s => s.name === to)!;
      if (!p1 || !p2 || !s1 || !s2) { setLoading(false); return; }

      const r1m = (p1.diameterKm / 2) * 1000;
      const r2m = (p2.diameterKm / 2) * 1000;
      const ev1 = escapeVelocity(p1.massKg, r1m);
      const ev2 = escapeVelocity(p2.massKg, r2m);
      const cruiseVel = cruisingVelocity(ev1, ev2);
      const accelTime = timeToEscape(cruiseVel, rocket.totalAcceleration);
      const accelDist = distanceTravelled(rocket.totalAcceleration, accelTime);

      const others = planets.filter(p => p.name !== from && p.name !== to);
      const otherSolar = solarBodies.filter(s => s.name !== from && s.name !== to);

      let bestDay = -1, bestDist = Infinity;
      let bestIntercept = { x: 0, y: 0 }, bestTtSec = 0, bestTtDays = 0;
      let subOptDay = -1, subOptDist = Infinity;
      let subOptIntercept = { x: 0, y: 0 }, subOptTtSec = 0, subOptTtDays = 0;

      for (let d = 0; d <= MAX_SEARCH; d++) {
        const day = START_DAY + d;
        const pos1 = planetPos2D(planetAngleDeg(day, s1.periodDays), s1.orbitalRadiusAU);

        let pos2 = planetPos2D(planetAngleDeg(day, s2.periodDays), s2.orbitalRadiusAU);
        let ttSec = 0, ttDays = 0;

        if (mode === "live") {
          for (let i = 0; i < 20; i++) {
            const distKm = distanceBetween(pos1, pos2) * AU_TO_KM;
            const accelT = cruiseVel / rocket.totalAcceleration;
            const accelDKm = (0.5 * rocket.totalAcceleration * accelT ** 2) / 1000;
            const cruiseDKm = distKm - 2 * accelDKm;
            ttSec = cruiseDKm > 0 ? 2 * accelT + (cruiseDKm * 1000) / cruiseVel : 2 * accelT;
            ttDays = ttSec / 86400;
            const newPos = planetPos2D(planetAngleDeg(day + ttDays, s2.periodDays), s2.orbitalRadiusAU);
            if (distanceBetween(newPos, pos2) < 0.00001) { pos2 = newPos; break; }
            pos2 = newPos;
          }
        }

        const dist = distanceBetween(pos1, pos2);

        if (dist < subOptDist) {
          subOptDist = dist; subOptDay = day;
          subOptIntercept = pos2; subOptTtSec = ttSec; subOptTtDays = ttDays;
        }

        let blocked = false;
        for (let i = 0; i < others.length; i++) {
          const os = otherSolar[i], op = others[i];
          const opos = planetPos2D(planetAngleDeg(day, os.periodDays), os.orbitalRadiusAU);
          if (isPlanetInPath(opos, (op.diameterKm / 2) / AU_TO_KM, pos1, pos2)) { blocked = true; break; }
        }

        if (!blocked && dist < bestDist) {
          bestDist = dist; bestDay = day;
          bestIntercept = pos2; bestTtSec = ttSec; bestTtDays = ttDays;
        }

        if (d % 100 === 0) setProgress(Math.round((d / MAX_SEARCH) * 100));
      }

      const noWindowFound = bestDay === -1;
      const windowDay = noWindowFound ? subOptDay : bestDay;
      const interceptPos = noWindowFound ? subOptIntercept : bestIntercept;
      const finalTtSec = noWindowFound ? subOptTtSec : bestTtSec;
      const finalTtDays = noWindowFound ? subOptTtDays : bestTtDays;
      const daysFromStart = windowDay - START_DAY;

      const sourcePos = planetPos2D(planetAngleDeg(windowDay, s1.periodDays), s1.orbitalRadiusAU);
      const actualDistKm = distanceBetween(sourcePos, interceptPos) * AU_TO_KM;
      const cruiseDistKm = Math.max(0, actualDistKm - (accelDist / 1000) * 2 - p1.diameterKm / 2 - p2.diameterKm / 2);
      const cruiseTimeSec = cruiseDistKm * 1000 / cruiseVel;
      const totalTimeSec = accelTime + cruiseTimeSec + accelTime;

      setResult({
        noWindowFound, windowDay, daysFromStart,
        years: Math.floor(daysFromStart / 365),
        remainDays: Math.round(daysFromStart % 365),
        ev1, ev2, cruiseVel,
        accelTimeSec: accelTime, accelDistKm: accelDist / 1000,
        cruiseDistKm, cruiseTimeSec,
        decelTimeSec: accelTime, decelDistKm: accelDist / 1000,
        actualDistKm, totalTimeSec,
        ttDays: finalTtDays,
        planetPositions: solarBodies.map(b => ({
          name: b.name,
          angleDeg: planetAngleDeg(windowDay, b.periodDays),
          orbitalRadiusAU: b.orbitalRadiusAU,
        })),
        sourcePos,
        interceptPos,
      });

      setProgress(100);
      setLoading(false);
    }, 50);

    return () => clearTimeout(timeout);
  }, [triggered, from, to, planetContent, rocketContent, solarContent, mode]);

  return { result, loading, progress };
}
