"use client";

export type MissEvent = {
  id: number;
  x: number;
  y: number;
};

type MissPopProps = {
  miss: MissEvent;
};

export function MissPop({ miss }: MissPopProps) {
  return (
    <div
      aria-hidden
      style={{
        position: "fixed",
        left: miss.x,
        top: miss.y,
        zIndex: 28,
        pointerEvents: "none",
        fontFamily: "var(--font-display)",
        fontWeight: 900,
        fontSize: 30,
        letterSpacing: 2,
        color: "var(--miss)",
        textShadow:
          "0 0 10px rgba(0,0,0,0.85), 0 2px 4px rgba(0,0,0,0.7)",
        animation: "miss-pop 0.85s cubic-bezier(0.34, 1.56, 0.64, 1) forwards",
        transform: "translate(-50%, -50%)",
        whiteSpace: "nowrap",
      }}
    >
      MISS !!!
      <style>{`
        @keyframes miss-pop {
          0%   { opacity: 0; transform: translate(-50%, -50%) scale(0.4) rotate(-12deg); }
          18%  { opacity: 1; transform: translate(-50%, -50%) scale(1.35) rotate(10deg); }
          28%  {              transform: translate(-50%, -50%) scale(1.1)  rotate(-6deg); }
          40%  {              transform: translate(-50%, -50%) scale(1.18) rotate(4deg); }
          55%  {              transform: translate(-50%, -50%) scale(1.05) rotate(-2deg); }
          100% { opacity: 0; transform: translate(-50%, -75%) scale(1)    rotate(0deg); }
        }
      `}</style>
    </div>
  );
}
