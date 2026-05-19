"use client";

import { useEffect, useState } from "react";
import type { Song } from "@/lib/songs";

type SongCardProps = {
  song: Song;
  onClose: () => void;
};

const VISIBLE_MS = 1000;

export function SongCard({ song, onClose }: SongCardProps) {
  const [entered, setEntered] = useState(false);
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    const enterId = requestAnimationFrame(() => setEntered(true));
    const leaveTimer = setTimeout(() => setLeaving(true), VISIBLE_MS);
    const closeTimer = setTimeout(onClose, VISIBLE_MS + 350);
    return () => {
      cancelAnimationFrame(enterId);
      clearTimeout(leaveTimer);
      clearTimeout(closeTimer);
    };
  }, [onClose]);

  const visible = entered && !leaving;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 25,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        pointerEvents: "none",
        background: visible ? "rgba(0,0,0,0.3)" : "rgba(0,0,0,0)",
        transition: "background 0.35s ease",
      }}
    >
      <div
        style={{
          position: "relative",
          width: "min(340px, 78vw)",
          height: 200,
          transform: visible
            ? "rotate(-2deg) scale(1)"
            : leaving
              ? "rotate(-2deg) scale(0.98) translateY(-6px)"
              : "rotate(-2deg) scale(0.9)",
          opacity: visible ? 1 : 0,
          filter: visible ? "blur(0)" : "blur(3px)",
          transition:
            "transform 0.45s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.35s ease, filter 0.35s ease",
        }}
      >
        {/* 손그림 종이 — 우글우글한 테두리 */}
        <svg
          viewBox="0 0 340 200"
          preserveAspectRatio="none"
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            filter: "drop-shadow(0 18px 30px rgba(0,0,0,0.55)) drop-shadow(0 4px 8px rgba(0,0,0,0.3))",
          }}
        >
          <path
            d="
              M 18,22
              C 80,12 160,16 235,14
              C 295,12 320,22 326,40
              C 332,90 330,140 322,168
              C 318,184 300,188 270,184
              C 200,180 110,186 50,182
              C 20,180 10,166 14,140
              C 10,100 12,52 18,22
              Z
            "
            fill="#f5f1e6"
            stroke="#1a1a18"
            strokeWidth="2.2"
            strokeLinejoin="round"
            strokeLinecap="round"
          />
          {/* 두 번째 살짝 어긋난 라인 — 손그림 중첩 느낌 */}
          <path
            d="
              M 22,26
              C 85,18 162,20 233,18
              C 290,18 318,24 322,42
              C 326,92 326,138 320,164
              C 314,180 298,184 270,180
              C 200,176 110,182 52,178
              C 24,178 14,162 18,138
              C 16,98 16,54 22,26
              Z
            "
            fill="none"
            stroke="#1a1a18"
            strokeWidth="0.6"
            strokeLinejoin="round"
            opacity="0.4"
          />
        </svg>

        {/* 내용 */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "28px 24px",
            color: "#1a1a18",
            textAlign: "center",
            fontFamily: "var(--font-doodle)",
          }}
        >
          <div
            style={{
              fontSize: 18,
              opacity: 0.7,
              marginBottom: 10,
              letterSpacing: 0.5,
              transform: "rotate(-0.5deg)",
            }}
          >
            {song.artist}
          </div>
          <div
            style={{
              fontSize: "clamp(28px, 6vw, 38px)",
              lineHeight: 1.15,
              transform: "rotate(0.4deg)",
            }}
          >
            {song.title}
          </div>
        </div>
      </div>
    </div>
  );
}
