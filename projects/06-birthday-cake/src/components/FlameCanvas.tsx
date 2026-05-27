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

export default function FlameCanvas({ onAllOut, onCandleOut, handleRef }: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const candlesRef = useRef<Candle[]>([]);
  const allOutFiredRef = useRef(false);

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
      canvas!.width = Math.floor(rect.width * dpr);
      canvas!.height = Math.floor(rect.height * dpr);
      canvas!.style.width = `${rect.width}px`;
      canvas!.style.height = `${rect.height}px`;
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    resize();
    const ro = new ResizeObserver(resize);
    if (canvas.parentElement) ro.observe(canvas.parentElement);

    function frame(ts: number) {
      const dt = Math.min(ts - lastTs, 50);
      lastTs = ts;
      const width = canvas!.clientWidth;
      const height = canvas!.clientHeight;
      ctx!.clearRect(0, 0, width, height);

      const rc = { ctx: ctx!, width, height, dpr: 1 };
      for (const c of candlesRef.current) {
        drawCandle(rc, c, ts, dt);
      }

      // 전부 꺼졌고 연기도 거의 다 사라졌을 때 한 번만 fire
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
        if (canvas && onCandleOut) {
          const rect = canvas.getBoundingClientRect();
          const ox = rect.left + target.anchor.x * rect.width;
          const oy = rect.top + target.anchor.y * rect.height;
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
      className="absolute inset-0 pointer-events-none"
      aria-hidden
    />
  );
}
