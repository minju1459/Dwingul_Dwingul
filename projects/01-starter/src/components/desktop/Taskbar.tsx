"use client";

import { useClock } from "@/hooks/useClock";

export function Taskbar() {
  const time = useClock();

  return (
    <div
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        height: 30,
        background: "#c0c0c0",
        borderTop: "2px solid #ffffff",
        display: "flex",
        alignItems: "center",
        padding: "0 4px",
        boxShadow: "inset 0 1px 0 #dfdfdf",
        fontFamily: "var(--font-pixel)",
        zIndex: 1000,
      }}
    >
      <button
        style={{
          fontFamily: "var(--font-pixel)",
          fontWeight: "bold",
          fontSize: 13,
          padding: "2px 8px",
          minWidth: 56,
        }}
      >
        시작
      </button>

      <div style={{ flex: 1 }} />

      <div
        style={{
          border: "1px inset #c0c0c0",
          padding: "2px 8px",
          fontSize: 12,
          background: "#c0c0c0",
          minWidth: 80,
          textAlign: "center",
        }}
      >
        {time}
      </div>
    </div>
  );
}
