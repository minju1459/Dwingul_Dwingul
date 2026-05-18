"use client";

import { useEffect, useState } from "react";
import type { PressEvent } from "@/lib/types";

type BigButtonProps = {
  onPress: () => void;
  lastPress: PressEvent | null;
};

export function BigButton({ onPress, lastPress }: BigButtonProps) {
  const [pressing, setPressing] = useState(false);
  const [remoteShake, setRemoteShake] = useState(0);

  useEffect(() => {
    if (lastPress?.origin === "remote") {
      setRemoteShake((n) => n + 1);
    }
  }, [lastPress]);

  const handlePress = () => {
    onPress();
    setPressing(true);
    setTimeout(() => setPressing(false), 220);
  };

  return (
    <div
      style={{
        position: "relative",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 48,
      }}
    >
      <button
        type="button"
        onClick={handlePress}
        aria-label="누르기"
        key={`shake-${remoteShake}`}
        style={{
          position: "relative",
          width: 240,
          height: 240,
          borderRadius: "50%",
          border: 0,
          cursor: "pointer",
          background:
            "radial-gradient(circle at 32% 28%, #ff8585 0%, #ff5a5a 35%, #c81e1e 78%, #7a0e0e 100%)",
          boxShadow: pressing
            ? `
              0 4px 8px rgba(0,0,0,0.5),
              inset 0 -4px 8px rgba(0,0,0,0.4),
              inset 0 4px 8px rgba(255,255,255,0.15),
              0 0 30px var(--accent-red-shadow)
            `
            : `
              0 14px 28px rgba(0,0,0,0.55),
              0 22px 44px rgba(0,0,0,0.3),
              inset 0 -10px 18px rgba(0,0,0,0.35),
              inset 0 10px 18px rgba(255,255,255,0.25),
              0 0 50px var(--accent-red-shadow)
            `,
          transform: pressing
            ? "translateY(8px) scale(0.96)"
            : "translateY(0) scale(1)",
          transition:
            "transform 0.12s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.12s ease-out",
          animation: pressing
            ? undefined
            : `button-heartbeat 2.4s ease-in-out infinite, button-shake 0.5s ease-in-out`,
          fontFamily: "var(--font-cute)",
          fontSize: 28,
          letterSpacing: 6,
          color: "rgba(255, 240, 240, 0.95)",
          textShadow: "0 2px 4px rgba(0,0,0,0.5)",
          padding: 0,
        }}
      >
        누르기
        <span
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 0,
            height: 0,
            borderRadius: "50%",
            border: "2px solid rgba(255, 100, 100, 0.8)",
            pointerEvents: "none",
            animation: pressing
              ? "button-ripple 0.6s ease-out forwards"
              : undefined,
          }}
        />
      </button>

      <style>{`
        @keyframes button-heartbeat {
          0%, 100% { transform: translateY(0) scale(1); }
          50%      { transform: translateY(-2px) scale(1.012); }
        }
        @keyframes button-ripple {
          0%   { width: 0;     height: 0;     opacity: 0.9; }
          100% { width: 480px; height: 480px; opacity: 0; }
        }
        @keyframes button-shake {
          0%, 100% { translate: 0 0; }
          25%      { translate: -2px 1px; }
          50%      { translate: 2px -1px; }
          75%      { translate: -1px 2px; }
        }
      `}</style>
    </div>
  );
}
