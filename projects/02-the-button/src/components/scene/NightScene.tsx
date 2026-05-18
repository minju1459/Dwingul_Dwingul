"use client";

import { useEffect, useState } from "react";
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
        gap: 36,
        padding: 32,
      }}
    >
      <h1
        style={{
          position: "relative",
          fontFamily: "var(--font-display)",
          fontWeight: 700,
          fontSize: 26,
          color: "var(--text-soft)",
          letterSpacing: 4,
          textAlign: "center",
          margin: 0,
          zIndex: 1,
        }}
      >
        안자는 사람
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
              "radial-gradient(circle at center, rgba(255,90,90,0.05) 0%, transparent 60%)",
            animation: "global-ripple 0.9s ease-out forwards",
            zIndex: 0,
          }}
        />
      ))}

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
