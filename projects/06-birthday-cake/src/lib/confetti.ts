export type ConfettiPiece = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  rot: number;
  vrot: number;
  size: number;
  color: string;
  shape: "rect" | "circle" | "strip" | "star";
  life: number;
  maxLife: number;
  twinkle: number;
};

const PALETTE = [
  "#ff3d8a",
  "#ff5ea0",
  "#ffa1c8",
  "#ffd089",
  "#ffe27a",
  "#fff066",
  "#fff7c8",
  "#a78bfa",
  "#c4b5fd",
  "#7dd3fc",
  "#86efac",
  "#fb7185",
  "#f472b6",
  "#facc15",
];

function pickShape(): ConfettiPiece["shape"] {
  const r = Math.random();
  if (r < 0.45) return "rect";
  if (r < 0.7) return "circle";
  if (r < 0.9) return "strip";
  return "star";
}

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
      shape: pickShape(),
      life: 0,
      maxLife: 2400 + Math.random() * 1600,
      twinkle: Math.random() * Math.PI * 2,
    });
  }
}

export function spawnConfettiCannon(
  pieces: ConfettiPiece[],
  width: number,
  height: number,
  count = 320,
) {
  // 양옆 cannon
  const sideCount = Math.floor(count * 0.55);
  for (let i = 0; i < sideCount; i++) {
    const fromLeft = i % 2 === 0;
    const ox = fromLeft ? -10 : width + 10;
    const oy = height * (0.5 + Math.random() * 0.35);
    const angle = fromLeft
      ? -Math.PI / 2 - Math.PI / 5 + Math.random() * (Math.PI / 2.5)
      : -Math.PI / 2 + Math.PI / 5 - Math.random() * (Math.PI / 2.5);
    const speed = 9 + Math.random() * 14;
    pieces.push({
      x: ox,
      y: oy,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      rot: Math.random() * Math.PI * 2,
      vrot: (Math.random() - 0.5) * 0.55,
      size: 5 + Math.random() * 10,
      color: PALETTE[Math.floor(Math.random() * PALETTE.length)],
      shape: pickShape(),
      life: 0,
      maxLife: 4200 + Math.random() * 2400,
      twinkle: Math.random() * Math.PI * 2,
    });
  }
  // 위에서 떨어지는 큰 비
  const topCount = count - sideCount;
  for (let i = 0; i < topCount; i++) {
    pieces.push({
      x: Math.random() * width,
      y: -20 - Math.random() * 200,
      vx: (Math.random() - 0.5) * 3,
      vy: 2 + Math.random() * 3.5,
      rot: Math.random() * Math.PI * 2,
      vrot: (Math.random() - 0.5) * 0.5,
      size: 6 + Math.random() * 12,
      color: PALETTE[Math.floor(Math.random() * PALETTE.length)],
      shape: pickShape(),
      life: 0,
      maxLife: 5000 + Math.random() * 2500,
      twinkle: Math.random() * Math.PI * 2,
    });
  }
}

// 지속적으로 위에서 떨어지는 confetti rain (celebration 동안 계속 호출)
export function spawnConfettiRainStep(
  pieces: ConfettiPiece[],
  width: number,
  count = 8,
) {
  for (let i = 0; i < count; i++) {
    pieces.push({
      x: Math.random() * width,
      y: -10,
      vx: (Math.random() - 0.5) * 2,
      vy: 1.5 + Math.random() * 3,
      rot: Math.random() * Math.PI * 2,
      vrot: (Math.random() - 0.5) * 0.4,
      size: 5 + Math.random() * 10,
      color: PALETTE[Math.floor(Math.random() * PALETTE.length)],
      shape: pickShape(),
      life: 0,
      maxLife: 5500 + Math.random() * 2500,
      twinkle: Math.random() * Math.PI * 2,
    });
  }
}

function drawStar(ctx: CanvasRenderingContext2D, r: number) {
  ctx.beginPath();
  for (let i = 0; i < 10; i++) {
    const ang = (i * Math.PI) / 5 - Math.PI / 2;
    const rr = i % 2 === 0 ? r : r * 0.45;
    const x = Math.cos(ang) * rr;
    const y = Math.sin(ang) * rr;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.fill();
}

export function updateAndDrawConfetti(
  ctx: CanvasRenderingContext2D,
  pieces: ConfettiPiece[],
  dt: number,
) {
  const dts = dt / 16.67;
  for (let i = pieces.length - 1; i >= 0; i--) {
    const p = pieces[i];
    p.vy += 0.16 * dts;
    p.vx *= 0.995;
    p.x += p.vx * dts;
    p.y += p.vy * dts;
    p.rot += p.vrot * dts;
    p.twinkle += 0.18 * dts;
    p.life += dt;
    const lifeRatio = p.life / p.maxLife;
    if (lifeRatio >= 1) {
      pieces.splice(i, 1);
      continue;
    }
    const fade = lifeRatio > 0.75 ? 1 - (lifeRatio - 0.75) / 0.25 : 1;
    // twinkle: 별/스트립은 살짝 깜빡임
    const shimmer =
      p.shape === "star" || p.shape === "strip"
        ? 0.7 + 0.3 * Math.sin(p.twinkle)
        : 1;
    const alpha = fade * shimmer;
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.rot);
    ctx.globalAlpha = alpha;
    ctx.fillStyle = p.color;
    if (p.shape === "rect") {
      ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
    } else if (p.shape === "circle") {
      ctx.beginPath();
      ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
      ctx.fill();
    } else if (p.shape === "strip") {
      // 길쭉한 종이끈
      ctx.fillRect(-p.size * 0.9, -p.size * 0.12, p.size * 1.8, p.size * 0.24);
    } else {
      // star — 살짝 글로우
      ctx.shadowBlur = 8;
      ctx.shadowColor = p.color;
      drawStar(ctx, p.size * 0.7);
    }
    ctx.restore();
  }
  ctx.globalAlpha = 1;
}
