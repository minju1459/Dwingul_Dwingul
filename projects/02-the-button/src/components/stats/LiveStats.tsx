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
            fontFamily: "var(--font-cute)",
            fontSize: 18,
            color: "var(--text-dim)",
            letterSpacing: 1,
            marginBottom: 6,
          }}
        >
          현재 깨어있는 사람
        </div>
        <div
          style={{
            fontFamily: "var(--font-led)",
            fontSize: 40,
            color: "var(--text-soft)",
            letterSpacing: 3,
            fontVariantNumeric: "tabular-nums",
          }}
        >
          {state.awakeCount.toLocaleString()}명
        </div>
      </div>

      <div>
        <div
          style={{
            fontFamily: "var(--font-cute)",
            fontSize: 14,
            color: "var(--text-dim)",
            letterSpacing: 1,
            marginBottom: 4,
          }}
        >
          마지막으로 눌린 시간
        </div>
        <div
          style={{
            fontFamily: "var(--font-led)",
            fontSize: 22,
            color: "var(--text-soft)",
            letterSpacing: 2,
            fontVariantNumeric: "tabular-nums",
          }}
        >
          {formatTime(state.lastPressedAt)}
        </div>
      </div>
    </div>
  );
}
