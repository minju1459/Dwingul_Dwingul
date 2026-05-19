"use client";

import { useCallback, useState } from "react";
import { RainCanvas } from "./RainCanvas";
import { PaperNote } from "@/components/paper/PaperNote";
import { MuteButton } from "@/components/controls/MuteButton";
import { useRainSound } from "@/hooks/useRainSound";

export function RainyScene() {
  const [paperOpen, setPaperOpen] = useState(false);
  const { muted, toggle } = useRainSound();

  const handleClick = useCallback(() => {
    setPaperOpen(true);
  }, []);

  return (
    <>
      <RainCanvas onClickAnywhere={handleClick} />
      {paperOpen && <PaperNote onClose={() => setPaperOpen(false)} />}
      <MuteButton muted={muted} onToggle={toggle} />

      {/* 첫 진입 힌트 — 종이 열기 전까지만 */}
      {!paperOpen && (
        <div
          aria-hidden
          style={{
            position: "fixed",
            bottom: 20,
            left: 0,
            right: 0,
            textAlign: "center",
            fontFamily: "var(--font-hand)",
            fontSize: 14,
            color: "rgba(244,244,238,0.4)",
            letterSpacing: 2,
            pointerEvents: "none",
            zIndex: 2,
            animation: "hint-fade 6s ease-in-out infinite",
          }}
        >
          빗방울을 잡아보세요
        </div>
      )}

      <style>{`
        @keyframes hint-fade {
          0%, 100% { opacity: 0.3; }
          50%      { opacity: 0.7; }
        }
      `}</style>
    </>
  );
}
