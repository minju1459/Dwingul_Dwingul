import type { CandleAnchor } from "./candleConfig";

export type CandleState = "lit" | "extinguishing" | "ember" | "out";

export type Candle = {
  anchor: CandleAnchor;
  state: CandleState;
  stateStart: number;
  flameSeed: number;
  smoke: SmokeParticle[];
};

type SmokeParticle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  alpha: number;
  life: number;
  maxLife: number;
};

export function makeCandle(anchor: CandleAnchor, now: number): Candle {
  return {
    anchor,
    state: "lit",
    stateStart: now,
    flameSeed: Math.random() * 1000,
    smoke: [],
  };
}

export function setCandleState(candle: Candle, state: CandleState, now: number) {
  candle.state = state;
  candle.stateStart = now;
  if (state === "extinguishing") {
    spawnSmokeBurst(candle, now, 14);
  }
}

function spawnSmokeBurst(candle: Candle, now: number, count: number) {
  for (let i = 0; i < count; i++) {
    const angle = (Math.random() - 0.5) * 0.6 - Math.PI / 2;
    const speed = 0.4 + Math.random() * 0.9;
    candle.smoke.push({
      x: 0,
      y: 0,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 0.3,
      radius: 6 + Math.random() * 8,
      alpha: 0.55 + Math.random() * 0.2,
      life: 0,
      maxLife: 1800 + Math.random() * 1200,
    });
  }
}

function spawnSmokeTrickle(candle: Candle) {
  if (candle.smoke.length > 60) return;
  if (Math.random() > 0.35) return;
  const angle = (Math.random() - 0.5) * 0.3 - Math.PI / 2;
  const speed = 0.25 + Math.random() * 0.4;
  candle.smoke.push({
    x: (Math.random() - 0.5) * 2,
    y: 0,
    vx: Math.cos(angle) * speed,
    vy: Math.sin(angle) * speed - 0.2,
    radius: 5 + Math.random() * 6,
    alpha: 0.35 + Math.random() * 0.2,
    life: 0,
    maxLife: 1500 + Math.random() * 1000,
  });
}

export type RenderContext = {
  ctx: CanvasRenderingContext2D;
  width: number;
  height: number;
  dpr: number;
};

export function drawCandle(rc: RenderContext, candle: Candle, now: number, dt: number) {
  const { ctx, width, height } = rc;
  const cx = candle.anchor.x * width;
  const cy = candle.anchor.y * height;
  const scale = candle.anchor.scale * Math.min(width / 480, 1.6);
  const elapsed = now - candle.stateStart;

  ctx.save();
  ctx.translate(cx, cy);

  // 상태별 fade
  if (candle.state === "lit") {
    drawFlame(ctx, candle, now, scale, 1);
    spawnSmokeTrickle(candle);
  } else if (candle.state === "extinguishing") {
    const t = Math.min(elapsed / 220, 1);
    const flameAlpha = 1 - t;
    if (flameAlpha > 0.01) drawFlame(ctx, candle, now, scale * (1 - t * 0.4), flameAlpha);
    if (t >= 1) setCandleState(candle, "ember", now);
  } else if (candle.state === "ember") {
    const t = Math.min(elapsed / 700, 1);
    drawEmber(ctx, scale, 1 - t);
    if (t >= 1) setCandleState(candle, "out", now);
  }

  // 연기는 모든 상태에서 살아있음 (lit 은 미세, out 은 사라질 때까지)
  drawSmoke(ctx, candle, dt, scale);

  ctx.restore();
}

function drawFlame(
  ctx: CanvasRenderingContext2D,
  candle: Candle,
  now: number,
  scale: number,
  alpha: number,
) {
  // 미세 흔들림
  const t = now * 0.004 + candle.flameSeed;
  const swayX = Math.sin(t * 1.7) * 1.4 + Math.sin(t * 3.1) * 0.6;
  const flickerY = Math.sin(t * 2.3) * 1.2;
  const heightMul = 1 + Math.sin(t * 4.1) * 0.06;

  const flameH = 28 * scale * heightMul;
  const flameW = 10 * scale;

  // 외곽 글로우
  const glow = ctx.createRadialGradient(swayX, -flameH * 0.4 + flickerY, 0, swayX, -flameH * 0.4 + flickerY, flameH * 1.8);
  glow.addColorStop(0, `rgba(255, 200, 120, ${0.55 * alpha})`);
  glow.addColorStop(0.4, `rgba(255, 140, 70, ${0.22 * alpha})`);
  glow.addColorStop(1, `rgba(255, 120, 50, 0)`);
  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.arc(swayX, -flameH * 0.4 + flickerY, flameH * 1.8, 0, Math.PI * 2);
  ctx.fill();

  // 외부 불꽃 (주황)
  ctx.beginPath();
  ctx.moveTo(swayX, -flameH + flickerY);
  ctx.bezierCurveTo(swayX + flameW * 1.1, -flameH * 0.55, swayX + flameW * 0.9, -flameH * 0.15, swayX, 2);
  ctx.bezierCurveTo(swayX - flameW * 0.9, -flameH * 0.15, swayX - flameW * 1.1, -flameH * 0.55, swayX, -flameH + flickerY);
  const outerGrad = ctx.createLinearGradient(0, -flameH, 0, 2);
  outerGrad.addColorStop(0, `rgba(255, 240, 180, ${alpha})`);
  outerGrad.addColorStop(0.3, `rgba(255, 180, 90, ${0.95 * alpha})`);
  outerGrad.addColorStop(0.75, `rgba(255, 110, 50, ${0.85 * alpha})`);
  outerGrad.addColorStop(1, `rgba(255, 80, 40, ${0.5 * alpha})`);
  ctx.fillStyle = outerGrad;
  ctx.globalCompositeOperation = "lighter";
  ctx.fill();

  // 내부 불꽃 (밝은 코어)
  const innerW = flameW * 0.5;
  const innerH = flameH * 0.7;
  ctx.beginPath();
  ctx.moveTo(swayX * 0.6, -innerH + flickerY * 0.6);
  ctx.bezierCurveTo(
    swayX * 0.6 + innerW,
    -innerH * 0.5,
    swayX * 0.6 + innerW * 0.8,
    -innerH * 0.1,
    swayX * 0.6,
    1,
  );
  ctx.bezierCurveTo(
    swayX * 0.6 - innerW * 0.8,
    -innerH * 0.1,
    swayX * 0.6 - innerW,
    -innerH * 0.5,
    swayX * 0.6,
    -innerH + flickerY * 0.6,
  );
  const innerGrad = ctx.createLinearGradient(0, -innerH, 0, 1);
  innerGrad.addColorStop(0, `rgba(255, 255, 230, ${alpha})`);
  innerGrad.addColorStop(0.5, `rgba(255, 220, 140, ${alpha})`);
  innerGrad.addColorStop(1, `rgba(255, 180, 90, ${0.6 * alpha})`);
  ctx.fillStyle = innerGrad;
  ctx.fill();

  // 가장 밝은 코어 점
  ctx.beginPath();
  ctx.fillStyle = `rgba(255, 255, 245, ${0.9 * alpha})`;
  ctx.ellipse(swayX * 0.5, -innerH * 0.45, innerW * 0.35, innerH * 0.22, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.globalCompositeOperation = "source-over";
}

function drawEmber(ctx: CanvasRenderingContext2D, scale: number, alpha: number) {
  ctx.globalCompositeOperation = "lighter";
  const r = 3 * scale;
  // 글로우
  const glow = ctx.createRadialGradient(0, 0, 0, 0, 0, r * 6);
  glow.addColorStop(0, `rgba(255, 90, 40, ${0.6 * alpha})`);
  glow.addColorStop(1, `rgba(255, 60, 20, 0)`);
  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.arc(0, 0, r * 6, 0, Math.PI * 2);
  ctx.fill();

  // 잔불 점
  ctx.fillStyle = `rgba(255, 120, 60, ${alpha})`;
  ctx.beginPath();
  ctx.arc(0, 0, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalCompositeOperation = "source-over";
}

function drawSmoke(ctx: CanvasRenderingContext2D, candle: Candle, dt: number, scale: number) {
  const dts = dt / 16.67;
  for (let i = candle.smoke.length - 1; i >= 0; i--) {
    const p = candle.smoke[i];
    p.x += p.vx * dts;
    p.y += p.vy * dts;
    p.vy -= 0.012 * dts;
    p.vx *= 0.992;
    p.radius += 0.18 * dts;
    p.life += dt;
    const lifeRatio = p.life / p.maxLife;
    if (lifeRatio >= 1) {
      candle.smoke.splice(i, 1);
      continue;
    }
    const fadeIn = Math.min(p.life / 200, 1);
    const fadeOut = 1 - lifeRatio;
    const a = p.alpha * fadeIn * fadeOut;
    const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.radius * scale);
    grad.addColorStop(0, `rgba(220, 220, 230, ${a * 0.55})`);
    grad.addColorStop(0.5, `rgba(180, 180, 195, ${a * 0.3})`);
    grad.addColorStop(1, `rgba(160, 160, 175, 0)`);
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.radius * scale, 0, Math.PI * 2);
    ctx.fill();
  }
}
