/**
 * 균열 생성기.
 * - 클릭 위치에서 시작점 N 개를 잡고
 * - 각 시작점에서 짧은 segment 를 계속 뻗어나가며 가끔 분기
 * - 분기 확률, 길이, 각도 변동량은 단계가 올라갈수록 커짐
 *
 * Crack 한 가닥 = Vec2 점들의 polyline.
 */

export type Vec2 = { x: number; y: number };

export type CrackLine = {
  points: Vec2[];
  width: number;
  /** 0~1, 그릴 때 점진적으로 1까지 차오름. */
  reveal: number;
  /** segment 별 jitter seed. */
  seed: number;
};

export type CrackField = {
  /** 왁뿌 중심을 기준으로 한 로컬 좌표계 균열들. */
  lines: CrackLine[];
};

export function makeCrackField(): CrackField {
  return { lines: [] };
}

/**
 * (cx, cy) 위치에서 새 균열들을 발생시켜 field 에 추가.
 * stage 가 높을수록 더 많고 더 길게.
 */
export function spawnCrack(
  field: CrackField,
  origin: Vec2,
  stage: number,
  radius: number,
  innerRadius = 0,
) {
  const branches = 4 + stage * 2;
  const baseLen = 14 + stage * 10;

  for (let i = 0; i < branches; i++) {
    const angle = Math.random() * Math.PI * 2;
    const main = growCrack(
      origin,
      angle,
      baseLen + Math.random() * 26,
      radius,
      stage,
      innerRadius,
    );
    if (main.points.length < 2) continue;
    field.lines.push(main);

    // 진짜 fracture 처럼 메인 가닥에서 sub-branch 1~3 개 뻗어 나옴
    const subN = 1 + Math.floor(Math.random() * 3);
    for (let j = 0; j < subN; j++) {
      const idx = 1 + Math.floor(Math.random() * (main.points.length - 1));
      const base = main.points[idx];
      const subAngle = angle + (Math.random() < 0.5 ? -1 : 1) * (0.6 + Math.random() * 0.8);
      const subLen = (baseLen * 0.4) + Math.random() * (baseLen * 0.5);
      const sub = growCrack(base, subAngle, subLen, radius, stage, innerRadius);
      if (sub.points.length >= 2) {
        sub.width = main.width * (0.5 + Math.random() * 0.25);
        field.lines.push(sub);
      }
    }
  }
}

function growCrack(
  start: Vec2,
  angle0: number,
  maxLen: number,
  radius: number,
  stage: number,
  innerRadius = 0,
): CrackLine {
  const points: Vec2[] = [{ ...start }];
  const step = 5 + Math.random() * 3;
  let angle = angle0;
  const angleNoise = 0.18 + stage * 0.04;
  let len = 0;
  let x = start.x;
  let y = start.y;
  while (len < maxLen) {
    angle += (Math.random() - 0.5) * angleNoise;
    x += Math.cos(angle) * step;
    y += Math.sin(angle) * step;
    const d = Math.hypot(x, y);
    // 도넛 가운데 구멍 안으로는 균열 자라지 않음
    if (innerRadius > 0 && d < innerRadius) break;
    if (d > radius * 0.92) break;
    points.push({ x, y });
    len += step;
  }
  return {
    points,
    width: 3 + Math.random() * (2 + stage * 1.0),
    reveal: 0,
    seed: Math.random() * 1000,
  };
}

/**
 * field 의 모든 라인 reveal 을 1 로 보간 + 분기 라인 추가.
 */
export function updateCrackField(field: CrackField, dt: number) {
  const dts = dt / 1000;
  for (const l of field.lines) {
    if (l.reveal < 1) l.reveal = Math.min(1, l.reveal + dts * 6);
  }
}

/**
 * "갈라진 진짜 균열" — 안 색 ⨯ 겉 색을 섞은 톤으로만 그림. 검정 ✕.
 * 1) 외곽 음영 — 안+겉 mix 의 어두운 버전 (깊이감, 검정 대신)
 * 2) 갭 면적 — segment 별로 안 색 / 겉 색 / 두 색 mix 를 결정적으로 분배
 * 3) 갭 중앙 빛 — 안 색의 밝은 버전 (빛이 새는 느낌)
 */
export function drawCracks(
  ctx: CanvasRenderingContext2D,
  field: CrackField,
  cx: number,
  cy: number,
  innerColor: string,
  outerColor: string,
) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  const blend = mixHex(innerColor, outerColor, 0.5);
  // 두 색의 어두운 버전 — 검정 대신 사용해서 색감 유지
  const blendShadow = darkenHex(blend, 0.45);

  // 1) 외곽 음영 (검정 대신 색상톤 그림자)
  ctx.save();
  ctx.shadowColor = withAlpha(blendShadow, 0.55);
  ctx.shadowBlur = 4;
  ctx.strokeStyle = withAlpha(blendShadow, 0.4);
  for (const l of field.lines) {
    const cut = Math.min(
      l.points.length,
      Math.max(2, Math.floor(l.points.length * l.reveal)),
    );
    ctx.lineWidth = l.width + 3;
    ctx.beginPath();
    for (let i = 0; i < cut; i++) {
      const p = l.points[i];
      if (i === 0) ctx.moveTo(p.x, p.y);
      else ctx.lineTo(p.x, p.y);
    }
    ctx.stroke();
  }
  ctx.restore();

  // 2) 갭 면적 — segment 별로 색 분배 (안 색 40 / 겉 색 30 / mix 30).
  //    매 segment 마다 색이 바뀌어 자연스럽게 두 색이 어우러진 갭이 됨.
  for (const l of field.lines) {
    const cut = Math.min(
      l.points.length,
      Math.max(2, Math.floor(l.points.length * l.reveal)),
    );
    ctx.lineWidth = Math.max(1.8, l.width * 0.92);
    for (let i = 1; i < cut; i++) {
      const a = l.points[i - 1];
      const b = l.points[i];
      const h = hash01(l.seed, i);
      let color: string;
      if (h < 0.4) color = innerColor;
      else if (h < 0.7) color = blend;
      else color = outerColor;
      ctx.strokeStyle = color;
      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(b.x, b.y);
      ctx.stroke();
    }
  }

  // 3) 갭 중앙 빛 — 안 색의 밝은 버전, segment 30% 만 spec light.
  ctx.globalCompositeOperation = "lighter";
  ctx.strokeStyle = withAlpha(lightenColor(innerColor, 0.55), 0.65);
  for (const l of field.lines) {
    const cut = Math.min(
      l.points.length,
      Math.max(2, Math.floor(l.points.length * l.reveal)),
    );
    ctx.lineWidth = Math.max(0.5, l.width * 0.3);
    for (let i = 1; i < cut; i++) {
      const h = hash01(l.seed + 999, i);
      if (h > 0.3) continue;
      const a = l.points[i - 1];
      const b = l.points[i];
      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(b.x, b.y);
      ctx.stroke();
    }
  }
  ctx.globalCompositeOperation = "source-over";

  ctx.restore();
}

function darkenHex(hex: string, amount: number): string {
  const { r, g, b } = parseHex(hex);
  const f = (c: number) => Math.max(0, Math.round(c * (1 - amount)));
  const hx = (n: number) => n.toString(16).padStart(2, "0");
  return `#${hx(f(r))}${hx(f(g))}${hx(f(b))}`;
}

/** 결정적 PRNG — seed 와 idx 가 같으면 매 프레임 같은 값. */
function hash01(seed: number, idx: number): number {
  const x = Math.sin((seed + 1) * 12.9898 + idx * 78.233) * 43758.5453;
  return x - Math.floor(x);
}

function mixHex(a: string, b: string, t: number): string {
  const pa = parseHex(a);
  const pb = parseHex(b);
  const r = Math.round(pa.r + (pb.r - pa.r) * t);
  const g = Math.round(pa.g + (pb.g - pa.g) * t);
  const bl = Math.round(pa.b + (pb.b - pa.b) * t);
  const hx = (n: number) => n.toString(16).padStart(2, "0");
  return `#${hx(r)}${hx(g)}${hx(bl)}`;
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

function lightenColor(hex: string, amount: number): string {
  const h = hex.replace("#", "");
  const v = h.length === 3 ? h.split("").map((c) => c + c).join("") : h;
  const r = parseInt(v.slice(0, 2), 16);
  const g = parseInt(v.slice(2, 4), 16);
  const b = parseInt(v.slice(4, 6), 16);
  const f = (c: number) => Math.min(255, Math.round(c + (255 - c) * amount));
  const hx = (n: number) => n.toString(16).padStart(2, "0");
  return `#${hx(f(r))}${hx(f(g))}${hx(f(b))}`;
}

function withAlpha(hex: string, a: number): string {
  const h = hex.replace("#", "");
  const v = h.length === 3 ? h.split("").map((c) => c + c).join("") : h;
  const r = parseInt(v.slice(0, 2), 16);
  const g = parseInt(v.slice(2, 4), 16);
  const b = parseInt(v.slice(4, 6), 16);
  return `rgba(${r},${g},${b},${a})`;
}

export function clearField(field: CrackField) {
  field.lines.length = 0;
}
