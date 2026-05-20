"use client";

import { useEffect, useState } from "react";
import { LOADING_PHRASES } from "@/lib/examples";

export function LoadingState() {
  const [phrase, setPhrase] = useState(LOADING_PHRASES[0]);

  useEffect(() => {
    // 1초마다 다른 문구로 교체.
    const id = setInterval(() => {
      const next =
        LOADING_PHRASES[Math.floor(Math.random() * LOADING_PHRASES.length)];
      setPhrase(next);
    }, 1100);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="flex flex-col items-center gap-3 py-10 text-center text-[var(--ink-soft)]">
      <span className="text-[15px] font-medium tracking-tight">{phrase}</span>
      <span aria-hidden className="flex">
        <span className="dot" />
        <span className="dot" />
        <span className="dot" />
      </span>
    </div>
  );
}
