export interface PlanetRawData {
  name: string;
  diameterKm: number;
  massKg: number;
}

export interface PlanetResult extends PlanetRawData {
  escapeVelocityMs: number;
}

export interface PlanetStage2Result extends PlanetResult {
  timeToEscapeS: number;
  distanceFromSurfaceM: number;
  distanceFromCenterM: number;
}
