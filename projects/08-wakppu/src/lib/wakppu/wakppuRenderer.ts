/**
 * 왁뿌 본체(겉면)와 내부 슬라임을 Canvas 2D 로 그린다.
 *
 * 좌표계는 캔버스 중앙(cx, cy) 기준이고 반경 R 안에서 그림.
 * 그리기 전에 ctx.save()/translate(cx, cy) 로 들어왔다 나가는 패턴.
 */

import type { WakppuShell, DonutShell, SolidShell } from "./types";
import { withAlpha } from "./variants";

export type RenderTransform = {
  /** 클릭마다 살짝 짓눌리는 squash(가로 scale, 세로 scale). */
  squashX: number;
  squashY: number;
  /** 슬라임이 살짝 출렁이는 위상. */
  slimePhase: number;
};

/**
 * 겉면 본체 그리기. 부서진 범위(brokenFraction 0~1) 만큼 겉면이 점점 사라짐 (alpha + radius).
 */
export function drawShell(
  ctx: CanvasRenderingContext2D,
  shell: WakppuShell,
  R: number,
  brokenFraction: number,
  transform: RenderTransform,
) {
  ctx.save();
  ctx.scale(transform.squashX, transform.squashY);

  if (shell.kind === "donut") {
    drawDonutShell(ctx, shell, R, brokenFraction);
  } else {
    drawSolidShell(ctx, shell, R, brokenFraction);
  }

  ctx.restore();
}

function drawSolidShell(
  ctx: CanvasRenderingContext2D,
  shell: SolidShell,
  R: number,
  broken: number,
) {
  const alpha = 1 - broken * 0.95;
  if (alpha <= 0.02) return;

  // 본체 색
  const grad = ctx.createRadialGradient(-R * 0.3, -R * 0.3, R * 0.1, 0, 0, R);
  grad.addColorStop(0, lighten(shell.outerColor, 0.35));
  grad.addColorStop(0.45, shell.outerColor);
  grad.addColorStop(1, darken(shell.outerColor, 0.35));
  ctx.globalAlpha = alpha;
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(0, 0, R, 0, Math.PI * 2);
  ctx.fill();

  // 유광 highlight (왼쪽 위)
  ctx.fillStyle = `rgba(255,255,255,${0.45 * alpha})`;
  ctx.beginPath();
  ctx.ellipse(-R * 0.35, -R * 0.4, R * 0.32, R * 0.18, -0.5, 0, Math.PI * 2);
  ctx.fill();

  // 보조 highlight
  ctx.fillStyle = `rgba(255,255,255,${0.18 * alpha})`;
  ctx.beginPath();
  ctx.ellipse(R * 0.25, R * 0.35, R * 0.22, R * 0.09, 0.3, 0, Math.PI * 2);
  ctx.fill();

  // 어두운 외곽 라인
  ctx.strokeStyle = `rgba(0,0,0,${0.18 * alpha})`;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(0, 0, R, 0, Math.PI * 2);
  ctx.stroke();

  ctx.globalAlpha = 1;
}

function drawDonutShell(
  ctx: CanvasRenderingContext2D,
  shell: DonutShell,
  R: number,
  broken: number,
) {
  const alpha = 1 - broken * 0.95;
  if (alpha <= 0.02) return;
  const inner = R * 0.2; // 도넛 가운데 구멍 — 더 작게 해서 부서지는 면적 ↑

  // 1. 도넛 본체(안쪽 무지개 그라데이션)
  ctx.save();
  // donut 경로(annulus): 큰 원 - 작은 원 = ring
  ctx.beginPath();
  ctx.arc(0, 0, R, 0, Math.PI * 2);
  ctx.arc(0, 0, inner, 0, Math.PI * 2, true);
  ctx.closePath();
  ctx.clip();

  const g = ctx.createLinearGradient(-R, -R, R, R);
  const cs = shell.innerColors;
  cs.forEach((c, i) => g.addColorStop(i / (cs.length - 1 || 1), c));
  ctx.globalAlpha = alpha;
  ctx.fillStyle = g;
  ctx.fillRect(-R, -R, R * 2, R * 2);
  ctx.restore();

  // 2. 하얀 막(왁스 코팅) — broken 만큼 깎임.
  // 알파를 낮춰 안쪽 무지개가 더 잘 비치게 함.
  const glazeAlpha = Math.max(0, 1 - broken * 1.2);
  if (glazeAlpha > 0.02) {
    ctx.save();
    ctx.beginPath();
    ctx.arc(0, 0, R * 0.96, 0, Math.PI * 2);
    ctx.arc(0, 0, inner * 1.05, 0, Math.PI * 2, true);
    ctx.closePath();
    ctx.clip();
    const gg = ctx.createRadialGradient(-R * 0.2, -R * 0.3, R * 0.1, 0, 0, R);
    gg.addColorStop(0, withAlpha(shell.glaze, 0.7 * glazeAlpha));
    gg.addColorStop(1, withAlpha(shell.glaze, 0.4 * glazeAlpha));
    ctx.fillStyle = gg;
    ctx.fillRect(-R, -R, R * 2, R * 2);
    ctx.restore();
  }

  // 3. 스프링클 (코팅 위)
  const sprinkleAlpha = glazeAlpha;
  if (sprinkleAlpha > 0.05) {
    ctx.save();
    // 결정적 위치 (왁뿌 마다 동일 패턴 — 매번 흔들리지 않도록 임의 hash 좌표)
    const SP = SPRINKLE_PATTERN;
    for (let i = 0; i < SP.length; i++) {
      const [u, v, rot, l] = SP[i];
      const x = (u - 0.5) * R * 1.6;
      const y = (v - 0.5) * R * 1.6;
      const r2 = Math.hypot(x, y);
      if (r2 > R * 0.93 || r2 < inner * 1.15) continue;
      const color = shell.sprinkles[i % shell.sprinkles.length];
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(rot);
      ctx.globalAlpha = sprinkleAlpha;
      ctx.fillStyle = color;
      ctx.fillRect(-l / 2, -1.4, l, 2.8);
      ctx.restore();
    }
    ctx.restore();
  }

  // 4. 글로벌 highlight + 외곽 라인
  ctx.globalAlpha = alpha;
  ctx.fillStyle = `rgba(255,255,255,${0.32 * alpha})`;
  ctx.beginPath();
  ctx.ellipse(-R * 0.4, -R * 0.5, R * 0.3, R * 0.14, -0.6, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = `rgba(0,0,0,${0.18 * alpha})`;
  ctx.lineWidth = 1.4;
  ctx.beginPath();
  ctx.arc(0, 0, R, 0, Math.PI * 2);
  ctx.stroke();
  ctx.strokeStyle = `rgba(0,0,0,${0.16 * alpha})`;
  ctx.beginPath();
  ctx.arc(0, 0, inner, 0, Math.PI * 2);
  ctx.stroke();

  ctx.globalAlpha = 1;
}

// 도넛 스프링클의 결정적 좌표(매번 같은 위치 — 흔들리면 어색해짐)
// [u, v, rot, length]
const SPRINKLE_PATTERN: Array<[number, number, number, number]> = (() => {
  const arr: Array<[number, number, number, number]> = [];
  // 균등 분포 흉내
  let s = 12345;
  const rng = () => {
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    return s / 0x7fffffff;
  };
  for (let i = 0; i < 80; i++) {
    arr.push([rng(), rng(), rng() * Math.PI, 5 + rng() * 4]);
  }
  return arr;
})();

/**
 * 내부 슬라임. 도넛이면 도넛 내부 ring 영역, solid 면 원판.
 * exposure 0~1 — 노출량.
 */
export function drawSlime(
  ctx: CanvasRenderingContext2D,
  shell: WakppuShell,
  R: number,
  exposure: number,
  transform: RenderTransform,
  dragOffset: { x: number; y: number } | null,
) {
  if (exposure <= 0.001) return;
  ctx.save();
  ctx.scale(transform.squashX, transform.squashY);

  const baseColor = shell.kind === "donut" ? shell.innerColors[0] : shell.innerColor;
  const inner = shell.kind === "donut" ? R * 0.2 : 0;

  // 슬라임 영역 클립
  ctx.save();
  ctx.beginPath();
  // 출렁이는 외곽 (사인 오프셋)
  const segs = 64;
  for (let i = 0; i <= segs; i++) {
    const t = (i / segs) * Math.PI * 2;
    const wobble =
      Math.sin(t * 3 + transform.slimePhase) * 1.6 +
      Math.sin(t * 5 + transform.slimePhase * 1.3) * 1.0;
    const rr = R * 0.92 + wobble;
    let x = Math.cos(t) * rr;
    let y = Math.sin(t) * rr;
    // 드래그 변형: 가장 가까운 각도에서 늘림
    if (dragOffset) {
      const a = Math.atan2(dragOffset.y, dragOffset.x);
      const da = Math.abs(angleDiff(t, a));
      const pull = Math.max(0, 1 - da / 0.9);
      x += dragOffset.x * pull * 0.5;
      y += dragOffset.y * pull * 0.5;
    }
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
  if (inner > 0) {
    ctx.moveTo(inner, 0);
    ctx.arc(0, 0, inner, 0, Math.PI * 2, true);
  }
  ctx.clip();

  // 슬라임 본체
  ctx.globalAlpha = exposure;
  const gg = ctx.createRadialGradient(-R * 0.25, -R * 0.25, R * 0.1, 0, 0, R);
  gg.addColorStop(0, lighten(baseColor, 0.3));
  gg.addColorStop(0.7, baseColor);
  gg.addColorStop(1, darken(baseColor, 0.15));
  ctx.fillStyle = gg;
  ctx.fillRect(-R, -R, R * 2, R * 2);

  // 윤기(빛 점)
  ctx.fillStyle = `rgba(255,255,255,${0.6 * exposure})`;
  ctx.beginPath();
  ctx.ellipse(-R * 0.3, -R * 0.35, R * 0.18, R * 0.08, -0.55, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = `rgba(255,255,255,${0.3 * exposure})`;
  ctx.beginPath();
  ctx.ellipse(R * 0.18, R * 0.25, R * 0.13, R * 0.05, 0.4, 0, Math.PI * 2);
  ctx.fill();

  // 은은한 발광 (완파 직후)
  ctx.globalCompositeOperation = "lighter";
  const glow = ctx.createRadialGradient(0, 0, 0, 0, 0, R * 1.1);
  glow.addColorStop(0, withAlpha(baseColor, 0.25 * exposure));
  glow.addColorStop(1, withAlpha(baseColor, 0));
  ctx.fillStyle = glow;
  ctx.fillRect(-R, -R, R * 2, R * 2);

  ctx.restore();

  ctx.restore();
}

function angleDiff(a: number, b: number) {
  let d = (a - b) % (Math.PI * 2);
  if (d > Math.PI) d -= Math.PI * 2;
  if (d < -Math.PI) d += Math.PI * 2;
  return d;
}

export function lighten(hex: string, amount: number): string {
  return mix(hex, "#ffffff", amount);
}

export function darken(hex: string, amount: number): string {
  return mix(hex, "#000000", amount);
}

function mix(a: string, b: string, t: number): string {
  const ar = parseHex(a);
  const br = parseHex(b);
  const r = Math.round(ar.r + (br.r - ar.r) * t);
  const g = Math.round(ar.g + (br.g - ar.g) * t);
  const bl = Math.round(ar.b + (br.b - ar.b) * t);
  const h = (n: number) => n.toString(16).padStart(2, "0");
  return `#${h(r)}${h(g)}${h(bl)}`;
}

function parseHex(hex: string) {
  const h = hex.replace("#", "");
  const v = h.length === 3 ? h.split("").map((c) => c + c).join("") : h;
  return {
    r: parseInt(v.slice(0, 2), 16),
    g: parseInt(v.slice(2, 4), 16),
    b: parseInt(v.slice(4, 6), 16),
  };
}
