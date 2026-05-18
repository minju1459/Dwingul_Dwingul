"use client";

type BootScreenProps = {
  onStart: () => void;
};

export function BootScreen({ onStart }: BootScreenProps) {
  return (
    <button
      type="button"
      onClick={onStart}
      style={{
        position: "fixed",
        inset: 0,
        background: "#000",
        border: 0,
        cursor: "pointer",
        color: "#e0e0e0",
        fontFamily: "var(--font-pixel)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 32,
        padding: 0,
        zIndex: 2000,
      }}
      aria-label="시작하기"
    >
      <div
        style={{
          fontSize: 40,
          letterSpacing: 2,
          animation: "boot-cursor-blink 1.1s steps(1) infinite",
        }}
        aria-hidden
      >
        _
      </div>

      <div
        style={{
          position: "absolute",
          bottom: 60,
          fontSize: 13,
          color: "#666",
          letterSpacing: 1,
        }}
      >
        Click anywhere to start
      </div>

      <style jsx>{`
        @keyframes boot-cursor-blink {
          0%,
          50% {
            opacity: 1;
          }
          51%,
          100% {
            opacity: 0;
          }
        }
      `}</style>
    </button>
  );
}
