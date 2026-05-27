"use client";

import { useEffect, useRef } from "react";
import {
  drawCandle,
  makeCandle,
  setCandleState,
  type Candle,
} from "@/lib/flameRenderer";
import { CANDLE_ANCHORS } from "@/lib/candleConfig";

export type FlameCanvasHandle = {
  extinguishNext: () => boolean;
  reset: () => void;
  litCount: () => number;
};

type Props = {
  onAllOut?: () => void;
  onCandleOut?: (originX: number, originY: number) => void;
  handleRef?: React.MutableRefObject<FlameCanvasHandle | null>;
};

// 케이크 영역 위로 캔버스를 얼마나 더 확장할지 (cake 높이 대비 비율).
// 불꽃이 심지 끝에서 위로 자라는 분량 + 연기 burst 여유까지 포함.
const HEAD_ROOM_RATIO = 0.22;

export default function FlameCanvas({ onAllOut, onCandleOut, handleRef }: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const candlesRef = useRef<Candle[]>([]);
  const allOutFiredRef = useRef(false);
  const cakeOriginYRef = useRef(0);
  const cakeWidthRef = useRef(0);
  const cakeHeightRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let rafId = 0;
    let lastTs = performance.now();

    const now0 = performance.now();
    candlesRef.current = CANDLE_ANCHORS.map((a) => makeCandle(a, now0));

    function resize() {
      const parent = canvas!.parentElement;
      if (!parent) return;
      const rect = parent.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const headroom = Math.round(rect.height * HEAD_ROOM_RATIO);
      const totalW = rect.width;
      const totalH = rect.height + headroom;
      canvas!.width = Math.floor(totalW * dpr);
      canvas!.height = Math.floor(totalH * dpr);
      canvas!.style.width = `${totalW}px`;
      canvas!.style.height = `${totalH}px`;
      canvas!.style.top = `-${headroom}px`;
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
      cakeOriginYRef.current = headroom;
      cakeWidthRef.current = totalW;
      cakeHeightRef.current = rect.height;
    }

    resize();
    const ro = new ResizeObserver(resize);
    if (canvas.parentElement) ro.observe(canvas.parentElement);

    function frame(ts: number) {
      const dt = Math.min(ts - lastTs, 50);
      lastTs = ts;
      const totalW = canvas!.clientWidth;
      const totalH = canvas!.clientHeight;
      ctx!.clearRect(0, 0, totalW, totalH);

      const rc = {
        ctx: ctx!,
        cakeOriginY: cakeOriginYRef.current,
        cakeWidth: cakeWidthRef.current,
        cakeHeight: cakeHeightRef.current,
      };
      for (const c of candlesRef.current) {
        drawCandle(rc, c, ts, dt);
      }

      if (
        !allOutFiredRef.current &&
        candlesRef.current.every((c) => c.state === "out")
      ) {
        allOutFiredRef.current = true;
        onAllOut?.();
      }
      rafId = requestAnimationFrame(frame);
    }
    rafId = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(rafId);
      ro.disconnect();
    };
  }, [onAllOut]);

  useEffect(() => {
    if (!handleRef) return;
    handleRef.current = {
      extinguishNext: () => {
        const candles = candlesRef.current;
        const target = candles.find((c) => c.state === "lit");
        if (!target) return false;
        setCandleState(target, "extinguishing", performance.now());
        const canvas = canvasRef.current;
        const parent = canvas?.parentElement;
        if (parent && onCandleOut) {
          // confetti burst 의 origin 은 케이크 이미지 영역 기준으로 잡음
          const cakeRect = parent.getBoundingClientRect();
          const ox = cakeRect.left + target.anchor.x * cakeRect.width;
          const oy = cakeRect.top + target.anchor.y * cakeRect.height;
          onCandleOut(ox, oy);
        }
        return true;
      },
      reset: () => {
        const now = performance.now();
        candlesRef.current = CANDLE_ANCHORS.map((a) => makeCandle(a, now));
        allOutFiredRef.current = false;
      },
      litCount: () => candlesRef.current.filter((c) => c.state === "lit").length,
    };
    return () => {
      if (handleRef) handleRef.current = null;
    };
  }, [handleRef, onCandleOut]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute left-0 right-0 pointer-events-none"
      aria-hidden
    />
  );
}
