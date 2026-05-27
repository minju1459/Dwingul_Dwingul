"use client";

import { useEffect, useRef } from "react";
import {
  spawnConfettiBurst,
  spawnConfettiCannon,
  updateAndDrawConfetti,
  type ConfettiPiece,
} from "@/lib/confetti";

export type ConfettiHandle = {
  burst: (x: number, y: number, count?: number) => void;
  cannon: () => void;
};

type Props = {
  handleRef: React.MutableRefObject<ConfettiHandle | null>;
};

export default function ConfettiLayer({ handleRef }: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const piecesRef = useRef<ConfettiPiece[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let rafId = 0;
    let lastTs = performance.now();

    function resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas!.width = Math.floor(window.innerWidth * dpr);
      canvas!.height = Math.floor(window.innerHeight * dpr);
      canvas!.style.width = `${window.innerWidth}px`;
      canvas!.style.height = `${window.innerHeight}px`;
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    resize();
    window.addEventListener("resize", resize);

    function frame(ts: number) {
      const dt = Math.min(ts - lastTs, 50);
      lastTs = ts;
      ctx!.clearRect(0, 0, window.innerWidth, window.innerHeight);
      updateAndDrawConfetti(ctx!, piecesRef.current, dt);
      rafId = requestAnimationFrame(frame);
    }
    rafId = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  useEffect(() => {
    handleRef.current = {
      burst: (x, y, count = 26) => {
        spawnConfettiBurst(piecesRef.current, x, y, count, 0.85);
      },
      cannon: () => {
        spawnConfettiCannon(piecesRef.current, window.innerWidth, window.innerHeight, 140);
      },
    };
    return () => {
      handleRef.current = null;
    };
  }, [handleRef]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-40"
      aria-hidden
    />
  );
}
