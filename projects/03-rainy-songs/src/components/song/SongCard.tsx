"use client";

import { useEffect, useState } from "react";
import type { Song } from "@/lib/songs";

type SongCardProps = {
  song: Song;
  onClose: () => void;
};

const VISIBLE_MS = 2000;

export function SongCard({ song, onClose }: SongCardProps) {
  const [entered, setEntered] = useState(false);
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    const enterId = requestAnimationFrame(() => setEntered(true));
    const leaveTimer = setTimeout(() => setLeaving(true), VISIBLE_MS);
    const closeTimer = setTimeout(onClose, VISIBLE_MS + 400);
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
        background: visible ? "rgba(0,0,0,0.35)" : "rgba(0,0,0,0)",
        transition: "background 0.4s ease",
        pointerEvents: "none",
      }}
    >
      <div
        style={{
          position: "relative",
          width: "min(360px, 80vw)",
          padding: "36px 28px",
          background: "#f5f1e6",
          color: "#1a1a18",
          fontFamily: "var(--font-display)",
          textAlign: "center",
          boxShadow:
            "0 24px 50px rgba(0,0,0,0.55), 0 6px 14px rgba(0,0,0,0.35)",
          transform: visible
            ? "rotate(-1deg) scale(1)"
            : leaving
              ? "rotate(-1deg) scale(0.98) translateY(-6px)"
              : "rotate(-1deg) scale(0.94)",
          opacity: visible ? 1 : 0,
          filter: visible ? "blur(0)" : "blur(3px)",
          transition:
            "transform 0.5s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.4s ease, filter 0.4s ease",
        }}
      >
        {/* 종이 결 (아주 옅게) */}
        <div
          aria-hidden
          style={{
            position: "absolute",
            inset: 0,
            pointerEvents: "none",
            background:
              "repeating-linear-gradient(132deg, rgba(0,0,0,0.018) 0 1px, transparent 1px 32px)",
          }}
        />

        <div
          style={{
            fontWeight: 700,
            fontSize: 14,
            letterSpacing: 2,
            opacity: 0.55,
            marginBottom: 14,
          }}
        >
          {song.artist}
        </div>
        <div
          style={{
            fontWeight: 900,
            fontSize: "clamp(22px, 4.8vw, 30px)",
            letterSpacing: 1,
            lineHeight: 1.3,
          }}
        >
          {song.title}
        </div>
      </div>
    </div>
  );
}
