import type { PlanetRawData } from "../types/planet";

const EARTH_MASS_KG = 6e24;

export function parsePlanetData(content: string): {
  planets: PlanetRawData[];
  errors: string[];
} {
  const lines = content.trim().split("\n");
  const planets: PlanetRawData[] = [];
  const errors: string[] = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    try {
      const colonIdx = trimmed.indexOf(":");
      if (colonIdx === -1) throw new Error("Missing colon separator");
      const name = trimmed.substring(0, colonIdx).trim();

      const diameterMatch = trimmed.match(/diameter\s*=\s*([\d.]+)\s*km/i);
      if (!diameterMatch) throw new Error("Could not parse diameter");
      const diameterKm = parseFloat(diameterMatch[1]);

      const massEarthsMatch = trimmed.match(/mass\s*=\s*([\d.]+)\s*Earths/i);
      const massKgMatch = trimmed.match(
        /mass\s*=\s*([\d.]+)\s*\*\s*10\^(\d+)\s*kg/i,
      );

      let massKg: number;
      if (massEarthsMatch) {
        massKg = parseFloat(massEarthsMatch[1]) * EARTH_MASS_KG;
      } else if (massKgMatch) {
        massKg =
          parseFloat(massKgMatch[1]) * Math.pow(10, parseInt(massKgMatch[2]));
      } else {
        throw new Error("Could not parse mass");
      }

      planets.push({ name, diameterKm, massKg });
    } catch (e) {
      errors.push(`Line "${trimmed}": ${(e as Error).message}`);
    }
  }

  return { planets, errors };
}
