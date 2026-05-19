"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const RAIN_SRC = "/sounds/rain.mp3";
const DEFAULT_VOLUME = 0.45;

export function useRainSound() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [muted, setMuted] = useState(true);

  useEffect(() => {
    const audio = new Audio(RAIN_SRC);
    audio.loop = true;
    audio.volume = DEFAULT_VOLUME;
    audioRef.current = audio;
    return () => {
      audio.pause();
      audioRef.current = null;
    };
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (muted) {
      audio.pause();
    } else {
      audio.play().catch(() => {
        // 자동 재생 정책으로 막혔거나 파일 없을 때 — 조용히 무시
      });
    }
  }, [muted]);

  const toggle = useCallback(() => {
    setMuted((m) => !m);
  }, []);

  return { muted, toggle };
}
