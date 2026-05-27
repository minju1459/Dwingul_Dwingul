export type ConfettiPiece = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  rot: number;
  vrot: number;
  size: number;
  color: string;
  shape: "rect" | "circle";
  life: number;
  maxLife: number;
};

const PALETTE = [
  "#ff5ea0",
  "#ffd089",
  "#ffe27a",
  "#a78bfa",
  "#7dd3fc",
  "#86efac",
  "#fb7185",
];

export function spawnConfettiBurst(
  pieces: ConfettiPiece[],
  originX: number,
  originY: number,
  count = 30,
  power = 1,
) {
  for (let i = 0; i < count; i++) {
    const angle = -Math.PI / 2 + (Math.random() - 0.5) * 1.6;
    const speed = (3 + Math.random() * 5) * power;
    pieces.push({
      x: originX,
      y: originY,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      rot: Math.random() * Math.PI * 2,
      vrot: (Math.random() - 0.5) * 0.4,
      size: 4 + Math.random() * 6,
      color: PALETTE[Math.floor(Math.random() * PALETTE.length)],
      shape: Math.random() > 0.4 ? "rect" : "circle",
      life: 0,
      maxLife: 2400 + Math.random() * 1600,
    });
  }
}

export function spawnConfettiCannon(
  pieces: ConfettiPiece[],
  width: number,
  height: number,
  count = 120,
) {
  for (let i = 0; i < count; i++) {
    const fromLeft = Math.random() > 0.5;
    const ox = fromLeft ? 0 : width;
    const oy = height * (0.55 + Math.random() * 0.25);
    const angle = fromLeft
      ? -Math.PI / 2 - Math.PI / 6 + Math.random() * (Math.PI / 3)
      : -Math.PI / 2 + Math.PI / 6 - Math.random() * (Math.PI / 3);
    const speed = 8 + Math.random() * 9;
    pieces.push({
      x: ox,
      y: oy,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      rot: Math.random() * Math.PI * 2,
      vrot: (Math.random() - 0.5) * 0.5,
      size: 5 + Math.random() * 8,
      color: PALETTE[Math.floor(Math.random() * PALETTE.length)],
      shape: Math.random() > 0.4 ? "rect" : "circle",
      life: 0,
      maxLife: 3600 + Math.random() * 1800,
    });
  }
}

export function updateAndDrawConfetti(
  ctx: CanvasRenderingContext2D,
  pieces: ConfettiPiece[],
  dt: number,
) {
  const dts = dt / 16.67;
  for (let i = pieces.length - 1; i >= 0; i--) {
    const p = pieces[i];
    p.vy += 0.18 * dts;
    p.vx *= 0.995;
    p.x += p.vx * dts;
    p.y += p.vy * dts;
    p.rot += p.vrot * dts;
    p.life += dt;
    const lifeRatio = p.life / p.maxLife;
    if (lifeRatio >= 1) {
      pieces.splice(i, 1);
      continue;
    }
    const alpha = lifeRatio > 0.7 ? 1 - (lifeRatio - 0.7) / 0.3 : 1;
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.rot);
    ctx.globalAlpha = alpha;
    ctx.fillStyle = p.color;
    if (p.shape === "rect") {
      ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
    } else {
      ctx.beginPath();
      ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }
  ctx.globalAlpha = 1;
}
