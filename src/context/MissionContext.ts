import { createContext } from "react";

export interface SolarBodyData {
  name: string;
  periodDays: number;
  orbitalRadiusAU: number;
}

export interface MissionContextType {
  planetContent: string | null;
  rocketContent: string | null;
  solarContent: string | null;
  setPlanetContent: (c: string) => void;
  setRocketContent: (c: string) => void;
  setSolarContent: (c: string) => void;
}

export const MissionContext = createContext<MissionContextType | null>(null);
