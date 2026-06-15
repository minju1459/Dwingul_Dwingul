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

export type WakppuCanvasHandle = {
  /** 캔버스 좌표 → 왁뿌 중심 기준 로컬 좌표. */
  toLocal: (x: number, y: number) => { x: number; y: number };
  /** 본체와 충돌하는지(반경 안). */
  isHit: (x: number, y: number) => boolean;
  /** 짓누르기 시작 — 누른 좌표 기억. */
  pressStart: (x: number, y: number) => void;
  /**
   * 짓누르기 진행 — dt 만큼 누른 상태가 지속됨.
   * 임계 progress 마다 다음 stage 로 자동 진행하고, 진행 직후 true 반환.
   */
  pressTick: (dt: number) => { advancedTo: CrackStage | null; progress: number };
  /** 짓누르기 종료. */
  pressStop: () => void;
  /** "다시 만들기" — 0.8s 부드러운 역 애니메이션. */
  rebuild: () => void;
  /** 즉시 초기 상태로 (variant 변경 시처럼 애니메이션 없이 깔끔하게). */
  reset: () => void;
  /** 슬라임 드래그 변위. */
  setDrag: (dx: number, dy: number) => void;
  releaseDrag: () => void;
  /** 현재 stage. */
  getStage: () => CrackStage;
};

type Props = {
  variant: WakppuVariant;
  onStageChange: (stage: CrackStage) => void;
  onBreak: () => void;
  handleRef: React.MutableRefObject<WakppuCanvasHandle | null>;
};

// 다음 stage 로 넘어가기까지 짓눌러야 하는 시간(ms). 짧을수록 빨리 부숴짐.
// 한 단계당 짓누름 시간을 늘려서 5 단계 = 약 10 회의 짓누름이 필요한 톤.
const PROGRESS_PER_STAGE = 900;

// 단계별 겉면 소실 비율 — 완파(stage 5) 에서도 18% 정도 남아있어
// 겉 색과 속 색이 자연스럽게 어우러진 "다 부숴진 모양" 으로 끝남.
const BROKEN_BY_STAGE = [0, 0.14, 0.28, 0.46, 0.66, 0.82];

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
  const slimeExposureRef = useRef(0);
  const brokenRef = useRef(0);
  const rebuildRef = useRef(0);
  const dragRef = useRef<{ x: number; y: number } | null>(null);
  const radiusRef = useRef(140);
  const centerRef = useRef({ x: 0, y: 0 });

  // 짓누름 상태
  const pressActiveRef = useRef(false);
  const pressOriginRef = useRef({ x: 0, y: 0 });
  const pressProgressRef = useRef(0); // 0~1, 1 도달 시 단계 진행
  const microCrackTimerRef = useRef(0);

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

      // 공통: slimePhase 와 파편/먼지 업데이트
      slimePhaseRef.current += dt * 0.0025;
      updateShardField(shardRef.current, dt);

      const EXP_BY_STAGE = [0, 0.28, 0.48, 0.65, 0.85, 1];

      if (rebuildRef.current > 0) {
        // ── 다시 만들기 ─────────────────────────────────────────
        // 평소 보간 분기를 끄고 모든 값을 빠르게 0 으로 끌어내림.
        // (평소 분기에서 stage=5 기준으로 broken/reveal 을 다시 1 로
        // 끌어올려 서로 상쇄되던 버그 fix)
        rebuildRef.current = Math.max(0, rebuildRef.current - dt / 800);

        slimeExposureRef.current = Math.max(0, slimeExposureRef.current - dt * 0.004);
        brokenRef.current = Math.max(0, brokenRef.current - dt * 0.0028);
        for (const l of crackRef.current.lines) {
          l.reveal = Math.max(0, l.reveal - dt * 0.005);
        }

        squashRef.current.x += (1 - squashRef.current.x) * 0.18;
        squashRef.current.y += (1 - squashRef.current.y) * 0.18;

        const k = Math.min(1, dt / 16.67) * 0.13;
        for (const s of shardRef.current.shards) {
          s.vx *= 0.86;
          s.vy *= 0.86;
          s.x += (0 - s.x) * k;
          s.y += (0 - s.y) * k;
          s.life = Math.max(0, s.life - dt * 1.3);
        }

        if (rebuildRef.current <= 0) {
          clearShards(shardRef.current);
          clearField(crackRef.current);
          brokenRef.current = 0;
          slimeExposureRef.current = 0;
          stageRef.current = 0;
          onStageChange(0);
        }
      } else {
        // ── 평상시 ─────────────────────────────────────────────
        const baseExp = EXP_BY_STAGE[Math.min(5, stageRef.current)];
        const liveExp = pressActiveRef.current
          ? baseExp +
            (EXP_BY_STAGE[Math.min(5, stageRef.current + 1)] - baseExp) *
              pressProgressRef.current *
              0.7
          : baseExp;
        slimeExposureRef.current += (liveExp - slimeExposureRef.current) * 0.18;

        const targetSx = pressActiveRef.current ? 0.95 - pressProgressRef.current * 0.04 : 1;
        const targetSy = pressActiveRef.current ? 1.05 + pressProgressRef.current * 0.04 : 1;
        squashRef.current.x += (targetSx - squashRef.current.x) * 0.2;
        squashRef.current.y += (targetSy - squashRef.current.y) * 0.2;

        updateCrackField(crackRef.current, dt);

        const baseBroken = BROKEN_BY_STAGE[Math.min(5, stageRef.current)];
        const nextBroken = BROKEN_BY_STAGE[Math.min(5, stageRef.current + 1)];
        const liveBroken = pressActiveRef.current
          ? baseBroken + (nextBroken - baseBroken) * pressProgressRef.current
          : baseBroken;
        brokenRef.current += (liveBroken - brokenRef.current) * 0.18;
      }

      // ── 그리기 ─────────────────────────────────────────────────────────
      // 1. 그림자
      ctx!.save();
      ctx!.translate(cx, cy + R * 0.78);
      ctx!.fillStyle = "rgba(0,0,0,0.55)";
      ctx!.filter = "blur(18px)";
      ctx!.beginPath();
      ctx!.ellipse(0, 0, R * 0.85, R * 0.12, 0, 0, Math.PI * 2);
      ctx!.fill();
      ctx!.filter = "none";
      ctx!.restore();

      // 2. 슬라임 (겉면 뒤)
      ctx!.save();
      ctx!.translate(cx, cy);
      drawSlime(
        ctx!,
        variantRef.current.shell,
        R,
        slimeExposureRef.current,
        {
          squashX: squashRef.current.x,
          squashY: squashRef.current.y,
          slimePhase: slimePhaseRef.current,
        },
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
        {
          squashX: squashRef.current.x,
          squashY: squashRef.current.y,
          slimePhase: slimePhaseRef.current,
        },
      );
      ctx!.restore();

      // 4. 균열 (겉면 위, 안 색 + 겉 색이 어우러진 갭)
      const innerColor = getInnerColor(variantRef.current);
      const outerColor = getOuterColor(variantRef.current);
      drawCracks(ctx!, crackRef.current, cx, cy, innerColor, outerColor);

      // 5. 파편/먼지
      drawShards(ctx!, shardRef.current, cx, cy);

      rafId = requestAnimationFrame(frame);
    }
    rafId = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(rafId);
      ro.disconnect();
    };
  }, [onStageChange]);

  useEffect(() => {
    handleRef.current = {
      toLocal: (x, y) => ({
        x: x - centerRef.current.x,
        y: y - centerRef.current.y,
      }),
      isHit: (x, y) => {
        const dx = x - centerRef.current.x;
        const dy = y - centerRef.current.y;
        return Math.hypot(dx, dy) <= radiusRef.current * 1.05;
      },
      pressStart: (x, y) => {
        pressActiveRef.current = true;
        pressProgressRef.current = 0;
        microCrackTimerRef.current = 0;
        let local = {
          x: x - centerRef.current.x,
          y: y - centerRef.current.y,
        };
        // 도넛이면 가운데 구멍 안쪽 클릭은 본체 영역 외곽으로 밀어냄
        const innerR = getDonutInnerRadius(variantRef.current, radiusRef.current);
        if (innerR > 0) {
          const d = Math.hypot(local.x, local.y);
          if (d < innerR * 1.05) {
            const ang = d > 0.001 ? Math.atan2(local.y, local.x) : Math.random() * Math.PI * 2;
            const target = innerR * 1.15;
            local = { x: Math.cos(ang) * target, y: Math.sin(ang) * target };
          }
        }
        pressOriginRef.current = local;
      },
      pressTick: (dt) => {
        if (!pressActiveRef.current || stageRef.current >= 5) {
          return { advancedTo: null, progress: pressProgressRef.current };
        }
        pressProgressRef.current = Math.min(
          1,
          pressProgressRef.current + dt / PROGRESS_PER_STAGE,
        );

        // 짓누르는 동안 작은 균열을 점진적으로 추가 — "균열이 자라는" 효과
        microCrackTimerRef.current += dt;
        const microGap = 95;
        const R = radiusRef.current;
        const innerR = getDonutInnerRadius(variantRef.current, R);
        while (microCrackTimerRef.current >= microGap) {
          microCrackTimerRef.current -= microGap;
          const jitter = 18 + Math.random() * 24;
          const ang = Math.random() * Math.PI * 2;
          const origin = clampToShell(
            {
              x: pressOriginRef.current.x + Math.cos(ang) * jitter,
              y: pressOriginRef.current.y + Math.sin(ang) * jitter,
            },
            R,
            innerR,
          );
          spawnCrack(
            crackRef.current,
            origin,
            Math.max(1, stageRef.current),
            R,
            innerR,
          );
        }

        if (pressProgressRef.current >= 1) {
          const next = Math.min(5, stageRef.current + 1) as CrackStage;
          stageRef.current = next;
          pressProgressRef.current = 0;
          const local = pressOriginRef.current;
          spawnCrack(crackRef.current, local, next, R, innerR);
          const palette = palette4(variantRef.current);
          const power = 0.6 + next * 0.2;
          if (next >= 3) spawnShards(shardRef.current, local, 10 + next * 4, palette, power);
          if (next >= 2) spawnDust(shardRef.current, local, 6 + next * 3);
          if (next === 5) {
            // 완파지만 표면 18% 남는 자연스러운 톤. 도넛이면 가운데
            // 구멍 안에서 파편이 안 튀게 일정 반경(annulus) 안에 spawn.
            spawnShellShards(shardRef.current, R, innerR, palette);
            spawnDust(shardRef.current, { x: 0, y: 0 }, 16);
            pressActiveRef.current = false;
            onBreak();
          }
          onStageChange(next);
          return { advancedTo: next, progress: 0 };
        }
        return { advancedTo: null, progress: pressProgressRef.current };
      },
      pressStop: () => {
        pressActiveRef.current = false;
        // pressProgress 는 유지 — 짧게 톡톡 누르고 떼도 누적되어 단계 진행
        microCrackTimerRef.current = 0;
      },
      rebuild: () => {
        rebuildRef.current = 1;
        pressActiveRef.current = false;
        pressProgressRef.current = 0;
      },
      reset: () => {
        // variant 교체 시처럼 애니메이션 없이 즉시 0 으로
        rebuildRef.current = 0;
        pressActiveRef.current = false;
        pressProgressRef.current = 0;
        microCrackTimerRef.current = 0;
        brokenRef.current = 0;
        slimeExposureRef.current = 0;
        squashRef.current = { x: 1, y: 1 };
        stageRef.current = 0;
        clearField(crackRef.current);
        clearShards(shardRef.current);
        onStageChange(0);
      },
      setDrag: (dx, dy) => {
        dragRef.current = { x: dx, y: dy };
      },
      releaseDrag: () => {
        dragRef.current = null;
      },
      getStage: () => stageRef.current,
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

function getInnerColor(v: WakppuVariant): string {
  if (v.shell.kind === "donut") return v.shell.innerColors[0] ?? "#ffffff";
  return v.shell.innerColor;
}

function getOuterColor(v: WakppuVariant): string {
  if (v.shell.kind === "donut") return v.shell.glaze;
  return v.shell.outerColor;
}

// 도넛 가운데 구멍 반경 (wakppuRenderer 의 inner = R*0.2 와 동일해야 정렬).
function getDonutInnerRadius(v: WakppuVariant, R: number): number {
  return v.shell.kind === "donut" ? R * 0.2 : 0;
}

function clampToShell(p: { x: number; y: number }, R: number, innerR: number) {
  const d = Math.hypot(p.x, p.y);
  // 외곽 92% 안으로
  const maxR = R * 0.9;
  if (d > maxR) {
    const ang = Math.atan2(p.y, p.x);
    return { x: Math.cos(ang) * maxR, y: Math.sin(ang) * maxR };
  }
  // 도넛 구멍 안이면 바깥으로
  if (innerR > 0 && d < innerR * 1.05) {
    const ang = d > 0.001 ? Math.atan2(p.y, p.x) : Math.random() * Math.PI * 2;
    const target = innerR * 1.15;
    return { x: Math.cos(ang) * target, y: Math.sin(ang) * target };
  }
  return p;
}

/**
 * 완파 시 본체 영역(annulus) 안에서 파편을 spawn — 가운데 구멍에서
 * 튀어나오지 않게.
 */
function spawnShellShards(
  field: ReturnType<typeof makeShardField> extends infer T ? T : never,
  R: number,
  innerR: number,
  palette: string[],
) {
  const N = 24;
  for (let i = 0; i < N; i++) {
    const ang = Math.random() * Math.PI * 2;
    const rMin = Math.max(innerR * 1.15, R * 0.25);
    const rMax = R * 0.85;
    const r = rMin + Math.random() * (rMax - rMin);
    const origin = { x: Math.cos(ang) * r, y: Math.sin(ang) * r };
    spawnShards(field as ReturnType<typeof makeShardField>, origin, 1, palette, 1.2);
  }
}

function palette4(v: WakppuVariant): string[] {
  if (v.shell.kind === "donut") {
    return [v.shell.glaze, ...v.shell.innerColors.slice(0, 3)];
  }
  return [v.shell.outerColor, v.shell.outerColor, v.shell.outerColor, v.shell.innerColor];
}
