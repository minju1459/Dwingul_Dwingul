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
  radius: number, // 왁뿌 반경(균열이 이 범위 밖으로 넘어가지 않게 클리핑)
) {
  const branches = 2 + stage; // 3 ~ 7
  const baseLen = 18 + stage * 14;

  for (let i = 0; i < branches; i++) {
    const angle = Math.random() * Math.PI * 2;
    const line = growCrack(origin, angle, baseLen + Math.random() * 30, radius, stage);
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
    // 두께를 키워서 갭 사이로 안쪽 색이 면적으로 보이게 함
    width: 2.2 + Math.random() * (1.4 + stage * 0.8),
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
 * 균열을 두 겹으로 그려서 "갈라진 틈으로 안쪽 색이 새어 나오는" 효과.
 * 1) 어두운 그림자(균열 깊이감)
 * 2) 그 위에 살짝 가는 innerColor 라인 (슬라임이 비치는 갭)
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

  // 1) 외곽 그림자 — 갈라진 틈의 깊이감
  ctx.strokeStyle = "rgba(0,0,0,0.7)";
  for (const l of field.lines) {
    const cut = Math.max(2, Math.floor(l.points.length * l.reveal));
    ctx.lineWidth = l.width + 1.6;
    ctx.beginPath();
    for (let i = 0; i < cut; i++) {
      const p = l.points[i];
      if (i === 0) ctx.moveTo(p.x, p.y);
      else ctx.lineTo(p.x, p.y);
    }
    ctx.stroke();
  }

  // 2) 안쪽 색이 갈라진 갭의 면적으로 새어 나옴 — 두께를 키워서 면처럼 보이게
  ctx.strokeStyle = innerColor;
  for (const l of field.lines) {
    const cut = Math.max(2, Math.floor(l.points.length * l.reveal));
    ctx.lineWidth = Math.max(1.2, l.width - 0.6);
    ctx.beginPath();
    for (let i = 0; i < cut; i++) {
      const p = l.points[i];
      if (i === 0) ctx.moveTo(p.x, p.y);
      else ctx.lineTo(p.x, p.y);
    }
    ctx.stroke();
  }

  // 3) 균열 끝에서 안쪽 색의 부드러운 spec light — 갭에서 빛이 새는 느낌
  ctx.globalCompositeOperation = "lighter";
  ctx.strokeStyle = withAlpha(innerColor, 0.45);
  for (const l of field.lines) {
    const cut = Math.max(2, Math.floor(l.points.length * l.reveal));
    ctx.lineWidth = Math.max(0.6, l.width * 0.4);
    ctx.beginPath();
    for (let i = 0; i < cut; i++) {
      const p = l.points[i];
      if (i === 0) ctx.moveTo(p.x, p.y);
      else ctx.lineTo(p.x, p.y);
    }
    ctx.stroke();
  }
  ctx.globalCompositeOperation = "source-over";

  ctx.restore();
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
