interface Props {
  from: string;
  to: string;
  progress: number;
}

export default function SearchLoader({ from, to, progress }: Props) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-6">
      {/* Orbital spinner */}
      <div className="relative w-24 h-24 flex items-center justify-center">
        <div className="w-4 h-4 rounded-full bg-yellow-400 shadow-[0_0_20px_rgba(251,191,36,0.8)] z-10" />
        {[
          { size: 40, duration: "1.2s", color: "#22d3ee", delay: "0s" },
          { size: 60, duration: "2.1s", color: "#f87171", delay: "0.3s" },
          { size: 84, duration: "3.4s", color: "#fb923c", delay: "0.6s" },
        ].map((ring, i) => (
          <div
            key={i}
            className="absolute rounded-full border border-slate-700/30"
            style={{
              width: ring.size,
              height: ring.size,
              animation: `spin-orbit ${ring.duration} linear infinite`,
              animationDelay: ring.delay,
            }}
          >
            <div
              className="absolute rounded-full"
              style={{
                width: 7,
                height: 7,
                background: ring.color,
                boxShadow: `0 0 8px ${ring.color}`,
                top: -3.5,
                left: "50%",
                transform: "translateX(-50%)",
              }}
            />
          </div>
        ))}
      </div>

      <div className="text-center">
        <p className="text-white font-semibold mb-1">Scanning transfer windows...</p>
        <p className="text-slate-400 text-sm">{from} → {to} · searching up to 10 years</p>
      </div>

      <div className="w-72">
        <div className="flex justify-between text-xs text-slate-500 mb-1.5">
          <span>Day {Math.round(progress * 36.5)} of 3,650</span>
          <span>{progress}%</span>
        </div>
        <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-cyan-500 to-green-400 rounded-full transition-all duration-100"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
}
