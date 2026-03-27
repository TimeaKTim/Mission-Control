import { useState } from "react";
import type { ReactNode } from "react";
import { MissionContext } from "./MissionContext";

export function MissionProvider({ children }: { children: ReactNode }) {
  const [planetContent, setPlanetContent] = useState<string | null>(null);
  const [rocketContent, setRocketContent] = useState<string | null>(null);
  const [solarContent, setSolarContent] = useState<string | null>(null);

  return (
    <MissionContext.Provider value={{
      planetContent, rocketContent, solarContent,
      setPlanetContent, setRocketContent, setSolarContent,
    }}>
      {children}
    </MissionContext.Provider>
  );
}