"use client";

import type { ButtonStateSnapshot } from "@/lib/types";

type LiveStatsProps = {
  state: ButtonStateSnapshot;
};

function formatTime(d: Date) {
  const h = d.getHours().toString().padStart(2, "0");
  const m = d.getMinutes().toString().padStart(2, "0");
  const s = d.getSeconds().toString().padStart(2, "0");
  const ampm = d.getHours() < 12 ? "AM" : "PM";
  return `${h}:${m}:${s} ${ampm}`;
}

export function LiveStats({ state }: LiveStatsProps) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 18,
        textAlign: "center",
      }}
    >
      <div>
        <div
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: 500,
            fontSize: 16,
            color: "var(--text-dim)",
            letterSpacing: 2,
            marginBottom: 8,
          }}
        >
          현재 깨어있는 사람
        </div>
        <div
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: 900,
            fontSize: 44,
            color: "var(--text-soft)",
            letterSpacing: 1,
            fontVariantNumeric: "tabular-nums",
            lineHeight: 1,
          }}
        >
          {state.awakeCount.toLocaleString()}명
        </div>
      </div>

      <div>
        <div
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: 500,
            fontSize: 13,
            color: "var(--text-dim)",
            letterSpacing: 2,
            marginBottom: 4,
          }}
        >
          마지막으로 눌린 시간
        </div>
        <div
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: 900,
            fontSize: 22,
            color: "var(--text-soft)",
            letterSpacing: 1,
            fontVariantNumeric: "tabular-nums",
          }}
        >
          {formatTime(state.lastPressedAt)}
        </div>
      </div>
    </div>
  );
}
