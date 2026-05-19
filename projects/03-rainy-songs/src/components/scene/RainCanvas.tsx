"use client";

import { useEffect, useRef } from "react";

type RainCanvasProps = {
  onHit: (x: number, y: number) => void;
  onMiss: (x: number, y: number) => void;
};

type Drop = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  thickness: number;
  alpha: number;
  jitter: number[];
};

type Splash = {
  x: number;
  y: number;
  age: number;
  life: number;
  particles: { angle: number; speed: number; length: number }[];
};

type GrassTuft = {
  x: number;
  height: number;
  tilt: number;
};

const DROP_COUNT = 110;
const GROUND_RATIO = 0.92;
const GRAVITY = 0.18;
const HIT_RADIUS = 26;

function rand(min: number, max: number) {
  return min + Math.random() * (max - min);
}

function makeJitter(): number[] {
  return Array.from({ length: 8 }, () => rand(-1.4, 1.4));
}

function makeDrop(w: number, h: number, freshTop = false): Drop {
  const size = rand(8, 18);
  return {
    x: rand(-w * 0.1, w * 1.1),
    y: freshTop ? rand(-h * 0.5, -20) : rand(-h * 0.5, h * GROUND_RATIO - 10),
    vx: rand(-1.3, -0.45),
    vy: rand(3.6, 6.4),
    size,
    thickness: rand(1.0, 1.6),
    alpha: rand(0.55, 0.95),
    jitter: makeJitter(),
  };
}

function makeSplash(x: number, y: number, big = false): Splash {
  const count = big ? 16 : 6;
  const particles = Array.from({ length: count }, () => ({
    angle: rand(-Math.PI * 0.85, -Math.PI * 0.15),
    speed: rand(big ? 2.2 : 1.4, big ? 4.8 : 2.8),
    length: rand(big ? 6 : 3, big ? 14 : 7),
  }));
  return { x, y, age: 0, life: big ? 32 : 22, particles };
}

function generateGrass(width: number, count: number, seed: number): GrassTuft[] {
  const tufts: GrassTuft[] = [];
  let s = seed;
  const random = () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
  for (let i = 0; i < count; i++) {
    tufts.push({
      x: random() * width,
      height: 6 + random() * 12,
      tilt: (random() - 0.5) * 0.8,
    });
  }
  return tufts;
}

function drawTeardrop(ctx: CanvasRenderingContext2D, d: Drop) {
  const motionAngle = Math.atan2(d.vy, d.vx);
  const rotation = motionAngle - Math.PI / 2;
  const w = d.size * 0.42;
  const h = d.size;
  const j = d.jitter;

  ctx.save();
  ctx.translate(d.x, d.y);
  ctx.rotate(rotation);
  ctx.globalAlpha = d.alpha;
  ctx.lineWidth = d.thickness;
  ctx.lineJoin = "round";
  ctx.lineCap = "round";

  ctx.beginPath();
  ctx.moveTo(0, -h * 0.55);
  ctx.bezierCurveTo(
    w + j[0] * 0.5, -h * 0.18 + j[1] * 0.4,
    w + j[2] * 0.5, h * 0.28 + j[3] * 0.4,
    0 + j[4] * 0.3, h * 0.45 + j[5] * 0.3
  );
  ctx.bezierCurveTo(
    -w + j[6] * 0.5, h * 0.28 + j[7] * 0.4,
    -w + j[0] * 0.5, -h * 0.18 + j[1] * 0.4,
    0, -h * 0.55
  );
  ctx.stroke();
  ctx.restore();
}

export function RainCanvas({ onHit, onMiss }: RainCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const onHitRef = useRef(onHit);
  const onMissRef = useRef(onMiss);

  useEffect(() => {
    onHitRef.current = onHit;
    onMissRef.current = onMiss;
  }, [onHit, onMiss]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let dpr = window.devicePixelRatio || 1;
    let width = window.innerWidth;
    let height = window.innerHeight;
    let groundY = height * GROUND_RATIO;
    let grass: GrassTuft[] = generateGrass(width, 80, 1234);

    const resize = () => {
      dpr = window.devicePixelRatio || 1;
      width = window.innerWidth;
      height = window.innerHeight;
      groundY = height * GROUND_RATIO;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      grass = generateGrass(width, Math.floor(width / 14), 1234);
    };
    resize();
    window.addEventListener("resize", resize);

    const drops: Drop[] = Array.from({ length: DROP_COUNT }, () =>
      makeDrop(width, height)
    );
    const splashes: Splash[] = [];

    const handleClick = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const cx = e.clientX - rect.left;
      const cy = e.clientY - rect.top;

      // 가장 가까운 빗방울 (반경 안에 있을 때만 잡힘)
      let hitIndex = -1;
      let minDist = HIT_RADIUS * HIT_RADIUS;
      for (let i = 0; i < drops.length; i++) {
        const d = drops[i];
        const dx = cx - d.x;
        const dy = cy - d.y;
        const distSq = dx * dx + dy * dy;
        if (distSq < minDist) {
          minDist = distSq;
          hitIndex = i;
        }
      }

      if (hitIndex >= 0) {
        const hitDrop = drops[hitIndex];
        splashes.push(makeSplash(hitDrop.x, hitDrop.y, true));
        Object.assign(hitDrop, makeDrop(width, height, true));
        onHitRef.current(cx, cy);
      } else {
        splashes.push(makeSplash(cx, cy, false));
        onMissRef.current(cx, cy);
      }
    };
    canvas.addEventListener("click", handleClick);

    let raf = 0;

    const drawGround = () => {
      ctx.save();
      ctx.strokeStyle = "rgba(244, 244, 238, 0.85)";
      ctx.lineWidth = 1.4;
      ctx.lineCap = "round";
      ctx.beginPath();
      for (let x = -10; x <= width + 10; x += 6) {
        const wobble = Math.sin(x * 0.08) * 0.6 + Math.sin(x * 0.31) * 0.4;
        const y = groundY + wobble;
        if (x === -10) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      ctx.lineWidth = 1.1;
      grass.forEach((t) => {
        const baseY = groundY;
        ctx.beginPath();
        ctx.moveTo(t.x, baseY);
        ctx.lineTo(t.x + t.tilt * t.height * 0.4, baseY - t.height);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(t.x - 3, baseY);
        ctx.lineTo(t.x - 3 + t.tilt * t.height * 0.3, baseY - t.height * 0.7);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(t.x + 3, baseY);
        ctx.lineTo(t.x + 3 + t.tilt * t.height * 0.35, baseY - t.height * 0.8);
        ctx.stroke();
      });
      ctx.restore();
    };

    const drawDrops = () => {
      ctx.save();
      ctx.strokeStyle = "rgba(244, 244, 238, 1)";
      for (const d of drops) drawTeardrop(ctx, d);
      ctx.restore();
    };

    const drawSplashes = () => {
      ctx.save();
      ctx.strokeStyle = "rgba(244, 244, 238, 0.95)";
      ctx.lineCap = "round";
      for (const s of splashes) {
        const t = s.age / s.life;
        ctx.globalAlpha = Math.max(0, 1 - t) * 0.9;
        ctx.lineWidth = 1.1;
        for (const p of s.particles) {
          const dist = p.speed * s.age * (1 - t * 0.4);
          const px = s.x + Math.cos(p.angle) * dist;
          const py = s.y + Math.sin(p.angle) * dist + s.age * 0.1;
          const px2 = px - Math.cos(p.angle) * p.length;
          const py2 = py - Math.sin(p.angle) * p.length;
          ctx.beginPath();
          ctx.moveTo(px, py);
          ctx.lineTo(px2, py2);
          ctx.stroke();
        }
      }
      ctx.restore();
    };

    const tick = () => {
      ctx.clearRect(0, 0, width, height);

      for (const d of drops) {
        d.vy += GRAVITY * 0.05;
        d.x += d.vx;
        d.y += d.vy;

        if (d.y > groundY) {
          splashes.push(makeSplash(d.x, groundY - 1, false));
          Object.assign(d, makeDrop(width, height, true));
        } else if (d.x < -60 || d.x > width + 60) {
          Object.assign(d, makeDrop(width, height, true));
        }
      }

      for (let i = splashes.length - 1; i >= 0; i--) {
        splashes[i].age += 1;
        if (splashes[i].age > splashes[i].life) splashes.splice(i, 1);
      }

      drawGround();
      drawDrops();
      drawSplashes();

      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      canvas.removeEventListener("click", handleClick);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed",
        inset: 0,
        display: "block",
        cursor: "pointer",
        zIndex: 1,
      }}
    />
  );
}
