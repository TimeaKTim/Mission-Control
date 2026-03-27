import type { SolarBodyData } from "../context/MissionContext";

export function parseSolarData(content: string): {
  bodies: SolarBodyData[];
  errors: string[];
} {
  const lines = content.trim().split("\n");
  const bodies: SolarBodyData[] = [];
  const errors: string[] = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    try {
      const colonIdx = trimmed.indexOf(":");
      if (colonIdx === -1) throw new Error("Missing colon separator");
      const name = trimmed.substring(0, colonIdx).trim();

      const periodMatch = trimmed.match(/period\s*=\s*([\d.]+)\s*days/i);
      if (!periodMatch) throw new Error("Could not parse period");

      const radiusMatch = trimmed.match(/orbital radius\s*=\s*([\d.]+)\s*AU/i);
      if (!radiusMatch) throw new Error("Could not parse orbital radius");

      bodies.push({
        name,
        periodDays: parseFloat(periodMatch[1]),
        orbitalRadiusAU: parseFloat(radiusMatch[1]),
      });
    } catch (e) {
      errors.push(`Line "${trimmed}": ${(e as Error).message}`);
    }
  }

  return { bodies, errors };
}
