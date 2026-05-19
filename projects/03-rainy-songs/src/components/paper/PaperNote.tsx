"use client";

import { useEffect, useState } from "react";
import { SONGS } from "@/lib/songs";

type PaperNoteProps = {
  onClose: () => void;
};

export function PaperNote({ onClose }: PaperNoteProps) {
  const [entered, setEntered] = useState(false);

  useEffect(() => {
    const id = requestAnimationFrame(() => setEntered(true));
    return () => cancelAnimationFrame(id);
  }, []);

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 30,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: entered ? "rgba(0,0,0,0.55)" : "rgba(0,0,0,0)",
        transition: "background 0.6s ease",
        cursor: "default",
      }}
    >
      <div
        style={{
          position: "relative",
          width: "min(420px, 86vw)",
          padding: "44px 36px 38px",
          background: "var(--paper)",
          color: "var(--paper-ink)",
          fontFamily: "var(--font-pen)",
          boxShadow:
            "0 28px 60px rgba(0,0,0,0.55), 0 8px 16px rgba(0,0,0,0.4), inset 0 0 60px rgba(180,160,110,0.35)",
          borderRadius: "10px 14px 8px 16px / 12px 8px 14px 10px",
          transform: entered
            ? "scale(1) rotate(-1.2deg)"
            : "scale(0.92) rotate(-1.2deg)",
          opacity: entered ? 1 : 0,
          filter: entered ? "blur(0)" : "blur(4px)",
          transition:
            "transform 0.7s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.6s ease, filter 0.7s ease",
          animation: entered
            ? "paper-settle 0.9s ease-out"
            : undefined,
        }}
      >
        {/* 종이 결 (살짝 어두운 가로 선 몇 줄로 꼬깃한 느낌) */}
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

        {/* 잉크 얼룩 몇 개 */}
        <div
          aria-hidden
          style={{
            position: "absolute",
            top: 18,
            right: 24,
            width: 18,
            height: 14,
            background: "rgba(40,40,30,0.18)",
            borderRadius: "60% 40% 50% 70% / 50% 60% 40% 60%",
            filter: "blur(1.5px)",
          }}
        />
        <div
          aria-hidden
          style={{
            position: "absolute",
            bottom: 30,
            left: 28,
            width: 10,
            height: 8,
            background: "rgba(40,40,30,0.16)",
            borderRadius: "60% 40% 70% 50% / 40% 60% 50% 60%",
            filter: "blur(1px)",
          }}
        />

        <div style={{ position: "relative" }}>
          <div
            style={{
              fontFamily: "var(--font-pen)",
              fontSize: 30,
              lineHeight: 1.1,
              marginBottom: 6,
              letterSpacing: 1,
              textAlign: "center",
              filter: "blur(0.3px)",
            }}
          >
            비 오는 날의 노래들
          </div>
          <div
            style={{
              fontFamily: "var(--font-hand)",
              fontSize: 13,
              color: "rgba(40,40,30,0.55)",
              textAlign: "center",
              marginBottom: 22,
              letterSpacing: 1,
            }}
          >
            ── 빗방울 안에 숨겨두었어요 ──
          </div>

          <ul
            style={{
              listStyle: "none",
              padding: 0,
              margin: 0,
              display: "flex",
              flexDirection: "column",
              gap: 6,
            }}
          >
            {SONGS.map((song, i) => (
              <li
                key={`${song.artist}-${song.title}`}
                style={{
                  fontFamily: "var(--font-pen)",
                  fontSize: 22,
                  lineHeight: 1.25,
                  letterSpacing: 0.5,
                  filter: `blur(${0.2 + (i % 3) * 0.1}px)`,
                  opacity: 0.92,
                  transform: `rotate(${(i % 2 === 0 ? -1 : 1) * 0.4}deg)`,
                }}
              >
                <span style={{ marginRight: 8, opacity: 0.7 }}>♪</span>
                {song.artist} — {song.title}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <style>{`
        @keyframes paper-settle {
          0%   { transform: scale(0.92) rotate(-1.2deg) translateY(-6px); }
          40%  { transform: scale(1.02) rotate(-1.6deg) translateY(2px); }
          70%  { transform: scale(0.99) rotate(-1deg) translateY(-1px); }
          100% { transform: scale(1) rotate(-1.2deg) translateY(0); }
        }
      `}</style>
    </div>
  );
}
