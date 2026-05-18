"use client";

import { useMemo } from "react";

type Star = {
  id: number;
  top: number;
  left: number;
  size: number;
  delay: number;
  duration: number;
};

const STAR_COUNT = 60;

function generateStars(): Star[] {
  return Array.from({ length: STAR_COUNT }, (_, i) => ({
    id: i,
    top: Math.random() * 100,
    left: Math.random() * 100,
    size: 1 + Math.random() * 1.6,
    delay: Math.random() * 6,
    duration: 4 + Math.random() * 6,
  }));
}

export function Stars() {
  const stars = useMemo(generateStars, []);

  return (
    <div
      aria-hidden
      style={{
        position: "fixed",
        inset: 0,
        pointerEvents: "none",
        overflow: "hidden",
        zIndex: 0,
      }}
    >
      {stars.map((s) => (
        <span
          key={s.id}
          style={{
            position: "absolute",
            top: `${s.top}%`,
            left: `${s.left}%`,
            width: s.size,
            height: s.size,
            borderRadius: "50%",
            background: "#fff",
            opacity: 0.6,
            animation: `star-twinkle ${s.duration}s ease-in-out ${s.delay}s infinite`,
          }}
        />
      ))}

      <style>{`
        @keyframes star-twinkle {
          0%, 100% { opacity: 0.15; transform: scale(0.8); }
          50%      { opacity: 0.8;  transform: scale(1.1); }
        }
      `}</style>
    </div>
  );
}
