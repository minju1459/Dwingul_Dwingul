"use client";

import { useCallback, useRef, useState } from "react";
import CakeStage from "./CakeStage";
import Hint from "./Hint";
import Celebration from "./Celebration";
import ReplayButton from "./ReplayButton";
import ConfettiLayer, { type ConfettiHandle } from "./ConfettiLayer";
import type { FlameCanvasHandle } from "./FlameCanvas";
import { useClapDetection } from "@/lib/useClapDetection";
import { CANDLE_ANCHORS } from "@/lib/candleConfig";

type Phase = "intro" | "listening" | "celebrating";

export default function BirthdayScene() {
  const [phase, setPhase] = useState<Phase>("intro");
  const [litCount, setLitCount] = useState(CANDLE_ANCHORS.length);
  const [dimmed, setDimmed] = useState(false);

  const flameHandle = useRef<FlameCanvasHandle | null>(null);
  const confettiHandle = useRef<ConfettiHandle | null>(null);
  const phaseRef = useRef<Phase>("intro");
  phaseRef.current = phase;

  const handleClap = useCallback(() => {
    if (phaseRef.current !== "listening") return;
    const ok = flameHandle.current?.extinguishNext();
    if (!ok) return;
    setLitCount(flameHandle.current?.litCount() ?? 0);
  }, []);

  const { micState, start, stop } = useClapDetection({ onClap: handleClap });

  const handleCandleOut = useCallback((x: number, y: number) => {
    confettiHandle.current?.burst(x, y, 22);
  }, []);

  const handleAllOut = useCallback(() => {
    setPhase("celebrating");
    setDimmed(true);
    stop();
    window.setTimeout(() => confettiHandle.current?.cannon(), 280);
    window.setTimeout(() => confettiHandle.current?.cannon(), 900);
  }, [stop]);

  const handleStart = useCallback(() => {
    setPhase("listening");
    void start();
  }, [start]);

  const handleReplay = useCallback(() => {
    flameHandle.current?.reset();
    setLitCount(CANDLE_ANCHORS.length);
    setDimmed(false);
    setPhase("intro");
  }, []);

  const handleSurfaceTap = useCallback(() => {
    if (phaseRef.current !== "listening") return;
    if (
      micState === "denied" ||
      micState === "unsupported" ||
      micState === "idle"
    ) {
      handleClap();
    }
  }, [micState, handleClap]);

  return (
    <main
      className="relative w-full overflow-hidden select-none"
      style={{ height: "100dvh" }}
      onClick={handleSurfaceTap}
    >
      <div className={`scene-bg ${dimmed ? "dimmed" : ""}`} />
      <div className="relative w-full h-full flex items-center justify-center px-4 sm:px-8 z-10">
        <CakeStage
          handleRef={flameHandle}
          onAllOut={handleAllOut}
          onCandleOut={handleCandleOut}
        />
      </div>
      <Hint
        phase={phase}
        litCount={litCount}
        totalCandles={CANDLE_ANCHORS.length}
        micState={micState}
        onStartListening={handleStart}
      />
      <Celebration visible={phase === "celebrating"} />
      <ReplayButton visible={phase === "celebrating"} onClick={handleReplay} />
      <ConfettiLayer handleRef={confettiHandle} />
    </main>
  );
}
