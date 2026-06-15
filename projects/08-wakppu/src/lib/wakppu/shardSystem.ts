/**
 * 깨질 때 튀는 왁스 파편 + 작은 먼지 파티클.
 */

export type Shard = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  rot: number;
  vrot: number;
  size: number;
  color: string;
  /** ms */
  life: number;
  maxLife: number;
  /** 폴리곤 꼭짓점 (로컬). */
  poly: Array<{ x: number; y: number }>;
};

export type Dust = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  alpha: number;
  life: number;
  maxLife: number;
};

export type ShardField = {
  shards: Shard[];
  dust: Dust[];
};

export function makeShardField(): ShardField {
  return { shards: [], dust: [] };
}

export function spawnShards(
  field: ShardField,
  origin: { x: number; y: number },
  count: number,
  colors: string[],
  power = 1,
) {
  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = (2 + Math.random() * 6) * power;
    const size = 5 + Math.random() * 10;
    field.shards.push({
      x: origin.x,
      y: origin.y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 1.5,
      rot: Math.random() * Math.PI * 2,
      vrot: (Math.random() - 0.5) * 0.45,
      size,
      color: colors[Math.floor(Math.random() * colors.length)],
      life: 0,
      maxLife: 900 + Math.random() * 700,
      poly: makePolygon(size),
    });
  }
}

export function spawnDust(
  field: ShardField,
  origin: { x: number; y: number },
  count: number,
) {
  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = 0.3 + Math.random() * 1.8;
    field.dust.push({
      x: origin.x,
      y: origin.y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 0.4,
      radius: 1.2 + Math.random() * 2.2,
      alpha: 0.5 + Math.random() * 0.3,
      life: 0,
      maxLife: 500 + Math.random() * 400,
    });
  }
}

function makePolygon(size: number) {
  const sides = 3 + Math.floor(Math.random() * 3);
  const pts: Array<{ x: number; y: number }> = [];
  for (let i = 0; i < sides; i++) {
    const ang = (i / sides) * Math.PI * 2 + Math.random() * 0.5;
    const r = size * (0.6 + Math.random() * 0.5);
    pts.push({ x: Math.cos(ang) * r, y: Math.sin(ang) * r });
  }
  return pts;
}

export function updateShardField(field: ShardField, dt: number) {
  const dts = dt / 16.67;
  for (let i = field.shards.length - 1; i >= 0; i--) {
    const s = field.shards[i];
    s.vy += 0.42 * dts; // 중력
    s.vx *= 0.985;
    s.x += s.vx * dts;
    s.y += s.vy * dts;
    s.rot += s.vrot * dts;
    s.life += dt;
    if (s.life >= s.maxLife) field.shards.splice(i, 1);
  }
  for (let i = field.dust.length - 1; i >= 0; i--) {
    const d = field.dust[i];
    d.vy += 0.08 * dts;
    d.x += d.vx * dts;
    d.y += d.vy * dts;
    d.radius += 0.04 * dts;
    d.life += dt;
    if (d.life >= d.maxLife) field.dust.splice(i, 1);
  }
}

export function drawShards(
  ctx: CanvasRenderingContext2D,
  field: ShardField,
  cx: number,
  cy: number,
) {
  ctx.save();
  ctx.translate(cx, cy);
  for (const s of field.shards) {
    const t = s.life / s.maxLife;
    const alpha = t > 0.7 ? 1 - (t - 0.7) / 0.3 : 1;
    ctx.save();
    ctx.translate(s.x, s.y);
    ctx.rotate(s.rot);
    ctx.globalAlpha = alpha;

    // 1) 본체 채움
    ctx.fillStyle = s.color;
    ctx.beginPath();
    s.poly.forEach((p, i) => (i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y)));
    ctx.closePath();
    ctx.fill();

    // 2) 폴리곤 안에 광원 그라데이션 — 위 밝고 아래 어둡게 (입체감)
    ctx.save();
    ctx.clip();
    const grad = ctx.createLinearGradient(0, -s.size, 0, s.size);
    grad.addColorStop(0, "rgba(255,255,255,0.45)");
    grad.addColorStop(0.45, "rgba(255,255,255,0)");
    grad.addColorStop(1, "rgba(0,0,0,0.32)");
    ctx.fillStyle = grad;
    ctx.fillRect(-s.size * 1.2, -s.size * 1.2, s.size * 2.4, s.size * 2.4);
    ctx.restore();

    // 3) 외곽선 — 약간 두껍게 어둡게 (깨진 면의 윤곽)
    ctx.strokeStyle = "rgba(0,0,0,0.32)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    s.poly.forEach((p, i) => (i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y)));
    ctx.closePath();
    ctx.stroke();

    ctx.restore();
  }
  ctx.globalAlpha = 1;
  for (const d of field.dust) {
    const t = d.life / d.maxLife;
    const a = d.alpha * (1 - t);
    ctx.beginPath();
    ctx.fillStyle = `rgba(220,220,225,${a})`;
    ctx.arc(d.x, d.y, d.radius, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

export function clearShards(field: ShardField) {
  field.shards.length = 0;
  field.dust.length = 0;
}
