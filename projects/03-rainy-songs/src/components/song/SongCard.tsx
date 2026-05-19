"use client";

import { useEffect, useState } from "react";
import type { Song } from "@/lib/songs";

type SongCardProps = {
  song: Song;
  onClose: () => void;
};

export function SongCard({ song, onClose }: SongCardProps) {
  const [entered, setEntered] = useState(false);

  useEffect(() => {
    const id = requestAnimationFrame(() => setEntered(true));
    return () => cancelAnimationFrame(id);
  }, []);

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 25,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: entered ? "rgba(0,0,0,0.5)" : "rgba(0,0,0,0)",
        transition: "background 0.5s ease",
        cursor: "default",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          position: "relative",
          width: "min(420px, 84vw)",
          padding: "44px 32px 40px",
          background: "var(--paper)",
          color: "var(--paper-ink)",
          fontFamily: "var(--font-display)",
          boxShadow:
            "0 28px 60px rgba(0,0,0,0.55), 0 8px 16px rgba(0,0,0,0.4), inset 0 0 60px rgba(180,160,110,0.3)",
          borderRadius: "10px 14px 8px 16px / 12px 8px 14px 10px",
          transform: entered
            ? "scale(1) rotate(-1.4deg)"
            : "scale(0.92) rotate(-1.4deg)",
          opacity: entered ? 1 : 0,
          filter: entered ? "blur(0)" : "blur(5px)",
          transition:
            "transform 0.65s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.55s ease, filter 0.65s ease",
          animation: entered ? "paper-settle 0.85s ease-out" : undefined,
          cursor: "pointer",
        }}
      >
        {/* 종이 결 */}
        <div
          aria-hidden
          style={{
            position: "absolute",
            inset: 0,
            pointerEvents: "none",
            background:
              "repeating-linear-gradient(135deg, rgba(0,0,0,0.02) 0 1px, transparent 1px 28px), repeating-linear-gradient(45deg, rgba(0,0,0,0.015) 0 1px, transparent 1px 18px)",
            borderRadius: "inherit",
          }}
        />
        {/* 잉크 얼룩 */}
        <div
          aria-hidden
          style={{
            position: "absolute",
            top: 18,
            right: 26,
            width: 14,
            height: 11,
            background: "rgba(40,40,30,0.18)",
            borderRadius: "60% 40% 50% 70% / 50% 60% 40% 60%",
            filter: "blur(1.5px)",
          }}
        />
        <div
          aria-hidden
          style={{
            position: "absolute",
            bottom: 22,
            left: 30,
            width: 9,
            height: 7,
            background: "rgba(40,40,30,0.16)",
            borderRadius: "60% 40% 70% 50% / 40% 60% 50% 60%",
            filter: "blur(1px)",
          }}
        />

        <div
          style={{
            position: "relative",
            textAlign: "center",
            fontFamily: "var(--font-display)",
          }}
        >
          <div
            style={{
              fontWeight: 500,
              fontSize: 13,
              letterSpacing: 4,
              color: "rgba(40,40,30,0.55)",
              marginBottom: 18,
            }}
          >
            ── 잡았다 ──
          </div>
          <div
            style={{
              fontWeight: 900,
              fontSize: "clamp(22px, 4.5vw, 32px)",
              letterSpacing: 1,
              lineHeight: 1.35,
            }}
          >
            {song.artist}
            <br />
            <span style={{ opacity: 0.75, fontWeight: 700, fontSize: "0.85em" }}>
              {song.title}
            </span>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes paper-settle {
          0%   { transform: scale(0.92) rotate(-1.4deg) translateY(-6px); }
          40%  { transform: scale(1.02) rotate(-1.8deg) translateY(2px); }
          70%  { transform: scale(0.99) rotate(-1.2deg) translateY(-1px); }
          100% { transform: scale(1) rotate(-1.4deg) translateY(0); }
        }
      `}</style>
    </div>
  );
}
