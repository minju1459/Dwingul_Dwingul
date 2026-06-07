"use client";

import { useEffect, useRef } from "react";
import type { WakppuVariant, CrackStage } from "@/lib/wakppu/types";
import {
  makeCrackField,
  spawnCrack,
  drawCracks,
  updateCrackField,
  clearField,
} from "@/lib/wakppu/crackSystem";
import {
  makeShardField,
  spawnShards,
  spawnDust,
  drawShards,
  updateShardField,
  clearShards,
} from "@/lib/wakppu/shardSystem";
import { drawShell, drawSlime } from "@/lib/wakppu/wakppuRenderer";
import { withAlpha } from "@/lib/wakppu/variants";

export type WakppuCanvasHandle = {
  /** 클릭 위치(캔버스 좌표)에서 한 단계 부수기. 반환: 새 stage. */
  hitAt: (x: number, y: number) => CrackStage;
  /** 모두 원래대로 복구. */
  rebuild: () => void;
  /** 드래그 변위(슬라임 늘이기). */
  setDrag: (dx: number, dy: number) => void;
  releaseDrag: () => void;
  /** 캔버스 좌표 → 왁뿌 중심 기준 로컬 좌표. */
  toLocal: (x: number, y: number) => { x: number; y: number };
  /** 현재 stage. */
  getStage: () => CrackStage;
  /** 본체와 충돌하는지(반경 안). */
  isHit: (x: number, y: number) => boolean;
};

type Props = {
  variant: WakppuVariant;
  onStageChange: (stage: CrackStage) => void;
  onBreak: () => void;
  handleRef: React.MutableRefObject<WakppuCanvasHandle | null>;
};

export default function WakppuCanvas({ variant, onStageChange, onBreak, handleRef }: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const variantRef = useRef(variant);
  variantRef.current = variant;

  // 엔진 상태
  const stageRef = useRef<CrackStage>(0);
  const crackRef = useRef(makeCrackField());
  const shardRef = useRef(makeShardField());
  const squashRef = useRef({ x: 1, y: 1 });
  const slimePhaseRef = useRef(0);
  const slimeExposureRef = useRef(0); // 0~1, stage>=4 면 1로 보간
  const brokenRef = useRef(0); // 0~1, 겉면이 깎인 정도
  const rebuildRef = useRef(0); // 0~1, 0 정상 / 1 완전 복구 진행중
  const dragRef = useRef<{ x: number; y: number } | null>(null);
  const radiusRef = useRef(140);
  const centerRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let rafId = 0;
    let last = performance.now();

    function resize() {
      const parent = canvas!.parentElement;
      if (!parent) return;
      const rect = parent.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas!.width = Math.floor(rect.width * dpr);
      canvas!.height = Math.floor(rect.height * dpr);
      canvas!.style.width = `${rect.width}px`;
      canvas!.style.height = `${rect.height}px`;
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
      centerRef.current = { x: rect.width / 2, y: rect.height / 2 };
      radiusRef.current = Math.min(rect.width, rect.height) * 0.32;
    }

    resize();
    const ro = new ResizeObserver(resize);
    if (canvas.parentElement) ro.observe(canvas.parentElement);

    function frame(now: number) {
      const dt = Math.min(now - last, 50);
      last = now;
      const w = canvas!.clientWidth;
      const h = canvas!.clientHeight;
      const cx = centerRef.current.x;
      const cy = centerRef.current.y;
      const R = radiusRef.current;

      ctx!.clearRect(0, 0, w, h);

      // 슬라임 노출 보간
      const targetExp =
        rebuildRef.current > 0 ? 0 : stageRef.current >= 4 ? 1 : stageRef.current === 3 ? 0.18 : 0;
      slimeExposureRef.current += (targetExp - slimeExposureRef.current) * 0.16;

      // squash 복귀
      squashRef.current.x += (1 - squashRef.current.x) * 0.18;
      squashRef.current.y += (1 - squashRef.current.y) * 0.18;
      slimePhaseRef.current += dt * 0.0025;

      // 균열 reveal 보간
      updateCrackField(crackRef.current, dt);
      // 파편/먼지 업데이트
      updateShardField(shardRef.current, dt);

      // 다시 만들기 중이면 파편 → 중심으로, crack reveal 0 으로 다시
      if (rebuildRef.current > 0) {
        const k = Math.min(1, dt / 16.67) * 0.13;
        for (const s of shardRef.current.shards) {
          s.vx *= 0.86;
          s.vy *= 0.86;
          // 중심(cx,cy) 좌표는 캔버스 기준이지만 shard 의 x,y 는 중심 기준 로컬이므로 0 으로 끌어당김
          s.x += (0 - s.x) * k;
          s.y += (0 - s.y) * k;
          s.life = Math.max(0, s.life - dt * 1.3);
        }
        for (const d of shardRef.current.dust) d.life = Math.min(d.maxLife, d.life + dt * 2);

        for (const l of crackRef.current.lines) l.reveal = Math.max(0, l.reveal - dt * 0.004);
        brokenRef.current = Math.max(0, brokenRef.current - dt * 0.0012);
        rebuildRef.current = Math.max(0, rebuildRef.current - dt / 800);

        if (rebuildRef.current <= 0) {
          clearShards(shardRef.current);
          clearField(crackRef.current);
          brokenRef.current = 0;
          stageRef.current = 0;
          onStageChange(0);
        }
      }

      // ── 그리기 ─────────────────────────────────────────────────────────
      // 1. 부드러운 그림자 (왁뿌 아래)
      ctx!.save();
      ctx!.translate(cx, cy + R * 0.78);
      ctx!.fillStyle = "rgba(0,0,0,0.55)";
      ctx!.filter = "blur(18px)";
      ctx!.beginPath();
      ctx!.ellipse(0, 0, R * 0.85, R * 0.12, 0, 0, Math.PI * 2);
      ctx!.fill();
      ctx!.filter = "none";
      ctx!.restore();

      // 2. 슬라임 (겉면 뒤에)
      ctx!.save();
      ctx!.translate(cx, cy);
      drawSlime(
        ctx!,
        variantRef.current.shell,
        R,
        slimeExposureRef.current,
        { squashX: squashRef.current.x, squashY: squashRef.current.y, slimePhase: slimePhaseRef.current },
        dragRef.current,
      );
      ctx!.restore();

      // 3. 겉면
      ctx!.save();
      ctx!.translate(cx, cy);
      drawShell(
        ctx!,
        variantRef.current.shell,
        R,
        brokenRef.current,
        { squashX: squashRef.current.x, squashY: squashRef.current.y, slimePhase: slimePhaseRef.current },
      );
      ctx!.restore();

      // 4. 균열 (겉면 위에)
      const crackColor = withAlpha("#000000", 0.55);
      drawCracks(ctx!, crackRef.current, cx, cy, crackColor);

      // 5. 파편/먼지 (왁뿌 영역 밖)
      drawShards(ctx!, shardRef.current, cx, cy);

      rafId = requestAnimationFrame(frame);
    }
    rafId = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(rafId);
      ro.disconnect();
    };
  }, [onStageChange]);

  // handle 노출
  useEffect(() => {
    handleRef.current = {
      hitAt: (x, y) => {
        const local = {
          x: x - centerRef.current.x,
          y: y - centerRef.current.y,
        };
        // 다음 stage
        const next = Math.min(5, stageRef.current + 1) as CrackStage;
        stageRef.current = next;
        squashRef.current.x = 0.94;
        squashRef.current.y = 1.06;

        // 단계별 효과
        const R = radiusRef.current;
        spawnCrack(crackRef.current, local, next, R);

        // 파편
        const palette = palette4(variantRef.current);
        const power = 0.6 + next * 0.18;
        if (next >= 3) spawnShards(shardRef.current, local, 12 + next * 4, palette, power);
        if (next >= 2) spawnDust(shardRef.current, local, 6 + next * 3);

        if (next === 5) {
          brokenRef.current = 1;
          spawnShards(shardRef.current, { x: 0, y: 0 }, 36, palette, 1.4);
          spawnDust(shardRef.current, { x: 0, y: 0 }, 22);
          onBreak();
        } else {
          brokenRef.current = Math.min(0.85, brokenRef.current + 0.16 + next * 0.05);
        }
        onStageChange(next);
        return next;
      },
      rebuild: () => {
        rebuildRef.current = 1;
      },
      setDrag: (dx, dy) => {
        dragRef.current = { x: dx, y: dy };
      },
      releaseDrag: () => {
        dragRef.current = null;
      },
      toLocal: (x, y) => ({
        x: x - centerRef.current.x,
        y: y - centerRef.current.y,
      }),
      getStage: () => stageRef.current,
      isHit: (x, y) => {
        const dx = x - centerRef.current.x;
        const dy = y - centerRef.current.y;
        return Math.hypot(dx, dy) <= radiusRef.current * 1.05;
      },
    };
    return () => {
      handleRef.current = null;
    };
  }, [handleRef, onBreak, onStageChange]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none"
      aria-hidden
    />
  );
}

function palette4(v: WakppuVariant): string[] {
  if (v.shell.kind === "donut") {
    return [v.shell.glaze, ...v.shell.innerColors.slice(0, 3)];
  }
  return [v.shell.outerColor, v.shell.outerColor, v.shell.outerColor, v.shell.innerColor];
}
