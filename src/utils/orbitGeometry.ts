export interface Vec2 {
  x: number;
  y: number;
}

export function planetPos2D(angleDeg: number, radiusAU: number): Vec2 {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return {
    x: radiusAU * Math.cos(rad),
    y: radiusAU * Math.sin(rad),
  };
}

export function distanceBetween(a: Vec2, b: Vec2): number {
  return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
}

// Shortest distance from point P to line segment AB
export function distPointToSegment(p: Vec2, a: Vec2, b: Vec2): number {
  const ab = { x: b.x - a.x, y: b.y - a.y };
  const ap = { x: p.x - a.x, y: p.y - a.y };
  const lenSq = ab.x ** 2 + ab.y ** 2;
  if (lenSq === 0) return distanceBetween(p, a);
  const t = Math.max(0, Math.min(1, (ap.x * ab.x + ap.y * ab.y) / lenSq));
  return distanceBetween(p, { x: a.x + t * ab.x, y: a.y + t * ab.y });
}

export function isPlanetInPath(
  planetPos: Vec2,
  planetRadiusAU: number,
  fromPos: Vec2,
  toPos: Vec2,
): boolean {
  return distPointToSegment(planetPos, fromPos, toPos) < planetRadiusAU;
}

export function findInterceptPoint(
  launchDay: number,
  sourcePos: Vec2,
  destSolar: { periodDays: number; orbitalRadiusAU: number },
  cruiseVelMs: number,
  accelMs2: number,
  AU_TO_KM: number,
): { aimPos: Vec2; travelTimeSec: number; travelTimeDays: number } {
  // Import inline to avoid circular dep
  const planetAngle = (day: number, period: number) =>
    ((day / period) * 360) % 360;
  const pos2D = (angleDeg: number, radiusAU: number): Vec2 => {
    const rad = ((angleDeg - 90) * Math.PI) / 180;
    return { x: radiusAU * Math.cos(rad), y: radiusAU * Math.sin(rad) };
  };
  const travelT = (distKm: number) => {
    const accelT = cruiseVelMs / accelMs2;
    const accelDKm = (0.5 * accelMs2 * accelT ** 2) / 1000;
    const cruiseDKm = distKm - 2 * accelDKm;
    if (cruiseDKm <= 0) return 2 * accelT;
    return 2 * accelT + (cruiseDKm * 1000) / cruiseVelMs;
  };

  let aimPos = pos2D(
    planetAngle(launchDay, destSolar.periodDays),
    destSolar.orbitalRadiusAU,
  );
  let ttSec = 0;

  for (let i = 0; i < 20; i++) {
    const distKm = distanceBetween(sourcePos, aimPos) * AU_TO_KM;
    ttSec = travelT(distKm);
    const ttDays = ttSec / 86400;
    const newAim = pos2D(
      planetAngle(launchDay + ttDays, destSolar.periodDays),
      destSolar.orbitalRadiusAU,
    );
    if (distanceBetween(newAim, aimPos) < 0.00001) {
      aimPos = newAim;
      break;
    }
    aimPos = newAim;
  }
  return { aimPos, travelTimeSec: ttSec, travelTimeDays: ttSec / 86400 };
}

export function isPathBlockedMoving(
  launchDay: number,
  sourcePos: Vec2,
  destPos: Vec2,
  travelTimeDays: number,
  others: Array<{
    periodDays: number;
    orbitalRadiusAU: number;
    radiusAU: number;
  }>,
  steps = 80,
): boolean {
  const planetAngle = (day: number, period: number) =>
    ((day / period) * 360) % 360;
  const pos2D = (angleDeg: number, radiusAU: number): Vec2 => {
    const rad = ((angleDeg - 90) * Math.PI) / 180;
    return { x: radiusAU * Math.cos(rad), y: radiusAU * Math.sin(rad) };
  };
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const day = launchDay + t * travelTimeDays;
    const rocketPos: Vec2 = {
      x: sourcePos.x + (destPos.x - sourcePos.x) * t,
      y: sourcePos.y + (destPos.y - sourcePos.y) * t,
    };
    for (const other of others) {
      const oPos = pos2D(
        planetAngle(day, other.periodDays),
        other.orbitalRadiusAU,
      );
      if (distanceBetween(rocketPos, oPos) < other.radiusAU) return true;
    }
  }
  return false;
}
