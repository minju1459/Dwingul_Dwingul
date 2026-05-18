"use client";

import { useEffect, useState } from "react";

function format(date: Date) {
  const h = date.getHours();
  const m = date.getMinutes().toString().padStart(2, "0");
  const ampm = h < 12 ? "오전" : "오후";
  const hour12 = ((h + 11) % 12) + 1;
  return `${ampm} ${hour12}:${m}`;
}

export function useClock(intervalMs = 30_000) {
  const [text, setText] = useState<string>(() => format(new Date()));

  useEffect(() => {
    const tick = () => setText(format(new Date()));
    tick();
    const id = setInterval(tick, intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);

  return text;
}
