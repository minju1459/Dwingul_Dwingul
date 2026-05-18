"use client";

import { useEffect, useState } from "react";
import { Stars } from "./Stars";
import { LiveStats } from "@/components/stats/LiveStats";
import { BigButton } from "@/components/button/BigButton";
import { useFakeRealtime } from "@/hooks/useFakeRealtime";

export function NightScene() {
  const { state, lastPress, pressLocal } = useFakeRealtime();
  const [globalRipples, setGlobalRipples] = useState<number[]>([]);

  useEffect(() => {
    if (!lastPress || lastPress.origin !== "remote") return;
    const id = Date.now();
    setGlobalRipples((arr) => [...arr, id]);
    const timer = setTimeout(() => {
      setGlobalRipples((arr) => arr.filter((n) => n !== id));
    }, 900);
    return () => clearTimeout(timer);
  }, [lastPress]);

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 40,
        padding: 32,
      }}
    >
      <Stars />

      <h1
        style={{
          position: "relative",
          fontFamily: "var(--font-cute)",
          fontSize: 28,
          fontWeight: 400,
          color: "var(--text-soft)",
          letterSpacing: 2,
          textAlign: "center",
          margin: 0,
          opacity: 0.85,
          zIndex: 1,
        }}
      >
        이 세상에 하나뿐인 버튼
      </h1>

      <div style={{ position: "relative", zIndex: 1 }}>
        <LiveStats state={state} />
      </div>

      <div style={{ position: "relative", zIndex: 1 }}>
        <BigButton onPress={pressLocal} lastPress={lastPress} />
      </div>

      {globalRipples.map((id) => (
        <span
          key={id}
          aria-hidden
          style={{
            position: "fixed",
            inset: 0,
            pointerEvents: "none",
            background:
              "radial-gradient(circle at center, rgba(255,90,90,0.06) 0%, transparent 60%)",
            animation: "global-ripple 0.9s ease-out forwards",
            zIndex: 0,
          }}
        />
      ))}

      <div
        style={{
          position: "fixed",
          bottom: 24,
          left: 0,
          right: 0,
          textAlign: "center",
          fontFamily: "var(--font-cute)",
          fontSize: 13,
          color: "var(--text-dim)",
          letterSpacing: 1,
          zIndex: 1,
        }}
      >
        지금도 누군가는 누르고 있습니다
      </div>

      <style>{`
        @keyframes global-ripple {
          0%   { opacity: 0;    transform: scale(0.6); }
          40%  { opacity: 1;    transform: scale(1.0); }
          100% { opacity: 0;    transform: scale(1.4); }
        }
      `}</style>
    </div>
  );
}
