"use client";

import { useCallback, useRef, useState } from "react";
import { RainCanvas } from "./RainCanvas";
import { SongCard } from "@/components/song/SongCard";
import { MissPop, type MissEvent } from "@/components/miss/MissPop";
import { MuteButton } from "@/components/controls/MuteButton";
import { useRainSound } from "@/hooks/useRainSound";
import type { Song } from "@/lib/songs";
import { shuffledDeck } from "@/lib/songs";

const MISS_DURATION_MS = 900;

export function RainyScene() {
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [revealKey, setRevealKey] = useState(0);
  const [misses, setMisses] = useState<MissEvent[]>([]);
  const deckRef = useRef<Song[]>(shuffledDeck());
  const lastSongRef = useRef<Song | null>(null);
  const { muted, toggle } = useRainSound();

  const pickNextSong = useCallback((): Song => {
    if (deckRef.current.length === 0) {
      deckRef.current = shuffledDeck();
      if (
        deckRef.current[0] &&
        lastSongRef.current &&
        deckRef.current[0].artist === lastSongRef.current.artist &&
        deckRef.current[0].title === lastSongRef.current.title &&
        deckRef.current.length > 1
      ) {
        const swap = deckRef.current[0];
        deckRef.current[0] = deckRef.current[1];
        deckRef.current[1] = swap;
      }
    }
    const next = deckRef.current.shift()!;
    lastSongRef.current = next;
    return next;
  }, []);

  const handleHit = useCallback(() => {
    const song = pickNextSong();
    setCurrentSong(song);
    setRevealKey((k) => k + 1);
  }, [pickNextSong]);

  const handleMiss = useCallback((x: number, y: number) => {
    const id = Date.now() + Math.random();
    setMisses((prev) => [...prev, { id, x, y }]);
    setTimeout(() => {
      setMisses((prev) => prev.filter((m) => m.id !== id));
    }, MISS_DURATION_MS);
  }, []);

  return (
    <>
      <RainCanvas onHit={handleHit} onMiss={handleMiss} />

      {misses.map((m) => (
        <MissPop key={m.id} miss={m} />
      ))}

      {currentSong && (
        <SongCard
          key={revealKey}
          song={currentSong}
          onClose={() => setCurrentSong(null)}
        />
      )}

      <MuteButton muted={muted} onToggle={toggle} />

      {currentSong === null && (
        <div
          aria-hidden
          style={{
            position: "fixed",
            bottom: 24,
            left: 0,
            right: 0,
            textAlign: "center",
            fontFamily: "var(--font-display)",
            fontWeight: 500,
            fontSize: 13,
            color: "rgba(244,244,238,0.45)",
            letterSpacing: 3,
            pointerEvents: "none",
            zIndex: 2,
            animation: "hint-fade 5s ease-in-out infinite",
          }}
        >
          빗방울을 잡아보세요
        </div>
      )}

      <style>{`
        @keyframes hint-fade {
          0%, 100% { opacity: 0.3; }
          50%      { opacity: 0.75; }
        }
      `}</style>
    </>
  );
}
