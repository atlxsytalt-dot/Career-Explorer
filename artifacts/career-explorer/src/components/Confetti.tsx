import { useEffect, useRef } from "react";

interface Piece {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  rot: number;
  rotV: number;
  color: string;
  life: number;
  maxLife: number;
}

const CONFETTI_COLORS = [
  "#ff3a3a", "#00e5ff", "#ffd700", "#a855f7", "#22d3ee", "#f97316", "#84cc16"
];

export function useConfetti() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animRef = useRef<number>(0);
  const piecesRef = useRef<Piece[]>([]);

  useEffect(() => {
    const canvas = document.createElement("canvas");
    canvas.style.cssText = "position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:9999;";
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    document.body.appendChild(canvas);
    canvasRef.current = canvas;

    return () => {
      cancelAnimationFrame(animRef.current);
      canvas.remove();
    };
  }, []);

  const burst = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const cx = canvas.width / 2;
    const cy = canvas.height / 3;
    const count = 120;

    piecesRef.current = Array.from({ length: count }, () => {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 12 + 4;
      return {
        x: cx + (Math.random() - 0.5) * 80,
        y: cy + (Math.random() - 0.5) * 40,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 6,
        r: Math.random() * 6 + 3,
        rot: Math.random() * 360,
        rotV: (Math.random() - 0.5) * 12,
        color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
        life: 0,
        maxLife: 90 + Math.random() * 40,
      };
    });

    cancelAnimationFrame(animRef.current);
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      piecesRef.current = piecesRef.current.filter(p => p.life < p.maxLife);
      if (piecesRef.current.length === 0) return;
      for (const p of piecesRef.current) {
        p.life++;
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.35;
        p.rot += p.rotV;
        const alpha = 1 - p.life / p.maxLife;
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rot * Math.PI) / 180);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.r / 2, -p.r / 4, p.r, p.r / 2);
        ctx.restore();
      }
      animRef.current = requestAnimationFrame(draw);
    };
    draw();
  };

  return burst;
}
