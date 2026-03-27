import type { RocketData } from "../types/rocket";

export function parseRocketData(content: string): {
  rocket: RocketData | null;
  errors: string[];
} {
  const lines = content.trim().split("\n");
  const errors: string[] = [];
  let engineCount: number | null = null;
  let accelerationPerEngine: number | null = null;

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    const enginesMatch = trimmed.match(/number of rocket engines\s*:\s*(\d+)/i);
    if (enginesMatch) {
      engineCount = parseInt(enginesMatch[1]);
      continue;
    }

    const accelMatch = trimmed.match(/acceleration per engine\s*:\s*([\d.]+)/i);
    if (accelMatch) {
      accelerationPerEngine = parseFloat(accelMatch[1]);
      continue;
    }

    errors.push(`Unrecognized line: "${trimmed}"`);
  }

  if (engineCount === null) errors.push("Missing: number of rocket engines");
  if (accelerationPerEngine === null)
    errors.push("Missing: acceleration per engine");

  if (engineCount === null || accelerationPerEngine === null) {
    return { rocket: null, errors };
  }

  return {
    rocket: {
      engineCount,
      accelerationPerEngine,
      totalAcceleration: engineCount * accelerationPerEngine,
    },
    errors,
  };
}
