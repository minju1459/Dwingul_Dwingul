"use client";

import type { Song } from "@/lib/songs";

type SongCardProps = {
  song: Song | null;
  revealKey: number;
};

export function SongCard({ song, revealKey }: SongCardProps) {
  if (!song) return null;
  return (
    <div
      aria-live="polite"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 20,
        pointerEvents: "none",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        key={revealKey}
        style={{
          fontFamily: "var(--font-display)",
          fontWeight: 700,
          fontSize: "clamp(28px, 5vw, 44px)",
          letterSpacing: 1,
          color: "var(--ink)",
          textAlign: "center",
          padding: "20px 28px",
          background: "rgba(0, 0, 0, 0.55)",
          backdropFilter: "blur(10px)",
          WebkitBackdropFilter: "blur(10px)",
          borderRadius: 6,
          textShadow: "0 2px 12px rgba(0,0,0,0.8)",
          animation: "song-reveal 3.6s ease-out forwards",
        }}
      >
        {song.artist} — {song.title}
      </div>

      <style>{`
        @keyframes song-reveal {
          0%   { opacity: 0; transform: translateY(10px) scale(0.96); filter: blur(6px); }
          12%  { opacity: 1; transform: translateY(0)    scale(1);    filter: blur(0); }
          78%  { opacity: 1; transform: translateY(0)    scale(1);    filter: blur(0); }
          100% { opacity: 0; transform: translateY(-8px) scale(1.02); filter: blur(6px); }
        }
      `}</style>
    </div>
  );
}
