const G = 6.67e-11;

export function escapeVelocity(massKg: number, radiusM: number): number {
  return Math.sqrt((2 * G * massKg) / radiusM);
}

export function timeToEscape(
  escapeVelocityMs: number,
  accelerationMs2: number,
): number {
  return escapeVelocityMs / accelerationMs2;
}

export function distanceTravelled(
  accelerationMs2: number,
  timeS: number,
): number {
  return 0.5 * accelerationMs2 * timeS * timeS;
}

export function formatTime(seconds: number): string {
  const d = Math.floor(seconds / 86400);
  const h = Math.floor((seconds % 86400) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  const parts = [];
  if (d > 0) parts.push(`${d}d`);
  if (h > 0) parts.push(`${h}h`);
  if (m > 0) parts.push(`${m}m`);
  parts.push(`${s}s`);
  return parts.join(" ");
}

export const AU_TO_KM = 149597870.7;
export const AU_TO_M = AU_TO_KM * 1000;

export function cruisingVelocity(ev1: number, ev2: number): number {
  return Math.max(ev1, ev2);
}

export function travelDistance(
  orbitalRadius1AU: number,
  orbitalRadius2AU: number,
): number {
  return Math.abs(orbitalRadius1AU - orbitalRadius2AU) * AU_TO_KM;
}

export function cruisingDistance(
  totalDistanceKm: number,
  accelDistanceKm1: number,
  accelDistanceKm2: number,
  radius1Km: number,
  radius2Km: number,
): number {
  return (
    totalDistanceKm -
    accelDistanceKm1 -
    accelDistanceKm2 -
    radius1Km -
    radius2Km
  );
}

export function cruisingTime(
  cruisingDistanceKm: number,
  cruisingVelocityKms: number,
): number {
  return (cruisingDistanceKm * 1000) / cruisingVelocityKms;
}

export function planetAngleDeg(days: number, periodDays: number): number {
  return ((days / periodDays) * 360) % 360;
}

export function travelTimeSec(
  distKm: number,
  cruiseVelMs: number,
  accelMs2: number,
): number {
  const accelT = cruiseVelMs / accelMs2;
  const accelDKm = (0.5 * accelMs2 * accelT ** 2) / 1000;
  const cruiseDKm = distKm - 2 * accelDKm;
  if (cruiseDKm <= 0) return 2 * accelT;
  return 2 * accelT + (cruiseDKm * 1000) / cruiseVelMs;
}
