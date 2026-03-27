import { useEffect, useRef } from "react";
import { PLANET_HEX, PLANET_SIZES_PX } from "../utils/planetConstants";
import { planetAngleDeg } from "../utils/physics";
import type { SolarBodyData } from "../context/MissionContext";

interface Props {
  launchDay: number;
  travelTimeDays: number;
  sourcePos: { x: number; y: number };
  interceptPos: { x: number; y: number };
  from: string;
  to: string;
  solarBodies: SolarBodyData[];
}

export default function LiveJourneyAnimation({
  launchDay, travelTimeDays, sourcePos, interceptPos, from, to, solarBodies,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const progressRef = useRef(0);
  const animRef = useRef<number | null>(null);

  const W = 500; const H = 500;
  const cx = W / 2; const cy = H / 2;
  const maxAU = Math.max(...solarBodies.map(b => b.orbitalRadiusAU), 1);
  const maxOrbitR = Math.min(W, H) / 2 - 24;

  function orbitR(au: number) {
    return (Math.log(au + 1) / Math.log(maxAU + 1)) * maxOrbitR;
  }
  function toCanvas(pos: { x: number; y: number }) {
    const r = orbitR(Math.sqrt(pos.x ** 2 + pos.y ** 2));
    const angle = Math.atan2(pos.y, pos.x);
    return { x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) };
  }
  function planetCanvasPos(angleDeg: number, au: number) {
    const r = orbitR(au);
    const rad = ((angleDeg - 90) * Math.PI) / 180;
    return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
  }

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const srcCanvas = toCanvas(sourcePos);
    const dstCanvas = toCanvas(interceptPos);

    function draw(progress: number) {
      if (!ctx) return;
      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = "#03030e";
      ctx.fillRect(0, 0, W, H);

      const currentDay = launchDay + progress * travelTimeDays;

      // Orbit rings
      solarBodies.forEach(b => {
        ctx.beginPath();
        ctx.arc(cx, cy, orbitR(b.orbitalRadiusAU), 0, Math.PI * 2);
        ctx.strokeStyle = "rgba(255,255,255,0.05)";
        ctx.lineWidth = 1;
        ctx.stroke();
      });

      // Intercept point marker
      ctx.beginPath();
      ctx.arc(dstCanvas.x, dstCanvas.y, 8, 0, Math.PI * 2);
      ctx.strokeStyle = "rgba(74,222,128,0.3)";
      ctx.lineWidth = 1;
      ctx.setLineDash([2, 2]);
      ctx.stroke();
      ctx.setLineDash([]);

      const rocketX = srcCanvas.x + (dstCanvas.x - srcCanvas.x) * progress;
      const rocketY = srcCanvas.y + (dstCanvas.y - srcCanvas.y) * progress;

      // Trail
      const grad = ctx.createLinearGradient(srcCanvas.x, srcCanvas.y, rocketX, rocketY);
      grad.addColorStop(0, "rgba(74,222,128,0)");
      grad.addColorStop(1, "rgba(74,222,128,0.7)");
      ctx.beginPath();
      ctx.moveTo(srcCanvas.x, srcCanvas.y);
      ctx.lineTo(rocketX, rocketY);
      ctx.strokeStyle = grad;
      ctx.lineWidth = 2;
      ctx.stroke();

      // Remaining path
      ctx.beginPath();
      ctx.moveTo(rocketX, rocketY);
      ctx.lineTo(dstCanvas.x, dstCanvas.y);
      ctx.strokeStyle = "rgba(74,222,128,0.12)";
      ctx.lineWidth = 1.5;
      ctx.setLineDash([4, 4]);
      ctx.stroke();
      ctx.setLineDash([]);

      // Sun
      const sunGlow = ctx.createRadialGradient(cx, cy, 0, cx, cy, 28);
      sunGlow.addColorStop(0, "rgba(251,191,36,0.9)");
      sunGlow.addColorStop(0.5, "rgba(251,191,36,0.3)");
      sunGlow.addColorStop(1, "rgba(251,191,36,0)");
      ctx.beginPath();
      ctx.arc(cx, cy, 28, 0, Math.PI * 2);
      ctx.fillStyle = sunGlow;
      ctx.fill();
      ctx.beginPath();
      ctx.arc(cx, cy, 9, 0, Math.PI * 2);
      ctx.fillStyle = "#fbbf24";
      ctx.fill();

      // Moving planets
      solarBodies.forEach(b => {
        const angle = planetAngleDeg(currentDay, b.periodDays);
        const pos = planetCanvasPos(angle, b.orbitalRadiusAU);
        const r = PLANET_SIZES_PX[b.name] ?? 4;
        const color = PLANET_HEX[b.name] ?? "#fff";
        const isEndpoint = b.name === from || b.name === to;

        const glow = ctx.createRadialGradient(pos.x, pos.y, 0, pos.x, pos.y, r + 6);
        glow.addColorStop(0, color + "55");
        glow.addColorStop(1, color + "00");
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, r + 6, 0, Math.PI * 2);
        ctx.fillStyle = glow;
        ctx.fill();

        ctx.beginPath();
        ctx.arc(pos.x, pos.y, r, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.fill();

        if (isEndpoint) {
          ctx.beginPath();
          ctx.arc(pos.x, pos.y, r + 4, 0, Math.PI * 2);
          ctx.strokeStyle = color + "88";
          ctx.lineWidth = 1.5;
          ctx.stroke();
        }

        ctx.font = isEndpoint ? "bold 10px monospace" : "9px monospace";
        ctx.fillStyle = color;
        ctx.globalAlpha = isEndpoint ? 1 : 0.7;
        ctx.textAlign = "center";
        ctx.fillText(b.name, pos.x, pos.y - r - 5);
        ctx.globalAlpha = 1;
      });

      // Rocket
      const angle = Math.atan2(dstCanvas.y - srcCanvas.y, dstCanvas.x - srcCanvas.x);
      ctx.save();
      ctx.translate(rocketX, rocketY);
      ctx.rotate(angle + Math.PI / 2);

      if (progress > 0 && progress < 1) {
        const flameGrad = ctx.createLinearGradient(0, 6, 0, 18);
        flameGrad.addColorStop(0, "rgba(251,146,60,0.9)");
        flameGrad.addColorStop(0.5, "rgba(239,68,68,0.6)");
        flameGrad.addColorStop(1, "rgba(239,68,68,0)");
        ctx.beginPath();
        ctx.moveTo(-3, 6);
        ctx.lineTo(0, 16);
        ctx.lineTo(3, 6);
        ctx.fillStyle = flameGrad;
        ctx.fill();
      }

      ctx.beginPath();
      ctx.moveTo(0, -8);
      ctx.lineTo(4, 4);
      ctx.lineTo(-4, 4);
      ctx.closePath();
      ctx.fillStyle = "#e2e8f0";
      ctx.fill();
      ctx.strokeStyle = "#22d3ee";
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.restore();

      // Day counter
      ctx.font = "10px monospace";
      ctx.fillStyle = "rgba(255,255,255,0.5)";
      ctx.textAlign = "right";
      ctx.fillText(`Day ${Math.round(currentDay).toLocaleString("en-US")}`, W - 12, 20);

      // Progress bar
      ctx.fillStyle = "rgba(0,0,0,0.4)";
      ctx.fillRect(10, H - 18, W - 20, 6);
      ctx.beginPath();
      ctx.roundRect(10, H - 18, (W - 20) * progress, 6, 3);
      const barGrad = ctx.createLinearGradient(10, 0, W - 10, 0);
      barGrad.addColorStop(0, "#22d3ee");
      barGrad.addColorStop(1, "#4ade80");
      ctx.fillStyle = barGrad;
      ctx.fill();

      ctx.font = "10px monospace";
      ctx.fillStyle = "rgba(255,255,255,0.4)";
      ctx.textAlign = "right";
      ctx.fillText(`${Math.round(progress * 100)}%`, W - 12, H - 22);
    }

    progressRef.current = 0;
    function animate() {
      progressRef.current += 0.002;
      if (progressRef.current > 1) progressRef.current = 0;
      draw(progressRef.current);
      animRef.current = requestAnimationFrame(animate);
    }
    animRef.current = requestAnimationFrame(animate);
    return () => { if (animRef.current) cancelAnimationFrame(animRef.current); };
  }, [launchDay, travelTimeDays, sourcePos, interceptPos, from, to, solarBodies]);

  return (
    <div className="shrink-0 flex flex-col items-center gap-2">
      <p className="text-xs text-slate-400 uppercase tracking-wider">Live Journey · Planets Moving</p>
      <canvas ref={canvasRef} width={W} height={H} className="rounded-xl border border-slate-800/60" />
    </div>
  );
}
