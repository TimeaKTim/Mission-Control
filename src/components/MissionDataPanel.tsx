import { useMission } from "../context/useMission";

interface FileSlotProps {
  label: string;
  filename: string;
  loaded: boolean;
  onLoad: (content: string) => void;
  icon: string;
}

function FileSlot({ label, filename, loaded, onLoad, icon }: FileSlotProps) {
  const [dragging, setDragging] = useState(false);

  function read(file: File) {
    const reader = new FileReader();
    reader.onload = (e) => onLoad(e.target?.result as string);
    reader.readAsText(file);
  }

  return (
    <label
      onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => {
        e.preventDefault(); setDragging(false);
        const f = e.dataTransfer.files?.[0]; if (f) read(f);
      }}
      className={`
        flex flex-col items-center justify-center gap-2 border-2 border-dashed rounded-xl p-5 cursor-pointer
        transition-all duration-300 flex-1
        ${loaded
          ? "border-green-500/50 bg-green-500/5"
          : dragging
            ? "border-cyan-400 bg-cyan-500/10 scale-[1.01]"
            : "border-slate-700 hover:border-cyan-500/60 hover:bg-slate-800/40 bg-slate-800/20"
        }
      `}
    >
      <span className="text-2xl">{loaded ? "✅" : icon}</span>
      <p className="text-xs text-slate-400 uppercase tracking-wider">{label}</p>
      <code className="text-cyan-400 bg-slate-900 px-2 py-0.5 rounded text-xs">{filename}</code>
      {loaded && <span className="text-green-400 text-xs font-semibold">Loaded</span>}
      <input type="file" accept=".txt" className="hidden"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) read(f); }} />
    </label>
  );
}

import { useState } from "react";

export default function MissionDataPanel() {
  const { planetContent, rocketContent, solarContent,
          setPlanetContent, setRocketContent, setSolarContent } = useMission();

  const allLoaded = !!planetContent && !!rocketContent && !!solarContent;

  return (
    <div className="bg-slate-900/40 backdrop-blur-md border border-slate-700/50 rounded-2xl p-6 mb-8">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-semibold text-white">Mission Data</h2>
          <p className="text-slate-500 text-sm">Upload all data files once — shared across all stages</p>
        </div>
        <div className={`px-3 py-1 rounded-full text-xs font-semibold border ${
          allLoaded
            ? "bg-green-500/10 border-green-500/40 text-green-400"
            : "bg-yellow-500/10 border-yellow-500/40 text-yellow-400"
        }`}>
          {allLoaded ? "🟢 All Systems Go" : "⚠ Awaiting Data"}
        </div>
      </div>

      <div className="flex gap-4">
        <FileSlot label="Planetary Data" filename="Planetary_Data.txt"
          loaded={!!planetContent} onLoad={setPlanetContent} icon="🪐" />
        <FileSlot label="Rocket Data" filename="Rocket_Data.txt"
          loaded={!!rocketContent} onLoad={setRocketContent} icon="🚀" />
        <FileSlot label="Solar System" filename="Solar_System_Data.txt"
          loaded={!!solarContent} onLoad={setSolarContent} icon="☀️" />
      </div>
    </div>
  );
}