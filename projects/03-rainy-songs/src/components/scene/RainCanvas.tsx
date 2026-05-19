"use client";

import { useEffect, useRef } from "react";

type RainCanvasProps = {
  onClickAnywhere: (x: number, y: number) => void;
};

type Drop = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  length: number;
  thickness: number;
  alpha: number;
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

const RAIN_ANGLE = -1.32; // 약 75도 (왼쪽으로 살짝 기울어 떨어짐)
const DROP_COUNT = 220;
const GROUND_RATIO = 0.92;

function rand(min: number, max: number) {
  return min + Math.random() * (max - min);
}

function makeDrop(w: number, h: number, freshTop = false): Drop {
  const speed = rand(9, 16);
  const length = rand(10, 22);
  return {
    x: rand(-w * 0.2, w * 1.2),
    y: freshTop ? rand(-h * 0.6, -10) : rand(-h, h * GROUND_RATIO - 4),
    vx: Math.cos(RAIN_ANGLE) * speed,
    vy: Math.sin(RAIN_ANGLE) * -speed,
    length,
    thickness: rand(0.7, 1.6),
    alpha: rand(0.45, 0.92),
  };
}

function makeSplash(x: number, y: number, big = false): Splash {
  const count = big ? 14 : 5;
  const particles = Array.from({ length: count }, () => ({
    angle: rand(-Math.PI * 0.85, -Math.PI * 0.15),
    speed: rand(big ? 2.2 : 1.4, big ? 4.5 : 2.8),
    length: rand(big ? 6 : 3, big ? 14 : 7),
  }));
  return {
    x,
    y,
    age: 0,
    life: big ? 32 : 22,
    particles,
  };
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

export function RainCanvas({ onClickAnywhere }: RainCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

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
      splashes.push(makeSplash(cx, cy, true));
      onClickAnywhere(cx, cy);
    };
    canvas.addEventListener("click", handleClick);

    let raf = 0;

    const drawGround = () => {
      ctx.save();
      ctx.strokeStyle = "rgba(244, 244, 238, 0.85)";
      ctx.lineWidth = 1.4;
      ctx.lineCap = "round";

      // 손그림 라인 (살짝 출렁이는 잉크 라인)
      ctx.beginPath();
      let prevY = groundY;
      for (let x = -10; x <= width + 10; x += 6) {
        const wobble = Math.sin(x * 0.08) * 0.6 + Math.sin(x * 0.31) * 0.4;
        const y = groundY + wobble;
        if (x === -10) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
        prevY = y;
      }
      ctx.stroke();

      // 잔디
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
      ctx.strokeStyle = "rgba(244, 244, 238, 0.85)";
      ctx.lineCap = "round";

      for (const d of drops) {
        ctx.globalAlpha = d.alpha;
        ctx.lineWidth = d.thickness;
        ctx.beginPath();
        // 살짝 휘어진 잉크 빗방울 (2단계 베지어 같은 약한 곡선)
        const x2 = d.x - d.vx * (d.length / 14);
        const y2 = d.y - d.vy * (d.length / 14);
        const midX = (d.x + x2) / 2 + (d.thickness - 1) * 0.5;
        const midY = (d.y + y2) / 2;
        ctx.moveTo(d.x, d.y);
        ctx.quadraticCurveTo(midX, midY, x2, y2);
        ctx.stroke();
      }
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
          const py = s.y + Math.sin(p.angle) * dist + s.age * 0.3 * s.age * 0.05;
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
      // 잔상 효과를 위한 살짝 투명한 배경
      ctx.fillStyle = "rgba(10, 10, 10, 0.32)";
      ctx.fillRect(0, 0, width, height);

      for (const d of drops) {
        d.x += d.vx;
        d.y += d.vy;

        if (d.y > groundY) {
          splashes.push(makeSplash(d.x, groundY - 1, false));
          Object.assign(d, makeDrop(width, height, true));
        } else if (d.x < -50 || d.x > width + 50) {
          Object.assign(d, makeDrop(width, height, true));
        }
      }

      for (let i = splashes.length - 1; i >= 0; i--) {
        splashes[i].age += 1;
        if (splashes[i].age > splashes[i].life) {
          splashes.splice(i, 1);
        }
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
  }, [onClickAnywhere]);

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
