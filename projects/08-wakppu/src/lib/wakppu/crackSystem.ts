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
) {
  // 매번 더 많은 가닥으로 잘게 쪼개진 파편 패턴을 만듦
  const branches = 4 + stage * 2; // 6 ~ 14
  const baseLen = 14 + stage * 10;

  for (let i = 0; i < branches; i++) {
    const angle = Math.random() * Math.PI * 2;
    const line = growCrack(origin, angle, baseLen + Math.random() * 26, radius, stage);
    field.lines.push(line);
  }
}

function growCrack(
  start: Vec2,
  angle0: number,
  maxLen: number,
  radius: number,
  stage: number,
): CrackLine {
  const points: Vec2[] = [{ ...start }];
  const step = 5 + Math.random() * 3;
  let angle = angle0;
  const angleNoise = 0.18 + stage * 0.04; // 더 험한 균열
  let len = 0;
  let x = start.x;
  let y = start.y;
  while (len < maxLen) {
    angle += (Math.random() - 0.5) * angleNoise;
    x += Math.cos(angle) * step;
    y += Math.sin(angle) * step;
    // 클리핑: 반경 밖으로 나가면 중단
    if (Math.hypot(x, y) > radius * 0.92) break;
    points.push({ x, y });
    len += step;
  }
  return {
    points,
    // 더 두꺼운 갭으로 파편 사이에 안쪽 색이 면적으로 보이게
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
 * "갈라진 진짜 균열" 처럼 보이게 4겹으로 그림.
 * 1) 균열 옆 음영 — 살짝 넓고 흐릿한 어두운 띠 (깨진 표면의 그림자)
 * 2) 갈라진 갭의 안쪽 그림자 — 좁고 진한 어두움 (깊이감)
 * 3) 안쪽 색이 면적으로 새어 나옴 — innerColor 채움
 * 4) 갭의 중앙 빛 — innerColor 살짝 밝게 (빛이 새는 느낌)
 */
export function drawCracks(
  ctx: CanvasRenderingContext2D,
  field: CrackField,
  cx: number,
  cy: number,
  innerColor: string,
) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  // 1) 외곽 살짝 흐릿한 음영 (깨진 표면이 살짝 떠 보이는 효과)
  ctx.save();
  ctx.shadowColor = "rgba(0,0,0,0.55)";
  ctx.shadowBlur = 4;
  ctx.strokeStyle = "rgba(0,0,0,0.35)";
  for (const l of field.lines) {
    const cut = Math.max(2, Math.floor(l.points.length * l.reveal));
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

  // 2) 갭의 진한 그림자 (깊이)
  ctx.strokeStyle = "rgba(0,0,0,0.85)";
  for (const l of field.lines) {
    const cut = Math.max(2, Math.floor(l.points.length * l.reveal));
    ctx.lineWidth = l.width + 0.8;
    ctx.beginPath();
    for (let i = 0; i < cut; i++) {
      const p = l.points[i];
      if (i === 0) ctx.moveTo(p.x, p.y);
      else ctx.lineTo(p.x, p.y);
    }
    ctx.stroke();
  }

  // 3) 갭 면적 — segment 마다 색이 다름. 한 줄로 그리지 않고 segment 별로
  //    검정 음영 / 안쪽 색 / 두 색의 혼합 을 결정적(seed) 으로 흩뿌려
  //    "단일색 stroke" 가 아니라 진짜 깨진 갭처럼 색이 듬성듬성 보임.
  const mixWithBlack = mixHex(innerColor, "#0c0a0a", 0.55);
  for (const l of field.lines) {
    const cut = Math.max(2, Math.floor(l.points.length * l.reveal));
    ctx.lineWidth = Math.max(1.6, l.width * 0.85);
    for (let i = 1; i < cut; i++) {
      const a = l.points[i - 1];
      const b = l.points[i];
      const h = hash01(l.seed, i);
      let color: string;
      if (h < 0.35) color = innerColor;
      else if (h < 0.65) color = mixWithBlack;
      else color = "rgba(18,14,14,0.85)";
      ctx.strokeStyle = color;
      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(b.x, b.y);
      ctx.stroke();
    }
  }

  // 4) 갭 중앙의 빛 — 안 색을 밝게 띄운 highlight, 가끔만 (segment 의 30%).
  //    이게 빛이 새어 나오는 인상을 만듦.
  ctx.globalCompositeOperation = "lighter";
  const litColor = withAlpha(lightenColor(innerColor, 0.55), 0.7);
  ctx.strokeStyle = litColor;
  for (const l of field.lines) {
    const cut = Math.max(2, Math.floor(l.points.length * l.reveal));
    ctx.lineWidth = Math.max(0.5, l.width * 0.3);
    for (let i = 1; i < cut; i++) {
      const h = hash01(l.seed + 999, i);
      if (h > 0.3) continue; // 30% 만 spec light
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
